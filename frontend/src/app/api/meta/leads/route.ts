import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('meta_access_token')?.value
  if (!token) return NextResponse.json({ error: 'No conectado a Meta' }, { status: 401 })

  // Get ad accounts
  const adAccountsRes = await fetch(
    `https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name&access_token=${token}`
  )
  if (!adAccountsRes.ok) {
    const err = await adAccountsRes.json()
    return NextResponse.json({ error: 'Error obteniendo cuentas', detail: err }, { status: 502 })
  }
  const { data: accounts } = await adAccountsRes.json() as { data: { id: string; name: string }[] }

  const allLeads: MetaLead[] = []
  const errors: unknown[] = []

  for (const acc of accounts) {
    // Try fetching leads directly from ad account
    const leadsRes = await fetch(
      `https://graph.facebook.com/v19.0/${acc.id}/leads?` +
      new URLSearchParams({
        fields: 'id,created_time,ad_id,ad_name,adset_id,adset_name,campaign_id,campaign_name,form_id,field_data',
        limit: '100',
        access_token: token,
      })
    )
    if (!leadsRes.ok) {
      const err = await leadsRes.json()
      errors.push({ account: acc.id, error: err })
      continue
    }
    const { data } = await leadsRes.json() as { data: MetaLead[] }
    allLeads.push(...data)
  }

  return NextResponse.json({ leads: allLeads, errors, total: allLeads.length })
}

type MetaLead = {
  id: string
  created_time: string
  ad_id?: string
  ad_name?: string
  adset_id?: string
  adset_name?: string
  campaign_id?: string
  campaign_name?: string
  form_id?: string
  field_data: { name: string; values: string[] }[]
}
