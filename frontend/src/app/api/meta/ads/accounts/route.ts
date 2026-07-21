import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAdAccounts } from '@/lib/meta-ads'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('meta_access_token')?.value
  if (!token) return NextResponse.json({ error: 'No conectado a Meta' }, { status: 401 })

  const accounts = await getAdAccounts(token)
  return NextResponse.json({ accounts })
}
