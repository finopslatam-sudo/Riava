import { NextResponse } from 'next/server'
import { runAppointmentReminders } from '@/lib/appointment-reminders'

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const result = await runAppointmentReminders()
  return NextResponse.json(result)
}
