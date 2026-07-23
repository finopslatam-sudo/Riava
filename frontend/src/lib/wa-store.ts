import { Redis } from '@upstash/redis'
import { randomUUID } from 'crypto'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const CLIENTS_KEY = 'riava:wa:clients'
const HISTORY_PREFIX = 'riava:wa:history:'
const MAX_HISTORY = 20

export type WaClientStatus = 'pending' | 'connected' | 'error'

export type WaClient = {
  id: string
  business_name: string
  phone_number_id: string
  waba_id: string
  access_token: string
  system_prompt: string
  tone: string
  business_info: string
  status: WaClientStatus
  enable_scheduling: boolean
  enable_quotes: boolean
  created_at: string
}

export type CreateWaClientInput = {
  business_name: string
  phone_number_id: string
  waba_id: string
  access_token: string
  system_prompt?: string
  tone?: string
  business_info?: string
  status?: WaClientStatus
  enable_scheduling?: boolean
  enable_quotes?: boolean
}

export type WaMessage = {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export async function getAllWaClients(): Promise<WaClient[]> {
  const clients = await redis.get<WaClient[]>(CLIENTS_KEY)
  return clients ?? []
}

export async function getWaClientById(id: string): Promise<WaClient | null> {
  const clients = await getAllWaClients()
  return clients.find(c => c.id === id) ?? null
}

export async function getClientByPhoneNumberId(phoneNumberId: string): Promise<WaClient | null> {
  const clients = await getAllWaClients()
  return clients.find(c => c.phone_number_id === phoneNumberId) ?? null
}

export async function createWaClient(input: CreateWaClientInput): Promise<WaClient> {
  const clients = await getAllWaClients()
  const client: WaClient = {
    id: randomUUID(),
    business_name: input.business_name,
    phone_number_id: input.phone_number_id,
    waba_id: input.waba_id,
    access_token: input.access_token,
    system_prompt: input.system_prompt ?? '',
    tone: input.tone ?? 'profesional_y_amigable',
    business_info: input.business_info ?? '',
    status: input.status ?? 'connected',
    enable_scheduling: input.enable_scheduling ?? false,
    enable_quotes: input.enable_quotes ?? false,
    created_at: new Date().toISOString(),
  }
  await redis.set(CLIENTS_KEY, [client, ...clients])
  return client
}

export async function updateWaClient(id: string, updates: Partial<Omit<WaClient, 'id'>>): Promise<WaClient | null> {
  const clients = await getAllWaClients()
  const idx = clients.findIndex(c => c.id === id)
  if (idx < 0) return null
  clients[idx] = { ...clients[idx], ...updates }
  await redis.set(CLIENTS_KEY, clients)
  return clients[idx]
}

export async function deleteWaClient(id: string): Promise<boolean> {
  const clients = await getAllWaClients()
  const filtered = clients.filter(c => c.id !== id)
  if (filtered.length === clients.length) return false
  await redis.set(CLIENTS_KEY, filtered)
  return true
}

function historyKey(phoneNumberId: string, customerPhone: string): string {
  return `${HISTORY_PREFIX}${phoneNumberId}:${customerPhone}`
}

export async function getHistory(phoneNumberId: string, customerPhone: string): Promise<WaMessage[]> {
  const history = await redis.get<WaMessage[]>(historyKey(phoneNumberId, customerPhone))
  return history ?? []
}

export async function appendHistory(
  phoneNumberId: string,
  customerPhone: string,
  messages: WaMessage[]
): Promise<void> {
  const existing = await getHistory(phoneNumberId, customerPhone)
  const updated = [...existing, ...messages].slice(-MAX_HISTORY)
  await redis.set(historyKey(phoneNumberId, customerPhone), updated)
}

export async function getConversationContacts(phoneNumberId: string): Promise<string[]> {
  const keys = await redis.keys(`${HISTORY_PREFIX}${phoneNumberId}:*`)
  return keys.map(k => k.slice(`${HISTORY_PREFIX}${phoneNumberId}:`.length))
}
