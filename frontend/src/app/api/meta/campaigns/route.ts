import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getCampaignsWithInsights } from '@/lib/meta-ads'
import { getCampaignsCache, saveCampaignsCache } from '@/lib/meta-ads-insights-cache'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('meta_access_token')?.value

  if (!token) {
    // Sin sesión de navegador: si el cron ya dejó datos frescos en caché, los usamos.
    const cached = await getCampaignsCache()
    if (cached) return NextResponse.json({ results: cached.results, updatedAt: cached.updatedAt })
    return NextResponse.json({ error: 'No conectado' }, { status: 401 })
  }

  try {
    const results = await getCampaignsWithInsights(token)
    await saveCampaignsCache(results)
    return NextResponse.json({ results, updatedAt: new Date().toISOString() })
  } catch {
    return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 })
  }
}
