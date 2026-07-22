import { getAccessiblePages } from './meta-pages'

const GRAPH_BASE = 'https://graph.facebook.com/v19.0'

export type LeadFormOption = { page_id: string; page_name: string; form_id: string; form_name: string }
export type LeadFormQuestionType =
  | 'FULL_NAME' | 'FIRST_NAME' | 'LAST_NAME' | 'EMAIL' | 'PHONE' | 'CUSTOM' | 'ID_CL_RUT'
export type LeadFormQuestion = { type: LeadFormQuestionType; key?: string; label?: string }

export async function getLeadFormsForPages(token: string): Promise<LeadFormOption[]> {
  const pages = await getAccessiblePages(token)
  const options: LeadFormOption[] = []

  for (const page of pages) {
    const res = await fetch(
      `${GRAPH_BASE}/${page.id}/leadgen_forms?` +
      new URLSearchParams({ fields: 'id,name', access_token: page.access_token })
    )
    if (!res.ok) continue
    const { data: forms } = await res.json() as { data?: { id: string; name: string }[] }
    for (const form of (forms ?? [])) {
      options.push({ page_id: page.id, page_name: page.name, form_id: form.id, form_name: form.name })
    }
  }
  return options
}

export async function createLeadForm(
  pageAccessToken: string,
  pageId: string,
  input: {
    name: string
    questions: LeadFormQuestion[]
    privacy_policy: { url: string; link_text: string }
    locale?: string
  }
): Promise<string> {
  const res = await fetch(`${GRAPH_BASE}/${pageId}/leadgen_forms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: input.name,
      questions: input.questions,
      privacy_policy: input.privacy_policy,
      ...(input.locale ? { locale: input.locale } : {}),
      access_token: pageAccessToken,
    }),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data?.error?.message ?? 'Error al crear el formulario de leads en Meta')
  }
  return data.id as string
}
