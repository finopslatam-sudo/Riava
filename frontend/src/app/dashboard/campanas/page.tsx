'use client'

import { useState, useEffect, useCallback } from 'react'
import { leadsCampaignsApi, type Campaign } from '@/lib/leads-api'
import { CreateCampaignModal, type AdAccount } from '../meta-ads/CreateCampaignModal'
import { EditCampaignModal } from './EditCampaignModal'

const STATUS_COLORS: Record<Campaign['status'], { bg: string; border: string; text: string; label: string }> = {
  ACTIVE: { bg: 'rgba(0,229,100,0.1)', border: 'rgba(0,229,100,0.3)', text: '#00e564', label: 'Activa' },
  PAUSED: { bg: 'rgba(255,160,0,0.1)', border: 'rgba(255,160,0,0.3)', text: '#ffa000', label: 'Pausada' },
  ARCHIVED: { bg: 'rgba(0,229,255,0.06)', border: 'rgba(0,229,255,0.15)', text: 'rgba(0,229,255,0.5)', label: 'Archivada' },
  DELETED: { bg: 'rgba(240,0,80,0.1)', border: 'rgba(240,0,80,0.2)', text: 'rgba(240,0,80,0.6)', label: 'Eliminada' },
}

function fmt(n: number) {
  return n.toLocaleString('es-CL')
}

function fmtCurrency(n: number) {
  return `$${fmt(Math.round(n))}`
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="px-5 py-4 rounded-2xl" style={{ background: 'rgba(0,10,18,0.9)', border: '1px solid rgba(0,229,255,0.12)' }}>
      <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: 'rgba(0,229,255,0.45)' }}>{label}</p>
      <p className="text-2xl font-bold" style={{ color: '#e0f7ff' }}>{value}</p>
      {sub ? <p className="text-xs mt-0.5" style={{ color: 'rgba(0,229,255,0.4)' }}>{sub}</p> : null}
    </div>
  )
}

