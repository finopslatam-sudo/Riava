'use client'

import { useState, useEffect } from 'react'

type AutomationDefinition = {
  id: string
  name: string
  description: string
  fields: { key: string; label: string; unit: string; min: number; max: number }[]
}
type AutomationSettings = {
  id: string
  enabled: boolean
  config: Record<string, number>
}

const RECOMMENDED = [
  {
    title: 'Chat de IA para tu propia web',
    description: 'El mismo cerebro del bot de WhatsApp (tono, servicios, agendamiento, cotizaciones), pero como un widget de chat embebido en tu sitio. No depende de Meta.',
  },
  {
    title: 'Página de agendamiento con calendario propio por cliente',
    description: 'Reservas con confirmación automática por correo y link de Google Meet, aislado por cliente (hoy solo funciona para tu propio número).',
  },
  {
    title: 'Cotizador automático embebido en tu web',
    description: 'El cliente arma su propia cotización con el catálogo de Servicios y se la envías sola por correo, sin pasar por WhatsApp.',
  },
  {
    title: 'Captura y scoring de leads desde formularios propios',
    description: 'El mismo motor de evaluación con IA que usamos para leads de Meta Ads, pero alimentado desde un formulario de contacto de tu web.',
  },
]

function AutomationCard({
  def,
  settings,
  onSaved,
}: {
  def: AutomationDefinition
  settings: AutomationSettings
  onSaved: (s: AutomationSettings) => void
}) {
  const [config, setConfig] = useState(settings.config)
  const [enabled, setEnabled] = useState(settings.enabled)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const dirty = enabled !== settings.enabled || JSON.stringify(config) !== JSON.stringify(settings.config)

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch(`/api/automations/${def.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled, config }),
      })
      const data = await res.json()
      onSaved(data.settings)
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-xl p-5" style={{ background: 'rgba(0,10,18,0.7)', border: '1px solid rgba(0,229,255,0.1)' }}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm font-semibold" style={{ color: '#e0f7ff' }}>{def.name}</p>
          <p className="text-xs mt-1 max-w-md" style={{ color: 'rgba(224,247,255,0.4)' }}>{def.description}</p>
        </div>
        <label className="flex items-center gap-2 shrink-0 cursor-pointer">
          <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} />
          <span className="text-xs font-medium" style={{ color: enabled ? '#00e564' : 'rgba(224,247,255,0.4)' }}>
            {enabled ? 'Activa' : 'Inactiva'}
          </span>
        </label>
      </div>

      <div className="flex flex-wrap gap-4 mt-4">
        {def.fields.map(field => (
          <div key={field.key}>
            <label className="text-xs font-mono mb-1.5 block" style={{ color: 'rgba(0,229,255,0.5)' }}>{field.label}</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={field.min}
                max={field.max}
                value={config[field.key] ?? 0}
                onChange={e => setConfig({ ...config, [field.key]: Number(e.target.value) })}
                className="w-20 px-2 py-1.5 rounded-lg text-sm bg-transparent border focus:outline-none"
                style={{ borderColor: 'rgba(0,229,255,0.15)', color: '#e0f7ff' }}
              />
              <span className="text-xs" style={{ color: 'rgba(224,247,255,0.4)' }}>{field.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className="btn-tron px-4 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-40"
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
        {saved && !dirty && <span className="text-xs" style={{ color: '#00e564' }}>Guardado ✓</span>}
      </div>
    </div>
  )
}

export default function AutomatizacionesPage() {
  const [definitions, setDefinitions] = useState<AutomationDefinition[]>([])
  const [settings, setSettings] = useState<AutomationSettings[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/automations')
      .then(r => r.json())
      .then(data => {
        setDefinitions(data.definitions ?? [])
        setSettings(data.settings ?? [])
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#e0f7ff' }}>Automatizaciones</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(0,229,255,0.5)' }}>
          Tareas que corren solas, sin que tengas que hacer nada manualmente.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="loader" />
        </div>
      ) : (
        <div className="flex flex-col gap-4 mb-10">
          {definitions.map(def => {
            const s = settings.find(x => x.id === def.id)
            if (!s) return null
            return (
              <AutomationCard
                key={def.id}
                def={def}
                settings={s}
                onSaved={updated => setSettings(prev => prev.map(x => (x.id === updated.id ? updated : x)))}
              />
            )
          })}
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold mb-1" style={{ color: '#e0f7ff' }}>Automatizaciones recomendadas</h2>
        <p className="text-xs mb-4" style={{ color: 'rgba(224,247,255,0.4)' }}>
          No dependen de la aprobación de Meta — dime cuál quieres y la construyo y la agrego aquí.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {RECOMMENDED.map(r => (
            <div key={r.title} className="rounded-xl p-4" style={{ background: 'rgba(0,10,18,0.4)', border: '1px dashed rgba(0,229,255,0.15)' }}>
              <p className="text-sm font-semibold mb-1" style={{ color: 'rgba(224,247,255,0.8)' }}>{r.title}</p>
              <p className="text-xs" style={{ color: 'rgba(224,247,255,0.4)' }}>{r.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
