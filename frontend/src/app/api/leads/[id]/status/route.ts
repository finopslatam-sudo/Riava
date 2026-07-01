import { NextRequest, NextResponse } from 'next/server'
import { updateLead } from '@/lib/leads-store'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { status } = await req.json()
  if (!status) return NextResponse.json({ error: 'status requerido' }, { status: 400 })
  const lead = await updateLead(id, { status })
  if (!lead) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json(lead)
}
