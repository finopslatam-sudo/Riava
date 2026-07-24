import { NextResponse } from 'next/server'
import { getWaClientById, getHistory, markConversationRead, setContactName } from '@/lib/wa-store'

export async function GET(_req: Request, { params }: { params: Promise<{ clientId: string; contact: string }> }) {
  const { clientId, contact } = await params
  const client = await getWaClientById(clientId)
  if (!client) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
  }
  const history = await getHistory(client.phone_number_id, decodeURIComponent(contact))
  return NextResponse.json({ history })
}

export async function POST(_req: Request, { params }: { params: Promise<{ clientId: string; contact: string }> }) {
  const { clientId, contact } = await params
  const client = await getWaClientById(clientId)
  if (!client) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
  }
  await markConversationRead(client.phone_number_id, decodeURIComponent(contact))
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ clientId: string; contact: string }> }) {
  const { clientId, contact } = await params
  const client = await getWaClientById(clientId)
  if (!client) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
  }
  const { name } = await req.json() as { name?: string }
  await setContactName(client.phone_number_id, decodeURIComponent(contact), name ?? '')
  return NextResponse.json({ ok: true })
}
