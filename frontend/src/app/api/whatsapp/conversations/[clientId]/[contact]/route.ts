import { NextResponse } from 'next/server'
import { getWaClientById, getHistory, markConversationRead } from '@/lib/wa-store'

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
