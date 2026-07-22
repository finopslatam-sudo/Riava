import { NextResponse } from 'next/server'
import { getClientByPhoneNumberId, getHistory, appendHistory } from '@/lib/wa-store'
import { generateWaReply } from '@/lib/wa-brain'

const GRAPH_API_VERSION = 'v21.0'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.META_WA_VERIFY_TOKEN && challenge) {
    return new NextResponse(challenge, { status: 200 })
  }
  return new NextResponse('Forbidden', { status: 403 })
}

type MetaWebhookPayload = {
  entry?: Array<{
    changes?: Array<{
      value?: {
        metadata?: { phone_number_id?: string }
        messages?: Array<{
          from?: string
          type?: string
          text?: { body?: string }
        }>
      }
    }>
  }>
}

async function sendWhatsAppMessage(phoneNumberId: string, accessToken: string, to: string, text: string) {
  const res = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  })
  if (!res.ok) {
    const errorBody = await res.text()
    console.error('Error enviando mensaje de WhatsApp:', res.status, errorBody)
  }
}

export async function POST(req: Request) {
  const body: MetaWebhookPayload = await req.json()

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value
      const phoneNumberId = value?.metadata?.phone_number_id
      if (!phoneNumberId) continue

      const client = await getClientByPhoneNumberId(phoneNumberId)
      if (!client) continue

      for (const msg of value?.messages ?? []) {
        if (msg.type !== 'text' || !msg.text?.body || !msg.from) continue

        const customerPhone = msg.from
        const userText = msg.text.body

        const history = await getHistory(phoneNumberId, customerPhone)
        const reply = await generateWaReply(client, history, userText)

        const now = new Date().toISOString()
        await appendHistory(phoneNumberId, customerPhone, [
          { role: 'user', content: userText, timestamp: now },
          { role: 'assistant', content: reply, timestamp: now },
        ])

        await sendWhatsAppMessage(phoneNumberId, client.access_token, customerPhone, reply)
      }
    }
  }

  return NextResponse.json({ status: 'ok' })
}
