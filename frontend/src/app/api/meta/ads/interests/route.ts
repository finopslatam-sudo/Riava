import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { searchInterests } from '@/lib/meta-ads'

export async function GET(req: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get('meta_access_token')?.value
  if (!token) return NextResponse.json({ error: 'No conectado a Meta' }, { status: 401 })

  const query = new URL(req.url).searchParams.get('q') ?? ''
  if (query.trim().length < 2) return NextResponse.json({ interests: [] })

  const interests = await searchInterests(token, query)
  return NextResponse.json({ interests })
}
