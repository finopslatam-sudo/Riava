import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { searchCities } from '@/lib/meta-ads'

export async function GET(req: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get('meta_access_token')?.value
  if (!token) return NextResponse.json({ error: 'No conectado a Meta' }, { status: 401 })

  const params = new URL(req.url).searchParams
  const country = params.get('country') ?? 'CL'
  const query = params.get('q') ?? ''
  if (query.trim().length < 2) return NextResponse.json({ cities: [] })

  const cities = await searchCities(token, country, query)
  return NextResponse.json({ cities })
}