export default function CampanasPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [metaConnected, setMetaConnected] = useState(false)
  const [accounts, setAccounts] = useState<AdAccount[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null)

  useEffect(() => {
    leadsCampaignsApi.list()
      .then(setCampaigns)
      .catch(() => setError('No se pudo conectar al backend. Asegúrate de que el servidor está activo.'))
      .finally(() => setLoading(false))
  }, [])

  const loadAccounts = useCallback(() => {
    fetch('/api/meta/status')
      .then(r => r.json() as Promise<{ connected: boolean }>)
      .then(({ connected }) => {
        setMetaConnected(connected)
        if (!connected) return
        fetch('/api/meta/ads/accounts')
          .then(r => r.json())
          .then(data => setAccounts(data.accounts ?? []))
      })
  }, [])

  useEffect(() => { loadAccounts() }, [loadAccounts])

  const active = campaigns.filter(c => c.status === 'ACTIVE')
  const totalSpend = campaigns.reduce((a, c) => a + c.spend, 0)
  const totalLeads = campaigns.reduce((a, c) => a + c.leads_count, 0)
  const avgCpl = totalLeads > 0 ? totalSpend / totalLeads : 0

  return (
    <div className="p-4 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#e0f7ff' }}>Campañas</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(0,229,255,0.5)' }}>
            Campañas sincronizadas desde Meta Ads
          </p>
        </div>
        <div className="flex items-center gap-3">
          {metaConnected && (
            <button
              onClick={() => setShowCreate(true)}
              className="btn-tron px-4 py-2 rounded-lg text-xs font-semibold text-white"
            >
              + Crear campaña
            </button>
          )}
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            style={{ background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.2)', color: '#00e5ff' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 .49-3.69" />
            </svg>
            Sincronizar
          </button>
        </div>
      </div>

      {!metaConnected && (
        <div className="mb-6 px-4 py-3 rounded-xl text-sm flex items-center justify-between gap-3 flex-wrap"
          style={{ background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.15)', color: 'rgba(224,247,255,0.6)' }}>
          <span>Conecta tu cuenta de Meta para poder crear campañas nuevas desde aquí.</span>
          <a href="/dashboard/meta-ads" className="text-xs font-medium" style={{ color: '#00e5ff' }}>Conectar Meta Ads →</a>
        </div>
      )}

      {/* Stats */}
      {campaigns.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Campañas activas" value={String(active.length)} sub={`de ${campaigns.length} totales`} />
          <StatCard label="Total leads" value={fmt(totalLeads)} sub="todas las campañas" />
          <StatCard label="Gasto total" value={fmtCurrency(totalSpend)} sub="Meta Ads" />
          <StatCard label="CPL promedio" value={fmtCurrency(avgCpl)} sub="costo por lead" />
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center min-h-64">
          <div className="loader" />
        </div>
      ) : error ? (
        <div className="max-w-lg mx-auto text-center py-16">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(240,0,80,0.1)', border: '1px solid rgba(240,0,80,0.2)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(240,0,80,0.7)" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="text-sm font-medium" style={{ color: '#e0f7ff' }}>Esta sección estará disponible próximamente</p>
          <p className="text-xs mt-2" style={{ color: 'rgba(224,247,255,0.35)' }}>
            El servidor de leads está siendo configurado. Mientras tanto, revisa tus campañas en{' '}
            <a href="/dashboard/meta-ads" style={{ color: '#00e5ff' }}>Meta Ads</a>.
          </p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="max-w-lg mx-auto text-center py-16">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.12)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(0,229,255,0.5)" strokeWidth="1.8">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <p className="text-sm font-medium" style={{ color: 'rgba(224,247,255,0.5)' }}>Sin campañas todavía</p>
          <p className="text-xs mt-2" style={{ color: 'rgba(224,247,255,0.3)' }}>
            Conecta tu cuenta de Meta Ads para importar campañas automáticamente
          </p>
          <a href="/dashboard/meta-ads"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', color: '#00e5ff' }}>
            Conectar Meta Ads
          </a>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(0,10,18,0.9)', border: '1px solid rgba(0,229,255,0.12)' }}>
          {/* Table header */}
          <div className="grid px-5 py-3 text-xs font-semibold uppercase tracking-wider"
            style={{ gridTemplateColumns: '1fr 100px 110px 90px 80px 80px 70px', color: 'rgba(0,229,255,0.4)', borderBottom: '1px solid rgba(0,229,255,0.08)' }}>
            <span>Campaña</span>
            <span>Estado</span>
            <span className="text-right">Gasto</span>
            <span className="text-right">Leads</span>
            <span className="text-right">CPL</span>
            <span className="text-right">CTR</span>
            <span></span>
          </div>

          {campaigns.map((c, idx) => {
            const s = STATUS_COLORS[c.status]
            const ctr = c.impressions > 0 ? ((c.clicks / c.impressions) * 100).toFixed(2) : '0.00'
            return (
              <div key={c.id}
                className="grid px-5 py-4 items-center transition-all"
                style={{
                  gridTemplateColumns: '1fr 100px 110px 90px 80px 80px 70px',
                  background: idx % 2 === 0 ? 'transparent' : 'rgba(0,229,255,0.02)',
                  borderBottom: '1px solid rgba(0,229,255,0.06)',
                }}>
                <div className="min-w-0 pr-4">
                  <p className="text-sm font-medium truncate" style={{ color: '#e0f7ff' }}>{c.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(0,229,255,0.4)' }}>{c.objective}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full w-fit flex items-center gap-1"
                  style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}>
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'currentColor' }} />
                  {s.label}
                </span>
                <span className="text-sm text-right font-medium" style={{ color: '#e0f7ff' }}>{fmtCurrency(c.spend)}</span>
                <span className="text-sm text-right font-bold" style={{ color: '#00e5ff' }}>{fmt(c.leads_count)}</span>
                <span className="text-sm text-right" style={{ color: 'rgba(224,247,255,0.7)' }}>{fmtCurrency(c.cpl)}</span>
                <span className="text-sm text-right" style={{ color: 'rgba(224,247,255,0.5)' }}>{ctr}%</span>
                <span className="text-right">
                  <button onClick={() => setEditingCampaignId(c.id)}
                    className="text-xs font-medium px-2 py-1 rounded-lg"
                    style={{ border: '1px solid rgba(0,229,255,0.15)', color: 'rgba(0,229,255,0.7)' }}>
                    Editar
                  </button>
                </span>
              </div>
            )
          })}
        </div>
      )}

      {showCreate && (
        <CreateCampaignModal
          accounts={accounts}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); leadsCampaignsApi.list().then(setCampaigns).catch(() => {}) }}
        />
      )}

      {editingCampaignId && (
        <EditCampaignModal
          campaignId={editingCampaignId}
          onClose={() => setEditingCampaignId(null)}
          onSaved={() => leadsCampaignsApi.list().then(setCampaigns).catch(() => {})}
        />
      )}
    </div>
  )
}
