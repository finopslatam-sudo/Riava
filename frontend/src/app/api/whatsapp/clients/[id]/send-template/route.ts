import { NextResponse } from 'next/server'
import { getWaClientById, appendHistory } from '@/lib/wa-store'
import { sendTemplateMessage } from '@/lib/meta-whatsapp-templates'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const client = await getWaClientById(id)
  if (!client) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
  }

  const body = await req.json()
  const { to, templateName, language, previewText } = body as {
    to?: string
    templateName?: string
    language?: string
    previewText?: string
  }

  if (!to || !templateName || !language) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const normalizedTo = to.replace(/[^\d]/g, '')

  try {
    await sendTemplateMessage(client.access_token, client.phone_number_id, {
      to: normalizedTo,
      templateName,
      language,
    })
    await appendHistory(client.phone_number_id, normalizedTo, [
      { role: 'assistant', content: previewText ?? `[Plantilla enviada: ${templateName}]`, timestamp: new Date().toISOString() },
    ])
    return NextResponse.json({ status: 'ok' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al enviar el mensaje'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
