import { NextResponse } from 'next/server'
import { getWaClientById } from '@/lib/wa-store'
import { generateWaReplyDebug } from '@/lib/wa-brain'

export async function POST(req: Request) {
  const { client_id, message, history } = await req.json()
  const client = await getWaClientById(client_id)
  if (!client) {
    return NextResponse.json({ error: 'client not found' }, { status: 404 })
  }

  const result = await generateWaReplyDebug(client, history ?? [], message ?? 'hola')
  return NextResponse.json(result)
}
