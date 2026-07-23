import { NextResponse } from 'next/server'
import { getWaClientById, getHistory } from '@/lib/wa-store'
import { generateWaReplyDebug } from '@/lib/wa-brain'

export async function POST(req: Request) {
  const { client_id, message, contact } = await req.json()
  const client = await getWaClientById(client_id)
  if (!client) {
    return NextResponse.json({ error: 'client not found' }, { status: 404 })
  }
  const history = contact ? await getHistory(client.phone_number_id, contact) : []
  const result = await generateWaReplyDebug(client, history, message ?? 'hola')
  return NextResponse.json({ ...result, historyLength: history.length })
}
