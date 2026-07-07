import { NextResponse } from 'next/server'
import { getAllLeads } from '@/lib/leads-store'
import { cookies } from 'next/headers'

export async function GET() {
  const leads = await getAllLeads()

  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)
  const monthStr = now.toISOString().slice(0, 7)

  const total_leads = leads.length
  const new_leads_today = leads.filter(l => l.created_at.startsWith(todayStr)).length
  const leads_this_month = leads.filter(l => l.created_at.startsWith(monthStr)).length
  const won = leads.filter(l => l.status === 'cotizacion_aceptada').length
  const conversion_rate = total_leads > 0 ? (won / total_leads) * 100 : 0
  const avg_score = total_leads > 0 ? leads.reduce((a, l) => a + l.score, 0) / total_leads : 0

  // Try to get Meta campaign stats from existing cookie
  let active_campaigns = 0
  let total_spend = 0
  let cpl = 0

  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('meta_access_token')?.value
    if (token) {
      const adAccountsRes = await fetch(
        `https://graph.facebook.com/v19.0/me/adaccounts?fields=id&access_token=${token}`
      )
      if (adAccountsRes.ok) {
        const { data: accounts } = await adAccountsRes.json() as { data: { id: string }[] }
        const results = await Promise.all(accounts.map(async acc => {
          const res = await fetch(
            `https://graph.facebook.com/v19.0/${acc.id}/campaigns?` +
            new URLSearchParams({
              fields: 'status,insights{spend}',
              date_preset: 'last_30d',
              access_token: token,
            })
          )
          if (!res.ok) return { active: 0, spend: 0 }
          const { data } = await res.json() as { data: { status: string; insights?: { data: { spend: string }[] } }[] }
          return {
            active: data.filter(c => c.status === 'ACTIVE').length,
            spend: data.reduce((s, c) => s + Number(c.insights?.data?.[0]?.spend ?? 0), 0),
          }
        }))
        active_campaigns = results.reduce((a, r) => a + r.active, 0)
        total_spend = results.reduce((a, r) => a + r.spend, 0)
        cpl = total_leads > 0 ? total_spend / total_leads : 0
      }
    }
  } catch {
    // Meta data unavailable — leave zeros
  }

  return NextResponse.json({
    total_leads,
    new_leads_today,
    leads_this_month,
    conversion_rate,
    avg_score,
    active_campaigns,
    total_spend,
    cpl,
  })
}
