import nodemailer from "nodemailer"
import { NextResponse } from "next/server"

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.ZOHO_EMAIL,
    pass: process.env.ZOHO_PASSWORD,
  },
})

export async function POST(req: Request) {
  const { name, email, message } = await req.json()

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
  }

  try {
    await transporter.sendMail({
      from: `"RIAVA Web" <${process.env.ZOHO_EMAIL}>`,
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

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error al enviar el correo" }, { status: 500 })
  }
}
