import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAccessiblePages } from '@/lib/meta-pages'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('meta_access_token')?.value
  if (!token) return NextResponse.json({ error: 'No conectado a Meta' }, { status: 401 })

  const pages = await getAccessiblePages(token)
  return NextResponse.json({ pages: pages.map(p => ({ id: p.id, name: p.name })) })
}
