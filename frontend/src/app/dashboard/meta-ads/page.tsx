'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

type AdAccount = { id: string; name: string; account_status: number }

type CampaignInsights = {
  impressions?: string
  clicks?: string
  spend?: string
  reach?: string
  cpm?: string
  cpc?: string
}

type Campaign = {
  id: string
  name: string
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DELETED'
  objective?: string
  insights?: { data: CampaignInsights[] }
}

type AccountResult = { account: AdAccount; campaigns: Campaign[] }

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string; border: string }> = {
  ACTIVE:   { label: 'Activa',    color: '#00e564', bg: 'rgba(0,229,100,0.08)',   border: 'rgba(0,229,100,0.25)'   },
  PAUSED:   { label: 'Pausada',   color: '#ffa000', bg: 'rgba(255,160,0,0.08)',   border: 'rgba(255,160,0,0.25)'   },
  ARCHIVED: { label: 'Archivada', color: '#6b7280', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.25)' },
  DELETED:  { label: 'Eliminada', color: '#f00050', bg: 'rgba(240,0,80,0.08)',    border: 'rgba(240,0,80,0.25)'    },
}

function fmt(n: string | undefined) {
  if (!n) return '—'
  return Number(n).toLocaleString('es-CL')
}

function fmtMoney(n: string | undefined) {
  if (!n) return '—'
  return `$${Number(n).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function MetaAdsContent() {
  const searchParams = useSearchParams()
  const justConnected = searchParams.get('connected') === '1'
  const connectError = searchParams.get('error')

  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState<AccountResult[]>([])
  const [campaignLoading, setCampaignLoading] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)

  const fetchCampaigns = useCallback(async () => {
    setCampaignLoading(true)
    try {
      const res = await fetch('/api/meta/campaigns')
      if (!res.ok) { setConnected(false); return }
      const json = await res.json() as { results?: AccountResult[] }
      setResults(json.results ?? [])
    } finally {
      setCampaignLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch('/api/meta/status')
      .then(r => r.json() as Promise<{ connected: boolean }>)
      .then(({ connected: c }) => {
        setConnected(c)
        if (c) fetchCampaigns()
      })
      .finally(() => setLoading(false))
  }, [fetchCampaigns])

  const handleConnect = () => {
    window.location.href = '/api/meta/auth'
  }

  const handleDisconnect = async () => {
    setDisconnecting(true)
    await fetch('/api/meta/status', { method: 'DELETE' })
    setConnected(false)
    setResults([])
    setDisconnecting(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="loader" />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#e0f7ff' }}>Meta Ads</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(0,229,255,0.5)' }}>
            Campañas de Facebook e Instagram conectadas a tu cuenta
          </p>
        </div>
        {connected && (
          <button
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="px-4 py-2 rounded-lg text-xs font-medium transition-all"
            style={{ color: 'rgba(240,0,255,0.6)', border: '1px solid rgba(240,0,255,0.15)' }}
          >
            {disconnecting ? 'Desconectando...' : 'Desconectar cuenta'}
          </button>
        )}
      </div>

      {/* Alerts */}
      {justConnected && (
        <div className="mb-6 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
          style={{ background: 'rgba(0,229,100,0.08)', border: '1px solid rgba(0,229,100,0.25)', color: '#00e564' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          Cuenta conectada exitosamente
        </div>
      )}
      {connectError && (
        <div className="mb-6 px-4 py-3 rounded-xl text-sm"
          style={{ background: 'rgba(240,0,80,0.08)', border: '1px solid rgba(240,0,80,0.25)', color: '#f00050' }}>
          {connectError === 'denied' ? 'Cancelaste la conexión con Facebook.' : 'Error al conectar. Intenta nuevamente.'}
        </div>
      )}

      {/* Not connected */}
      {!connected && (
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl p-8" style={{ background: 'rgba(0,10,18,0.9)', border: '1px solid rgba(0,229,255,0.15)' }}>
            <div className="flex items-start gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, #1877f2 0%, #0050c8 100%)' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold" style={{ color: '#e0f7ff' }}>Conectar Meta Business</h2>
                <p className="text-sm mt-1 leading-relaxed" style={{ color: 'rgba(224,247,255,0.5)' }}>
                  Conecta tu cuenta de Facebook para ver tus campañas, impresiones, clics y capturar leads automáticamente.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              {[
                { icon: '📊', title: 'Campañas en tiempo real', desc: 'Ve el estado e impresiones de tus campañas activas' },
                { icon: '🎯', title: 'Captación de leads', desc: 'Leads de formularios de Meta directo a Riava' },
                { icon: '🔒', title: 'Conexión segura', desc: 'OAuth 2.0 oficial de Meta, sin contraseñas' },
              ].map(f => (
                <div key={f.title} className="px-4 py-3 rounded-xl" style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.1)' }}>
                  <div className="text-xl mb-1">{f.icon}</div>
                  <p className="text-xs font-semibold" style={{ color: '#e0f7ff' }}>{f.title}</p>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'rgba(224,247,255,0.4)' }}>{f.desc}</p>
                </div>
              ))}
            </div>

            <button
              onClick={handleConnect}
              className="btn-tron w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-3"
              style={{ color: '#000a0f' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
              Conectar con Meta Business
            </button>

            <p className="text-xs text-center mt-4" style={{ color: 'rgba(0,229,255,0.3)' }}>
              Puedes desconectar tu cuenta en cualquier momento desde esta misma pantalla.
            </p>
          </div>
        </div>
      )}

      {/* Connected — campaigns */}
      {connected && (
        <div>
          {campaignLoading ? (
            <div className="flex items-center justify-center min-h-64">
              <div className="loader" />
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-16" style={{ color: 'rgba(0,229,255,0.4)' }}>
              <p className="text-sm">No se encontraron cuentas publicitarias asociadas a tu perfil.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-10">
              {results.map(({ account, campaigns }) => (
                <div key={account.id}>
                  {/* Account header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'linear-gradient(135deg, #1877f2 0%, #0050c8 100%)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#e0f7ff' }}>{account.name}</p>
                      <p className="text-xs" style={{ color: 'rgba(0,229,255,0.4)' }}>{account.id} · {campaigns.length} campaña{campaigns.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  {campaigns.length === 0 ? (
                    <div className="px-5 py-4 rounded-xl text-sm" style={{ background: 'rgba(0,10,18,0.6)', border: '1px solid rgba(0,229,255,0.08)', color: 'rgba(0,229,255,0.35)' }}>
                      Sin campañas en los últimos 30 días.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {campaigns.map(c => {
                        const ins = c.insights?.data?.[0]
                        const st = STATUS_LABEL[c.status] ?? STATUS_LABEL.PAUSED
                        return (
                          <div key={c.id} className="rounded-2xl overflow-hidden"
                            style={{ background: 'rgba(0,10,18,0.9)', border: '1px solid rgba(0,229,255,0.1)' }}>
                            {/* Campaign header */}
                            <div className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap"
                              style={{ borderBottom: '1px solid rgba(0,229,255,0.07)' }}>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold truncate" style={{ color: '#e0f7ff' }}>{c.name}</p>
                                {c.objective && (
                                  <p className="text-xs mt-0.5" style={{ color: 'rgba(0,229,255,0.4)' }}>
                                    {c.objective.replace(/_/g, ' ')}
                                  </p>
                                )}
                              </div>
                              <span className="text-xs px-2.5 py-1 rounded-full font-medium shrink-0 flex items-center gap-1.5"
                                style={{ color: st.color, background: st.bg, border: `1px solid ${st.border}` }}>
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.color }} />
                                {st.label}
                              </span>
                            </div>

                            {/* Metrics */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0"
                              style={{ '--tw-divide-opacity': 1, borderColor: 'rgba(0,229,255,0.07)' } as React.CSSProperties}>
                              {[
                                { label: 'Impresiones', value: fmt(ins?.impressions) },
                                { label: 'Clics', value: fmt(ins?.clicks) },
                                { label: 'Alcance', value: fmt(ins?.reach) },
                                { label: 'Gasto', value: fmtMoney(ins?.spend) },
                              ].map(m => (
                                <div key={m.label} className="px-5 py-3 text-center">
                                  <p className="text-xs mb-1" style={{ color: 'rgba(0,229,255,0.4)' }}>{m.label}</p>
                                  <p className="text-base font-bold" style={{ color: '#e0f7ff' }}>{m.value}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function MetaAdsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-96">
        <div className="loader" />
      </div>
    }>
      <MetaAdsContent />
    </Suspense>
  )
}
