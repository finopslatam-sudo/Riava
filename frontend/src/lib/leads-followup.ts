import { getAllLeads, updateLead } from '@/lib/leads-store'
import { sendEmail } from '@/lib/mailer'

const AGENDAR_URL = 'https://www.riava.cl/agendar'
const WHATSAPP_NUMBER = '56965090121'

const FOLLOW_UP_INTERVAL_DAYS = 2
const FOLLOW_UP_PERIOD_DAYS = 30
const MAX_FOLLOW_UPS = Math.floor(FOLLOW_UP_PERIOD_DAYS / FOLLOW_UP_INTERVAL_DAYS)

function daysBetween(a: Date, b: Date): number {
  return (b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)
}

function buildFollowUpEmail(fullName: string): string {
  const firstName = fullName.split(' ')[0] || fullName
  const whatsappText = encodeURIComponent(`Hola, soy ${fullName}, quiero retomar la conversación con RIAVA System.`)
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
        <p style="margin:0 0 16px;font-size:16px;color:#111827;">Hola ${firstName} 👋</p>
        <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.7;">
          Hace unos días nos escribiste a través de nuestra web. Queremos saber si sigues interesado en conversar
          sobre tu proyecto — seguimos disponibles para ayudarte cuando quieras.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
          <tr><td style="padding:14px 18px;background:#f9fafb;border-radius:8px;border-left:3px solid #00e5ff;">
            <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#111827;">📅 Agenda una reunión</p>
            <a href="${AGENDAR_URL}" style="display:inline-block;background:#00e5ff;color:#000a0f;text-decoration:none;font-size:13px;font-weight:700;padding:10px 18px;border-radius:6px;">Agendar ahora</a>
          </td></tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:14px 18px;background:#f9fafb;border-radius:8px;border-left:3px solid #25d366;">
            <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#111827;">💬 Escríbenos por WhatsApp</p>
            <a href="${whatsappUrl}" style="display:inline-block;background:#25d366;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;padding:10px 18px;border-radius:6px;">Abrir WhatsApp</a>
          </td></tr>
        </table>
        <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;">
          Si ya no te interesa, puedes ignorar este correo y no te escribiremos más al respecto.
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

export type FollowUpResult = { sent: number; skipped: number; checked: number }

export async function runLeadsFollowUp(): Promise<FollowUpResult> {
  const leads = await getAllLeads()
  const now = new Date()

  let sent = 0
  let skipped = 0
  let checked = 0

  for (const lead of leads) {
    if (lead.status !== 'new') continue
    if (!lead.first_contact_at || !lead.last_contact_at) continue
    checked++

    const followUpCount = lead.follow_up_count ?? 0
    if (followUpCount >= MAX_FOLLOW_UPS) { skipped++; continue }
    if (daysBetween(new Date(lead.first_contact_at), now) > FOLLOW_UP_PERIOD_DAYS) { skipped++; continue }
    if (daysBetween(new Date(lead.last_contact_at), now) < FOLLOW_UP_INTERVAL_DAYS) { skipped++; continue }

    try {
      await sendEmail({
        to: lead.email,
        subject: `¿Seguimos en contacto, ${lead.full_name.split(' ')[0]}?`,
        html: buildFollowUpEmail(lead.full_name),
      })
      await updateLead(lead.id, { last_contact_at: now.toISOString(), follow_up_count: followUpCount + 1 })
      sent++
    } catch {
      skipped++
    }
  }

  return { sent, skipped, checked }
}
