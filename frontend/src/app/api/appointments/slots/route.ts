import { NextRequest, NextResponse } from 'next/server'
import { getSlots, saveSlots, type TimeSlot } from '@/lib/data-store'

export async function GET(req: NextRequest) {
  const from = req.nextUrl.searchParams.get('from')
  const to   = req.nextUrl.searchParams.get('to')

  let slots = getSlots()
  if (from && to) slots = slots.filter(s => s.date >= from && s.date <= to)

  return NextResponse.json(slots)
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<TimeSlot>

  if (!body.date || !body.startTime || !body.endTime) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const slots = getSlots()

  if (slots.some(s => s.date === body.date && s.startTime === body.startTime)) {
    return NextResponse.json({ error: 'Ya existe un horario en esa fecha y hora' }, { status: 409 })
  }

  const newSlot: TimeSlot = {
    id: `slot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    date: body.date,
    startTime: body.startTime,
    endTime: body.endTime,
    booked: false,
  }

  slots.push(newSlot)
  saveSlots(slots)

  return NextResponse.json(newSlot, { status: 201 })
}
