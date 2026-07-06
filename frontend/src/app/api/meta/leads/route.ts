import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAccessiblePages } from '@/lib/meta-pages'

type FieldData = { name: string; values: string[] }
type MetaLead = {
  id: string; created_time: string; campaign_name?: string
  form_id: string; form_name: string; field_data: FieldData[]
}

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('meta_access_token')?.value
  if (!token) return NextResponse.json({ error: 'No conectado a Meta' }, { status: 401 })

  const pages = await getAccessiblePages(token)

  const allLeads: MetaLead[] = []
  const debugPages: { id: string; name: string; forms_found: number; forms_error?: string }[] = []

  for (const page of pages) {
    const formsRes = await fetch(
      `https://graph.facebook.com/v19.0/${page.id}/leadgen_forms?` +
      new URLSearchParams({ fields: 'id,name', access_token: page.access_token })
    )
    if (!formsRes.ok) {
      debugPages.push({ id: page.id, name: page.name, forms_found: 0, forms_error: await formsRes.text() })
      continue
    }
    const { data: forms } = await formsRes.json() as { data: { id: string; name: string }[] }
    debugPages.push({ id: page.id, name: page.name, forms_found: (forms ?? []).length })

    for (const form of (forms ?? [])) {
      const leadsRes = await fetch(
        `https://graph.facebook.com/v19.0/${form.id}/leads?` +
        new URLSearchParams({
          fields: 'id,created_time,campaign_name,field_data',
          limit: '200',
          access_token: page.access_token,
        })
      )
      if (!leadsRes.ok) continue
      const { data } = await leadsRes.json() as { data: Omit<MetaLead, 'form_id' | 'form_name'>[] }
      for (const lead of (data ?? [])) {
        allLeads.push({ ...lead, form_id: form.id, form_name: form.name })
      }
    }
  }

  allLeads.sort((a, b) => new Date(b.created_time).getTime() - new Date(a.created_time).getTime())
  return NextResponse.json({
    leads: allLeads,
    total: allLeads.length,
    debug: { pages_found: pages.length, pages: debugPages },
  })
}
