import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const base = new URL('/dashboard/meta-ads', req.url)

  if (error || !code || !state) {
    base.searchParams.set('error', 'denied')
    return NextResponse.redirect(base)
  }

  const cookieStore = await cookies()
  const storedState = cookieStore.get('meta_oauth_state')?.value
  if (storedState !== state) {
    base.searchParams.set('error', 'invalid_state')
    return NextResponse.redirect(base)
  }

  // Exchange code for short-lived token
  const tokenRes = await fetch(
    `https://graph.facebook.com/v19.0/oauth/access_token?` +
    new URLSearchParams({
      client_id: process.env.META_APP_ID!,
      client_secret: process.env.META_APP_SECRET!,
      redirect_uri: process.env.META_REDIRECT_URI!,
      code,
    })
  )

  if (!tokenRes.ok) {
    base.searchParams.set('error', 'token_exchange')
    return NextResponse.redirect(base)
  }

  const { access_token: shortToken } = await tokenRes.json() as { access_token: string }

  // Exchange for long-lived token (~60 days)
  const longRes = await fetch(
    `https://graph.facebook.com/v19.0/oauth/access_token?` +
    new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: process.env.META_APP_ID!,
      client_secret: process.env.META_APP_SECRET!,
      fb_exchange_token: shortToken,
    })
  )

  const { access_token: token } = longRes.ok
    ? (await longRes.json() as { access_token: string })
    : { access_token: shortToken }

  base.searchParams.set('connected', '1')
  const response = NextResponse.redirect(base)

  response.cookies.set('meta_access_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 60, // 60 días
    path: '/',
    sameSite: 'lax',
  })
  response.cookies.delete('meta_oauth_state')

  return response
}
