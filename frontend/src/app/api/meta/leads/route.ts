import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

type FieldData = { name: string; values: string[] }
type MetaLead = {
  id: string; created_time: string; ad_id?: string; ad_name?: string
  adset_name?: string; campaign_id?: string; campaign_name?: string
  form_id: string; form_name: string; field_data: FieldData[]
}

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('meta_access_token')?.value
  if (!token) return NextResponse.json({ error: 'No conectado a Meta' }, { status: 401 })

  // Get ad accounts
  const accsRes = await fetch(
    `https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name&access_token=${token}`
  )
  if (!accsRes.ok) return NextResponse.json({ error: 'Error obteniendo cuentas' }, { status: 502 })
  const { data: accounts } = await accsRes.json() as { data: { id: string; name: string }[] }

  // Collect unique form IDs from ads across all accounts
  const formIds = new Map<string, string>() // formId → formName

  for (const acc of accounts) {
    const adsRes = await fetch(
      `https://graph.facebook.com/v19.0/${acc.id}/ads?` +
      new URLSearchParams({
        fields: 'id,name,creative{lead_gen_form_id}',
        limit: '200',
        access_token: token,
      })
    )
    if (!adsRes.ok) continue
    const { data: ads } = await adsRes.json() as {
      data: { id: string; name: string; creative?: { lead_gen_form_id?: string } }[]
    }
    for (const ad of (ads ?? [])) {
      const fid = ad.creative?.lead_gen_form_id
      if (fid && !formIds.has(fid)) formIds.set(fid, ad.name)
    }
  }

  // Fetch leads for each form using user token (has leads_retrieval)
  const allLeads: MetaLead[] = []

  for (const [formId, adName] of formIds) {
    // Get form name
    const formInfoRes = await fetch(
      `https://graph.facebook.com/v19.0/${formId}?fields=id,name&access_token=${token}`
    )
    const formName = formInfoRes.ok
      ? ((await formInfoRes.json()) as { name?: string }).name ?? adName
      : adName

    const leadsRes = await fetch(
      `https://graph.facebook.com/v19.0/${formId}/leads?` +
      new URLSearchParams({
        fields: 'id,created_time,ad_id,ad_name,adset_name,campaign_id,campaign_name,field_data',
        limit: '200',
        access_token: token,
      })
    )
    if (!leadsRes.ok) continue
    const { data } = await leadsRes.json() as { data: Omit<MetaLead, 'form_id' | 'form_name'>[] }
    for (const lead of (data ?? [])) {
      allLeads.push({ ...lead, form_id: formId, form_name: formName })
    }
  }

  allLeads.sort((a, b) => new Date(b.created_time).getTime() - new Date(a.created_time).getTime())
  return NextResponse.json({ leads: allLeads, total: allLeads.length, forms_found: formIds.size })
}
