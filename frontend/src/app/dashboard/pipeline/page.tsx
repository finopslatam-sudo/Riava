'use client'

import { useState, useEffect } from 'react'
import { leadsApi, type Lead, type LeadStatus } from '@/lib/leads-api'

const COLUMNS: { status: LeadStatus; label: string; color: string; border: string }[] = [
  { status: 'new',                  label: 'Nuevos',                   color: '#00e5ff',  border: 'rgba(0,229,255,0.3)' },
  { status: 'contacted',            label: 'Contactados',              color: '#a78bfa',  border: 'rgba(167,139,250,0.3)' },
  { status: 'sin_respuesta',        label: 'Sin respuesta',            color: '#fbbf24',  border: 'rgba(251,191,36,0.3)' },
  { status: 'agendado',             label: 'Agendados',                color: '#38bdf8',  border: 'rgba(56,189,248,0.3)' },
  { status: 'cotizado',             label: 'Cotizados',                color: '#fb923c',  border: 'rgba(251,146,60,0.3)' },
  { status: 'cotizacion_aceptada',  label: 'Cotización Aceptada',      color: '#00e564',  border: 'rgba(0,229,100,0.3)' },
  { status: 'cotizacion_rechazada', label: 'Cotización Rechazada',     color: 'rgba(240,0,80,0.7)', border: 'rgba(240,0,80,0.25)' },
]

const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function monthOptions(count: number): { value: string; label: string }[] {
  const now = new Date()
  const options: { value: string; label: string }[] = []
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    options.push({ value, label: `${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}` })
  }
  return options
}

function monthToRange(yyyymm: string): { from: string; to: string } {
  const [y, m] = yyyymm.split('-').map(Number)
  const from = `${yyyymm}-01`
  const lastDay = new Date(y, m, 0).getDate()
  const to = `${yyyymm}-${String(lastDay).padStart(2, '0')}`
  return { from, to }
}

