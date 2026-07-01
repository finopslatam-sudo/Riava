async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string }
    throw Object.assign(new Error(body.error ?? res.statusText), { status: res.status })
  }
  return res.json() as Promise<T>
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost'

export interface Lead {
  id: string
  full_name: string
  email: string
  phone: string
  company_name: string
  status: LeadStatus
  score: number
  source_campaign: string
  assigned_to: string | null
  created_at: string
  updated_at: string
}

export interface LeadListResponse {
  items: Lead[]
  total: number
  page: number
  size: number
}

export interface Campaign {
  id: string
  name: string
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DELETED'
  objective: string
  budget_remaining: number
  spend: number
  impressions: number
  clicks: number
  leads_count: number
  cpl: number
  created_at: string
}

export interface DashboardStats {
  total_leads: number
  new_leads_today: number
  leads_this_month: number
  conversion_rate: number
  avg_score: number
  active_campaigns: number
  total_spend: number
  cpl: number
}

// ── Leads ─────────────────────────────────────────────────────────────────────

export const leadsApi = {
  list: (params?: { page?: number; size?: number; status?: string; search?: string }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.size) qs.set('size', String(params.size))
    if (params?.status) qs.set('status', params.status)
    if (params?.search) qs.set('search', params.search)
    return api<LeadListResponse>(`/api/leads?${qs}`)
  },
  get: (id: string) => api<Lead>(`/api/leads/${id}`),
  create: (payload: Partial<Lead>) => api<Lead>('/api/leads', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string, payload: Partial<Lead>) =>
    api<Lead>(`/api/leads/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  updateStatus: (id: string, status: LeadStatus) =>
    api<Lead>(`/api/leads/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  delete: (id: string) => api<{ ok: boolean }>(`/api/leads/${id}`, { method: 'DELETE' }),
}

// ── Campaigns ─────────────────────────────────────────────────────────────────

export const leadsCampaignsApi = {
  list: () => api<Campaign[]>('/api/campaigns'),
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export const leadsAnalyticsApi = {
  stats: () => api<DashboardStats>('/api/leads/analytics'),
}
