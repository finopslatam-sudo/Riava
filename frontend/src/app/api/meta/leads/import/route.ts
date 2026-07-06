import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAllLeads, createLead } from '@/lib/leads-store'
import { scoreLead } from '@/lib/lead-scoring'

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

  // Get ad accounts
  const accsRes = await fetch(
    `https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name&access_token=${token}`
  )
  if (!accsRes.ok) return NextResponse.json({ error: 'Error obteniendo cuentas' }, { status: 502 })
  const { data: accounts } = await accsRes.json() as { data: { id: string; name: string }[] }

  // Collect unique lead form IDs from ads across all accounts (bypasses page access limitation)
  const formIds = new Map<string, string>() // formId → campaign/ad name fallback

  for (const acc of accounts) {
    const adsRes = await fetch(
      `https://graph.facebook.com/v19.0/${acc.id}/ads?` +
      new URLSearchParams({
        fields: 'id,name,campaign{name},creative{lead_gen_form_id}',
        limit: '200',
        access_token: token,
      })
    )
    if (!adsRes.ok) continue
    const { data: ads } = await adsRes.json() as {
      data: {
        id: string
        name: string
        campaign?: { name?: string }
        creative?: { lead_gen_form_id?: string }
      }[]
    }
    for (const ad of (ads ?? [])) {
      const fid = ad.creative?.lead_gen_form_id
      if (fid && !formIds.has(fid)) formIds.set(fid, ad.campaign?.name ?? ad.name)
    }
  }

  const existingLeads = await getAllLeads()
  const existingEmails = new Set(existingLeads.map(l => l.email.toLowerCase()))

  let imported = 0
  let skipped = 0

  for (const [formId, fallbackName] of formIds) {
    const formInfoRes = await fetch(
      `https://graph.facebook.com/v19.0/${formId}?fields=id,name,questions&access_token=${token}`
    )
    let formName = fallbackName
    const labels = new Map<string, string>()
    if (formInfoRes.ok) {
      const formInfo = await formInfoRes.json() as { name?: string; questions?: FormQuestion[] }
      formName = formInfo.name ?? fallbackName
      for (const q of (formInfo.questions ?? [])) {
        if (q.label) labels.set(q.key.toLowerCase(), q.label)
      }
    }

    const leadsRes = await fetch(
      `https://graph.facebook.com/v19.0/${formId}/leads?` +
      new URLSearchParams({
        fields: 'id,created_time,campaign_name,field_data',
        limit: '200',
        access_token: token,
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
      const source_campaign = ml.campaign_name ?? formName
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

  return NextResponse.json({ imported, skipped, total: imported + skipped, forms_found: formIds.size })
}
