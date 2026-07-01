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

  // Check what permissions the token actually has
  const permRes = await fetch(`https://graph.facebook.com/v19.0/me/permissions?access_token=${token}`)
  const permData = permRes.ok ? await permRes.json() : null

  // Step 1: get pages the user manages
  const pagesRes = await fetch(
    `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token&access_token=${token}`
  )
  if (!pagesRes.ok) {
    const err = await pagesRes.json()
    return NextResponse.json({ error: 'Error obteniendo páginas', detail: err }, { status: 502 })
  }
  const pagesData = await pagesRes.json() as { data: { id: string; name: string; access_token: string }[] }
  const pages = pagesData.data

  const debug: Record<string, unknown>[] = []
  const allLeads: MetaLead[] = []

  for (const page of pages) {
    const pageDebug: Record<string, unknown> = { page_id: page.id, page_name: page.name, forms: [] }

    // Step 2: get lead gen forms for this page
    const formsRes = await fetch(
      `https://graph.facebook.com/v19.0/${page.id}/leadgen_forms?` +
      new URLSearchParams({ fields: 'id,name,status', access_token: page.access_token })
    )
    const formsData = formsRes.ok ? await formsRes.json() : null
    pageDebug.forms_status = formsRes.status
    pageDebug.forms_raw = formsData

    if (!formsRes.ok || !formsData?.data) { debug.push(pageDebug); continue }
    const forms = formsData.data as { id: string; name: string; status: string }[]

    for (const form of forms) {
      const formDebug: Record<string, unknown> = { form_id: form.id, form_name: form.name }

      const leadsRes = await fetch(
        `https://graph.facebook.com/v19.0/${form.id}/leads?` +
        new URLSearchParams({
          fields: 'id,created_time,ad_id,ad_name,adset_name,campaign_id,campaign_name,field_data',
          limit: '200',
          access_token: page.access_token,
        })
      )
      const leadsData = leadsRes.ok ? await leadsRes.json() : null
      formDebug.leads_status = leadsRes.status
      formDebug.leads_raw = leadsData
      ;(pageDebug.forms as unknown[]).push(formDebug)

      if (!leadsRes.ok || !leadsData?.data) continue
      for (const lead of leadsData.data as Omit<MetaLead, 'form_id' | 'form_name'>[]) {
        allLeads.push({ ...lead, form_id: form.id, form_name: form.name })
      }
    }
    debug.push(pageDebug)
  }

  allLeads.sort((a, b) => new Date(b.created_time).getTime() - new Date(a.created_time).getTime())

  return NextResponse.json({
    leads: allLeads,
    total: allLeads.length,
    debug: { permissions: permData, pages_count: pages.length, pages: debug },
  })
}
