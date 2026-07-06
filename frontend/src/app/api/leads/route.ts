import { NextRequest, NextResponse } from 'next/server'
import { getAllLeads, createLead } from '@/lib/leads-store'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const page = Math.max(1, Number(searchParams.get('page') ?? 1))
  const size = Math.min(200, Math.max(1, Number(searchParams.get('size') ?? 20)))
  const status = searchParams.get('status') ?? ''
  const search = (searchParams.get('search') ?? '').toLowerCase()

  let leads = await getAllLeads()

  if (status) leads = leads.filter(l => l.status === status)
  if (search) leads = leads.filter(l =>
    l.full_name.toLowerCase().includes(search) ||
    l.email.toLowerCase().includes(search) ||
    l.company_name.toLowerCase().includes(search) ||
    l.source_campaign.toLowerCase().includes(search)
  )

  const total = leads.length
  const items = leads.slice((page - 1) * size, page * size)

  return NextResponse.json({ items, total, page, size })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body.full_name || !body.email) {
    return NextResponse.json({ error: 'full_name y email son requeridos' }, { status: 400 })
  }
  const lead = await createLead(body)
  return NextResponse.json(lead, { status: 201 })
}
