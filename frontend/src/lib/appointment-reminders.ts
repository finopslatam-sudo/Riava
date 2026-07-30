import { getAppointments, saveAppointments } from '@/lib/data-store'
import { getAutomation } from '@/lib/automations-store'
import { sendEmail } from '@/lib/mailer'
import { chileWallTimeToInstant } from '@/lib/chile-time'

function buildReminderEmail(name: string, date: string, startTime: string, meetLink: string): string {
  const formattedDate = new Date(`${date}T00:00:00`).toLocaleDateString('es-CL', {
    weekday: 'long', day: '2-digit', month: 'long',
  })

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
        <p style="margin:0 0 16px;font-size:16px;color:#111827;">Hola ${name} 👋</p>
        <p style="margin:0 0 20px;font-size:14px;color:#374151;line-height:1.7;">
          Te recordamos tu reunión con RIAVA System:
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
          <tr><td style="padding:16px 18px;background:#f9fafb;border-radius:8px;border-left:3px solid #00e5ff;">
            <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#111827;text-transform:capitalize;">${formattedDate}</p>
            <p style="margin:0;font-size:14px;color:#374151;">${startTime} hrs (hora de Chile)</p>
          </td></tr>
        </table>
        ${meetLink ? `<a href="${meetLink}" style="display:inline-block;background:#00e5ff;color:#000a0f;text-decoration:none;font-size:13px;font-weight:700;padding:10px 18px;border-radius:6px;">Unirse a la reunión</a>` : ''}
        <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;">
          Si necesitas reagendar, contáctanos respondiendo este correo.
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

export type ReminderResult = { sent: number; checked: number }

export async function runAppointmentReminders(): Promise<ReminderResult> {
  const automation = await getAutomation('appointment_reminder')
  if (!automation.enabled) return { sent: 0, checked: 0 }

  const hoursBefore = automation.config.hours_before
  const appointments = await getAppointments()
  const now = new Date()

  let sent = 0
  let checked = 0
  let changed = false

  for (const appt of appointments) {
    if (appt.reminderSent) continue
    checked++

    const start = chileWallTimeToInstant(appt.date, appt.startTime)
    const hoursUntil = (start.getTime() - now.getTime()) / (1000 * 60 * 60)
    if (hoursUntil > hoursBefore || hoursUntil < 0) continue

    try {
      await sendEmail({
        to: appt.email,
        subject: `Recordatorio: tu reunión con RIAVA System es pronto`,
        html: buildReminderEmail(appt.name, appt.date, appt.startTime, appt.meetLink),
      })
      appt.reminderSent = true
      changed = true
      sent++
    } catch {
      // se reintenta en la próxima corrida
    }
  }

  if (changed) await saveAppointments(appointments)

  return { sent, checked }
}
