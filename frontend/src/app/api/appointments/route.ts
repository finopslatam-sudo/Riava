import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { getSlots, saveSlots, getAppointments, saveAppointments, type Appointment } from '@/lib/data-store'
import { createMeetEvent } from '@/lib/google-meet'
import { BOOKING_SERVICES } from '@/lib/constants'

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true,
  auth: { user: process.env.ZOHO_EMAIL, pass: process.env.ZOHO_PASSWORD },
})

function fmtDate(d: string) {
  const [y, m, day] = d.split('-')
  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
  return `${parseInt(day)} de ${months[parseInt(m) - 1]} de ${y}`
}

function clientHtml(a: Appointment) {
  const meet = a.meetLink
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr><td style="padding:20px;background:#000a0f;border-radius:8px;text-align:center;">
          <p style="margin:0 0 6px;font-size:11px;color:rgba(0,229,255,0.6);text-transform:uppercase;letter-spacing:1px;font-weight:600;">ENLACE GOOGLE MEET</p>
          <p style="margin:0 0 14px;font-size:13px;color:rgba(224,247,255,0.7);">Usa este enlace para unirte a la videollamada en la fecha y hora indicadas.</p>
          <a href="${a.meetLink}" style="display:inline-block;background:#00e5ff;color:#000a0f;text-decoration:none;font-weight:700;font-size:13px;padding:12px 28px;border-radius:6px;">Unirse a la reunión →</a>
          <p style="margin:12px 0 0;font-size:11px;color:rgba(0,229,255,0.4);word-break:break-all;">${a.meetLink}</p>
        </td></tr>
      </table>`
    : ''

  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f0f4f8"><tr><td align="center" style="padding:24px 12px;">
<table width="620" cellpadding="0" cellspacing="0" style="border-radius:10px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.12);">
  <tr><td style="background:#000a0f;padding:28px 36px;">
    <img src="https://riava.cl/logocolor.png" alt="RIAVA System SpA" height="42" style="display:block;margin-bottom:14px;">
    <p style="margin:0;color:#00e5ff;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:700;">CONFIRMACIÓN DE CITA</p>
  </td></tr>
  <tr><td style="background:#ffffff;padding:32px 36px;">
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">¡Cita confirmada, ${a.name}!</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">Tu reunión con RIAVA System SpA ha sido agendada exitosamente.</p>
    <div style="height:1px;background:#e5e7eb;margin-bottom:24px;"></div>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr><td style="padding:16px;background:#f9fafb;border-radius:8px;border-left:3px solid #00e5ff;">
        <p style="margin:0 0 12px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;font-weight:600;">DETALLES DE LA REUNIÓN</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:5px 0;font-size:13px;color:#6b7280;width:130px;">📅 Fecha</td><td style="padding:5px 0;font-size:13px;font-weight:600;color:#111827;">${fmtDate(a.date)}</td></tr>
          <tr><td style="padding:5px 0;font-size:13px;color:#6b7280;">🕐 Hora</td><td style="padding:5px 0;font-size:13px;font-weight:600;color:#111827;">${a.startTime} – ${a.endTime} (Santiago, Chile)</td></tr>
          <tr><td style="padding:5px 0;font-size:13px;color:#6b7280;">💼 Servicio</td><td style="padding:5px 0;font-size:13px;font-weight:600;color:#111827;">${a.service}</td></tr>
        </table>
      </td></tr>
    </table>
    ${meet}
    <p style="margin:0 0 8px;font-size:13px;color:#374151;">¿Necesitas reagendar? Escríbenos a <a href="mailto:contacto@riava.cl" style="color:#00e5ff;text-decoration:none;">contacto@riava.cl</a></p>
  </td></tr>
  <tr><td style="background:#f9fafb;padding:24px 36px;border-top:1px solid #e5e7eb;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><img src="https://riava.cl/firmacorreo.png" alt="Firma" height="70" style="display:block;margin-bottom:10px;">
        <p style="margin:0;font-size:13px;font-weight:700;color:#111827;">RIAVA System SpA</p>
        <p style="margin:3px 0 0;font-size:12px;color:#6b7280;">contacto@riava.cl · www.riava.cl</p>
      </td>
      <td align="right" valign="middle"><img src="https://riava.cl/logocolor.png" alt="RIAVA" height="36" style="display:block;margin-left:auto;"></td>
    </tr></table>
  </td></tr>
</table></td></tr></table></body></html>`
}

