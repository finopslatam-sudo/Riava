import { Redis } from '@upstash/redis'
import { randomUUID } from 'crypto'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const CATALOG_KEY = 'riava:services:catalog'

export type ServiceCatalogItem = {
  id: string
  name: string
  price: number
}

export type ServiceCatalogEntry = {
  id: string
  name: string
  detail: string
  items: ServiceCatalogItem[]
  created_at: string
}

export type CreateServiceInput = {
  name: string
  detail?: string
  items?: { name: string; price: number }[]
}

export async function getAllServices(): Promise<ServiceCatalogEntry[]> {
  const services = await redis.get<ServiceCatalogEntry[]>(CATALOG_KEY)
  return services ?? []
}

export async function getServiceById(id: string): Promise<ServiceCatalogEntry | null> {
  const services = await getAllServices()
  return services.find(s => s.id === id) ?? null
}

export async function createService(input: CreateServiceInput): Promise<ServiceCatalogEntry> {
  const services = await getAllServices()
  const entry: ServiceCatalogEntry = {
    id: randomUUID(),
    name: input.name,
    detail: input.detail ?? '',
    items: (input.items ?? []).map(i => ({ id: randomUUID(), name: i.name, price: i.price })),
    created_at: new Date().toISOString(),
  }
  await redis.set(CATALOG_KEY, [entry, ...services])
  return entry
}

export async function updateService(
  id: string,
  updates: Partial<Omit<ServiceCatalogEntry, 'id' | 'created_at'>>
): Promise<ServiceCatalogEntry | null> {
  const services = await getAllServices()
  const idx = services.findIndex(s => s.id === id)
  if (idx < 0) return null
  services[idx] = { ...services[idx], ...updates }
  await redis.set(CATALOG_KEY, services)
  return services[idx]
}

export async function deleteService(id: string): Promise<boolean> {
  const services = await getAllServices()
  const filtered = services.filter(s => s.id !== id)
  if (filtered.length === services.length) return false
  await redis.set(CATALOG_KEY, filtered)
  return true
}
