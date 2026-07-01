import { NextRequest, NextResponse } from 'next/server'
import { getLeadById, updateLead, deleteLead } from '@/lib/leads-store'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lead = await getLeadById(id)
  if (!lead) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json(lead)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const lead = await updateLead(id, body)
  if (!lead) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json(lead)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ok = await deleteLead(id)
  if (!ok) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
