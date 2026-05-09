import { createSign } from 'crypto'

// ── OAuth2 Refresh Token (recommended for personal Google accounts) ────────────
async function getAccessTokenOAuth(): Promise<string | null> {
  const clientId     = process.env.GOOGLE_OAUTH_CLIENT_ID
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) return null

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'refresh_token',
      client_id:     clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    }).toString(),
    signal: AbortSignal.timeout(8000),
  })

  if (!res.ok) {
    const body = await res.text()
    console.error(`[Google Meet] OAuth2 refresh token error ${res.status}:`, body)
    return null
  }

  const data = await res.json() as { access_token?: string }
  if (!data.access_token) {
    console.error('[Google Meet] OAuth2 response missing access_token:', JSON.stringify(data))
    return null
  }
  return data.access_token
}

// ── Service Account JWT (fallback, only works with Google Workspace + DWD) ────
async function getAccessTokenServiceAccount(): Promise<string | null> {
  const serviceEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const rawKey       = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
  const impersonate  = process.env.GOOGLE_IMPERSONATE_EMAIL

  if (!serviceEmail || !rawKey) {
    console.error('[Google Meet] Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY')
    return null
  }

  const privateKey = rawKey.replace(/\\n/g, '\n')
  const now = Math.floor(Date.now() / 1000)

  const claimsObj: Record<string, string | number> = {
    iss:   serviceEmail,
    scope: 'https://www.googleapis.com/auth/calendar',
    aud:   'https://oauth2.googleapis.com/token',
    exp:   now + 3600,
    iat:   now,
  }
  if (impersonate) claimsObj.sub = impersonate

  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const claims = Buffer.from(JSON.stringify(claimsObj)).toString('base64url')

  let sig: string
  try {
    const signer = createSign('RSA-SHA256')
    signer.update(`${header}.${claims}`)
    signer.end()
    sig = signer.sign(privateKey, 'base64url')
  } catch (err) {
    console.error('[Google Meet] Failed to sign JWT — check private key format:', err)
    return null
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${header}.${claims}.${sig}`,
    signal: AbortSignal.timeout(8000),
  })

  if (!res.ok) {
    const body = await res.text()
    console.error(`[Google Meet] Service account OAuth error ${res.status}:`, body)
    return null
  }
  const data = await res.json() as { access_token?: string }
  if (!data.access_token) {
    console.error('[Google Meet] Service account OAuth missing access_token:', JSON.stringify(data))
    return null
  }
  return data.access_token
}

async function getAccessToken(): Promise<string | null> {
  // OAuth2 refresh token works with personal accounts and generates Meet links
  const oauthToken = await getAccessTokenOAuth()
  if (oauthToken) {
    console.log('[Google Meet] Using OAuth2 refresh token (personal account mode)')
    return oauthToken
  }
  // Fallback: service account JWT (requires Google Workspace + Domain-Wide Delegation)
  console.log('[Google Meet] OAuth2 not configured, falling back to service account JWT')
  return getAccessTokenServiceAccount()
}

export async function createMeetEvent(params: {
  name: string
  lastName: string
  service: string
  date: string      // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string   // HH:mm
  clientEmail: string
}): Promise<string | null> {
  const token = await getAccessToken()
  if (!token) return null

  const calendarId = process.env.GOOGLE_CALENDAR_ID
    || process.env.GOOGLE_IMPERSONATE_EMAIL
    || 'primary'

  const body = JSON.stringify({
    summary: `RIAVA · ${params.service} — ${params.name} ${params.lastName}`,
    description: `Reunión agendada mediante RIAVA System SpA\nServicio: ${params.service}\nCliente: ${params.name} ${params.lastName}`,
    start: { dateTime: `${params.date}T${params.startTime}:00`, timeZone: 'America/Santiago' },
    end:   { dateTime: `${params.date}T${params.endTime}:00`,   timeZone: 'America/Santiago' },
    attendees: [{ email: params.clientEmail }],
    conferenceData: {
      createRequest: {
        requestId: `riava-${Date.now()}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email',  minutes: 60 },
        { method: 'popup',  minutes: 30 },
      ],
    },
  })

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1&sendUpdates=all`

  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body,
    signal: AbortSignal.timeout(10000),
  })

  if (!res.ok) {
    const errBody = await res.text()
    console.error(`[Google Meet] Calendar API ${res.status} (calendar: "${calendarId}"):`, errBody)
    return null
  }

  const data = await res.json() as { conferenceData?: { entryPoints?: Array<{ uri: string }> } }
  const meetLink = data.conferenceData?.entryPoints?.[0]?.uri ?? null

  if (!meetLink) {
    console.error('[Google Meet] Event created but no Meet link — conferenceData:', JSON.stringify(data.conferenceData))
  } else {
    console.log('[Google Meet] Meet link generated:', meetLink)
  }

  return meetLink
}
