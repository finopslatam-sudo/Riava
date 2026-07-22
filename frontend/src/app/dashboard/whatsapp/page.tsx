'use client'

import { useState, useEffect, FormEvent } from 'react'

type WaClient = {
  id: string
  business_name: string
  phone_number_id: string
  waba_id: string
  access_token: string
  system_prompt: string
  tone: string
  business_info: string
  status: 'pending' | 'connected' | 'error'
  created_at: string
}

type WaMessage = { role: 'user' | 'assistant'; content: string; timestamp: string }
type Conversation = { contact: string; history: WaMessage[] }

const STATUS_LABEL: Record<WaClient['status'], string> = {
  pending: 'Pendiente',
  connected: 'Conectado',
  error: 'Error',
}
const STATUS_COLOR: Record<WaClient['status'], string> = {
  pending: '#fbbf24',
  connected: '#00e564',
  error: 'rgba(240,0,80,0.7)',
}

const EMPTY_FORM = {
  business_name: '',
  phone_number_id: '',
  waba_id: '',
  access_token: '',
  tone: 'profesional_y_amigable',
  business_info: '',
  system_prompt: '',
}

function AddClientModal({ onClose, onCreated }: { onClose: () => void; onCreated: (c: WaClient) => void }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/whatsapp/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      onCreated(data.client)
      if (data.webhook_override !== 'ok') {
        setError(data.webhook_override ?? 'El cliente se guardó, pero no se pudo confirmar la configuración del webhook en Meta.')
        return
      }
      onClose()
    } catch {
      setError('No se pudo crear el cliente. Revisa los datos.')
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full px-3 py-2 rounded-lg text-sm bg-transparent border focus:outline-none'
  const inputStyle = { borderColor: 'rgba(0,229,255,0.15)', color: '#e0f7ff' }
  const labelClass = 'text-xs font-mono mb-1.5 block'
  const labelStyle = { color: 'rgba(0,229,255,0.5)' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,10,15,0.75)' }} onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ background: '#0a0e18', border: '1px solid rgba(0,229,255,0.15)' }}
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-1" style={{ color: '#e0f7ff' }}>Agregar cliente</h2>
        <p className="text-xs mb-5" style={{ color: 'rgba(224,247,255,0.4)' }}>
          Conexión manual con credenciales de Meta Cloud API. El flujo automático con
          Embedded Signup estará disponible cuando Meta apruebe la verificación de
          negocio de Riava.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass} style={labelStyle}>Nombre del negocio</label>
            <input required className={inputClass} style={inputStyle} value={form.business_name}
              onChange={e => setForm({ ...form, business_name: e.target.value })} placeholder="ClienteFiel" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} style={labelStyle}>Phone Number ID</label>
              <input required className={inputClass} style={inputStyle} value={form.phone_number_id}
                onChange={e => setForm({ ...form, phone_number_id: e.target.value })} />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>WABA ID</label>
              <input required className={inputClass} style={inputStyle} value={form.waba_id}
                onChange={e => setForm({ ...form, waba_id: e.target.value })} />
            </div>
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Access Token</label>
            <input required type="password" className={inputClass} style={inputStyle} value={form.access_token}
              onChange={e => setForm({ ...form, access_token: e.target.value })} />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Tono del agente</label>
            <select className={inputClass} style={inputStyle} value={form.tone}
              onChange={e => setForm({ ...form, tone: e.target.value })}>
              <option value="profesional_y_amigable">Profesional y amigable</option>
              <option value="vendedor_y_persuasivo">Vendedor y persuasivo</option>
              <option value="empatico_y_calido">Empático y cálido</option>
              <option value="formal">Formal</option>
            </select>
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Información del negocio (horario, servicios, FAQ)</label>
            <textarea rows={4} className={inputClass} style={inputStyle} value={form.business_info}
              onChange={e => setForm({ ...form, business_info: e.target.value })}
              placeholder="Ej: Horario Lun-Vie 9-18h. Ofrecemos reservas de citas para..." />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Instrucciones adicionales del agente (opcional)</label>
            <textarea rows={3} className={inputClass} style={inputStyle} value={form.system_prompt}
              onChange={e => setForm({ ...form, system_prompt: e.target.value })}
              placeholder="Ej: Siempre pregunta el nombre antes de agendar." />
          </div>

          {error && <p className="text-xs" style={{ color: 'rgba(240,0,80,0.8)' }}>{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium"
              style={{ border: '1px solid rgba(0,229,255,0.15)', color: 'rgba(224,247,255,0.6)' }}>
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="btn-tron flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60">
              {saving ? 'Guardando...' : 'Guardar cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ConversationsPanel({ client, onClose }: { client: WaClient; onClose: () => void }) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/whatsapp/clients/${client.id}/conversations`)
      .then(r => r.json())
      .then(data => setConversations(data.conversations ?? []))
      .finally(() => setLoading(false))
  }, [client.id])

  const active = conversations.find(c => c.contact === selected)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,10,15,0.75)' }} onClick={onClose}>
      <div
        className="w-full max-w-3xl h-[80vh] rounded-2xl flex overflow-hidden"
        style={{ background: '#0a0e18', border: '1px solid rgba(0,229,255,0.15)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-56 shrink-0 overflow-y-auto" style={{ borderRight: '1px solid rgba(0,229,255,0.1)' }}>
          <div className="p-4" style={{ borderBottom: '1px solid rgba(0,229,255,0.1)' }}>
            <p className="text-sm font-bold" style={{ color: '#e0f7ff' }}>{client.business_name}</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(0,229,255,0.4)' }}>Conversaciones</p>
          </div>
          {loading ? (
            <p className="text-xs p-4" style={{ color: 'rgba(224,247,255,0.35)' }}>Cargando...</p>
          ) : conversations.length === 0 ? (
            <p className="text-xs p-4" style={{ color: 'rgba(224,247,255,0.35)' }}>Aún no hay conversaciones.</p>
          ) : (
            conversations.map(c => (
              <button
                key={c.contact}
                onClick={() => setSelected(c.contact)}
                className="w-full text-left px-4 py-3 text-xs truncate"
                style={{
                  color: selected === c.contact ? '#00e5ff' : 'rgba(224,247,255,0.6)',
                  background: selected === c.contact ? 'rgba(0,229,255,0.06)' : 'transparent',
                }}
              >
                {c.contact}
              </button>
            ))
          )}
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid rgba(0,229,255,0.1)' }}>
            <p className="text-sm font-medium" style={{ color: '#e0f7ff' }}>{selected ?? 'Selecciona una conversación'}</p>
            <button onClick={onClose} className="text-xs" style={{ color: 'rgba(224,247,255,0.4)' }}>Cerrar ✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {active?.history.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                <div
                  className="max-w-[75%] rounded-xl px-3 py-2 text-sm"
                  style={{
                    background: m.role === 'user' ? 'rgba(0,229,255,0.06)' : 'rgba(0,229,100,0.08)',
                    color: '#e0f7ff',
                    border: `1px solid ${m.role === 'user' ? 'rgba(0,229,255,0.15)' : 'rgba(0,229,100,0.2)'}`,
                  }}
                >
                  {m.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

type MessageTemplate = { id: string; name: string; status: string; category: string; language: string }

const TEMPLATE_STATUS_COLOR: Record<string, string> = {
  APPROVED: '#00e564',
  PENDING: '#fbbf24',
  REJECTED: 'rgba(240,0,80,0.7)',
}

const EMPTY_TEMPLATE_FORM = {
  name: '',
  language: 'es',
  category: 'UTILITY' as 'UTILITY' | 'MARKETING' | 'AUTHENTICATION',
  bodyText: '',
}

function TemplatesPanel({ client, onClose }: { client: WaClient; onClose: () => void }) {
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_TEMPLATE_FORM)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const loadTemplates = () => {
    setLoading(true)
    fetch(`/api/whatsapp/clients/${client.id}/templates`)
      .then(r => r.json())
      .then(data => setTemplates(data.templates ?? []))
      .finally(() => setLoading(false))
  }

  useEffect(loadTemplates, [client.id])

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError('')
    try {
      const res = await fetch(`/api/whatsapp/clients/${client.id}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al crear la plantilla')
      setForm(EMPTY_TEMPLATE_FORM)
      loadTemplates()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la plantilla')
    } finally {
      setCreating(false)
    }
  }

  const inputClass = 'w-full px-3 py-2 rounded-lg text-sm bg-transparent border focus:outline-none'
  const inputStyle = { borderColor: 'rgba(0,229,255,0.15)', color: '#e0f7ff' }
  const labelClass = 'text-xs font-mono mb-1.5 block'
  const labelStyle = { color: 'rgba(0,229,255,0.5)' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,10,15,0.75)' }} onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6"
        style={{ background: '#0a0e18', border: '1px solid rgba(0,229,255,0.15)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold" style={{ color: '#e0f7ff' }}>Plantillas — {client.business_name}</h2>
          <button onClick={onClose} className="text-xs" style={{ color: 'rgba(224,247,255,0.4)' }}>Cerrar ✕</button>
        </div>
        <p className="text-xs mb-5" style={{ color: 'rgba(224,247,255,0.4)' }}>
          Las plantillas deben ser aprobadas por Meta antes de poder usarse fuera de la ventana de 24h de conversación.
        </p>

        <div className="mb-6">
          {loading ? (
            <p className="text-xs" style={{ color: 'rgba(224,247,255,0.35)' }}>Cargando...</p>
          ) : templates.length === 0 ? (
            <p className="text-xs" style={{ color: 'rgba(224,247,255,0.35)' }}>Aún no hay plantillas creadas.</p>
          ) : (
            <div className="space-y-2">
              {templates.map(t => (
                <div key={t.id} className="flex items-center justify-between px-3 py-2 rounded-lg"
                  style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.1)' }}>
                  <div>
                    <p className="text-sm" style={{ color: '#e0f7ff' }}>{t.name}</p>
                    <p className="text-xs" style={{ color: 'rgba(0,229,255,0.4)' }}>{t.category} · {t.language}</p>
                  </div>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full"
                    style={{
                      background: `${TEMPLATE_STATUS_COLOR[t.status] ?? '#6b7280'}18`,
                      color: TEMPLATE_STATUS_COLOR[t.status] ?? '#6b7280',
                    }}>
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="divider-tron mb-5" />

        <h3 className="text-sm font-semibold mb-3" style={{ color: '#e0f7ff' }}>Crear nueva plantilla</h3>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className={labelClass} style={labelStyle}>Nombre (minúsculas y guiones bajos)</label>
            <input required pattern="[a-z0-9_]+" className={inputClass} style={inputStyle} value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} placeholder="confirmacion_cita" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} style={labelStyle}>Categoría</label>
              <select className={inputClass} style={inputStyle} value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value as typeof form.category })}>
                <option value="UTILITY" className="bg-[#060612]">Utilidad</option>
                <option value="MARKETING" className="bg-[#060612]">Marketing</option>
                <option value="AUTHENTICATION" className="bg-[#060612]">Autenticación</option>
              </select>
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Idioma</label>
              <select className={inputClass} style={inputStyle} value={form.language}
                onChange={e => setForm({ ...form, language: e.target.value })}>
                <option value="es" className="bg-[#060612]">Español</option>
                <option value="en_US" className="bg-[#060612]">English (US)</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Texto del mensaje</label>
            <textarea required rows={3} className={inputClass} style={inputStyle} value={form.bodyText}
              onChange={e => setForm({ ...form, bodyText: e.target.value })}
              placeholder="Hola, tu cita ha sido confirmada." />
          </div>

          {error && <p className="text-xs" style={{ color: 'rgba(240,0,80,0.8)' }}>{error}</p>}

          <button type="submit" disabled={creating} className="btn-tron w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60">
            {creating ? 'Creando...' : 'Crear plantilla'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function WhatsAppPage() {
  const [clients, setClients] = useState<WaClient[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [viewingClient, setViewingClient] = useState<WaClient | null>(null)
  const [templatesClient, setTemplatesClient] = useState<WaClient | null>(null)

  useEffect(() => {
    fetch('/api/whatsapp/clients')
      .then(r => r.json())
      .then(data => setClients(data.clients ?? []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-4 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#e0f7ff' }}>WhatsApp IA</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(0,229,255,0.5)' }}>
            Agentes de IA multi-cliente conectados vía Meta WhatsApp Cloud API
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="btn-tron px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
        >
          + Agregar cliente
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="loader" />
        </div>
      ) : clients.length === 0 ? (
        <div className="max-w-lg mx-auto text-center py-16">
          <p className="text-sm font-medium" style={{ color: 'rgba(224,247,255,0.5)' }}>Sin clientes conectados</p>
          <p className="text-xs mt-2" style={{ color: 'rgba(224,247,255,0.3)' }}>
            Agrega el primer cliente pegando sus credenciales de Meta Cloud API
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map(client => (
            <div
              key={client.id}
              onClick={() => setViewingClient(client)}
              className="rounded-xl p-4 cursor-pointer transition-all hover:opacity-90"
              style={{ background: 'rgba(0,10,18,0.7)', border: '1px solid rgba(0,229,255,0.1)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold truncate" style={{ color: '#e0f7ff' }}>{client.business_name}</p>
                <span
                  className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full shrink-0"
                  style={{ background: `${STATUS_COLOR[client.status]}18`, color: STATUS_COLOR[client.status] }}
                >
                  {STATUS_LABEL[client.status]}
                </span>
              </div>
              <p className="text-xs truncate" style={{ color: 'rgba(0,229,255,0.4)' }}>{client.phone_number_id}</p>
              <p className="text-xs mt-2" style={{ color: 'rgba(224,247,255,0.3)' }}>Tono: {client.tone}</p>
              <button
                onClick={e => { e.stopPropagation(); setTemplatesClient(client) }}
                className="mt-3 text-xs font-medium px-3 py-1.5 rounded-lg"
                style={{ border: '1px solid rgba(0,229,255,0.15)', color: 'rgba(0,229,255,0.7)' }}
              >
                Plantillas
              </button>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <AddClientModal
          onClose={() => setShowAdd(false)}
          onCreated={c => setClients(prev => [c, ...prev])}
        />
      )}
      {viewingClient && (
        <ConversationsPanel client={viewingClient} onClose={() => setViewingClient(null)} />
      )}
      {templatesClient && (
        <TemplatesPanel client={templatesClient} onClose={() => setTemplatesClient(null)} />
      )}
    </div>
  )
}
