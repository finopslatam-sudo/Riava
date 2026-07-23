import { NextResponse } from 'next/server'
import { getWaClientById } from '@/lib/wa-store'
import { generateWaReply } from '@/lib/wa-brain'

export async function POST(req: Request) {
  const { client_id, message } = await req.json()
  const client = await getWaClientById(client_id)
  if (!client) {
    return NextResponse.json({ error: 'client not found' }, { status: 404 })
  }

  const text = await generateWaReply(client, [], message ?? 'hola')
  return NextResponse.json({ text })
}
