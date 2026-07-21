import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getLeadFormsForPages } from '@/lib/meta-ads'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('meta_access_token')?.value
  if (!token) return NextResponse.json({ error: 'No conectado a Meta' }, { status: 401 })

  const forms = await getLeadFormsForPages(token)
  return NextResponse.json({ forms })
}
