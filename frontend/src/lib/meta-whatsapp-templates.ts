const GRAPH_BASE = 'https://graph.facebook.com/v19.0'

export type TemplateCategory = 'UTILITY' | 'MARKETING' | 'AUTHENTICATION'

export type MessageTemplate = {
  id: string
  name: string
  status: string
  category: string
  language: string
}

export async function getMessageTemplates(accessToken: string, wabaId: string): Promise<MessageTemplate[]> {
  const res = await fetch(
    `${GRAPH_BASE}/${wabaId}/message_templates?fields=id,name,status,category,language&access_token=${accessToken}`
  )
  if (!res.ok) return []
  const { data } = await res.json() as { data?: MessageTemplate[] }
  return data ?? []
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
