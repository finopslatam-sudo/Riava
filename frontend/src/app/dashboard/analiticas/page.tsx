'use client'

import { useState, useEffect } from 'react'
import { leadsAnalyticsApi, leadsApi, type DashboardStats, type Lead } from '@/lib/leads-api'

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  const color = accent ?? '#00e5ff'
  return (
    <div className="px-5 py-4 rounded-2xl" style={{ background: 'rgba(0,10,18,0.9)', border: '1px solid rgba(0,229,255,0.12)' }}>
      <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: 'rgba(0,229,255,0.4)' }}>{label}</p>
      <p className="text-3xl font-bold" style={{ color }}>{value}</p>
      {sub ? <p className="text-xs mt-1" style={{ color: 'rgba(224,247,255,0.4)' }}>{sub}</p> : null}
    </div>
  )
}

function fmtNum(n: number) { return n.toLocaleString('es-CL') }
function fmtCLP(n: number) { return `$${fmtNum(Math.round(n))}` }
function fmtPct(n: number) { return `${n.toFixed(1)}%` }

export default function AnaliticasPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentLeads, setRecentLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      leadsAnalyticsApi.stats(),
      leadsApi.list({ size: 8 }),
    ])
      .then(([s, leads]) => { setStats(s); setRecentLeads(leads.items) })
      .catch(() => setError('No se pudo conectar al backend.'))
      .finally(() => setLoading(false))
  }, [])

  const STATUS_LABELS: Record<string, string> = {
    new: 'Nuevo', contacted: 'Contactado', sin_respuesta: 'Sin respuesta', agendado: 'Agendado',
    cotizado: 'Cotizado', cotizacion_aceptada: 'Cotización Aceptada', cotizacion_rechazada: 'Cotización Rechazada',
  }
  const STATUS_COLORS: Record<string, string> = {
    new: '#00e5ff', contacted: '#a78bfa', sin_respuesta: '#fbbf24', agendado: '#38bdf8',
    cotizado: '#fb923c', cotizacion_aceptada: '#00e564', cotizacion_rechazada: 'rgba(240,0,80,0.7)',
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#e0f7ff' }}>Analíticas</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(0,229,255,0.5)' }}>
          Métricas clave de tu operación de leads
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-64">
          <div className="loader" />
        </div>
      ) : error ? (
        <div className="max-w-lg mx-auto text-center py-16">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.12)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(0,229,255,0.4)" strokeWidth="1.8">
              <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>
          <p className="text-sm font-medium" style={{ color: '#e0f7ff' }}>Esta sección estará disponible próximamente</p>
          <p className="text-xs mt-2" style={{ color: 'rgba(224,247,255,0.35)' }}>
            El servidor de leads está siendo configurado.
          </p>
          {/* Offline preview with zeroed values */}
          <p className="text-xs mt-6 px-4 py-2 rounded-xl inline-block"
            style={{ background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.1)', color: 'rgba(0,229,255,0.5)' }}>
            Vista previa del layout disponible cuando el backend esté activo
          </p>
        </div>
      ) : stats !== null ? (
        <>
          {/* KPI grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total leads" value={fmtNum(stats.total_leads)} sub="histórico" />
            <StatCard label="Leads hoy" value={fmtNum(stats.new_leads_today)} sub="capturados hoy" accent="#a78bfa" />
            <StatCard label="Este mes" value={fmtNum(stats.leads_this_month)} sub="leads del mes" accent="#fbbf24" />
            <StatCard label="Conversión" value={fmtPct(stats.conversion_rate)} sub="leads → ganados" accent="#00e564" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Score promedio" value={String(Math.round(stats.avg_score))} sub="/100" />
            <StatCard label="Campañas activas" value={fmtNum(stats.active_campaigns)} />
            <StatCard label="Gasto total" value={fmtCLP(stats.total_spend)} sub="Meta Ads" accent="#fb923c" />
            <StatCard label="CPL promedio" value={fmtCLP(stats.cpl)} sub="costo por lead" />
          </div>

          {/* Recent leads */}
          {recentLeads.length > 0 ? (
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(0,10,18,0.9)', border: '1px solid rgba(0,229,255,0.12)' }}>
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(0,229,255,0.08)' }}>
                <p className="text-sm font-semibold" style={{ color: '#e0f7ff' }}>Leads recientes</p>
                <a href="/dashboard/leads" className="text-xs" style={{ color: '#00e5ff' }}>Ver todos →</a>
              </div>
              {recentLeads.map((lead, idx) => {
                const date = new Date(lead.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })
                const statusColor = STATUS_COLORS[lead.status] ?? '#00e5ff'
                const statusLabel = STATUS_LABELS[lead.status] ?? lead.status
                const scoreColor = lead.score >= 70 ? '#00e564' : lead.score >= 40 ? '#fbbf24' : 'rgba(240,0,80,0.7)'
                return (
                  <div key={lead.id}
                    className="flex items-center gap-4 px-5 py-3"
                    style={{ borderBottom: idx < recentLeads.length - 1 ? '1px solid rgba(0,229,255,0.05)' : 'none' }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: '#e0f7ff' }}>{lead.full_name}</p>
                      <p className="text-xs truncate mt-0.5" style={{ color: 'rgba(0,229,255,0.4)' }}>{lead.email}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full shrink-0"
                      style={{ background: `${statusColor}15`, border: `1px solid ${statusColor}40`, color: statusColor }}>
                      {statusLabel}
                    </span>
                    <span className="text-xs font-bold shrink-0 w-8 text-right" style={{ color: scoreColor }}>{lead.score}</span>
                    <span className="text-xs shrink-0 w-16 text-right" style={{ color: 'rgba(224,247,255,0.3)' }}>{date}</span>
                  </div>
                )
              })}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
