'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

type WaMessage = { role: 'user' | 'assistant'; content: string; timestamp: string }

type ConversationSummary = {
  clientId: string
  clientName: string
  contact: string
  name: string | null
  lastMessage: WaMessage
  messageCount: number
  unread: boolean
  unanswered: boolean
}

type Filter = 'all' | 'unread' | 'unanswered'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'unread', label: 'No leídos' },
  { id: 'unanswered', label: 'No contestados' },
]

function formatPhone(contact: string): string {
  return contact.startsWith('+') ? contact : `+${contact}`
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diffMs / 60000)
  if (min < 1) return 'ahora'
  if (min < 60) return `hace ${min} min`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `hace ${hr} h`
  const days = Math.floor(hr / 24)
  if (days < 7) return `hace ${days} d`
  return new Date(iso).toLocaleDateString('es-CL')
}

export default function ConversacionesPage() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')
  const [selected, setSelected] = useState<{ clientId: string; contact: string } | null>(null)
  const [thread, setThread] = useState<WaMessage[]>([])
  const [threadLoading, setThreadLoading] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [sendError, setSendError] = useState('')

  const loadConversations = useCallback(() => {
    fetch('/api/whatsapp/conversations')
      .then(r => r.json())
      .then(data => setConversations(data.conversations ?? []))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadConversations()
    const interval = setInterval(loadConversations, 20000)
    return () => clearInterval(interval)
  }, [loadConversations])

  const counts = useMemo(
    () => ({
      all: conversations.length,
      unread: conversations.filter(c => c.unread).length,
      unanswered: conversations.filter(c => c.unanswered).length,
    }),
    [conversations]
  )

  const filtered = useMemo(() => {
    if (filter === 'all') return conversations
    if (filter === 'unread') return conversations.filter(c => c.unread)
    return conversations.filter(c => c.unanswered)
  }, [conversations, filter])

  const openConversation = async (c: ConversationSummary) => {
    setSelected({ clientId: c.clientId, contact: c.contact })
    setEditingName(false)
    setReplyText('')
    setSendError('')
    setThreadLoading(true)
    try {
      const [historyRes] = await Promise.all([
        fetch(`/api/whatsapp/conversations/${c.clientId}/${encodeURIComponent(c.contact)}`).then(r => r.json()),
        fetch(`/api/whatsapp/conversations/${c.clientId}/${encodeURIComponent(c.contact)}`, { method: 'POST' }),
      ])
      setThread(historyRes.history ?? [])
      setConversations(prev =>
        prev.map(x => (x.clientId === c.clientId && x.contact === c.contact ? { ...x, unread: false } : x))
      )
    } finally {
      setThreadLoading(false)
    }
  }

  const selectedSummary = conversations.find(c => c.clientId === selected?.clientId && c.contact === selected?.contact)

  const startEditingName = () => {
    setNameDraft(selectedSummary?.name ?? '')
    setEditingName(true)
  }

  const saveName = async () => {
    if (!selected) return
    setSavingName(true)
    try {
      await fetch(`/api/whatsapp/conversations/${selected.clientId}/${encodeURIComponent(selected.contact)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameDraft }),
      })
      setConversations(prev =>
        prev.map(x =>
          x.clientId === selected.clientId && x.contact === selected.contact
            ? { ...x, name: nameDraft.trim() || null }
            : x
        )
      )
      setEditingName(false)
    } finally {
      setSavingName(false)
    }
  }

  const sendReply = async () => {
    if (!selected || !replyText.trim() || sendingReply) return
    const text = replyText.trim()
    setSendingReply(true)
    setSendError('')
    try {
      const res = await fetch(`/api/whatsapp/conversations/${selected.clientId}/${encodeURIComponent(selected.contact)}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'No se pudo enviar el mensaje')
      const now = new Date().toISOString()
      setThread(prev => [...prev, { role: 'assistant', content: text, timestamp: now }])
      setConversations(prev =>
        prev.map(x =>
          x.clientId === selected.clientId && x.contact === selected.contact
            ? { ...x, lastMessage: { role: 'assistant', content: text, timestamp: now } }
            : x
        )
      )
      setReplyText('')
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'No se pudo enviar el mensaje')
    } finally {
      setSendingReply(false)
    }
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#e0f7ff' }}>Conversaciones WhatsApp</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(0,229,255,0.5)' }}>
          Todas las conversaciones de tus clientes de WhatsApp IA, en un solo lugar.
        </p>
      </div>

      <div
        className="rounded-2xl overflow-hidden flex flex-col lg:flex-row"
        style={{ background: '#0a0e18', border: '1px solid rgba(0,229,255,0.15)', height: '75vh', minHeight: 480 }}
      >
        {/* List */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col" style={{ borderRight: '1px solid rgba(0,229,255,0.1)' }}>
          <div className="flex p-2 gap-1 overflow-x-auto" style={{ borderBottom: '1px solid rgba(0,229,255,0.1)' }}>
            {FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className="shrink-0 text-xs font-medium px-2.5 py-2 rounded-lg transition-all whitespace-nowrap"
                style={{
                  color: filter === f.id ? '#00e5ff' : 'rgba(224,247,255,0.5)',
                  background: filter === f.id ? 'rgba(0,229,255,0.08)' : 'transparent',
                  border: filter === f.id ? '1px solid rgba(0,229,255,0.2)' : '1px solid transparent',
                }}
              >
                {f.label} <span style={{ opacity: 0.6 }}>({counts[f.id]})</span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="loader" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-xs p-4" style={{ color: 'rgba(224,247,255,0.35)' }}>
                {filter === 'unread' ? 'No hay conversaciones sin leer.' : filter === 'unanswered' ? 'No hay conversaciones sin contestar.' : 'Aún no hay conversaciones.'}
              </p>
            ) : (
              filtered.map(c => {
                const isSelected = selected?.clientId === c.clientId && selected?.contact === c.contact
                return (
                  <button
                    key={`${c.clientId}:${c.contact}`}
                    onClick={() => openConversation(c)}
                    className="w-full text-left px-4 py-3 flex flex-col gap-0.5"
                    style={{
                      background: isSelected ? 'rgba(0,229,255,0.06)' : 'transparent',
                      borderBottom: '1px solid rgba(0,229,255,0.06)',
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium truncate" style={{ color: isSelected ? '#00e5ff' : '#e0f7ff' }}>
                        {c.name || formatPhone(c.contact)}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {c.unanswered && (
                          <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(240,0,80,0.15)', color: 'rgba(240,80,120,0.9)' }}>
                            Sin contestar
                          </span>
                        )}
                        {c.unread && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: '#00e5ff' }} />}
                      </div>
                    </div>
                    {c.name && (
                      <p className="text-[11px] truncate" style={{ color: 'rgba(224,247,255,0.35)' }}>{formatPhone(c.contact)}</p>
                    )}
                    <p className="text-[11px] truncate" style={{ color: 'rgba(0,229,255,0.4)' }}>{c.clientName}</p>
                    <p className="text-xs truncate" style={{ color: 'rgba(224,247,255,0.45)' }}>
                      {c.lastMessage.role === 'assistant' ? 'Tú: ' : ''}
                      {c.lastMessage.content}
                    </p>
                    <p className="text-[10px]" style={{ color: 'rgba(224,247,255,0.3)' }}>{formatRelativeTime(c.lastMessage.timestamp)}</p>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Thread */}
        <div className="flex-1 flex flex-col min-w-0">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm" style={{ color: 'rgba(224,247,255,0.35)' }}>Selecciona una conversación</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between p-4 gap-3" style={{ borderBottom: '1px solid rgba(0,229,255,0.1)' }}>
                <div className="min-w-0">
                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        value={nameDraft}
                        onChange={e => setNameDraft(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false) }}
                        placeholder="Nombre del contacto"
                        className="px-2 py-1 rounded-lg text-sm bg-transparent border focus:outline-none"
                        style={{ borderColor: 'rgba(0,229,255,0.3)', color: '#e0f7ff' }}
                      />
                      <button onClick={saveName} disabled={savingName} className="text-xs font-semibold px-2 py-1 rounded-lg disabled:opacity-50" style={{ color: '#00e5ff' }}>
                        {savingName ? '...' : 'Guardar'}
                      </button>
                      <button onClick={() => setEditingName(false)} className="text-xs px-1" style={{ color: 'rgba(224,247,255,0.4)' }}>
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#e0f7ff' }}>{selectedSummary?.name || formatPhone(selected.contact)}</p>
                        {selectedSummary?.name && (
                          <p className="text-xs" style={{ color: 'rgba(224,247,255,0.35)' }}>{formatPhone(selected.contact)}</p>
                        )}
                        <p className="text-xs" style={{ color: 'rgba(0,229,255,0.4)' }}>{selectedSummary?.clientName}</p>
                      </div>
                      <button onClick={startEditingName} title="Editar nombre" style={{ color: 'rgba(0,229,255,0.4)' }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#00e5ff' }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(0,229,255,0.4)' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                <a
                  href={`https://wa.me/${selected.contact.replace(/[^\d]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Abre una conversación con este contacto usando tu WhatsApp personal (no el número de la API)"
                  className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg"
                  style={{ border: '1px solid rgba(0,229,255,0.15)', color: 'rgba(0,229,255,0.7)' }}
                >
                  Responder desde mi WhatsApp personal
                </a>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {threadLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="loader" />
                  </div>
                ) : (
                  thread.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className="max-w-[75%] rounded-xl px-3 py-2 text-sm"
                        style={{
                          background: m.role === 'user' ? 'rgba(0,229,100,0.08)' : 'rgba(0,229,255,0.06)',
                          color: '#e0f7ff',
                          border: `1px solid ${m.role === 'user' ? 'rgba(0,229,100,0.2)' : 'rgba(0,229,255,0.15)'}`,
                        }}
                      >
                        {m.content}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3" style={{ borderTop: '1px solid rgba(0,229,255,0.1)' }}>
                {sendError && (
                  <p className="text-xs mb-2" style={{ color: 'rgba(240,0,80,0.8)' }}>{sendError}</p>
                )}
                <div className="flex items-end gap-2">
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply() } }}
                    placeholder="Escribe un mensaje manual (se envía desde tu número de negocio)..."
                    rows={2}
                    className="flex-1 px-3 py-2 rounded-lg text-sm bg-transparent border focus:outline-none resize-none"
                    style={{ borderColor: 'rgba(0,229,255,0.15)', color: '#e0f7ff' }}
                  />
                  <button
                    onClick={sendReply}
                    disabled={sendingReply || !replyText.trim()}
                    className="btn-tron shrink-0 px-4 py-2.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                  >
                    {sendingReply ? '...' : 'Enviar'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
