'use client'

import { useState, useEffect, useCallback } from 'react'
import { leadsApi, type Lead, type LeadStatus } from '@/lib/leads-api'

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; bg: string; border: string }> = {
  new:       { label: 'Nuevo',      color: '#00e5ff',  bg: 'rgba(0,229,255,0.1)',  border: 'rgba(0,229,255,0.3)' },
  contacted: { label: 'Contactado', color: '#a78bfa',  bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.3)' },
  qualified: { label: 'Calificado', color: '#fbbf24',  bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.3)' },
  proposal:  { label: 'Propuesta',  color: '#fb923c',  bg: 'rgba(251,146,60,0.1)',  border: 'rgba(251,146,60,0.3)' },
  won:       { label: 'Ganado',     color: '#00e564',  bg: 'rgba(0,229,100,0.1)',   border: 'rgba(0,229,100,0.3)' },
  lost:      { label: 'Perdido',    color: 'rgba(240,0,80,0.7)', bg: 'rgba(240,0,80,0.08)', border: 'rgba(240,0,80,0.2)' },
}

const ALL_STATUSES: LeadStatus[] = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? '#00e564' : score >= 40 ? '#fbbf24' : 'rgba(240,0,80,0.7)'
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,229,255,0.1)' }}>
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-xs font-medium" style={{ color }}>{score}</span>
    </div>
  )
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 20

  const fetchLeads = useCallback(() => {
    setLoading(true)
    leadsApi.list({ page, size: PAGE_SIZE, search: search || undefined, status: statusFilter || undefined })
      .then(data => { setLeads(data.items); setTotal(data.total) })
      .catch(() => setError('No se pudo conectar al backend.'))
      .finally(() => setLoading(false))
  }, [page, search, statusFilter])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  const handleStatusChange = async (id: string, status: LeadStatus) => {
    try {
      const updated = await leadsApi.updateStatus(id, status)
      setLeads(prev => prev.map(l => l.id === id ? updated : l))
    } catch {
      // silent — user sees no change
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#e0f7ff' }}>Leads</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(0,229,255,0.5)' }}>
            {total > 0 ? `${total.toLocaleString('es-CL')} leads capturados` : 'Gestión de leads'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/dashboard/pipeline"
            className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            style={{ background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.18)', color: '#00e5ff' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="5" height="18" rx="1" /><rect x="10" y="3" width="5" height="12" rx="1" /><rect x="17" y="3" width="5" height="8" rx="1" />
            </svg>
            Ver pipeline
          </a>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(0,229,255,0.4)" strokeWidth="2"
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Buscar por nombre, email..."
            className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: 'rgba(0,10,18,0.9)', border: '1px solid rgba(0,229,255,0.15)', color: '#e0f7ff', caretColor: '#00e5ff' }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value as LeadStatus | ''); setPage(1) }}
          className="rounded-lg px-3 py-2 text-sm outline-none"
          style={{ background: 'rgba(0,10,18,0.9)', border: '1px solid rgba(0,229,255,0.15)', color: statusFilter ? '#e0f7ff' : 'rgba(224,247,255,0.4)' }}>
          <option value="">Todos los estados</option>
          {ALL_STATUSES.map(s => (
            <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-64">
          <div className="loader" />
        </div>
      ) : error ? (
        <div className="max-w-lg mx-auto text-center py-16">
          <p className="text-sm font-medium" style={{ color: '#e0f7ff' }}>Esta sección estará disponible próximamente</p>
          <p className="text-xs mt-2" style={{ color: 'rgba(224,247,255,0.35)' }}>
            El servidor de leads está siendo configurado.
          </p>
        </div>
      ) : leads.length === 0 ? (
        <div className="max-w-lg mx-auto text-center py-16">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.12)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(0,229,255,0.5)" strokeWidth="1.8">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <p className="text-sm font-medium" style={{ color: 'rgba(224,247,255,0.5)' }}>
            {search || statusFilter ? 'Sin resultados para este filtro' : 'Sin leads todavía'}
          </p>
          {(!search && !statusFilter) ? (
            <p className="text-xs mt-2" style={{ color: 'rgba(224,247,255,0.3)' }}>
              Los leads aparecerán aquí cuando lleguen desde Meta Ads
            </p>
          ) : null}
        </div>
      ) : (
        <>
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(0,10,18,0.9)', border: '1px solid rgba(0,229,255,0.12)' }}>
            {/* Header row */}
            <div className="grid px-5 py-3 text-xs font-semibold uppercase tracking-wider"
              style={{ gridTemplateColumns: '1fr 180px 130px 100px 110px', color: 'rgba(0,229,255,0.4)', borderBottom: '1px solid rgba(0,229,255,0.08)' }}>
              <span>Lead</span>
              <span>Campaña</span>
              <span>Score</span>
              <span className="text-center">Estado</span>
              <span className="text-right">Fecha</span>
            </div>

            {leads.map((lead, idx) => {
              const s = STATUS_CONFIG[lead.status]
              const date = new Date(lead.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })
              return (
                <div key={lead.id}
                  className="grid px-5 py-3.5 items-center"
                  style={{
                    gridTemplateColumns: '1fr 180px 130px 100px 110px',
                    background: idx % 2 === 0 ? 'transparent' : 'rgba(0,229,255,0.02)',
                    borderBottom: '1px solid rgba(0,229,255,0.05)',
                  }}>
                  <div className="min-w-0 pr-3">
                    <p className="text-sm font-medium truncate" style={{ color: '#e0f7ff' }}>{lead.full_name}</p>
                    <p className="text-xs truncate mt-0.5" style={{ color: 'rgba(0,229,255,0.45)' }}>{lead.email}</p>
                  </div>
                  <p className="text-xs truncate pr-3" style={{ color: 'rgba(224,247,255,0.45)' }}>{lead.source_campaign || '—'}</p>
                  <ScoreBadge score={lead.score} />
                  <div className="flex justify-center">
                    <select
                      value={lead.status}
                      onChange={e => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                      className="text-xs rounded-lg px-2 py-1 outline-none cursor-pointer"
                      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
                      {ALL_STATUSES.map(st => (
                        <option key={st} value={st} style={{ background: '#000a0f', color: '#e0f7ff' }}>
                          {STATUS_CONFIG[st].label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-xs text-right" style={{ color: 'rgba(224,247,255,0.4)' }}>{date}</p>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 ? (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs" style={{ color: 'rgba(0,229,255,0.4)' }}>
                Página {page} de {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{ background: 'rgba(0,10,18,0.9)', border: '1px solid rgba(0,229,255,0.15)', color: page === 1 ? 'rgba(0,229,255,0.25)' : '#00e5ff' }}>
                  Anterior
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{ background: 'rgba(0,10,18,0.9)', border: '1px solid rgba(0,229,255,0.15)', color: page === totalPages ? 'rgba(0,229,255,0.25)' : '#00e5ff' }}>
                  Siguiente
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
