import { NextResponse } from 'next/server'
import { getWaClientById, getConversationContacts, getHistory } from '@/lib/wa-store'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const client = await getWaClientById(id)
  if (!client) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
  }

  const contacts = await getConversationContacts(client.phone_number_id)
  const conversations = await Promise.all(
    contacts.map(async contact => ({
      contact,
      history: await getHistory(client.phone_number_id, contact),
    }))
  )

  return NextResponse.json({ conversations })
}