function LeadCard({ lead, onStatusChange }: { lead: Lead; onStatusChange: (id: string, status: LeadStatus) => void }) {
  const date = new Date(lead.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })
  const scoreColor = lead.score >= 70 ? '#00e564' : lead.score >= 40 ? '#fbbf24' : 'rgba(240,0,80,0.7)'

  return (
    <div
      className="rounded-xl px-4 py-3 cursor-grab active:cursor-grabbing"
      style={{ background: 'rgba(0,10,18,0.95)', border: '1px solid rgba(0,229,255,0.1)' }}
      draggable
      onDragStart={e => e.dataTransfer.setData('lead_id', lead.id)}
    >
      <p className="text-sm font-medium truncate" style={{ color: '#e0f7ff' }}>{lead.full_name}</p>
      <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(0,229,255,0.45)' }}>{lead.email}</p>
      {lead.source_campaign ? (
        <p className="text-xs mt-1.5 truncate" style={{ color: 'rgba(224,247,255,0.3)' }}>{lead.source_campaign}</p>
      ) : null}
      <div className="flex items-center justify-between mt-2.5">
        <div className="flex items-center gap-1.5">
          <div className="w-12 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(0,229,255,0.1)' }}>
            <div className="h-full rounded-full" style={{ width: `${lead.score}%`, background: scoreColor }} />
          </div>
          <span className="text-xs font-bold" style={{ color: scoreColor }}>{lead.score}</span>
        </div>
        <span className="text-xs" style={{ color: 'rgba(224,247,255,0.25)' }}>{date}</span>
      </div>
    </div>
  )
}

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [draggingOver, setDraggingOver] = useState<LeadStatus | null>(null)

  const [monthSelect, setMonthSelect] = useState('')
  const [fromDraft, setFromDraft] = useState('')
  const [toDraft, setToDraft] = useState('')
  const [appliedFrom, setAppliedFrom] = useState('')
  const [appliedTo, setAppliedTo] = useState('')

  useEffect(() => {
    leadsApi.list({ size: 200 })
      .then(data => setLeads(data.items))
      .catch(() => setError('No se pudo conectar al backend.'))
      .finally(() => setLoading(false))
  }, [])

  const handleMonthSelect = (value: string) => {
    setMonthSelect(value)
    if (!value) return
    const { from, to } = monthToRange(value)
    setFromDraft(from)
    setToDraft(to)
    setAppliedFrom(from)
    setAppliedTo(to)
  }

  const applyDateFilter = () => {
    setMonthSelect('')
    setAppliedFrom(fromDraft)
    setAppliedTo(toDraft)
  }

  const clearDateFilter = () => {
    setMonthSelect('')
    setFromDraft('')
    setToDraft('')
    setAppliedFrom('')
    setAppliedTo('')
  }

  const visibleLeads = leads.filter(l => {
    const d = l.created_at.slice(0, 10)
    if (appliedFrom && d < appliedFrom) return false
    if (appliedTo && d > appliedTo) return false
    return true
  })

  const handleDrop = async (e: React.DragEvent, targetStatus: LeadStatus) => {
    e.preventDefault()
    setDraggingOver(null)
    const leadId = e.dataTransfer.getData('lead_id')
    if (!leadId) return

    const lead = leads.find(l => l.id === leadId)
    if (!lead || lead.status === targetStatus) return

    // Optimistic update
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: targetStatus } : l))
    try {
      await leadsApi.updateStatus(leadId, targetStatus)
    } catch {
      // Rollback on error
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: lead.status } : l))
    }
  }

  const byStatus = (status: LeadStatus) => visibleLeads.filter(l => l.status === status)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="loader" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 lg:p-8">
        <div className="max-w-lg mx-auto text-center py-16">
          <p className="text-sm font-medium" style={{ color: '#e0f7ff' }}>Esta sección estará disponible próximamente</p>
          <p className="text-xs mt-2" style={{ color: 'rgba(224,247,255,0.35)' }}>
            El servidor de leads está siendo configurado.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#e0f7ff' }}>CRM</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(0,229,255,0.5)' }}>
            Arrastra los leads entre columnas para actualizar su estado
          </p>
        </div>
        <a href="/dashboard/leads"
          className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          style={{ background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.18)', color: '#00e5ff' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          Ver lista
        </a>
      </div>

      {/* Filtro de fecha */}
      <div className="flex flex-wrap items-end gap-3 mb-4 shrink-0">
        <div>
          <label className="text-xs font-mono mb-1.5 block" style={{ color: 'rgba(0,229,255,0.5)' }}>Mes</label>
          <select
            value={monthSelect}
            onChange={e => handleMonthSelect(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm bg-transparent border focus:outline-none"
            style={{ borderColor: 'rgba(0,229,255,0.15)', color: '#e0f7ff' }}
          >
            <option value="" className="bg-[#000a0f]">Selecciona un mes...</option>
            {monthOptions(12).map(m => (
              <option key={m.value} value={m.value} className="bg-[#000a0f]">{m.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-mono mb-1.5 block" style={{ color: 'rgba(0,229,255,0.5)' }}>Desde</label>
          <input
            type="date"
            value={fromDraft}
            onChange={e => setFromDraft(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm bg-transparent border focus:outline-none"
            style={{ borderColor: 'rgba(0,229,255,0.15)', color: '#e0f7ff' }}
          />
        </div>
        <div>
          <label className="text-xs font-mono mb-1.5 block" style={{ color: 'rgba(0,229,255,0.5)' }}>Hasta</label>
          <input
            type="date"
            value={toDraft}
            onChange={e => setToDraft(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm bg-transparent border focus:outline-none"
            style={{ borderColor: 'rgba(0,229,255,0.15)', color: '#e0f7ff' }}
          />
        </div>
        <button
          onClick={applyDateFilter}
          className="btn-tron px-4 py-2 rounded-lg text-sm font-semibold text-white"
        >
          Filtrar
        </button>
        {(appliedFrom || appliedTo) && (
          <button
            onClick={clearDateFilter}
            className="px-3 py-2 rounded-lg text-xs font-medium"
            style={{ color: 'rgba(224,247,255,0.5)' }}
          >
            Limpiar filtro
          </button>
        )}
      </div>

      {leads.length === 0 ? (
        <div className="max-w-lg mx-auto text-center py-16">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.12)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(0,229,255,0.5)" strokeWidth="1.8">
              <rect x="3" y="3" width="5" height="18" rx="1" /><rect x="10" y="3" width="5" height="12" rx="1" /><rect x="17" y="3" width="5" height="8" rx="1" />
            </svg>
          </div>
          <p className="text-sm font-medium" style={{ color: 'rgba(224,247,255,0.5)' }}>Pipeline vacío</p>
          <p className="text-xs mt-2" style={{ color: 'rgba(224,247,255,0.3)' }}>Los leads aparecerán aquí desde Meta Ads</p>
        </div>
      ) : visibleLeads.length === 0 ? (
        <div className="max-w-lg mx-auto text-center py-16">
          <p className="text-sm font-medium" style={{ color: 'rgba(224,247,255,0.5)' }}>Sin leads en ese rango de fechas</p>
          <p className="text-xs mt-2" style={{ color: 'rgba(224,247,255,0.3)' }}>Prueba con otro mes o rango, o limpia el filtro</p>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: 0, maxHeight: 'calc(100vh - 220px)' }}>
          {COLUMNS.map(col => {
            const colLeads = byStatus(col.status)
            const isOver = draggingOver === col.status
            return (
              <div
                key={col.status}
                className="flex flex-col rounded-2xl overflow-hidden flex-1 transition-all"
                style={{
                  minWidth: 190,
                  background: isOver ? 'rgba(0,229,255,0.04)' : 'rgba(0,10,18,0.6)',
                  border: `1px solid ${isOver ? col.border : 'rgba(0,229,255,0.1)'}`,
                }}
                onDragOver={e => { e.preventDefault(); setDraggingOver(col.status) }}
                onDragLeave={() => setDraggingOver(null)}
                onDrop={e => handleDrop(e, col.status)}
              >
                {/* Column header */}
                <div className="px-3 py-3 flex items-center justify-between gap-1.5 shrink-0"
                  style={{ borderBottom: `1px solid ${col.border}`, background: `rgba(0,10,18,0.8)` }}>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: col.color }} />
                    <span className="text-[10px] font-semibold uppercase tracking-wide truncate" style={{ color: col.color }} title={col.label}>
                      {col.label}
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: `${col.color}18`, color: col.color }}>
                    {colLeads.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-2 p-3 overflow-y-auto flex-1" style={{ minHeight: 120 }}>
                  {colLeads.length === 0 ? (
                    <div className="flex items-center justify-center h-16 rounded-xl border-2 border-dashed"
                      style={{ borderColor: isOver ? col.border : 'rgba(0,229,255,0.08)', color: 'rgba(0,229,255,0.2)' }}>
                      <p className="text-xs">Arrastra aquí</p>
                    </div>
                  ) : (
                    colLeads.map(lead => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        onStatusChange={async (id, status) => {
                          setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l))
                          await leadsApi.updateStatus(id, status).catch(() => {})
                        }}
                      />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
