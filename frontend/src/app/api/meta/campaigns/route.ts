import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('meta_access_token')?.value

  if (!token) {
    return NextResponse.json({ error: 'No conectado' }, { status: 401 })
  }

  // Obtener cuentas publicitarias
  const adAccountsRes = await fetch(
    `https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name,account_status&access_token=${token}`
  )

  if (!adAccountsRes.ok) {
    return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 })
  }

  const { data: adAccounts } = await adAccountsRes.json() as {
    data: { id: string; name: string; account_status: number }[]
  }

  if (!adAccounts || adAccounts.length === 0) {
    return NextResponse.json({ campaigns: [], adAccounts: [] })
  }

  // Obtener campañas de todas las cuentas
  const campaignResults = await Promise.all(
    adAccounts.map(async (account) => {
      const res = await fetch(
        `https://graph.facebook.com/v19.0/${account.id}/campaigns?` +
        new URLSearchParams({
          fields: 'id,name,status,objective,insights{impressions,clicks,spend,reach,cpm,cpc}',
          date_preset: 'last_30d',
          access_token: token,
        })
      )
      if (!res.ok) return { account, campaigns: [] }
      const { data } = await res.json() as { data: unknown[] }
      return { account, campaigns: data ?? [] }
    })
  )

  return NextResponse.json({ results: campaignResults })
}
