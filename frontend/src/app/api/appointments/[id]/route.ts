import { NextRequest, NextResponse } from 'next/server'
import { getSlots, saveSlots, getAppointments, saveAppointments } from '@/lib/data-store'

type Params = Promise<{ id: string }>

export async function DELETE(_req: NextRequest, context: { params: Params }) {
  const { id } = await context.params

  const [appointments, slots] = await Promise.all([getAppointments(), getSlots()])

  const appt = appointments.find(a => a.id === id)
  if (!appt) return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 })

  const updatedAppointments = appointments.filter(a => a.id !== id)

  const updatedSlots = slots.map(s =>
    s.id === appt.slotId ? { ...s, booked: false, appointmentId: undefined } : s
  )

  await Promise.all([saveAppointments(updatedAppointments), saveSlots(updatedSlots)])

  return NextResponse.json({ success: true, slotId: appt.slotId })
}
