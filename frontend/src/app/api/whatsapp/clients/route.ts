import { NextResponse } from 'next/server'
import { getAllWaClients, createWaClient, updateWaClient } from '@/lib/wa-store'

const GRAPH_BASE = 'https://graph.facebook.com/v19.0'
const WEBHOOK_URL = 'https://www.riava.cl/api/whatsapp/webhook'

export async function GET() {
  const clients = await getAllWaClients()
  return NextResponse.json({ clients })
}

async function overrideWabaWebhook(accessToken: string, wabaId: string): Promise<boolean> {
  const res = await fetch(`${GRAPH_BASE}/${wabaId}/subscribed_apps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      override_callback_uri: WEBHOOK_URL,
      verify_token: process.env.META_WA_VERIFY_TOKEN,
      access_token: accessToken,
    }),
  })
  return res.ok
}

export async function POST(req: Request) {
  const body = await req.json()
  const { business_name, phone_number_id, waba_id, access_token, system_prompt, tone, business_info } = body

  if (!business_name || !phone_number_id || !waba_id || !access_token) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const client = await createWaClient({
    business_name,
    phone_number_id,
    waba_id,
    access_token,
    system_prompt,
    tone,
    business_info,
  })

  const overrideOk = await overrideWabaWebhook(access_token, waba_id)
  const finalClient = overrideOk
    ? client
    : await updateWaClient(client.id, { status: 'error' }) ?? client

  return NextResponse.json({
    client: finalClient,
    webhook_override: overrideOk
      ? 'ok'
      : 'No se pudo configurar el webhook automáticamente en Meta. Revisa el Access Token y el WABA ID.',
  })
}
