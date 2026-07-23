import { NextResponse } from 'next/server'
import { updateService, deleteService } from '@/lib/services-store'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { name, detail, items } = body as {
    name?: string
    detail?: string
    items?: { id: string; name: string; price: number }[]
  }

  const updates: Parameters<typeof updateService>[1] = {}
  if (name) updates.name = name
  if (detail !== undefined) updates.detail = detail
  if (items) updates.items = items

  const updated = await updateService(id, updates)
  if (!updated) {
    return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
  }
  return NextResponse.json({ service: updated })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const deleted = await deleteService(id)
  if (!deleted) {
    return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
  }
  return NextResponse.json({ status: 'ok' })
}
