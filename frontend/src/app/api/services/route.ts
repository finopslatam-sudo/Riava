import { NextResponse } from 'next/server'
import { getAllServices, createService } from '@/lib/services-store'

export async function GET() {
  const services = await getAllServices()
  return NextResponse.json({ services })
}

export async function POST(req: Request) {
  const body = await req.json()
  const { name, detail, items } = body as {
    name?: string
    detail?: string
    items?: { name: string; price: number }[]
  }

  if (!name) {
    return NextResponse.json({ error: 'Falta el nombre del servicio' }, { status: 400 })
  }

  const service = await createService({ name, detail, items })
  return NextResponse.json({ service })
}
