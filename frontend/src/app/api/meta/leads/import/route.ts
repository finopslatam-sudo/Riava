import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { runLeadsImport } from '@/lib/leads-import'

export async function POST() {
  const cookieStore = await cookies()
  const token = cookieStore.get('meta_access_token')?.value
  if (!token) return NextResponse.json({ error: 'No conectado a Meta' }, { status: 401 })

  const result = await runLeadsImport(token)
  return NextResponse.json(result)
}
