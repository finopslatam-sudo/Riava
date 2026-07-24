const GRAPH_BASE = 'https://graph.facebook.com/v19.0'

export type TemplateCategory = 'UTILITY' | 'MARKETING' | 'AUTHENTICATION'

type TemplateComponent = { type: string; text?: string }

type RawMessageTemplate = {
  id: string
  name: string
  status: string
  category: string
  language: string
  components?: TemplateComponent[]
}

export type MessageTemplate = {
  id: string
  name: string
  status: string
  category: string
  language: string
  bodyText: string
}

export async function getMessageTemplates(accessToken: string, wabaId: string): Promise<MessageTemplate[]> {
  const res = await fetch(
    `${GRAPH_BASE}/${wabaId}/message_templates?fields=id,name,status,category,language,components&access_token=${accessToken}`
  )
  if (!res.ok) return []
  const { data } = await res.json() as { data?: RawMessageTemplate[] }
  return (data ?? []).map(t => ({
    id: t.id,
    name: t.name,
    status: t.status,
    category: t.category,
    language: t.language,
    bodyText: t.components?.find(c => c.type === 'BODY')?.text ?? '',
  }))
}

export async function deleteMessageTemplate(
  accessToken: string,
  wabaId: string,
  input: { id: string; name: string }
): Promise<void> {
  const params = new URLSearchParams({ hsm_id: input.id, name: input.name, access_token: accessToken })
  const res = await fetch(`${GRAPH_BASE}/${wabaId}/message_templates?${params.toString()}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.error?.message ?? 'Error al eliminar la plantilla en Meta')
  }
}

export async function sendTemplateMessage(
  accessToken: string,
  phoneNumberId: string,
  input: { to: string; templateName: string; language: string }
): Promise<void> {
  const res = await fetch(`${GRAPH_BASE}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: input.to,
      type: 'template',
      template: {
        name: input.templateName,
        language: { code: input.language },
      },
      access_token: accessToken,
    }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.error?.message ?? 'Error al enviar el mensaje por WhatsApp')
  }
}

export async function createMessageTemplate(
  accessToken: string,
  wabaId: string,
  input: { name: string; language: string; category: TemplateCategory; bodyText: string }
): Promise<{ id: string; status: string; category: string }> {
  const res = await fetch(`${GRAPH_BASE}/${wabaId}/message_templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: input.name,
      language: input.language,
      category: input.category,
      components: [{ type: 'BODY', text: input.bodyText }],
      access_token: accessToken,
    }),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data?.error?.message ?? 'Error al crear la plantilla en Meta')
  }
  return data
}
