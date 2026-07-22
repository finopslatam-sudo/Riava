import { NextResponse } from 'next/server'
import { getMetaToken } from '@/lib/meta-token-store'
import { runLeadsImport } from '@/lib/leads-import'

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const token = await getMetaToken()
  if (!token) {
    return NextResponse.json({ skipped: true, reason: 'Meta no conectado' })
  }

  const result = await runLeadsImport(token)
  return NextResponse.json(result)
}
