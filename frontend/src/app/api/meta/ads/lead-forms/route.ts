import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAccessiblePages } from '@/lib/meta-pages'
import { createLeadForm, type LeadFormQuestion } from '@/lib/meta-lead-forms'

export async function POST(req: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get('meta_access_token')?.value
  if (!token) return NextResponse.json({ error: 'No conectado a Meta' }, { status: 401 })

  const body = await req.json()
  const { page_id, name, questions, privacy_policy_url, privacy_policy_text } = body as {
    page_id?: string
    name?: string
    questions?: LeadFormQuestion[]
    privacy_policy_url?: string
    privacy_policy_text?: string
  }

  if (!page_id || !name || !questions?.length || !privacy_policy_url || !privacy_policy_text) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const pages = await getAccessiblePages(token)
  const page = pages.find(p => p.id === page_id)
  if (!page) {
    return NextResponse.json({ error: 'Página no encontrada o sin acceso' }, { status: 404 })
  }

  try {
    const form_id = await createLeadForm(page.access_token, page_id, {
      name,
      questions,
      privacy_policy: { url: privacy_policy_url, link_text: privacy_policy_text },
    })
    return NextResponse.json({ form_id })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al crear el formulario de leads'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
