import { NextResponse } from 'next/server'
import { getWaClientById } from '@/lib/wa-store'
import { generateWaReplyDebug } from '@/lib/wa-brain'

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('token') !== process.env.META_WA_VERIFY_TOKEN) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { client_id, message } = await req.json()
  const client = await getWaClientById(client_id)
  if (!client) {
    return NextResponse.json({ error: 'client not found' }, { status: 404 })
  }

  const result = await generateWaReplyDebug(client, [], message ?? 'hola')
  return NextResponse.json(result)
}
