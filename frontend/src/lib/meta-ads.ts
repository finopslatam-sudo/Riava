const GRAPH_BASE = 'https://graph.facebook.com/v19.0'

export type AdAccount = { id: string; name: string; account_status: number }
export type RegionOption = { key: string; name: string }
export type CountryOption = { key: string; name: string }
export type CityOption = { key: string; name: string }
export type InterestOption = { id: string; name: string; audience_size_lower_bound?: number }
export type WorkPositionOption = { id: string; name: string }
export type EmployerOption = { id: string; name: string }
export type IndustryOption = { id: string; name: string }
export type BehaviorOption = { id: string; name: string }
export type Gender = 'all' | 'male' | 'female'
export type AdCreativeAsset =
  | { type: 'image'; image_hash: string }
  | { type: 'video'; video_id: string; thumbnail_url: string }

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

export async function getRegions(token: string, countryCode = 'CL'): Promise<RegionOption[]> {
  const res = await fetch(
    `${GRAPH_BASE}/search?` +
    new URLSearchParams({
      type: 'adgeolocation',
      location_types: JSON.stringify(['region']),
      country_code: countryCode,
      limit: '30',
      access_token: token,
    })
  )
  if (!res.ok) return []
  const { data } = await res.json() as { data?: { key: string; name: string }[] }
  return (data ?? []).map(r => ({ key: r.key, name: r.name }))
}

export async function getCountries(token: string): Promise<CountryOption[]> {
  const res = await fetch(
    `${GRAPH_BASE}/search?` +
    new URLSearchParams({
      type: 'adgeolocation',
      location_types: JSON.stringify(['country']),
      limit: '1000',
      access_token: token,
    })
  )
  if (!res.ok) return []
  const { data } = await res.json() as { data?: { key: string; name: string }[] }
  return (data ?? []).map(c => ({ key: c.key, name: c.name }))
}

export async function searchCities(token: string, countryCode: string, query: string): Promise<CityOption[]> {
  const res = await fetch(
    `${GRAPH_BASE}/search?` +
    new URLSearchParams({
      type: 'adgeolocation',
      location_types: JSON.stringify(['city']),
      country_code: countryCode,
      q: query,
      limit: '15',
      access_token: token,
    })
  )
  if (!res.ok) return []
  const { data } = await res.json() as { data?: { key: string; name: string }[] }
  return (data ?? []).map(c => ({ key: c.key, name: c.name }))
}

export async function searchInterests(token: string, query: string): Promise<InterestOption[]> {
  const res = await fetch(
    `${GRAPH_BASE}/search?` +
    new URLSearchParams({
      type: 'adinterest',
      q: query,
      limit: '15',
      access_token: token,
    })
  )
  if (!res.ok) return []
  const { data } = await res.json() as { data?: InterestOption[] }
  return data ?? []
}

export async function searchWorkPositions(token: string, query: string): Promise<WorkPositionOption[]> {
  const res = await fetch(
    `${GRAPH_BASE}/search?` +
    new URLSearchParams({ type: 'adworkposition', q: query, limit: '15', access_token: token })
  )
  if (!res.ok) return []
  const { data } = await res.json() as { data?: WorkPositionOption[] }
  return data ?? []
}

export async function searchEmployers(token: string, query: string): Promise<EmployerOption[]> {
  const res = await fetch(
    `${GRAPH_BASE}/search?` +
    new URLSearchParams({ type: 'adworkemployer', q: query, limit: '15', access_token: token })
  )
  if (!res.ok) return []
  const { data } = await res.json() as { data?: EmployerOption[] }
  return data ?? []
}

export async function getIndustries(token: string): Promise<IndustryOption[]> {
  const res = await fetch(
    `${GRAPH_BASE}/search?` +
    new URLSearchParams({ type: 'adTargetingCategory', class: 'industries', limit: '1000', access_token: token })
  )
  if (!res.ok) return []
  const { data } = await res.json() as { data?: IndustryOption[] }
  return data ?? []
}

export async function searchBehaviors(token: string, query: string): Promise<BehaviorOption[]> {
  const res = await fetch(
    `${GRAPH_BASE}/search?` +
    new URLSearchParams({ type: 'adTargetingCategory', class: 'behaviors', q: query, limit: '15', access_token: token })
  )
  if (!res.ok) return []
  const { data } = await res.json() as { data?: BehaviorOption[] }
  return data ?? []
}

