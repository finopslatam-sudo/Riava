import { NextResponse } from 'next/server'
import { getWaClientById } from '@/lib/wa-store'
import { getMessageTemplates, createMessageTemplate, type TemplateCategory } from '@/lib/meta-whatsapp-templates'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const client = await getWaClientById(id)
  if (!client) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
  }

  const templates = await getMessageTemplates(client.access_token, client.waba_id)
  return NextResponse.json({ templates })
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const client = await getWaClientById(id)
  if (!client) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
  }

  const body = await req.json()
  const { name, language, category, bodyText } = body as {
    name?: string; language?: string; category?: TemplateCategory; bodyText?: string
  }

  if (!name || !language || !category || !bodyText) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  try {
    const template = await createMessageTemplate(client.access_token, client.waba_id, {
      name, language, category, bodyText,
    })
    return NextResponse.json({ template })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al crear la plantilla'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
