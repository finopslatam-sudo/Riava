import { NextResponse } from 'next/server'
import { getMetaToken } from '@/lib/meta-token-store'
import { getAccessiblePages } from '@/lib/meta-pages'
import { importLeadFromWebhook } from '@/lib/leads-import'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.META_LEADS_VERIFY_TOKEN && challenge) {
    return new NextResponse(challenge, { status: 200 })
  }
  return new NextResponse('Forbidden', { status: 403 })
}

type LeadgenWebhookPayload = {
  entry?: Array<{
    id?: string
    changes?: Array<{
      field?: string
      value?: {
        form_id?: string
        leadgen_id?: string
        page_id?: string
      }
    }>
  }>
}

export async function POST(req: Request) {
  const body: LeadgenWebhookPayload = await req.json()

  const token = await getMetaToken()
  if (!token) return NextResponse.json({ status: 'ignored', reason: 'Meta no conectado' })

  const pages = await getAccessiblePages(token)
  const pagesById = new Map(pages.map(p => [p.id, p]))

  const jobs: Promise<unknown>[] = []

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== 'leadgen') continue
      const { form_id, leadgen_id, page_id } = change.value ?? {}
      if (!form_id || !leadgen_id || !page_id) continue

      const page = pagesById.get(page_id)
      if (!page) continue

      jobs.push(
        importLeadFromWebhook(page.access_token, form_id, leadgen_id).catch(err => {
          console.error('Error procesando lead de webhook:', err)
        })
      )
    }
  }

  await Promise.all(jobs)

  return NextResponse.json({ status: 'ok' })
}