export async function uploadAdImage(token: string, accountId: string, file: File): Promise<string> {
  const bytes = Buffer.from(await file.arrayBuffer()).toString('base64')
  const data = await graphPost(`${accountId}/adimages`, token, { bytes })
  const images = data.images as Record<string, { hash: string }>
  const firstKey = Object.keys(images)[0]
  return images[firstKey].hash
}

export async function getVideoThumbnail(token: string, videoId: string): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const statusRes = await fetch(
      `${GRAPH_BASE}/${videoId}?fields=status&access_token=${token}`
    )
    if (statusRes.ok) {
      const statusData = await statusRes.json() as { status?: { video_status?: string } }
      if (statusData.status?.video_status === 'ready') break
    }
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  const thumbsRes = await fetch(
    `${GRAPH_BASE}/${videoId}/thumbnails?access_token=${token}`
  )
  if (!thumbsRes.ok) {
    throw new Error('No se pudo obtener la miniatura del video')
  }
  const { data: thumbnails } = await thumbsRes.json() as {
    data?: { uri: string; is_preferred?: boolean }[]
  }
  const preferred = (thumbnails ?? []).find(t => t.is_preferred) ?? thumbnails?.[0]
  if (!preferred) {
    throw new Error('El video no tiene miniaturas disponibles todavía')
  }
  return preferred.uri
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
    gender: Gender
    country_code: string
    region_keys: string[]
    city_keys: string[]
    interest_ids: string[]
    work_position_ids: string[]
    work_employer_ids: string[]
    industry_ids: string[]
    behavior_ids: string[]
  }
): Promise<string> {
  const geo: Record<string, unknown> = {}
  if (input.city_keys.length > 0) {
    geo.cities = input.city_keys.map(key => ({ key, radius: 20, distance_unit: 'kilometer' }))
  }
  if (input.region_keys.length > 0) {
    geo.regions = input.region_keys.map(key => ({ key }))
  }
  if (Object.keys(geo).length === 0) {
    geo.countries = [input.country_code]
  }

  const targeting: Record<string, unknown> = {
    geo_locations: geo,
    age_min: input.age_min,
    age_max: input.age_max,
  }
  if (input.gender !== 'all') {
    targeting.genders = [input.gender === 'male' ? 1 : 2]
  }

  const flexible_spec: Record<string, { id: string }[]>[] = []
  if (input.interest_ids.length > 0) flexible_spec.push({ interests: input.interest_ids.map(id => ({ id })) })
  if (input.work_position_ids.length > 0) flexible_spec.push({ work_positions: input.work_position_ids.map(id => ({ id })) })
  if (input.work_employer_ids.length > 0) flexible_spec.push({ work_employers: input.work_employer_ids.map(id => ({ id })) })
  if (input.industry_ids.length > 0) flexible_spec.push({ industries: input.industry_ids.map(id => ({ id })) })
  if (input.behavior_ids.length > 0) flexible_spec.push({ behaviors: input.behavior_ids.map(id => ({ id })) })
  if (flexible_spec.length > 0) targeting.flexible_spec = flexible_spec

  const data = await graphPost(`${accountId}/adsets`, token, {
    name: input.name,
    campaign_id: input.campaign_id,
    daily_budget: input.daily_budget,
    billing_event: 'IMPRESSIONS',
    optimization_goal: 'LEAD_GENERATION',
    promoted_object: { page_id: input.page_id },
    targeting,
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
    asset: AdCreativeAsset
    message: string
    headline: string
  }
): Promise<string> {
  const call_to_action = {
    type: 'SIGN_UP',
    value: { lead_gen_form_id: input.form_id },
  }

  const objectStorySpec = input.asset.type === 'video'
    ? {
        page_id: input.page_id,
        video_data: {
          video_id: input.asset.video_id,
          image_url: input.asset.thumbnail_url,
          title: input.headline,
          message: input.message,
          call_to_action,
        },
      }
    : {
        page_id: input.page_id,
        link_data: {
          message: input.message,
          image_hash: input.asset.image_hash,
          name: input.headline,
          call_to_action,
        },
      }

  const data = await graphPost(`${accountId}/adcreatives`, token, {
    name: input.name,
    object_story_spec: objectStorySpec,
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
