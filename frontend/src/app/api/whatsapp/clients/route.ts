import { NextResponse } from 'next/server'
import { getAllWaClients, createWaClient } from '@/lib/wa-store'

export async function GET() {
  const clients = await getAllWaClients()
  return NextResponse.json({ clients })
}

export async function POST(req: Request) {
  const body = await req.json()
  const { business_name, phone_number_id, waba_id, access_token, system_prompt, tone, business_info } = body

  if (!business_name || !phone_number_id || !waba_id || !access_token) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const client = await createWaClient({
    business_name,
    phone_number_id,
    waba_id,
    access_token,
    system_prompt,
    tone,
    business_info,
  })

  return NextResponse.json({ client })
}
