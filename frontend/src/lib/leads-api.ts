const BASE_URL = process.env.NEXT_PUBLIC_LEADS_API_URL ?? 'http://localhost:8000'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('rl_access_token')
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw Object.assign(new Error(body.detail ?? res.statusText), { status: res.status, body })
  }
  return res.json() as Promise<T>
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface UserOut {
  id: string
  email: string
  name: string
  last_name: string
  company_id: string
  roles: string[]
  mfa_enabled: boolean
}

export const leadsAuth = {
  register: (payload: {
    company_name: string
    name: string
    last_name: string
    email: string
    password: string
  }) => request<TokenResponse>('/api/v1/auth/register', { method: 'POST', body: JSON.stringify(payload) }),

  login: (email: string, password: string, mfa_code?: string) =>
    request<TokenResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, ...(mfa_code ? { mfa_code } : {}) }),
    }),

  me: () => request<UserOut>('/api/v1/auth/me'),

  saveTokens: (tokens: TokenResponse) => {
    localStorage.setItem('rl_access_token', tokens.access_token)
    localStorage.setItem('rl_refresh_token', tokens.refresh_token)
  },

  clearTokens: () => {
    localStorage.removeItem('rl_access_token')
    localStorage.removeItem('rl_refresh_token')
  },

  isConnected: () => !!getToken(),
}

// ── Meta Ads ─────────────────────────────────────────────────────────────────

export interface MetaConnection {
  id: string
  ad_account_id: string
  ad_account_name: string
  page_name: string
  is_active: boolean
  connected_at: string
}

export const leadsMetaApi = {
  listConnections: () => request<MetaConnection[]>('/api/v1/meta/connections'),
  getOAuthUrl: () => request<{ url: string }>('/api/v1/meta/oauth/url'),
  disconnect: (id: string) => request<void>(`/api/v1/meta/connections/${id}`, { method: 'DELETE' }),
}

// ── Campaigns ────────────────────────────────────────────────────────────────

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

export const leadsCampaignsApi = {
  list: () => request<Campaign[]>('/api/v1/campaigns'),
  get: (id: string) => request<Campaign>(`/api/v1/campaigns/${id}`),
}

// ── Leads ────────────────────────────────────────────────────────────────────

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

export const leadsApi = {
  list: (params?: { page?: number; size?: number; status?: string; search?: string }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.size) qs.set('size', String(params.size))
    if (params?.status) qs.set('status', params.status)
    if (params?.search) qs.set('search', params.search)
    return request<LeadListResponse>(`/api/v1/leads?${qs}`)
  },
  get: (id: string) => request<Lead>(`/api/v1/leads/${id}`),
  updateStatus: (id: string, status: LeadStatus) =>
    request<Lead>(`/api/v1/leads/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
}

// ── Analytics ────────────────────────────────────────────────────────────────

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

export const leadsAnalyticsApi = {
  stats: () => request<DashboardStats>('/api/v1/analytics/stats'),
}
