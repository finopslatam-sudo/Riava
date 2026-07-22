import { NextResponse } from 'next/server'
import { getWaClientById, updateWaClient } from '@/lib/wa-store'

const GRAPH_BASE = 'https://graph.facebook.com/v19.0'
const WEBHOOK_URL = 'https://www.riava.cl/api/whatsapp/webhook'

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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const client = await getWaClientById(id)
  if (!client) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
  }

  const body = await req.json()
  const { access_token } = body as { access_token?: string }

  if (!access_token) {
    return NextResponse.json({ error: 'Falta access_token' }, { status: 400 })
  }

  const overrideOk = await overrideWabaWebhook(access_token, client.waba_id)
  const updated = await updateWaClient(id, {
    access_token,
    status: overrideOk ? 'connected' : 'error',
  })

  return NextResponse.json({
    client: updated,
    webhook_override: overrideOk
      ? 'ok'
      : 'No se pudo configurar el webhook automáticamente en Meta. Revisa el Access Token.',
  })
}
