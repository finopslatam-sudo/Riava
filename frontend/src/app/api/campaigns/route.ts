import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAllLeads } from '@/lib/leads-store'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('meta_access_token')?.value

  if (!token) return NextResponse.json([], { status: 200 })

  const [leads, adAccountsRes] = await Promise.all([
    getAllLeads(),
    fetch(`https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name&access_token=${token}`),
  ])

  if (!adAccountsRes.ok) return NextResponse.json([])

  const { data: accounts } = await adAccountsRes.json() as { data: { id: string; name: string }[] }

  const campaignArrays = await Promise.all(
    accounts.map(async acc => {
      const res = await fetch(
        `https://graph.facebook.com/v19.0/${acc.id}/campaigns?` +
        new URLSearchParams({
          fields: 'id,name,status,objective,created_time,insights{impressions,clicks,spend,reach,cpm,cpc}',
          date_preset: 'last_30d',
          access_token: token,
        })
      )
      if (!res.ok) return []
      const { data } = await res.json() as { data: {
        id: string; name: string; status: string; objective: string
        created_time: string
        insights?: { data: { impressions: string; clicks: string; spend: string; cpm: string; cpc: string }[] }
      }[] }

      return data.map(c => {
        const ins = c.insights?.data?.[0]
        const spend = Number(ins?.spend ?? 0)
        const clicks = Number(ins?.clicks ?? 0)
        const impressions = Number(ins?.impressions ?? 0)
        const campaign_leads = leads.filter(l => l.source_campaign === c.name).length
        return {
          id: c.id,
          name: c.name,
          status: c.status as 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DELETED',
          objective: c.objective ?? '',
          budget_remaining: 0,
          spend,
          impressions,
          clicks,
          leads_count: campaign_leads,
          cpl: campaign_leads > 0 ? spend / campaign_leads : 0,
          created_at: c.created_time ?? new Date().toISOString(),
        }
      })
    })
  )

  return NextResponse.json(campaignArrays.flat())
}
