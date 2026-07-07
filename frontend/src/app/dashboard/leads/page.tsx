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

type NewLeadForm = {
  full_name: string
  email: string
  phone: string
  company_name: string
  source_campaign: string
  status: LeadStatus
}

const EMPTY_FORM: NewLeadForm = {
  full_name: '', email: '', phone: '', company_name: '', source_campaign: '', status: 'new',
}

function NewLeadModal({ onClose, onCreated }: { onClose: () => void; onCreated: (lead: Lead) => void }) {
  const [form, setForm] = useState<NewLeadForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const set = (k: keyof NewLeadForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.full_name.trim() || !form.email.trim()) { setErr('Nombre y email son requeridos'); return }
    setSaving(true); setErr('')
    try {
      const lead = await leadsApi.create(form)
      onCreated(lead)
    } catch {
      setErr('Error al crear el lead. Intenta nuevamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md rounded-2xl p-6" style={{ background: '#000a0f', border: '1px solid rgba(0,229,255,0.2)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold" style={{ color: '#e0f7ff' }}>Nuevo lead</h2>
          <button onClick={onClose} style={{ color: 'rgba(224,247,255,0.4)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {[
            { label: 'Nombre completo *', key: 'full_name', placeholder: 'Juan Pérez' },
            { label: 'Email *', key: 'email', placeholder: 'juan@empresa.cl' },
            { label: 'Teléfono', key: 'phone', placeholder: '+56 9 1234 5678' },
            { label: 'Empresa', key: 'company_name', placeholder: 'Empresa SPA' },
            { label: 'Campaña origen', key: 'source_campaign', placeholder: 'Campaña Pág Web' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-medium block mb-1" style={{ color: 'rgba(0,229,255,0.6)' }}>{f.label}</label>
              <input
                value={form[f.key as keyof NewLeadForm] as string}
                onChange={set(f.key as keyof NewLeadForm)}
                placeholder={f.placeholder}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.15)', color: '#e0f7ff', caretColor: '#00e5ff' }}
              />
            </div>
          ))}

          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'rgba(0,229,255,0.6)' }}>Estado</label>
            <select
              value={form.status}
              onChange={set('status')}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.15)', color: '#e0f7ff' }}>
              {ALL_STATUSES.map(s => <option key={s} value={s} style={{ background: '#000a0f' }}>{STATUS_CONFIG[s].label}</option>)}
            </select>
          </div>

          {err && <p className="text-xs" style={{ color: '#f00050' }}>{err}</p>}

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium"
              style={{ border: '1px solid rgba(0,229,255,0.15)', color: 'rgba(224,247,255,0.5)' }}>
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold btn-tron"
              style={{ color: '#000a0f', opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Guardando...' : 'Crear lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function LeadDetailModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const s = STATUS_CONFIG[lead.status]
  const date = new Date(lead.created_at).toLocaleString('es-CL', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
  const scoreColor = lead.score >= 70 ? '#00e564' : lead.score >= 40 ? '#fbbf24' : 'rgba(240,0,80,0.7)'
  const customEntries = Object.entries(lead.custom_fields ?? {})

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ background: '#000a0f', border: '1px solid rgba(0,229,255,0.2)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold" style={{ color: '#e0f7ff' }}>Detalle del lead</h2>
          <button onClick={onClose} style={{ color: 'rgba(224,247,255,0.4)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: 'rgba(0,229,255,0.5)' }}>Score IA</p>
            <p className="text-3xl font-bold" style={{ color: scoreColor }}>{lead.score}<span className="text-sm font-medium" style={{ color: 'rgba(224,247,255,0.4)' }}>/100</span></p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium mb-1" style={{ color: 'rgba(0,229,255,0.5)' }}>Campaña</p>
            <p className="text-sm" style={{ color: '#e0f7ff' }}>{lead.source_campaign || '—'}</p>
            <p className="text-xs mt-2" style={{ color: 'rgba(224,247,255,0.4)' }}>{date}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-sm font-semibold" style={{ color: '#e0f7ff' }}>{lead.full_name}</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(0,229,255,0.45)' }}>{lead.company_name || 'Empresa no especificada'}</p>
          </div>
          <span className="text-xs rounded-lg px-2 py-1" style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
            {s.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: 'rgba(0,229,255,0.5)' }}>Número de teléfono</p>
            <p className="text-sm" style={{ color: '#e0f7ff' }}>{lead.phone || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: 'rgba(0,229,255,0.5)' }}>Correo electrónico</p>
            <p className="text-sm break-all" style={{ color: '#e0f7ff' }}>{lead.email}</p>
          </div>
        </div>

        {lead.ai_reasoning && (
          <div className="mb-5 p-3 rounded-xl" style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.1)' }}>
            <p className="text-xs font-semibold mb-1.5" style={{ color: 'rgba(0,229,255,0.6)' }}>Por qué se calificó así</p>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(224,247,255,0.75)' }}>{lead.ai_reasoning}</p>
          </div>
        )}

        {customEntries.length > 0 && (
          <div>
            <p className="text-xs font-semibold mb-3" style={{ color: 'rgba(0,229,255,0.6)' }}>Información del formulario</p>
            <div className="flex flex-col gap-3">
              {customEntries.map(([question, answer]) => (
                <div key={question}>
                  <p className="text-xs" style={{ color: 'rgba(224,247,255,0.45)' }}>{question}</p>
                  <p className="text-sm mt-0.5" style={{ color: '#e0f7ff' }}>{answer || '—'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
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
  const [showModal, setShowModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState('')
  const [rescoring, setRescoring] = useState(false)
  const [rescoreMsg, setRescoreMsg] = useState('')
  const PAGE_SIZE = 20

  const fetchLeads = useCallback(() => {
    setLoading(true)
    leadsApi.list({ page, size: PAGE_SIZE, search: search || undefined, status: statusFilter || undefined })
      .then(data => { setLeads(data.items); setTotal(data.total) })
      .catch(() => setError('error'))
      .finally(() => setLoading(false))
  }, [page, search, statusFilter])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  const handleStatusChange = async (id: string, status: LeadStatus) => {
    const prev = leads.find(l => l.id === id)
    setLeads(ls => ls.map(l => l.id === id ? { ...l, status } : l))
    try {
      const updated = await leadsApi.updateStatus(id, status)
      setLeads(ls => ls.map(l => l.id === id ? updated : l))
    } catch {
      if (prev) setLeads(ls => ls.map(l => l.id === id ? prev : l))
    }
  }

  const handleCreated = (lead: Lead) => {
    setShowModal(false)
    setLeads(prev => [lead, ...prev])
    setTotal(t => t + 1)
  }

  const handleSyncMeta = async () => {
    setSyncing(true)
    setSyncMsg('')
    try {
      const res = await fetch('/api/meta/leads/import', { method: 'POST' })
      const data = await res.json() as { imported?: number; skipped?: number; error?: string }
      if (!res.ok) {
        setSyncMsg(data.error === 'No conectado a Meta' ? 'Conecta Meta primero en Ajustes → Meta Ads' : 'Error al sincronizar')
      } else {
        setSyncMsg(data.imported === 0 ? 'Sin leads nuevos para importar' : `${data.imported} lead${data.imported !== 1 ? 's' : ''} importado${data.imported !== 1 ? 's' : ''}`)
        if ((data.imported ?? 0) > 0) fetchLeads()
      }
    } catch {
      setSyncMsg('Error de conexión')
    } finally {
      setSyncing(false)
      setTimeout(() => setSyncMsg(''), 5000)
    }
  }

  const handleRescore = async () => {
    setRescoring(true)
    setRescoreMsg('')
    try {
      const res = await fetch('/api/leads/rescore', { method: 'POST' })
      const data = await res.json() as { rescored?: number; total_pending?: number; error?: string }
      if (!res.ok) {
        setRescoreMsg('Error al recalcular')
      } else if ((data.total_pending ?? 0) === 0) {
        setRescoreMsg('No hay leads pendientes de recalcular')
      } else {
        setRescoreMsg(`${data.rescored ?? 0} de ${data.total_pending} leads recalculados con IA`)
        fetchLeads()
      }
    } catch {
      setRescoreMsg('Error de conexión')
    } finally {
      setRescoring(false)
      setTimeout(() => setRescoreMsg(''), 6000)
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="p-4 lg:p-8">
      {showModal && <NewLeadModal onClose={() => setShowModal(false)} onCreated={handleCreated} />}
      {selectedLead && <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#e0f7ff' }}>Leads</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(0,229,255,0.5)' }}>
            {total > 0 ? `${total.toLocaleString('es-CL')} leads capturados` : 'Gestión de leads'}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <a href="/dashboard/pipeline"
              className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              style={{ background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.18)', color: '#00e5ff' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="5" height="18" rx="1" /><rect x="10" y="3" width="5" height="12" rx="1" /><rect x="17" y="3" width="5" height="8" rx="1" />
              </svg>
              Ver pipeline
            </a>
            <button
              onClick={handleSyncMeta}
              disabled={syncing}
              className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              style={{ background: 'rgba(24,119,242,0.12)', border: '1px solid rgba(24,119,242,0.35)', color: syncing ? 'rgba(100,160,255,0.5)' : '#4e9fff' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }}>
                <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              {syncing ? 'Sincronizando...' : 'Sincronizar Meta'}
            </button>
            <button
              onClick={handleRescore}
              disabled={rescoring}
              className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.35)', color: rescoring ? 'rgba(167,139,250,0.5)' : '#a78bfa' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ animation: rescoring ? 'spin 1s linear infinite' : 'none' }}>
                <path d="M12 2a10 10 0 1 0 10 10" /><path d="M12 2v5l3-3" />
              </svg>
              {rescoring ? 'Recalculando...' : 'Recalcular Score IA'}
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="btn-tron px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
              style={{ color: '#000a0f' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nuevo lead
            </button>
          </div>
          {syncMsg && (
            <p className="text-xs font-medium" style={{ color: syncMsg.includes('importado') ? '#00e564' : 'rgba(0,229,255,0.6)' }}>
              {syncMsg}
            </p>
          )}
          {rescoreMsg && (
            <p className="text-xs font-medium" style={{ color: rescoreMsg.includes('recalculados') ? '#00e564' : 'rgba(167,139,250,0.7)' }}>
              {rescoreMsg}
            </p>
          )}
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
          <p className="text-sm font-medium" style={{ color: 'rgba(224,247,255,0.5)' }}>Error al cargar leads. Recarga la página.</p>
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
            <button onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg text-sm font-medium btn-tron"
              style={{ color: '#000a0f' }}>
              Crear primer lead
            </button>
          ) : null}
        </div>
      ) : (
        <>
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(0,10,18,0.9)', border: '1px solid rgba(0,229,255,0.12)' }}>
            <div className="grid gap-x-6 px-5 py-3 text-xs font-semibold uppercase tracking-wider"
              style={{ gridTemplateColumns: 'minmax(200px,480px) 200px 120px 140px 110px', color: 'rgba(0,229,255,0.4)', borderBottom: '1px solid rgba(0,229,255,0.08)' }}>
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
                  onClick={() => setSelectedLead(lead)}
                  className="grid gap-x-6 px-5 py-3.5 items-center cursor-pointer"
                  style={{
                    gridTemplateColumns: 'minmax(200px,480px) 200px 120px 140px 110px',
                    background: idx % 2 === 0 ? 'transparent' : 'rgba(0,229,255,0.02)',
                    borderBottom: '1px solid rgba(0,229,255,0.05)',
                  }}>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: '#e0f7ff' }}>{lead.full_name}</p>
                    <p className="text-xs truncate mt-0.5" style={{ color: 'rgba(0,229,255,0.45)' }}>{lead.email}</p>
                  </div>
                  <p className="text-xs truncate" style={{ color: 'rgba(224,247,255,0.45)' }}>{lead.source_campaign || '—'}</p>
                  <ScoreBadge score={lead.score} />
                  <div className="flex justify-center" onClick={e => e.stopPropagation()}>
                    <select
                      value={lead.status}
                      onChange={e => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                      className="text-xs font-medium rounded-lg pl-2.5 pr-2 py-1.5 outline-none cursor-pointer appearance-none"
                      style={{
                        background: s.bg,
                        border: `1px solid ${s.border}`,
                        color: s.color,
                        backgroundImage: `radial-gradient(circle, ${s.color} 3px, transparent 3px)`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: '6px center',
                        paddingLeft: '18px',
                      }}>
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

          {totalPages > 1 ? (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs" style={{ color: 'rgba(0,229,255,0.4)' }}>
                Página {page} de {totalPages}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ background: 'rgba(0,10,18,0.9)', border: '1px solid rgba(0,229,255,0.15)', color: page === 1 ? 'rgba(0,229,255,0.25)' : '#00e5ff' }}>
                  Anterior
                </button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium"
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
