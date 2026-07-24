import { NextResponse } from 'next/server'
import { getAllWaClients, getConversationContacts, getHistory, getLastReadMap, getContactNamesMap, type WaMessage } from '@/lib/wa-store'
import { getAllLeads } from '@/lib/leads-store'
import { FALLBACK_REPLY } from '@/lib/wa-brain'

export type ConversationSummary = {
  clientId: string
  clientName: string
  contact: string
  name: string | null
  lastMessage: WaMessage
  messageCount: number
  unread: boolean
  unanswered: boolean
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, '').replace(/^0+/, '')
}

export async function GET() {
  const [clients, lastReadMap, contactNamesMap, leads] = await Promise.all([
    getAllWaClients(),
    getLastReadMap(),
    getContactNamesMap(),
    getAllLeads(),
  ])

  const leadNameByPhone = new Map<string, string>()
  for (const lead of leads) {
    if (!lead.phone) continue
    const normalized = normalizePhone(lead.phone)
    if (normalized.length >= 8) leadNameByPhone.set(normalized.slice(-8), lead.full_name)
  }

  const perClient = await Promise.all(
    clients.map(async client => {
      const contacts = await getConversationContacts(client.phone_number_id)
      const conversations = await Promise.all(
        contacts.map(async contact => {
          const history = await getHistory(client.phone_number_id, contact)
          const lastMessage = history[history.length - 1]
          if (!lastMessage) return null

          const key = `${client.phone_number_id}:${contact}`
          const lastReadAt = lastReadMap[key]
          const unread = !lastReadAt || lastMessage.timestamp > lastReadAt
          const unanswered = lastMessage.role === 'assistant' && lastMessage.content === FALLBACK_REPLY

          const explicitName = contactNamesMap[key] ?? null
          const normalizedContact = normalizePhone(contact)
          const leadName = normalizedContact.length >= 8 ? leadNameByPhone.get(normalizedContact.slice(-8)) ?? null : null

          const summary: ConversationSummary = {
            clientId: client.id,
            clientName: client.business_name,
            contact,
            name: explicitName ?? leadName,
            lastMessage,
            messageCount: history.length,
            unread,
            unanswered,
          }
          return summary
        })
      )
      return conversations.filter((c): c is ConversationSummary => c !== null)
    })
  )

  const conversations = perClient.flat().sort((a, b) => b.lastMessage.timestamp.localeCompare(a.lastMessage.timestamp))

  return NextResponse.json({ conversations })
}
