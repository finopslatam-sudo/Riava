import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getCampaignAdSet, updateCampaign, updateAdSet, type Gender } from '@/lib/meta-ads'

const GRAPH_BASE = 'https://graph.facebook.com/v19.0'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('meta_access_token')?.value
  if (!token) return NextResponse.json({ error: 'No conectado a Meta' }, { status: 401 })

  const [campaignRes, adset] = await Promise.all([
    fetch(`${GRAPH_BASE}/${id}?fields=id,name,status&access_token=${token}`),
    getCampaignAdSet(token, id),
  ])
  if (!campaignRes.ok) {
    return NextResponse.json({ error: 'No se pudo obtener la campaña' }, { status: 500 })
  }
  const campaign = await campaignRes.json() as { id: string; name: string; status: string }

  return NextResponse.json({ campaign, adset })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('meta_access_token')?.value
  if (!token) return NextResponse.json({ error: 'No conectado a Meta' }, { status: 401 })

  const body = await req.json() as {
    name?: string
    status?: 'ACTIVE' | 'PAUSED'
    daily_budget?: number
    age_min?: number
    age_max?: number
    gender?: Gender
    country_code?: string
    region_keys?: string[]
    city_keys?: string[]
    interest_ids?: string[]
  }

  try {
    await updateCampaign(token, id, { name: body.name, status: body.status })

    const hasAdSetChanges =
      body.daily_budget !== undefined || body.age_min !== undefined || body.age_max !== undefined ||
      body.gender !== undefined || body.country_code !== undefined || body.region_keys !== undefined ||
      body.city_keys !== undefined || body.interest_ids !== undefined

    if (hasAdSetChanges) {
      const adset = await getCampaignAdSet(token, id)
      if (!adset) {
        return NextResponse.json({ error: 'No se encontró el conjunto de anuncios de esta campaña' }, { status: 404 })
      }
      const preserveFlexibleSpec = (adset.flexible_spec ?? []).filter(spec => !('interests' in spec))
      await updateAdSet(token, adset.id, {
        daily_budget: body.daily_budget,
        age_min: body.age_min,
        age_max: body.age_max,
        gender: body.gender,
        country_code: body.country_code,
        region_keys: body.region_keys,
        city_keys: body.city_keys,
        interest_ids: body.interest_ids,
        preserveFlexibleSpec,
      })
    }

    return NextResponse.json({ status: 'ok' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al actualizar la campaña'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
