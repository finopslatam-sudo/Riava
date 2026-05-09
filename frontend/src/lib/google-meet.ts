import { createSign } from 'crypto'

async function getAccessToken(): Promise<string | null> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
  if (!email || !rawKey) return null

  const privateKey = rawKey.replace(/\\n/g, '\n')
  const now = Math.floor(Date.now() / 1000)

  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const claims = Buffer.from(
    JSON.stringify({
      iss: email,
      scope: 'https://www.googleapis.com/auth/calendar',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    })
  ).toString('base64url')

  const signer = createSign('RSA-SHA256')
  signer.update(`${header}.${claims}`)
  signer.end()
  const sig = signer.sign(privateKey, 'base64url')

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${header}.${claims}.${sig}`,
    signal: AbortSignal.timeout(8000),
  })

  if (!res.ok) return null
  const data = await res.json() as { access_token?: string }
  return data.access_token ?? null
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

  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary'

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
  })

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body,
      signal: AbortSignal.timeout(8000),
    }
  )

  if (!res.ok) return null
  const data = await res.json() as { conferenceData?: { entryPoints?: Array<{ uri: string }> } }
  return data.conferenceData?.entryPoints?.[0]?.uri ?? null
}
