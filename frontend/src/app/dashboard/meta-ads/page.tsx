'use client'

import { useState, useEffect, useCallback, Suspense, FormEvent } from 'react'
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

type LeadFormOption = { page_id: string; page_name: string; form_id: string; form_name: string }
type RegionOption = { key: string; name: string }
type InterestOption = { id: string; name: string; audience_size_lower_bound?: number }
type Gender = 'all' | 'male' | 'female'

const MAX_VIDEO_BYTES = 100 * 1024 * 1024 // 100MB

const CREATE_FORM_EMPTY = {
  ad_account_id: '',
  form_key: '',
  campaign_name: '',
  daily_budget: '',
  age_min: '18',
  age_max: '65',
  primary_text: '',
  headline: '',
  gender: 'all' as Gender,
}

function CreateCampaignModal({
  accounts,
  onClose,
  onCreated,
}: {
  accounts: AdAccount[]
  onClose: () => void
  onCreated: () => void
}) {
  const [forms, setForms] = useState<LeadFormOption[]>([])
  const [loadingForms, setLoadingForms] = useState(true)
  const [form, setForm] = useState(CREATE_FORM_EMPTY)
  const [mediaTab, setMediaTab] = useState<'image' | 'video'>('image')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ manage_url: string } | null>(null)

  // Regiones
  const [regions, setRegions] = useState<RegionOption[]>([])
  const [loadingRegions, setLoadingRegions] = useState(true)
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])

  // Intereses
  const [interestQuery, setInterestQuery] = useState('')
  const [interestResults, setInterestResults] = useState<InterestOption[]>([])
  const [selectedInterests, setSelectedInterests] = useState<InterestOption[]>([])
  const [searchingInterests, setSearchingInterests] = useState(false)

  useEffect(() => {
    fetch('/api/meta/ads/forms')
      .then(r => r.json())
      .then(data => setForms(data.forms ?? []))
      .finally(() => setLoadingForms(false))

    fetch('/api/meta/ads/regions')
      .then(r => r.json())
      .then(data => setRegions(data.regions ?? []))
      .finally(() => setLoadingRegions(false))
  }, [])

  useEffect(() => {
    if (interestQuery.trim().length < 2) {
      setInterestResults([])
      return
    }
    setSearchingInterests(true)
    const timeout = setTimeout(() => {
      fetch(`/api/meta/ads/interests?q=${encodeURIComponent(interestQuery)}`)
        .then(r => r.json())
        .then(data => setInterestResults(data.interests ?? []))
        .finally(() => setSearchingInterests(false))
    }, 400)
    return () => clearTimeout(timeout)
  }, [interestQuery])

  const toggleRegion = (key: string) => {
    setSelectedRegions(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }

  const addInterest = (interest: InterestOption) => {
    if (!selectedInterests.some(i => i.id === interest.id)) {
      setSelectedInterests(prev => [...prev, interest])
    }
    setInterestQuery('')
    setInterestResults([])
  }

  const removeInterest = (id: string) => {
    setSelectedInterests(prev => prev.filter(i => i.id !== id))
  }

  const handleVideoChange = (file: File | null) => {
    if (file && file.size > MAX_VIDEO_BYTES) {
      setError('El video no puede superar los 100MB.')
      setVideoFile(null)
      return
    }
    setError('')
    setVideoFile(file)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (mediaTab === 'image' && !imageFile) {
      setError('Sube una imagen para el anuncio.')
      return
    }
    if (mediaTab === 'video' && !videoFile) {
      setError('Sube un video para el anuncio.')
      return
    }
    const [page_id, form_id] = form.form_key.split('|')
    if (!page_id || !form_id) {
      setError('Selecciona un formulario de leads.')
      return
    }

    setSaving(true)
    setError('')
    try {
      let video_id = ''
      let image_hash = ''

      if (mediaTab === 'video' && videoFile) {
        const tokenRes = await fetch('/api/meta/ads/upload-token')
        const tokenData = await tokenRes.json()
        if (!tokenRes.ok) throw new Error(tokenData.error ?? 'No se pudo obtener autorización para subir el video')

        const uploadBody = new FormData()
        uploadBody.append('access_token', tokenData.token)
        uploadBody.append('source', videoFile, videoFile.name)
        const uploadRes = await fetch(`https://graph.facebook.com/v19.0/${form.ad_account_id}/advideos`, {
          method: 'POST',
          body: uploadBody,
        })
        const uploadData = await uploadRes.json()
        if (!uploadRes.ok) throw new Error(uploadData?.error?.message ?? 'Error al subir el video a Meta')
        video_id = uploadData.id
      }

      if (mediaTab === 'image' && imageFile) {
        const tokenRes = await fetch('/api/meta/ads/upload-token')
        const tokenData = await tokenRes.json()
        if (!tokenRes.ok) throw new Error(tokenData.error ?? 'No se pudo obtener autorización para subir la imagen')

        const uploadBody = new FormData()
        uploadBody.append('access_token', tokenData.token)
        uploadBody.append('source', imageFile, imageFile.name)
        const uploadRes = await fetch(`https://graph.facebook.com/v19.0/${form.ad_account_id}/adimages`, {
          method: 'POST',
          body: uploadBody,
        })
        const uploadData = await uploadRes.json()
        if (!uploadRes.ok) throw new Error(uploadData?.error?.message ?? 'Error al subir la imagen a Meta')
        const images = uploadData.images as Record<string, { hash: string }>
        image_hash = images[Object.keys(images)[0]].hash
      }

      const body = new FormData()
      if (image_hash) body.append('image_hash', image_hash)
      if (video_id) body.append('video_id', video_id)
      body.append('ad_account_id', form.ad_account_id)
      body.append('page_id', page_id)
      body.append('form_id', form_id)
      body.append('campaign_name', form.campaign_name)
      body.append('daily_budget', form.daily_budget)
      body.append('age_min', form.age_min)
      body.append('age_max', form.age_max)
      body.append('primary_text', form.primary_text)
      body.append('headline', form.headline)
      body.append('gender', form.gender)
      body.append('region_keys', JSON.stringify(selectedRegions))
      body.append('interest_ids', JSON.stringify(selectedInterests.map(i => i.id)))

      const res = await fetch('/api/meta/ads/create', { method: 'POST', body })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al crear la campaña')
      setResult({ manage_url: data.manage_url })
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la campaña')
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
        {result ? (
          <div className="text-center py-6">
            <h2 className="text-lg font-bold mb-2" style={{ color: '#00e564' }}>Campaña creada en pausa</h2>
            <p className="text-sm mb-6" style={{ color: 'rgba(224,247,255,0.55)' }}>
              Revísala y actívala manualmente en Meta Ads Manager cuando estés listo.
            </p>
            <a
              href={result.manage_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-tron inline-block px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
            >
              Abrir en Meta Ads Manager →
            </a>
            <button onClick={onClose} className="block mx-auto mt-4 text-xs" style={{ color: 'rgba(224,247,255,0.4)' }}>
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-bold mb-1" style={{ color: '#e0f7ff' }}>Crear campaña de leads</h2>
            <p className="text-xs mb-5" style={{ color: 'rgba(224,247,255,0.4)' }}>
              Se crea en pausa (campaña, conjunto y anuncio) — la activas tú desde Meta Ads Manager.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelClass} style={labelStyle}>Cuenta publicitaria</label>
                <select required className={inputClass} style={inputStyle} value={form.ad_account_id}
                  onChange={e => setForm({ ...form, ad_account_id: e.target.value })}>
                  <option value="">Selecciona una cuenta</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id} className="bg-[#060612]">{a.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass} style={labelStyle}>Formulario de leads</label>
                <select required disabled={loadingForms} className={inputClass} style={inputStyle} value={form.form_key}
                  onChange={e => setForm({ ...form, form_key: e.target.value })}>
                  <option value="">{loadingForms ? 'Cargando formularios...' : 'Selecciona un formulario'}</option>
                  {forms.map(f => (
                    <option key={`${f.page_id}|${f.form_id}`} value={`${f.page_id}|${f.form_id}`} className="bg-[#060612]">
                      {f.page_name} — {f.form_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass} style={labelStyle}>Nombre de la campaña</label>
                <input required className={inputClass} style={inputStyle} value={form.campaign_name}
                  onChange={e => setForm({ ...form, campaign_name: e.target.value })} placeholder="Campaña Leads — Julio" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelClass} style={labelStyle}>Presupuesto diario (CLP)</label>
                  <input required type="number" min="1" className={inputClass} style={inputStyle} value={form.daily_budget}
                    onChange={e => setForm({ ...form, daily_budget: e.target.value })} placeholder="5000" />
                </div>
                <div>
                  <label className={labelClass} style={labelStyle}>Edad mín.</label>
                  <input required type="number" min="18" max="65" className={inputClass} style={inputStyle} value={form.age_min}
                    onChange={e => setForm({ ...form, age_min: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass} style={labelStyle}>Edad máx.</label>
                  <input required type="number" min="18" max="65" className={inputClass} style={inputStyle} value={form.age_max}
                    onChange={e => setForm({ ...form, age_max: e.target.value })} />
                </div>
              </div>

              <div>
                <label className={labelClass} style={labelStyle}>Género</label>
                <select className={inputClass} style={inputStyle} value={form.gender}
                  onChange={e => setForm({ ...form, gender: e.target.value as Gender })}>
                  <option value="all" className="bg-[#060612]">Todos</option>
                  <option value="male" className="bg-[#060612]">Hombres</option>
                  <option value="female" className="bg-[#060612]">Mujeres</option>
                </select>
              </div>

              <div>
                <label className={labelClass} style={labelStyle}>
                  Regiones {selectedRegions.length === 0 ? '(Chile completo)' : `(${selectedRegions.length} seleccionadas)`}
                </label>
                {loadingRegions ? (
                  <p className="text-xs" style={{ color: 'rgba(224,247,255,0.35)' }}>Cargando regiones...</p>
                ) : (
                  <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto p-2 rounded-lg" style={{ border: '1px solid rgba(0,229,255,0.15)' }}>
                    {regions.map(r => (
                      <label key={r.key} className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: 'rgba(224,247,255,0.7)' }}>
                        <input type="checkbox" checked={selectedRegions.includes(r.key)}
                          onChange={() => toggleRegion(r.key)} />
                        {r.name}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className={labelClass} style={labelStyle}>Intereses (opcional)</label>
                {selectedInterests.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {selectedInterests.map(i => (
                      <span key={i.id} className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                        style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', color: '#00e5ff' }}>
                        {i.name}
                        <button type="button" onClick={() => removeInterest(i.id)} style={{ color: 'rgba(0,229,255,0.5)' }}>✕</button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="relative">
                  <input className={inputClass} style={inputStyle} value={interestQuery}
                    onChange={e => setInterestQuery(e.target.value)}
                    placeholder="Buscar intereses (ej. emprendedores, tecnología)..." />
                  {interestQuery.trim().length >= 2 && (
                    <div className="absolute z-10 w-full mt-1 rounded-lg overflow-hidden max-h-40 overflow-y-auto"
                      style={{ background: '#0a0e18', border: '1px solid rgba(0,229,255,0.2)' }}>
                      {searchingInterests ? (
                        <p className="text-xs px-3 py-2" style={{ color: 'rgba(224,247,255,0.35)' }}>Buscando...</p>
                      ) : interestResults.length === 0 ? (
                        <p className="text-xs px-3 py-2" style={{ color: 'rgba(224,247,255,0.35)' }}>Sin resultados.</p>
                      ) : (
                        interestResults.map(i => (
                          <button type="button" key={i.id} onClick={() => addInterest(i)}
                            className="w-full text-left text-xs px-3 py-2 hover:bg-white/5" style={{ color: '#e0f7ff' }}>
                            {i.name}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className={labelClass} style={labelStyle}>Encabezado</label>
                <input required className={inputClass} style={inputStyle} value={form.headline}
                  onChange={e => setForm({ ...form, headline: e.target.value })} placeholder="Crea tu página web con Riava" />
              </div>

              <div>
                <label className={labelClass} style={labelStyle}>Texto principal</label>
                <textarea required rows={3} className={inputClass} style={inputStyle} value={form.primary_text}
                  onChange={e => setForm({ ...form, primary_text: e.target.value })}
                  placeholder="Cotiza gratis tu sitio web o SaaS a medida..." />
              </div>

              <div>
                <label className={labelClass} style={labelStyle}>Creativo del anuncio</label>
                <div className="flex gap-2 mb-2">
                  <button type="button" onClick={() => setMediaTab('image')}
                    className="flex-1 py-1.5 rounded-lg text-xs font-medium"
                    style={{
                      background: mediaTab === 'image' ? 'rgba(0,229,255,0.1)' : 'transparent',
                      border: `1px solid ${mediaTab === 'image' ? 'rgba(0,229,255,0.3)' : 'rgba(0,229,255,0.12)'}`,
                      color: mediaTab === 'image' ? '#00e5ff' : 'rgba(224,247,255,0.5)',
                    }}>
                    Imagen
                  </button>
                  <button type="button" onClick={() => setMediaTab('video')}
                    className="flex-1 py-1.5 rounded-lg text-xs font-medium"
                    style={{
                      background: mediaTab === 'video' ? 'rgba(0,229,255,0.1)' : 'transparent',
                      border: `1px solid ${mediaTab === 'video' ? 'rgba(0,229,255,0.3)' : 'rgba(0,229,255,0.12)'}`,
                      color: mediaTab === 'video' ? '#00e5ff' : 'rgba(224,247,255,0.5)',
                    }}>
                    Video
                  </button>
                </div>
                {mediaTab === 'image' ? (
                  <input type="file" accept="image/*" className={`${inputClass} py-1.5`} style={inputStyle}
                    onChange={e => setImageFile(e.target.files?.[0] ?? null)} />
                ) : (
                  <>
                    <input type="file" accept="video/*" className={`${inputClass} py-1.5`} style={inputStyle}
                      onChange={e => handleVideoChange(e.target.files?.[0] ?? null)} />
                    <p className="text-xs mt-1" style={{ color: 'rgba(224,247,255,0.3)' }}>Máximo 100MB.</p>
                  </>
                )}
              </div>

              {error && <p className="text-xs" style={{ color: 'rgba(240,0,80,0.8)' }}>{error}</p>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                  style={{ border: '1px solid rgba(0,229,255,0.15)', color: 'rgba(224,247,255,0.6)' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="btn-tron flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60">
                  {saving ? 'Creando...' : 'Crear campaña'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
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
  const [showCreate, setShowCreate] = useState(false)

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
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreate(true)}
              className="btn-tron px-4 py-2 rounded-lg text-xs font-semibold text-white"
            >
              + Crear campaña
            </button>
            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="px-4 py-2 rounded-lg text-xs font-medium transition-all"
              style={{ color: 'rgba(240,0,255,0.6)', border: '1px solid rgba(240,0,255,0.15)' }}
            >
              {disconnecting ? 'Desconectando...' : 'Desconectar cuenta'}
            </button>
          </div>
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

      {showCreate && (
        <CreateCampaignModal
          accounts={results.map(r => r.account)}
          onClose={() => setShowCreate(false)}
          onCreated={fetchCampaigns}
        />
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
