import { Resend } from "resend"
import { NextResponse } from "next/server"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const { name, email, message } = await req.json()

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
  }

  const { error } = await resend.emails.send({
    from: "Formulario RIAVA <no-reply@riava.cl>",
    to: "contacto@riava.cl",
    replyTo: email,
    subject: `Nuevo contacto de ${name}`,
    html: `
      <div style="font-family: monospace; background: #000a0f; color: #e2e8f0; padding: 32px; border-radius: 8px;">
        <h2 style="color: #00e5ff; margin-bottom: 24px;">Nuevo mensaje de contacto — RIAVA</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; width: 120px;">Nombre</td>
            <td style="padding: 8px 0; color: #e2e8f0;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Email</td>
            <td style="padding: 8px 0; color: #00e5ff;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; vertical-align: top;">Mensaje</td>
            <td style="padding: 8px 0; color: #e2e8f0; white-space: pre-line;">${message}</td>
          </tr>
        </table>
        <p style="color: #475569; font-size: 12px; margin-top: 32px;">Enviado desde riava.cl</p>
      </div>
    `,
  })

  if (error) {
    return NextResponse.json({ error: "Error al enviar el correo" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
