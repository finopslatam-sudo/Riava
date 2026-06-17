import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('meta_access_token')?.value
  return NextResponse.json({ connected: !!token })
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete('meta_access_token')
  return NextResponse.json({ ok: true })
}
