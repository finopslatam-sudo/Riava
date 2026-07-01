import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAllLeads, createLead } from '@/lib/leads-store'

function field(data: { name: string; values: string[] }[], ...keys: string[]): string {
  for (const key of keys) {
    const found = data.find(f => f.name.toLowerCase() === key.toLowerCase())
    if (found?.values?.[0]) return found.values[0]
  }
  return ''
}

export async function POST() {
  const cookieStore = await cookies()
  const token = cookieStore.get('meta_access_token')?.value
  if (!token) return NextResponse.json({ error: 'No conectado a Meta' }, { status: 401 })

  // Get pages
  const pagesRes = await fetch(
    `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token&access_token=${token}`
  )
  if (!pagesRes.ok) return NextResponse.json({ error: 'Error obteniendo páginas' }, { status: 502 })
  const { data: pages } = await pagesRes.json() as { data: { id: string; name: string; access_token: string }[] }

  const existingLeads = await getAllLeads()
  const existingEmails = new Set(existingLeads.map(l => l.email.toLowerCase()))

  let imported = 0
  let skipped = 0

  for (const page of pages) {
    const formsRes = await fetch(
      `https://graph.facebook.com/v19.0/${page.id}/leadgen_forms?` +
      new URLSearchParams({ fields: 'id,name', access_token: page.access_token })
    )
    if (!formsRes.ok) continue
    const { data: forms } = await formsRes.json() as { data: { id: string; name: string }[] }

    for (const form of forms) {
      const leadsRes = await fetch(
        `https://graph.facebook.com/v19.0/${form.id}/leads?` +
        new URLSearchParams({
          fields: 'id,created_time,campaign_name,field_data',
          limit: '200',
          access_token: page.access_token,
        })
      )
      if (!leadsRes.ok) continue
      const { data: metaLeads } = await leadsRes.json() as {
        data: { id: string; created_time: string; campaign_name?: string; field_data: { name: string; values: string[] }[] }[]
      }

      for (const ml of metaLeads) {
        const email = field(ml.field_data, 'email', 'correo_electronico', 'correo', 'e-mail')
        if (!email || existingEmails.has(email.toLowerCase())) { skipped++; continue }

        const full_name =
          field(ml.field_data, 'full_name', 'nombre_completo', 'nombre', 'name') ||
          [
            field(ml.field_data, 'first_name', 'nombre', 'primer_nombre'),
            field(ml.field_data, 'last_name', 'apellido', 'apellidos'),
          ].filter(Boolean).join(' ') ||
          'Sin nombre'

        await createLead({
          full_name,
          email,
          phone: field(ml.field_data, 'phone_number', 'telefono', 'teléfono', 'celular', 'mobile', 'phone'),
          company_name: field(ml.field_data, 'company_name', 'empresa', 'compania', 'company'),
          source_campaign: ml.campaign_name ?? form.name,
          status: 'new',
        })

        existingEmails.add(email.toLowerCase())
        imported++
      }
    }
  }

  return NextResponse.json({ imported, skipped, total: imported + skipped })
}
