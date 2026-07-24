import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

type WaMessage = { role: 'user' | 'assistant'; content: string; timestamp: string }

export async function POST(req: Request) {
  const { phoneNumberId, contact, newText } = await req.json() as { phoneNumberId: string; contact: string; newText: string }
  const key = `riava:wa:history:${phoneNumberId}:${contact}`
  const history = (await redis.get<WaMessage[]>(key)) ?? []
  let updated = 0
  const rewritten = history.map(m => {
    if (m.content.startsWith('[Plantilla enviada:')) {
      updated++
      return { ...m, content: newText }
    }
    return m
  })
  await redis.set(key, rewritten)
  return NextResponse.json({ updated, history: rewritten })
}
