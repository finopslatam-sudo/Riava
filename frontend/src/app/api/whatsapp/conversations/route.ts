import { NextResponse } from 'next/server'
import { getAllWaClients, getConversationContacts, getHistory, getLastReadMap, type WaMessage } from '@/lib/wa-store'
import { FALLBACK_REPLY } from '@/lib/wa-brain'

export type ConversationSummary = {
  clientId: string
  clientName: string
  contact: string
  lastMessage: WaMessage
  messageCount: number
  unread: boolean
  unanswered: boolean
}

export async function GET() {
  const clients = await getAllWaClients()
  const lastReadMap = await getLastReadMap()

  const perClient = await Promise.all(
    clients.map(async client => {
      const contacts = await getConversationContacts(client.phone_number_id)
      const conversations = await Promise.all(
        contacts.map(async contact => {
          const history = await getHistory(client.phone_number_id, contact)
          const lastMessage = history[history.length - 1]
          if (!lastMessage) return null

          const lastReadAt = lastReadMap[`${client.phone_number_id}:${contact}`]
          const unread = !lastReadAt || lastMessage.timestamp > lastReadAt
          const unanswered = lastMessage.role === 'assistant' && lastMessage.content === FALLBACK_REPLY

          const summary: ConversationSummary = {
            clientId: client.id,
            clientName: client.business_name,
            contact,
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
