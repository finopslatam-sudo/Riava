import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

type FieldData = { name: string; values: string[] }
type MetaLead = {
  id: string; created_time: string; ad_id?: string; ad_name?: string
  adset_name?: string; campaign_id?: string; campaign_name?: string
  form_id: string; form_name: string; field_data: FieldData[]
}
type PageInfo = { id: string; name: string; access_token?: string }

async function getPagesViaBusinesses(token: string): Promise<PageInfo[]> {
  // Try via Business Portfolio (Business Login path)
  const bizRes = await fetch(
    `https://graph.facebook.com/v19.0/me/businesses?fields=id,name,owned_pages{id,name,access_token}&access_token=${token}`
  )
  if (!bizRes.ok) return []
  const { data: businesses } = await bizRes.json() as {
    data: { id: string; name: string; owned_pages?: { data: PageInfo[] } }[]
  }
  return businesses.flatMap(b => b.owned_pages?.data ?? [])
}

async function getLeadsForPage(page: PageInfo, token: string): Promise<MetaLead[]> {
  const pageToken = page.access_token ?? token
  const formsRes = await fetch(
    `https://graph.facebook.com/v19.0/${page.id}/leadgen_forms?` +
    new URLSearchParams({ fields: 'id,name,status', access_token: pageToken })
  )
  if (!formsRes.ok) return []
  const { data: forms } = await formsRes.json() as { data: { id: string; name: string }[] }

  const leads: MetaLead[] = []
  for (const form of forms) {
    const leadsRes = await fetch(
      `https://graph.facebook.com/v19.0/${form.id}/leads?` +
      new URLSearchParams({
        fields: 'id,created_time,ad_id,ad_name,adset_name,campaign_id,campaign_name,field_data',
        limit: '200',
        access_token: pageToken,
      })
    )
    if (!leadsRes.ok) continue
    const { data } = await leadsRes.json() as { data: Omit<MetaLead, 'form_id' | 'form_name'>[] }
    for (const lead of (data ?? [])) {
      leads.push({ ...lead, form_id: form.id, form_name: form.name })
    }
  }
  return leads
}

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('meta_access_token')?.value
  if (!token) return NextResponse.json({ error: 'No conectado a Meta' }, { status: 401 })

  // Try direct accounts first, then business portfolio
  const accountsRes = await fetch(
    `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token&access_token=${token}`
  )
  const accountsData = accountsRes.ok ? await accountsRes.json() as { data: PageInfo[] } : { data: [] }
  let pages: PageInfo[] = accountsData.data ?? []

  // If no pages via me/accounts, try business portfolio
  if (pages.length === 0) {
    pages = await getPagesViaBusinesses(token)
  }

  const allLeads: MetaLead[] = []
  for (const page of pages) {
    const leads = await getLeadsForPage(page, token)
    allLeads.push(...leads)
  }

  allLeads.sort((a, b) => new Date(b.created_time).getTime() - new Date(a.created_time).getTime())
  return NextResponse.json({ leads: allLeads, total: allLeads.length, pages_found: pages.length })
}
