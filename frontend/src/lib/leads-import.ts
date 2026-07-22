import { getAllLeads, createLead, updateLead } from '@/lib/leads-store'
import { scoreLead } from '@/lib/lead-scoring'
import { getAccessiblePages } from '@/lib/meta-pages'
import { sendEmail } from '@/lib/mailer'

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

export type LeadsImportResult = {
  imported: number
  skipped: number
  total: number
  pages_found: number
  forms_found: number
}

export async function runLeadsImport(token: string): Promise<LeadsImportResult> {
  const pages = await getAccessiblePages(token)

  const existingLeads = await getAllLeads()
  const existingByEmail = new Map(existingLeads.map(l => [l.email.toLowerCase(), l]))

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
        if (!email) { skipped++; continue }

        const existing = existingByEmail.get(email.toLowerCase())
        if (existing) {
          skipped++
          if (existing.created_at !== ml.created_time) {
            await updateLead(existing.id, { created_at: ml.created_time })
          }
          continue
        }

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

        const lead = await createLead({
          full_name,
          email,
          phone,
          company_name,
          source_campaign,
          status: 'new',
          score,
          ai_reasoning: reasoning,
          custom_fields,
          created_at: ml.created_time,
        })

        existingByEmail.set(email.toLowerCase(), lead)
        imported++

        sendEmail({
          to: 'contacto@riava.cl',
          subject: `Nuevo lead: ${full_name} — ${source_campaign}`,
          html: `
            <div style="font-family: monospace; background: #000a0f; color: #e2e8f0; padding: 32px; border-radius: 8px;">
              <h2 style="color: #00e5ff; margin-bottom: 24px;">Nuevo lead — RIAVA</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #64748b; width: 140px;">Nombre</td><td style="padding: 8px 0; color: #e2e8f0;">${full_name}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;">Email</td><td style="padding: 8px 0; color: #00e5ff;">${email}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;">Teléfono</td><td style="padding: 8px 0; color: #e2e8f0;">${phone || '(sin teléfono)'}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;">Empresa</td><td style="padding: 8px 0; color: #e2e8f0;">${company_name || '(sin especificar)'}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;">Campaña</td><td style="padding: 8px 0; color: #e2e8f0;">${source_campaign}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;">Score IA</td><td style="padding: 8px 0; color: #e2e8f0;">${score}/100</td></tr>
              </table>
              <p style="color: #475569; font-size: 12px; margin-top: 32px;">
                <a href="https://riava.cl/dashboard/leads" style="color: #00e5ff;">Ver en el dashboard →</a>
              </p>
            </div>
          `,
        }).catch(() => {})
      }
    }
  }

  return { imported, skipped, total: imported + skipped, pages_found: pages.length, forms_found: formsFound }
}
