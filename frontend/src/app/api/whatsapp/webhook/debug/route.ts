import { NextResponse } from 'next/server'
import { getLastWebhookCall } from '@/lib/wa-store'

export async function GET() {
  const last = await getLastWebhookCall()
  return NextResponse.json({ last })
}
