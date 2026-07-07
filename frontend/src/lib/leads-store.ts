import { Redis } from '@upstash/redis'
import { randomUUID } from 'crypto'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})
const KEY = 'riava:leads'

export type LeadStatus = 'new' | 'contacted' | 'agendado' | 'cotizado' | 'cotizacion_aceptada' | 'cotizacion_rechazada'

export type Lead = {
  id: string
  full_name: string
  email: string
  phone: string
  company_name: string
  status: LeadStatus
  score: number
  source_campaign: string
  assigned_to: string | null
  custom_fields: Record<string, string>
  ai_reasoning: string
  created_at: string
  updated_at: string
}

export type CreateLeadInput = {
  full_name: string
  email: string
  phone?: string
  company_name?: string
  status?: LeadStatus
  score?: number
  source_campaign?: string
  assigned_to?: string | null
  custom_fields?: Record<string, string>
  ai_reasoning?: string
  created_at?: string
}

export async function getAllLeads(): Promise<Lead[]> {
  const leads = await redis.get<Lead[]>(KEY)
  return leads ?? []
}

export async function createLead(input: CreateLeadInput): Promise<Lead> {
  const leads = await getAllLeads()
  const now = new Date().toISOString()
  const lead: Lead = {
    id: randomUUID(),
    full_name: input.full_name,
    email: input.email,
    phone: input.phone ?? '',
    company_name: input.company_name ?? '',
    status: input.status ?? 'new',
    score: input.score ?? Math.floor(Math.random() * 40) + 30,
    source_campaign: input.source_campaign ?? '',
    assigned_to: input.assigned_to ?? null,
    custom_fields: input.custom_fields ?? {},
    ai_reasoning: input.ai_reasoning ?? '',
    created_at: input.created_at ?? now,
    updated_at: now,
  }
  await redis.set(KEY, [lead, ...leads])
  return lead
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const leads = await getAllLeads()
  return leads.find(l => l.id === id) ?? null
}

export async function updateLead(id: string, updates: Partial<Omit<Lead, 'id'>>): Promise<Lead | null> {
  const leads = await getAllLeads()
  const idx = leads.findIndex(l => l.id === id)
  if (idx < 0) return null
  leads[idx] = { ...leads[idx], ...updates, updated_at: new Date().toISOString() }
  await redis.set(KEY, leads)
  return leads[idx]
}

export async function deleteLead(id: string): Promise<boolean> {
  const leads = await getAllLeads()
  const filtered = leads.filter(l => l.id !== id)
  if (filtered.length === leads.length) return false
  await redis.set(KEY, filtered)
  return true
}
