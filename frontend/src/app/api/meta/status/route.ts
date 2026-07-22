import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { deleteMetaToken } from '@/lib/meta-token-store'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('meta_access_token')?.value
  return NextResponse.json({ connected: !!token })
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete('meta_access_token')
  await deleteMetaToken()
  return NextResponse.json({ ok: true })
}
