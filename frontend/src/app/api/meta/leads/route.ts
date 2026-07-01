import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

type FieldData = { name: string; values: string[] }

type MetaLead = {
  id: string
  created_time: string
  ad_id?: string
  ad_name?: string
  adset_name?: string
  campaign_id?: string
  campaign_name?: string
  form_id: string
  form_name: string
  field_data: FieldData[]
}

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('meta_access_token')?.value
  if (!token) return NextResponse.json({ error: 'No conectado a Meta' }, { status: 401 })

  // Step 1: get pages the user manages
  const pagesRes = await fetch(
    `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token&access_token=${token}`
  )
  if (!pagesRes.ok) {
    const err = await pagesRes.json()
    return NextResponse.json({ error: 'Error obteniendo páginas', detail: err }, { status: 502 })
  }
  const { data: pages } = await pagesRes.json() as { data: { id: string; name: string; access_token: string }[] }

  const allLeads: MetaLead[] = []

  for (const page of pages) {
    // Step 2: get lead gen forms for this page (use page-level access token)
    const formsRes = await fetch(
      `https://graph.facebook.com/v19.0/${page.id}/leadgen_forms?` +
      new URLSearchParams({
        fields: 'id,name,status',
        access_token: page.access_token,
      })
    )
    if (!formsRes.ok) continue
    const { data: forms } = await formsRes.json() as { data: { id: string; name: string; status: string }[] }

    for (const form of forms) {
      // Step 3: get leads for each form
      const leadsRes = await fetch(
        `https://graph.facebook.com/v19.0/${form.id}/leads?` +
        new URLSearchParams({
          fields: 'id,created_time,ad_id,ad_name,adset_name,campaign_id,campaign_name,field_data',
          limit: '200',
          access_token: page.access_token,
        })
      )
      if (!leadsRes.ok) continue
      const { data: leads } = await leadsRes.json() as { data: Omit<MetaLead, 'form_id' | 'form_name'>[] }

      for (const lead of leads) {
        allLeads.push({ ...lead, form_id: form.id, form_name: form.name })
      }
    }
  }

  // Sort newest first
  allLeads.sort((a, b) => new Date(b.created_time).getTime() - new Date(a.created_time).getTime())

  return NextResponse.json({ leads: allLeads, total: allLeads.length })
}
