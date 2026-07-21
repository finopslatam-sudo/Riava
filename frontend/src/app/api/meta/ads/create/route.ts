import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { uploadAdImage, createCampaign, createAdSet, createAdCreative, createAd } from '@/lib/meta-ads'

export async function POST(req: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get('meta_access_token')?.value
  if (!token) return NextResponse.json({ error: 'No conectado a Meta' }, { status: 401 })

  const formData = await req.formData()
  const image = formData.get('image')
  const ad_account_id = formData.get('ad_account_id')?.toString()
  const page_id = formData.get('page_id')?.toString()
  const form_id = formData.get('form_id')?.toString()
  const campaign_name = formData.get('campaign_name')?.toString()
  const daily_budget = Number(formData.get('daily_budget'))
  const age_min = Number(formData.get('age_min'))
  const age_max = Number(formData.get('age_max'))
  const primary_text = formData.get('primary_text')?.toString()
  const headline = formData.get('headline')?.toString()

  if (
    !(image instanceof File) || !ad_account_id || !page_id || !form_id ||
    !campaign_name || !daily_budget || !age_min || !age_max || !primary_text || !headline
  ) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  try {
    const image_hash = await uploadAdImage(token, ad_account_id, image)
    const campaign_id = await createCampaign(token, ad_account_id, { name: campaign_name })
    const adset_id = await createAdSet(token, ad_account_id, {
      name: `${campaign_name} — Conjunto`,
      campaign_id,
      daily_budget,
      page_id,
      age_min,
      age_max,
    })
    const creative_id = await createAdCreative(token, ad_account_id, {
      name: `${campaign_name} — Creatividad`,
      page_id,
      form_id,
      image_hash,
      message: primary_text,
      headline,
    })
    const ad_id = await createAd(token, ad_account_id, {
      name: `${campaign_name} — Anuncio`,
      adset_id,
      creative_id,
    })

    return NextResponse.json({
      campaign_id,
      adset_id,
      ad_id,
      manage_url: `https://business.facebook.com/adsmanager/manage/campaigns?act=${ad_account_id.replace('act_', '')}`,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al crear la campaña'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
