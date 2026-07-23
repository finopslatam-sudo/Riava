'use client'

import { useState, useEffect, FormEvent } from 'react'

type ServiceCatalogItem = { id: string; name: string; price: number }
type ServiceCatalogEntry = {
  id: string
  name: string
  detail: string
  items: ServiceCatalogItem[]
  created_at: string
}

type ItemDraft = { id: string; name: string; price: string }

const EMPTY_ITEM = (): ItemDraft => ({ id: crypto.randomUUID(), name: '', price: '' })

function formatCLP(n: number) {
  return n.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })
}

function ServiceModal({
  service,
  onClose,
  onSaved,
}: {
  service: ServiceCatalogEntry | null
  onClose: () => void
  onSaved: (s: ServiceCatalogEntry) => void
}) {
  const [name, setName] = useState(service?.name ?? '')
  const [detail, setDetail] = useState(service?.detail ?? '')
  const [items, setItems] = useState<ItemDraft[]>(
    service?.items.length
      ? service.items.map(i => ({ id: i.id, name: i.name, price: String(i.price) }))
      : [EMPTY_ITEM()]
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const addItem = () => setItems(prev => [...prev, EMPTY_ITEM()])
  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id))
  const updateItem = (id: string, field: 'name' | 'price', value: string) =>
    setItems(prev => prev.map(i => (i.id === id ? { ...i, [field]: value } : i)))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payloadItems = items
        .filter(i => i.name.trim())
        .map(i => ({ id: i.id, name: i.name.trim(), price: Number(i.price) || 0 }))

      const res = await fetch(service ? `/api/services/${service.id}` : '/api/services', {
        method: service ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, detail, items: payloadItems }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'No se pudo guardar el servicio')
      onSaved(data.service)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el servicio')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'w-full px-3 py-2 rounded-lg text-sm bg-transparent border focus:outline-none'
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
        <h2 className="text-lg font-bold mb-5" style={{ color: '#e0f7ff' }}>
          {service ? 'Editar servicio' : 'Agregar servicio'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass} style={labelStyle}>Nombre del servicio</label>
            <input required className={inputClass} style={inputStyle} value={name}
              onChange={e => setName(e.target.value)} placeholder="Creación de páginas web" />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Detalle</label>
            <textarea rows={3} className={inputClass} style={inputStyle} value={detail}
              onChange={e => setDetail(e.target.value)}
              placeholder="Descripción general del servicio, en qué consiste, qué incluye..." />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={labelClass} style={{ ...labelStyle, marginBottom: 0 }}>Ítems y precios (CLP)</label>
              <button type="button" onClick={addItem} className="text-xs font-medium" style={{ color: '#00e5ff' }}>
                + Agregar ítem
              </button>
            </div>
            <div className="space-y-2">
              {items.map(item => (
                <div key={item.id} className="grid gap-2 items-center" style={{ gridTemplateColumns: '1fr 6.5rem 1.75rem' }}>
                  <input className={`${inputClass} min-w-0`} style={inputStyle} value={item.name}
                    onChange={e => updateItem(item.id, 'name', e.target.value)}
                    placeholder="Ej: Landing page 1 sección" />
                  <input type="number" min={0} className={`${inputClass} min-w-0`} style={inputStyle} value={item.price}
                    onChange={e => updateItem(item.id, 'price', e.target.value)}
                    placeholder="Precio" />
                  <button type="button" onClick={() => removeItem(item.id)}
                    className="h-full rounded-lg text-xs"
                    style={{ border: '1px solid rgba(240,0,80,0.2)', color: 'rgba(240,0,80,0.7)' }}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-xs" style={{ color: 'rgba(240,0,80,0.8)' }}>{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium"
              style={{ border: '1px solid rgba(0,229,255,0.15)', color: 'rgba(224,247,255,0.6)' }}>
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="btn-tron flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60">
              {saving ? 'Guardando...' : 'Guardar servicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ServiciosPage() {
  const [services, setServices] = useState<ServiceCatalogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState<ServiceCatalogEntry | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/services')
      .then(r => r.json())
      .then(data => setServices(data.services ?? []))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (service: ServiceCatalogEntry) => {
    if (!confirm(`¿Eliminar el servicio "${service.name}"? El agente de WhatsApp dejará de poder cotizarlo.`)) return
    setDeletingId(service.id)
    try {
      const res = await fetch(`/api/services/${service.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setServices(prev => prev.filter(s => s.id !== service.id))
    } catch {
      alert('No se pudo eliminar el servicio.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#e0f7ff' }}>Servicios</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(0,229,255,0.5)' }}>
            Catálogo de servicios, ítems y precios. El agente de WhatsApp usa esta información para armar cotizaciones.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-tron px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
        >
          + Agregar servicio
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="loader" />
        </div>
      ) : services.length === 0 ? (
        <div className="max-w-lg mx-auto text-center py-16">
          <p className="text-sm font-medium" style={{ color: 'rgba(224,247,255,0.5)' }}>Sin servicios cargados</p>
          <p className="text-xs mt-2" style={{ color: 'rgba(224,247,255,0.3)' }}>
            Agrega tu primer servicio con sus ítems y precios
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map(service => (
            <div
              key={service.id}
              className="rounded-xl p-4"
              style={{ background: 'rgba(0,10,18,0.7)', border: '1px solid rgba(0,229,255,0.1)' }}
            >
              <p className="text-sm font-semibold mb-1" style={{ color: '#e0f7ff' }}>{service.name}</p>
              {service.detail && (
                <p className="text-xs mb-3 line-clamp-2" style={{ color: 'rgba(224,247,255,0.4)' }}>{service.detail}</p>
              )}
              <div className="space-y-1 mb-3">
                {service.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between text-xs">
                    <span style={{ color: 'rgba(224,247,255,0.6)' }}>{item.name}</span>
                    <span style={{ color: 'rgba(0,229,255,0.6)' }}>{formatCLP(item.price)}</span>
                  </div>
                ))}
                {service.items.length === 0 && (
                  <p className="text-xs" style={{ color: 'rgba(224,247,255,0.3)' }}>Sin ítems cargados</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingService(service)}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg"
                  style={{ border: '1px solid rgba(0,229,255,0.15)', color: 'rgba(0,229,255,0.7)' }}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(service)}
                  disabled={deletingId === service.id}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg disabled:opacity-50"
                  style={{ border: '1px solid rgba(240,0,80,0.2)', color: 'rgba(240,0,80,0.7)' }}
                >
                  {deletingId === service.id ? '...' : 'Eliminar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ServiceModal
          service={null}
          onClose={() => setShowModal(false)}
          onSaved={s => setServices(prev => [s, ...prev])}
        />
      )}
      {editingService && (
        <ServiceModal
          service={editingService}
          onClose={() => setEditingService(null)}
          onSaved={s => setServices(prev => prev.map(x => (x.id === s.id ? s : x)))}
        />
      )}
    </div>
  )
}
