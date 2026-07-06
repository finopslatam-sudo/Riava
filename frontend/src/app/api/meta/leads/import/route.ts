import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAllLeads, createLead } from '@/lib/leads-store'
import { scoreLead } from '@/lib/lead-scoring'
import { getAccessiblePages } from '@/lib/meta-pages'

type FieldData = { name: string; values: string[] }
type FormQuestion = { key: string; label?: string }

const STANDARD_KEYS = new Set([
  'full_name', 'nombre_completo', 'nombre', 'name',
  'first_name', 'primer_nombre', 'last_name', 'apellido', 'apellidos',
  'email', 'correo_electronico', 'correo', 'e-mail',
  'phone_number', 'telefono', 'teléfono', 'celular', 'mobile', 'phone',
  'company_name', 'empresa', 'compania', 'company',
])

function field(data: FieldData[], ...keys: string[]): string {
  for (const key of keys) {
    const found = data.find(f => f.name.toLowerCase() === key.toLowerCase())
    if (found?.values?.[0]) return found.values[0]
  }
  return ''
}

function buildCustomFields(fieldData: FieldData[], labels: Map<string, string>): Record<string, string> {
  const result: Record<string, string> = {}
  for (const f of fieldData) {
    const key = f.name.toLowerCase()
    if (STANDARD_KEYS.has(key)) continue
    const label = labels.get(key) ?? f.name
    result[label] = f.values?.[0] ?? ''
  }
  return result
}

export async function POST() {
  const cookieStore = await cookies()
  const token = cookieStore.get('meta_access_token')?.value
  if (!token) return NextResponse.json({ error: 'No conectado a Meta' }, { status: 401 })

  const pages = await getAccessiblePages(token)

  const existingLeads = await getAllLeads()
  const existingEmails = new Set(existingLeads.map(l => l.email.toLowerCase()))

  let imported = 0
  let skipped = 0
  let formsFound = 0

  for (const page of pages) {
    const formsRes = await fetch(
      `https://graph.facebook.com/v19.0/${page.id}/leadgen_forms?` +
      new URLSearchParams({ fields: 'id,name,questions', access_token: page.access_token })
    )
    if (!formsRes.ok) continue
    const { data: forms } = await formsRes.json() as {
      data: { id: string; name: string; questions?: FormQuestion[] }[]
    }
    formsFound += (forms ?? []).length

    for (const form of (forms ?? [])) {
      const labels = new Map<string, string>()
      for (const q of (form.questions ?? [])) {
        if (q.label) labels.set(q.key.toLowerCase(), q.label)
      }

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
        data: { id: string; created_time: string; campaign_name?: string; field_data: FieldData[] }[]
      }

      for (const ml of (metaLeads ?? [])) {
        const email = field(ml.field_data, 'email', 'correo_electronico', 'correo', 'e-mail')
        if (!email || existingEmails.has(email.toLowerCase())) { skipped++; continue }

        const full_name =
          field(ml.field_data, 'full_name', 'nombre_completo', 'nombre', 'name') ||
          [
            field(ml.field_data, 'first_name', 'nombre', 'primer_nombre'),
            field(ml.field_data, 'last_name', 'apellido', 'apellidos'),
          ].filter(Boolean).join(' ') ||
          'Sin nombre'

        const phone = field(ml.field_data, 'phone_number', 'telefono', 'teléfono', 'celular', 'mobile', 'phone')
        const company_name = field(ml.field_data, 'company_name', 'empresa', 'compania', 'company')
        const source_campaign = ml.campaign_name ?? form.name
        const custom_fields = buildCustomFields(ml.field_data, labels)

        const { score, reasoning } = await scoreLead({
          full_name, email, phone, company_name, source_campaign, custom_fields,
        })

        await createLead({
          full_name,
          email,
          phone,
          company_name,
          source_campaign,
          status: 'new',
          score,
          ai_reasoning: reasoning,
          custom_fields,
        })

        existingEmails.add(email.toLowerCase())
        imported++
      }
    }
  }

  return NextResponse.json({ imported, skipped, total: imported + skipped, pages_found: pages.length, forms_found: formsFound })
}
