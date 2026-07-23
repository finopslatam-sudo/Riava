import { getAllLeads, createLead, updateLead } from '@/lib/leads-store'
import { scoreLead } from '@/lib/lead-scoring'
import { getAccessiblePages } from '@/lib/meta-pages'
import { sendEmail } from '@/lib/mailer'

type FieldData = { name: string; values: string[] }
type FormQuestion = { key: string; label?: string }

const AGENDAR_URL = 'https://www.riava.cl/agendar'
const WHATSAPP_NUMBER = '56965090121'

function buildWelcomeEmail(fullName: string): string {
  const firstName = fullName.split(' ')[0] || fullName
  const whatsappText = encodeURIComponent(`Hola, soy ${fullName} y llené el formulario en la web de RIAVA System.`)
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappText}`

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f0f4f8">
  <tr><td align="center" style="padding:24px 12px;">
    <table width="560" cellpadding="0" cellspacing="0" style="border-radius:10px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.12);">
      <tr><td style="background:#000a0f;padding:28px 36px;">
        <img src="https://riava.cl/logocolor.png" alt="RIAVA System SpA" height="42" style="display:block;">
      </td></tr>
      <tr><td style="background:#ffffff;padding:32px 36px;">
        <p style="margin:0 0 16px;font-size:16px;color:#111827;">¡Hola ${firstName}! 👋</p>
        <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.7;">
          Gracias por contactar a <strong>RIAVA System</strong> y por tomarte el tiempo de llenar el formulario en nuestra página web.
          Ya recibimos tu información y uno de nuestros especialistas la va a revisar.
        </p>
        <p style="margin:0 0 24px;font-size:14px;color:#374151;line-height:1.7;">
          Mientras tanto, te dejamos dos formas de avanzar más rápido:
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
          <tr><td style="padding:14px 18px;background:#f9fafb;border-radius:8px;border-left:3px solid #00e5ff;">
            <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#111827;">📅 Agenda una reunión</p>
            <p style="margin:0 0 10px;font-size:13px;color:#6b7280;">Elige el horario que más te acomode y conversemos sobre tu proyecto.</p>
            <a href="${AGENDAR_URL}" style="display:inline-block;background:#00e5ff;color:#000a0f;text-decoration:none;font-size:13px;font-weight:700;padding:10px 18px;border-radius:6px;">Agendar ahora</a>
          </td></tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:14px 18px;background:#f9fafb;border-radius:8px;border-left:3px solid #25d366;">
            <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#111827;">💬 Escríbenos por WhatsApp</p>
            <p style="margin:0 0 10px;font-size:13px;color:#6b7280;">Si prefieres conversar directo, empecemos ahora mismo.</p>
            <a href="${whatsappUrl}" style="display:inline-block;background:#25d366;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;padding:10px 18px;border-radius:6px;">Abrir WhatsApp</a>
          </td></tr>
        </table>
        <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;">
          Si no llenaste este formulario, puedes ignorar este correo.
        </p>
      </td></tr>
      <tr><td style="background:#f9fafb;padding:20px 36px;border-top:1px solid #e5e7eb;">
        <p style="margin:0;font-size:13px;font-weight:700;color:#111827;">RIAVA System SpA</p>
        <p style="margin:3px 0 0;font-size:12px;color:#6b7280;">contacto@riava.cl · www.riava.cl</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`
}

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
          to: email,
          subject: `Gracias por contactar a RIAVA System, ${full_name.split(' ')[0]}`,
          html: buildWelcomeEmail(full_name),
        }).catch(() => {})

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
