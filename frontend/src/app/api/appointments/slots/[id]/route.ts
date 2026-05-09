import { NextResponse } from 'next/server'
import { getSlots, saveSlots } from '@/lib/data-store'

type Params = Promise<{ id: string }>

export async function DELETE(req: Request, context: { params: Params }) {
  const { id } = await context.params

  const slots = getSlots()
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

  saveSlots(slots.filter(s => s.id !== id))
  return NextResponse.json({ success: true })
}
