import { Redis } from '@upstash/redis'
import type { CampaignsByAccount } from '@/lib/meta-ads'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const KEY = 'riava:meta:campaigns_cache'

type CampaignsCache = {
  results: CampaignsByAccount[]
  updatedAt: string
}

export async function saveCampaignsCache(results: CampaignsByAccount[]): Promise<void> {
  const payload: CampaignsCache = { results, updatedAt: new Date().toISOString() }
  await redis.set(KEY, payload)
}

export async function getCampaignsCache(): Promise<CampaignsCache | null> {
  return (await redis.get<CampaignsCache>(KEY)) ?? null
}

export async function clearCampaignsCache(): Promise<void> {
  await redis.del(KEY)
}
