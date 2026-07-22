import { NextResponse } from 'next/server'
import { getWaClientById, updateWaClient, deleteWaClient } from '@/lib/wa-store'

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
  const { access_token, business_name, system_prompt, tone, business_info } = body as {
    access_token?: string
    business_name?: string
    system_prompt?: string
    tone?: string
    business_info?: string
  }

  if (!access_token && !business_name && system_prompt === undefined && !tone && business_info === undefined) {
    return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 })
  }

  const updates: Parameters<typeof updateWaClient>[1] = {}
  if (business_name) updates.business_name = business_name
  if (system_prompt !== undefined) updates.system_prompt = system_prompt
  if (tone) updates.tone = tone
  if (business_info !== undefined) updates.business_info = business_info

  let webhookOverride: string | undefined
  if (access_token) {
    const overrideOk = await overrideWabaWebhook(access_token, client.waba_id)
    updates.access_token = access_token
    updates.status = overrideOk ? 'connected' : 'error'
    webhookOverride = overrideOk
      ? 'ok'
      : 'No se pudo configurar el webhook automáticamente en Meta. Revisa el Access Token.'
  }

  const updated = await updateWaClient(id, updates)

  return NextResponse.json({ client: updated, webhook_override: webhookOverride })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const deleted = await deleteWaClient(id)
  if (!deleted) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
  }
  return NextResponse.json({ status: 'ok' })
}
