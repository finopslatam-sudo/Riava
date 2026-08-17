import { NextResponse } from 'next/server'
import { getMetaToken } from '@/lib/meta-token-store'
import { getCampaignsWithInsights } from '@/lib/meta-ads'
import { saveCampaignsCache } from '@/lib/meta-ads-insights-cache'

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const token = await getMetaToken()
  if (!token) {
    return NextResponse.json({ skipped: true, reason: 'Meta no conectado' })
  }

  const results = await getCampaignsWithInsights(token)
  await saveCampaignsCache(results)

  return NextResponse.json({
    accounts: results.length,
    campaigns: results.reduce((sum, r) => sum + r.campaigns.length, 0),
  })
}
