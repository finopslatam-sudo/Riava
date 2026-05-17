import nodemailer from 'nodemailer'
import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.ZOHO_EMAIL,
    pass: process.env.ZOHO_PASSWORD,
  },
})

function formatCLP(n: number) {
  return n.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })
}

type Item = { id: string; description: string; qty: number; unitPrice: number }

type QuoteData = {
  quoteNum: string
  date: string
  clientName: string
  clientCompany: string
  clientEmail: string
  clientPhone: string
  items: Item[]
  subtotal: number
  discountAmount: number
  discountPct: number
  afterDiscount: number
  ivaAmount: number
  total: number
  notes: string
  validDays: number
}

function buildHtml(body: string, q: QuoteData): string {
  const itemRows = q.items
    .filter(i => i.description)
    .map(
      (item, idx) => `
      <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f9fafb'};">
        <td style="padding:10px 14px;font-size:13px;color:#374151;border-top:1px solid #f3f4f6;">${item.description}</td>
        <td style="padding:10px 14px;font-size:13px;color:#374151;text-align:center;border-top:1px solid #f3f4f6;">${item.qty}</td>
        <td style="padding:10px 14px;font-size:13px;color:#374151;text-align:right;border-top:1px solid #f3f4f6;">${formatCLP(item.unitPrice)}</td>
        <td style="padding:10px 14px;font-size:13px;font-weight:600;color:#111827;text-align:right;border-top:1px solid #f3f4f6;">${formatCLP(item.qty * item.unitPrice)}</td>
      </tr>`,
    )
    .join('')

  const clientBlock =
    q.clientName || q.clientCompany
      ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr><td style="padding:16px;background:#f9fafb;border-radius:8px;border-left:3px solid #00e5ff;">
        <p style="margin:0 0 6px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;font-weight:600;">DATOS DEL CLIENTE</p>
        ${q.clientName ? `<p style="margin:0;font-size:14px;font-weight:600;color:#111827;">${q.clientName}</p>` : ''}
        ${q.clientCompany ? `<p style="margin:2px 0 0;font-size:13px;color:#374151;">${q.clientCompany}</p>` : ''}
        ${q.clientEmail ? `<p style="margin:4px 0 0;font-size:12px;color:#6b7280;">${q.clientEmail}</p>` : ''}
        ${q.clientPhone ? `<p style="margin:2px 0 0;font-size:12px;color:#6b7280;">${q.clientPhone}</p>` : ''}
      </td></tr>
    </table>`
      : ''

  const discountRow =
    q.discountAmount > 0
      ? `<tr>
        <td style="padding:5px 0;font-size:13px;color:#dc2626;">Descuento (${q.discountPct}%)</td>
        <td style="padding:5px 0;font-size:13px;color:#dc2626;text-align:right;">− ${formatCLP(q.discountAmount)}</td>
      </tr>`
      : ''

  const notesBlock = q.notes
    ? `<div style="margin-top:24px;padding:16px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;">
        <p style="margin:0 0 6px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;font-weight:600;">NOTAS Y CONDICIONES</p>
        <p style="margin:0;font-size:13px;color:#374151;white-space:pre-line;">${q.notes}</p>
      </div>`
    : ''

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f0f4f8">
  <tr><td align="center" style="padding:24px 12px;">
    <table width="620" cellpadding="0" cellspacing="0" style="border-radius:10px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.12);">

      <!-- HEADER -->
      <tr><td style="background:#000a0f;padding:28px 36px;">
        <img src="https://riava.cl/logocolor.png" alt="RIAVA System SpA" height="42" style="display:block;margin-bottom:14px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td><p style="margin:0;color:#00e5ff;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:700;">COTIZACIÓN N° ${q.quoteNum}</p></td>
            <td align="right"><p style="margin:0;color:rgba(0,229,255,0.5);font-size:11px;">Fecha: ${q.date}</p></td>
          </tr>
        </table>
      </td></tr>

      <!-- BODY -->
      <tr><td style="background:#ffffff;padding:32px 36px;">

        <!-- Mensaje personalizado -->
        <div style="font-size:14px;color:#374151;line-height:1.75;margin-bottom:28px;">${body.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</div>

        <div style="height:1px;background:#e5e7eb;margin-bottom:24px;"></div>

        ${clientBlock}

        <!-- Items -->
        <p style="margin:0 0 8px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;font-weight:600;">DETALLE DE SERVICIOS</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:24px;">
          <tr style="background:#f9fafb;">
            <td style="padding:10px 14px;font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">DESCRIPCIÓN</td>
            <td style="padding:10px 14px;font-size:11px;color:#6b7280;font-weight:600;text-align:center;width:60px;">CANT.</td>
            <td style="padding:10px 14px;font-size:11px;color:#6b7280;font-weight:600;text-align:right;width:110px;">P. UNIT.</td>
            <td style="padding:10px 14px;font-size:11px;color:#6b7280;font-weight:600;text-align:right;width:120px;">SUBTOTAL</td>
          </tr>
          ${itemRows}
        </table>

        <!-- Totales -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="50%"></td>
            <td width="50%">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:5px 0;font-size:13px;color:#6b7280;">Subtotal</td>
                  <td style="padding:5px 0;font-size:13px;color:#374151;text-align:right;">${formatCLP(q.subtotal)}</td>
                </tr>
                ${discountRow}
                <tr><td colspan="2" style="padding:4px 0;"><div style="height:1px;background:#e5e7eb;"></div></td></tr>
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#374151;">Total neto (sin IVA)</td>
                  <td style="padding:6px 0;font-size:14px;font-weight:600;color:#111827;text-align:right;">${formatCLP(q.afterDiscount)}</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;font-size:12px;color:#9ca3af;">IVA (19%)</td>
                  <td style="padding:4px 0;font-size:12px;color:#9ca3af;text-align:right;">+ ${formatCLP(q.ivaAmount)}</td>
                </tr>
                <tr><td colspan="2" style="padding:4px 0;"><div style="height:2px;background:#000a0f;margin:6px 0;"></div></td></tr>
                <tr>
                  <td style="padding:12px 14px;font-size:14px;font-weight:700;color:#ffffff;background:#000a0f;border-radius:6px 0 0 6px;">TOTAL CON IVA</td>
                  <td style="padding:12px 14px;font-size:18px;font-weight:700;color:#00e5ff;background:#000a0f;border-radius:0 6px 6px 0;text-align:right;">${formatCLP(q.total)}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        ${notesBlock}

        <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;">
          Esta cotización es válida por ${q.validDays} días desde su emisión. Los precios están expresados en Pesos Chilenos (CLP).
        </p>

      </td></tr>

      <!-- FOOTER / FIRMA -->
      <tr><td style="background:#f9fafb;padding:24px 36px;border-top:1px solid #e5e7eb;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <img src="https://riava.cl/firmacorreo.png" alt="Firma RIAVA" height="70" style="display:block;margin-bottom:10px;">
              <p style="margin:0;font-size:13px;font-weight:700;color:#111827;">RIAVA System SpA</p>
              <p style="margin:3px 0 0;font-size:12px;color:#6b7280;">contacto@riava.cl</p>
              <p style="margin:2px 0 0;font-size:12px;color:#6b7280;">www.riava.cl</p>
            </td>
            <td align="right" valign="middle">
              <img src="https://riava.cl/logocolor.png" alt="RIAVA" height="36" style="display:block;margin-left:auto;">
            </td>
          </tr>
        </table>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`
}

export async function POST(req: Request) {
  try {
    const { to, subject, body, quoteData, attachAlcances } = (await req.json()) as {
      to: string
      subject: string
      body: string
      quoteData: QuoteData
      attachAlcances?: boolean
    }

    if (!to || !subject) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const html = buildHtml(body, quoteData)

    const attachments: { filename: string; content: Buffer; contentType: string }[] = []
    if (attachAlcances) {
      const pdfPath = path.join(process.cwd(), 'public', 'alcances-tecnicos-ecommerce.pdf')
      const pdfBuffer = await readFile(pdfPath)
      attachments.push({
        filename: 'Alcances técnicos E-commerce - RIAVA.pdf',
        content: pdfBuffer,
        contentType: 'application/pdf',
      })
    }

    await transporter.sendMail({
      from: `"RIAVA System SpA" <${process.env.ZOHO_EMAIL}>`,
      to,
      subject,
      text: body,
      html,
      attachments,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error enviando cotización:', err)
    return NextResponse.json({ error: 'Error al enviar el correo' }, { status: 500 })
  }
}
