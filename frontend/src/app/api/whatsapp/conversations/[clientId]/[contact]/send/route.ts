import { NextResponse } from 'next/server'
import { getWaClientById, appendHistory } from '@/lib/wa-store'
import { sendTextMessage } from '@/lib/meta-whatsapp-templates'

export async function POST(req: Request, { params }: { params: Promise<{ clientId: string; contact: string }> }) {
  const { clientId, contact } = await params
  const client = await getWaClientById(clientId)
  if (!client) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
  }

  const { text } = await req.json() as { text?: string }
  if (!text?.trim()) {
    return NextResponse.json({ error: 'Falta el texto del mensaje' }, { status: 400 })
  }

  const customerPhone = decodeURIComponent(contact)

  try {
    await sendTextMessage(client.access_token, client.phone_number_id, { to: customerPhone, text })
    await appendHistory(client.phone_number_id, customerPhone, [
      { role: 'assistant', content: text, timestamp: new Date().toISOString() },
    ])
    return NextResponse.json({ status: 'ok' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al enviar el mensaje'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
