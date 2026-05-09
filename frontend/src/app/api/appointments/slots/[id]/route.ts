import { NextRequest, NextResponse } from 'next/server'
import { getSlots, saveSlots } from '@/lib/data-store'

type Params = Promise<{ id: string }>

export async function PATCH(req: NextRequest, context: { params: Params }) {
  const { id } = await context.params
  const body = (await req.json()) as { startTime?: string; endTime?: string }

  if (!body.startTime || !body.endTime) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }
  if (body.startTime >= body.endTime) {
    return NextResponse.json({ error: 'La hora de fin debe ser posterior a la de inicio' }, { status: 400 })
  }

  const slots = await getSlots()
  const slot = slots.find(s => s.id === id)

  if (!slot) return NextResponse.json({ error: 'Horario no encontrado' }, { status: 404 })
  if (slot.booked) return NextResponse.json({ error: 'No se puede editar un horario reservado' }, { status: 409 })

  const duplicate = slots.some(s => s.id !== id && s.date === slot.date && s.startTime === body.startTime)
  if (duplicate) return NextResponse.json({ error: 'Ya existe un horario en esa hora' }, { status: 409 })

  slot.startTime = body.startTime
  slot.endTime = body.endTime
  await saveSlots(slots)

  return NextResponse.json(slot)
}

export async function DELETE(req: Request, context: { params: Params }) {
  const { id } = await context.params

  const slots = await getSlots()
  const slot = slots.find(s => s.id === id)

  if (!slot) {
    return NextResponse.json({ error: 'Horario no encontrado' }, { status: 404 })
  }

  if (slot.booked) {
    return NextResponse.json(
      { error: 'No se puede eliminar un horario con cita agendada' },
      { status: 409 }
    )
  }

  await saveSlots(slots.filter(s => s.id !== id))
  return NextResponse.json({ success: true })
}
