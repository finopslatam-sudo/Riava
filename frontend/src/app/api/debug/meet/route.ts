import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('key')
  if (secret !== 'riava-debug-2025') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const report: Record<string, unknown> = {}

  // 1. Check env vars
  report.env = {
    GOOGLE_OAUTH_CLIENT_ID:     !!process.env.GOOGLE_OAUTH_CLIENT_ID,
    GOOGLE_OAUTH_CLIENT_SECRET: !!process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    GOOGLE_OAUTH_REFRESH_TOKEN: !!process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
    GOOGLE_CALENDAR_ID:         process.env.GOOGLE_CALENDAR_ID ?? '(not set → will use primary)',
  }

  // 2. Try OAuth2 token exchange
  if (process.env.GOOGLE_OAUTH_CLIENT_ID && process.env.GOOGLE_OAUTH_CLIENT_SECRET && process.env.GOOGLE_OAUTH_REFRESH_TOKEN) {
    try {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type:    'refresh_token',
          client_id:     process.env.GOOGLE_OAUTH_CLIENT_ID,
          client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
          refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
        }).toString(),
        signal: AbortSignal.timeout(8000),
      })

      const tokenData = await tokenRes.json() as Record<string, unknown>

      if (!tokenRes.ok) {
        report.oauth2 = { status: 'FAILED', httpStatus: tokenRes.status, error: tokenData }
        return NextResponse.json(report)
      }

      const accessToken = tokenData.access_token as string
      report.oauth2 = { status: 'OK', scope: tokenData.scope }

      // 3. Try Calendar API — list calendars
      const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary'
      const calRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          signal: AbortSignal.timeout(8000),
        }
      )
      const calData = await calRes.json() as Record<string, unknown>

      if (!calRes.ok) {
        report.calendar = { status: 'FAILED', httpStatus: calRes.status, calendarId, error: calData }
      } else {
        report.calendar = { status: 'OK', calendarId, summary: calData.summary }
      }

    } catch (err) {
      report.oauth2 = { status: 'EXCEPTION', error: String(err) }
    }
  } else {
    report.oauth2 = { status: 'SKIPPED', reason: 'Missing env vars' }
  }

  return NextResponse.json(report, { status: 200 })
}
