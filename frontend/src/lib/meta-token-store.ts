import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const KEY = 'riava:meta:access_token'

export async function saveMetaToken(token: string): Promise<void> {
  await redis.set(KEY, token)
}

export async function getMetaToken(): Promise<string | null> {
  return (await redis.get<string>(KEY)) ?? null
}

export async function deleteMetaToken(): Promise<void> {
  await redis.del(KEY)
}
