import { NextResponse } from 'next/server'
import { runLeadsFollowUp } from '@/lib/leads-followup'

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const result = await runLeadsFollowUp()
  return NextResponse.json(result)
}