function adminHtml(a: Appointment) {
  const meet = a.meetLink
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr><td style="padding:20px;background:#000a0f;border-radius:8px;text-align:center;">
          <p style="margin:0 0 6px;font-size:11px;color:rgba(0,229,255,0.6);text-transform:uppercase;letter-spacing:1px;font-weight:600;">ENLACE GOOGLE MEET</p>
          <a href="${a.meetLink}" style="display:inline-block;background:#00e5ff;color:#000a0f;text-decoration:none;font-weight:700;font-size:13px;padding:12px 28px;border-radius:6px;">Abrir reunión →</a>
          <p style="margin:12px 0 0;font-size:11px;color:rgba(0,229,255,0.4);word-break:break-all;">${a.meetLink}</p>
        </td></tr>
      </table>`
    : ''

  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f0f4f8"><tr><td align="center" style="padding:24px 12px;">
<table width="620" cellpadding="0" cellspacing="0" style="border-radius:10px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.12);">
  <tr><td style="background:#000a0f;padding:28px 36px;">
    <img src="https://riava.cl/logocolor.png" alt="RIAVA System SpA" height="42" style="display:block;margin-bottom:14px;">
    <p style="margin:0;color:#f000ff;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:700;">NUEVA CITA AGENDADA</p>
  </td></tr>
  <tr><td style="background:#ffffff;padding:32px 36px;">
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">Nueva reunión en tu agenda</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">Un cliente agendó una cita a través del sistema de reservas.</p>
    <div style="height:1px;background:#e5e7eb;margin-bottom:24px;"></div>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr><td style="padding:16px;background:#f9fafb;border-radius:8px;border-left:3px solid #f000ff;">
        <p style="margin:0 0 12px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;font-weight:600;">DATOS DEL CLIENTE</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:4px 0;font-size:13px;color:#6b7280;width:130px;">Nombre</td><td style="padding:4px 0;font-size:13px;font-weight:600;color:#111827;">${a.name} ${a.lastName}</td></tr>
          <tr><td style="padding:4px 0;font-size:13px;color:#6b7280;">Empresa</td><td style="padding:4px 0;font-size:13px;color:#374151;">${a.company || '—'}</td></tr>
          <tr><td style="padding:4px 0;font-size:13px;color:#6b7280;">Correo</td><td style="padding:4px 0;font-size:13px;color:#374151;">${a.email}</td></tr>
          <tr><td style="padding:4px 0;font-size:13px;color:#6b7280;">Teléfono</td><td style="padding:4px 0;font-size:13px;color:#374151;">${a.phone || '—'}</td></tr>
          <tr><td style="padding:4px 0;font-size:13px;color:#6b7280;">Servicio</td><td style="padding:4px 0;font-size:13px;font-weight:600;color:#111827;">${a.service}</td></tr>
        </table>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr><td style="padding:16px;background:#f9fafb;border-radius:8px;border-left:3px solid #00e5ff;">
        <p style="margin:0 0 8px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;font-weight:600;">FECHA Y HORA</p>
        <p style="margin:0;font-size:16px;font-weight:700;color:#111827;">📅 ${fmtDate(a.date)}</p>
        <p style="margin:6px 0 0;font-size:14px;color:#374151;">🕐 ${a.startTime} – ${a.endTime}</p>
      </td></tr>
    </table>
    ${meet}
  </td></tr>
  <tr><td style="background:#f9fafb;padding:16px 36px;border-top:1px solid #e5e7eb;">
    <p style="margin:0;font-size:12px;color:#9ca3af;">Notificación automática · RIAVA System SpA</p>
  </td></tr>
</table></td></tr></table></body></html>`
}

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date')
  let appts = getAppointments()
  if (date) appts = appts.filter(a => a.date === date)
  return NextResponse.json(appts)
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    slotId: string; name: string; lastName: string
    company?: string; email: string; phone?: string; service: string
  }

  const { slotId, name, lastName, company, email, phone, service } = body

  if (!slotId || !name || !lastName || !email || !service) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }
  if (!(BOOKING_SERVICES as readonly string[]).includes(service)) {
    return NextResponse.json({ error: 'Servicio inválido' }, { status: 400 })
  }

  const slots = getSlots()
  const slot = slots.find(s => s.id === slotId)
  if (!slot) return NextResponse.json({ error: 'Horario no encontrado' }, { status: 404 })
  if (slot.booked) return NextResponse.json({ error: 'Este horario ya fue reservado' }, { status: 409 })

  const meetLink = await createMeetEvent({
    name, lastName, service,
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    clientEmail: email,
  }) ?? ''

  const appt: Appointment = {
    id: `appt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    slotId,
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    name,
    lastName,
    company: company ?? '',
    email,
    phone: phone ?? '',
    service,
    meetLink,
    createdAt: new Date().toISOString(),
  }

  slot.booked = true
  slot.appointmentId = appt.id
  saveSlots(slots)

  const appointments = getAppointments()
  appointments.push(appt)
  saveAppointments(appointments)

  const adminEmail = process.env.ZOHO_EMAIL ?? 'contacto@riava.cl'

  transporter.sendMail({
    from: `"RIAVA System SpA" <${process.env.ZOHO_EMAIL}>`,
    to: email,
    subject: `Confirmación de cita · ${fmtDate(appt.date)} ${appt.startTime} · RIAVA System SpA`,
    html: clientHtml(appt),
  }).catch(console.error)

  transporter.sendMail({
    from: `"RIAVA Sistema" <${process.env.ZOHO_EMAIL}>`,
    to: adminEmail,
    subject: `Nueva cita: ${name} ${lastName} · ${fmtDate(appt.date)} ${appt.startTime}`,
    html: adminHtml(appt),
  }).catch(console.error)

  return NextResponse.json(appt, { status: 201 })
}
