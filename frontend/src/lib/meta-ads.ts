import { getAccessiblePages } from './meta-pages'

const GRAPH_BASE = 'https://graph.facebook.com/v19.0'

export type AdAccount = { id: string; name: string; account_status: number }
export type LeadFormOption = { page_id: string; page_name: string; form_id: string; form_name: string }

async function graphPost(path: string, token: string, body: Record<string, unknown>) {
  const res = await fetch(`${GRAPH_BASE}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, access_token: token }),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data?.error?.message ?? 'Error desconocido de la API de Meta')
  }
  return data
}

export async function getAdAccounts(token: string): Promise<AdAccount[]> {
  const res = await fetch(
    `${GRAPH_BASE}/me/adaccounts?fields=id,name,account_status&access_token=${token}`
  )
  if (!res.ok) return []
  const { data } = await res.json() as { data?: AdAccount[] }
  return data ?? []
}

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

export async function uploadAdImage(token: string, accountId: string, file: File): Promise<string> {
  const bytes = Buffer.from(await file.arrayBuffer()).toString('base64')
  const data = await graphPost(`${accountId}/adimages`, token, { bytes })
  const images = data.images as Record<string, { hash: string }>
  const firstKey = Object.keys(images)[0]
  return images[firstKey].hash
}

export async function createCampaign(
  token: string,
  accountId: string,
  input: { name: string }
): Promise<string> {
  const data = await graphPost(`${accountId}/campaigns`, token, {
    name: input.name,
    objective: 'OUTCOME_LEADS',
    status: 'PAUSED',
    special_ad_categories: [],
  })
  return data.id as string
}

export async function createAdSet(
  token: string,
  accountId: string,
  input: {
    name: string
    campaign_id: string
    daily_budget: number
    page_id: string
    age_min: number
    age_max: number
  }
): Promise<string> {
  const data = await graphPost(`${accountId}/adsets`, token, {
    name: input.name,
    campaign_id: input.campaign_id,
    daily_budget: input.daily_budget,
    billing_event: 'IMPRESSIONS',
    optimization_goal: 'LEAD_GENERATION',
    promoted_object: { page_id: input.page_id },
    targeting: {
      geo_locations: { countries: ['CL'] },
      age_min: input.age_min,
      age_max: input.age_max,
    },
    status: 'PAUSED',
  })
  return data.id as string
}

export async function createAdCreative(
  token: string,
  accountId: string,
  input: {
    name: string
    page_id: string
    form_id: string
    image_hash: string
    message: string
    headline: string
  }
): Promise<string> {
  const data = await graphPost(`${accountId}/adcreatives`, token, {
    name: input.name,
    object_story_spec: {
      page_id: input.page_id,
      link_data: {
        message: input.message,
        image_hash: input.image_hash,
        name: input.headline,
        call_to_action: {
          type: 'SIGN_UP',
          value: { lead_gen_form_id: input.form_id },
        },
      },
    },
  })
  return data.id as string
}

export async function createAd(
  token: string,
  accountId: string,
  input: { name: string; adset_id: string; creative_id: string }
): Promise<string> {
  const data = await graphPost(`${accountId}/ads`, token, {
    name: input.name,
    adset_id: input.adset_id,
    creative: { creative_id: input.creative_id },
    status: 'PAUSED',
  })
  return data.id as string
}
