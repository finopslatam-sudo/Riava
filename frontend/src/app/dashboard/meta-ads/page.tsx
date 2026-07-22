'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChipSearch, type ChipItem } from './ChipSearch'
import { CheckboxGrid, type GridItem } from './CheckboxGrid'

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
type PageOption = { id: string; name: string }
type Gender = 'all' | 'male' | 'female'
type QuestionType = 'FULL_NAME' | 'EMAIL' | 'PHONE' | 'ID_CL_RUT'

const MAX_VIDEO_BYTES = 100 * 1024 * 1024 // 100MB
const TOTAL_STEPS = 5
const STEP_TITLES = ['Cuenta', 'Audiencia', 'Creatividad', 'Formulario de leads', 'Revisión']

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

const inputClass = 'w-full px-3 py-2 rounded-lg text-sm bg-transparent border focus:outline-none'
const inputStyle = { borderColor: 'rgba(0,229,255,0.15)', color: '#e0f7ff' }
const labelClass = 'text-xs font-mono mb-1.5 block'
const labelStyle = { color: 'rgba(0,229,255,0.5)' }

function CreateCampaignModal({
  accounts,
  onClose,
  onCreated,
}: {
  accounts: AdAccount[]
  onClose: () => void
  onCreated: () => void
}) {
  const [step, setStep] = useState(1)
  const [forms, setForms] = useState<LeadFormOption[]>([])
  const [loadingForms, setLoadingForms] = useState(true)
  const [form, setForm] = useState(CREATE_FORM_EMPTY)
  const [mediaTab, setMediaTab] = useState<'image' | 'video'>('image')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ manage_url: string } | null>(null)

  // Geografía
  const [countries, setCountries] = useState<GridItem[]>([])
  const [countryCode, setCountryCode] = useState('CL')
  const [regions, setRegions] = useState<GridItem[]>([])
  const [loadingRegions, setLoadingRegions] = useState(true)
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [selectedCities, setSelectedCities] = useState<ChipItem[]>([])

  // Segmentación detallada
  const [selectedInterests, setSelectedInterests] = useState<ChipItem[]>([])
  const [selectedWorkPositions, setSelectedWorkPositions] = useState<ChipItem[]>([])
  const [selectedEmployers, setSelectedEmployers] = useState<ChipItem[]>([])
  const [selectedBehaviors, setSelectedBehaviors] = useState<ChipItem[]>([])
  const [industries, setIndustries] = useState<GridItem[]>([])
  const [loadingIndustries, setLoadingIndustries] = useState(true)
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])

  // Formulario de leads nuevo
  const [creatingNewForm, setCreatingNewForm] = useState(false)
  const [pages, setPages] = useState<PageOption[]>([])
  const [loadingPages, setLoadingPages] = useState(false)
  const [newFormPageId, setNewFormPageId] = useState('')
  const [newFormName, setNewFormName] = useState('')
  const [newFormFields, setNewFormFields] = useState<Record<QuestionType, boolean>>({
    FULL_NAME: true, EMAIL: true, PHONE: true, ID_CL_RUT: false,
  })
  const [privacyUrl, setPrivacyUrl] = useState('')
  const [privacyText, setPrivacyText] = useState('Política de privacidad')
  const [savingNewForm, setSavingNewForm] = useState(false)
  const [newFormError, setNewFormError] = useState('')

  useEffect(() => {
    fetch('/api/meta/ads/forms')
      .then(r => r.json())
      .then(data => setForms(data.forms ?? []))
      .finally(() => setLoadingForms(false))

    fetch('/api/meta/ads/countries')
      .then(r => r.json())
      .then(data => setCountries(data.countries ?? []))

    fetch('/api/meta/ads/industries')
      .then(r => r.json())
      .then(data => setIndustries(data.industries ?? []))
      .finally(() => setLoadingIndustries(false))
  }, [])

  useEffect(() => {
    setLoadingRegions(true)
    setSelectedRegions([])
    setSelectedCities([])
    fetch(`/api/meta/ads/regions?country=${countryCode}`)
      .then(r => r.json())
      .then(data => setRegions(data.regions ?? []))
      .finally(() => setLoadingRegions(false))
  }, [countryCode])

  const toggleRegion = (key: string) => {
    setSelectedRegions(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }

  const toggleIndustry = (key: string) => {
    setSelectedIndustries(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }

  const searchCitiesFn = useCallback(async (q: string): Promise<ChipItem[]> => {
    const res = await fetch(`/api/meta/ads/cities?country=${countryCode}&q=${encodeURIComponent(q)}`)
    const data = await res.json()
    return (data.cities ?? []).map((c: { key: string; name: string }) => ({ id: c.key, name: c.name }))
  }, [countryCode])

  const searchInterestsFn = useCallback(async (q: string): Promise<ChipItem[]> => {
    const res = await fetch(`/api/meta/ads/interests?q=${encodeURIComponent(q)}`)
    const data = await res.json()
    return data.interests ?? []
  }, [])

  const searchWorkPositionsFn = useCallback(async (q: string): Promise<ChipItem[]> => {
    const res = await fetch(`/api/meta/ads/work-positions?q=${encodeURIComponent(q)}`)
    const data = await res.json()
    return data.work_positions ?? []
  }, [])

  const searchEmployersFn = useCallback(async (q: string): Promise<ChipItem[]> => {
    const res = await fetch(`/api/meta/ads/employers?q=${encodeURIComponent(q)}`)
    const data = await res.json()
    return data.employers ?? []
  }, [])

  const searchBehaviorsFn = useCallback(async (q: string): Promise<ChipItem[]> => {
    const res = await fetch(`/api/meta/ads/behaviors?q=${encodeURIComponent(q)}`)
    const data = await res.json()
    return data.behaviors ?? []
  }, [])

  const handleVideoChange = (file: File | null) => {
    if (file && file.size > MAX_VIDEO_BYTES) {
      setError('El video no puede superar los 100MB.')
      setVideoFile(null)
      return
    }
    setError('')
    setVideoFile(file)
  }

  const loadPagesForNewForm = () => {
    setCreatingNewForm(true)
    if (pages.length === 0) {
      setLoadingPages(true)
      fetch('/api/meta/ads/pages')
        .then(r => r.json())
        .then(data => setPages(data.pages ?? []))
        .finally(() => setLoadingPages(false))
    }
  }

  const handleCreateLeadForm = async () => {
    setNewFormError('')
    if (!newFormPageId || !newFormName.trim() || !privacyUrl.trim() || !privacyText.trim()) {
      setNewFormError('Completa página, nombre y política de privacidad.')
      return
    }
    const questions = (Object.keys(newFormFields) as QuestionType[])
      .filter(k => newFormFields[k])
      .map(type => ({ type }))
    if (questions.length === 0) {
      setNewFormError('Selecciona al menos un campo para el formulario.')
      return
    }

    setSavingNewForm(true)
    try {
      const res = await fetch('/api/meta/ads/lead-forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_id: newFormPageId,
          name: newFormName.trim(),
          questions,
          privacy_policy_url: privacyUrl.trim(),
          privacy_policy_text: privacyText.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al crear el formulario')

      const pageName = pages.find(p => p.id === newFormPageId)?.name ?? newFormPageId
      const newForm: LeadFormOption = { page_id: newFormPageId, page_name: pageName, form_id: data.form_id, form_name: newFormName.trim() }
      setForms(prev => [newForm, ...prev])
      setForm(prev => ({ ...prev, form_key: `${newFormPageId}|${data.form_id}` }))
      setCreatingNewForm(false)
    } catch (err) {
      setNewFormError(err instanceof Error ? err.message : 'Error al crear el formulario')
    } finally {
      setSavingNewForm(false)
    }
  }

  const validateStep = (): string | null => {
    if (step === 1 && !form.ad_account_id) return 'Selecciona una cuenta publicitaria.'
    if (step === 2 && Number(form.age_min) > Number(form.age_max)) return 'La edad mínima no puede ser mayor a la máxima.'
    if (step === 3) {
      if (!form.headline.trim() || !form.primary_text.trim()) return 'Completa el encabezado y el texto principal.'
      if (mediaTab === 'image' && !imageFile) return 'Sube una imagen para el anuncio.'
      if (mediaTab === 'video' && !videoFile) return 'Sube un video para el anuncio.'
    }
    if (step === 4 && !form.form_key) return 'Selecciona o crea un formulario de leads.'
    return null
  }

  const goNext = () => {
    const err = validateStep()
    if (err) { setError(err); return }
    setError('')
    setStep(s => Math.min(TOTAL_STEPS, s + 1))
  }
  const goBack = () => { setError(''); setStep(s => Math.max(1, s - 1)) }

  const handleSubmit = async () => {
    const err = validateStep()
    if (err) { setError(err); return }
    const [page_id, form_id] = form.form_key.split('|')

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
      body.append('country_code', countryCode)
      body.append('region_keys', JSON.stringify(selectedRegions))
      body.append('city_keys', JSON.stringify(selectedCities.map(c => c.id)))
      body.append('interest_ids', JSON.stringify(selectedInterests.map(i => i.id)))
      body.append('work_position_ids', JSON.stringify(selectedWorkPositions.map(i => i.id)))
      body.append('work_employer_ids', JSON.stringify(selectedEmployers.map(i => i.id)))
      body.append('industry_ids', JSON.stringify(selectedIndustries))
      body.append('behavior_ids', JSON.stringify(selectedBehaviors.map(i => i.id)))

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
            <p className="text-xs mb-1" style={{ color: 'rgba(224,247,255,0.4)' }}>
              Se crea en pausa (campaña, conjunto y anuncio) — la activas tú desde Meta Ads Manager.
            </p>
            <p className="text-xs mb-5 font-mono" style={{ color: 'rgba(0,229,255,0.5)' }}>
              Paso {step}/{TOTAL_STEPS} — {STEP_TITLES[step - 1]}
            </p>

            <div className="space-y-4">
              {step === 1 && (
                <div>
                  <label className={labelClass} style={labelStyle}>Cuenta publicitaria</label>
                  <select className={inputClass} style={inputStyle} value={form.ad_account_id}
                    onChange={e => setForm({ ...form, ad_account_id: e.target.value })}>
                    <option value="">Selecciona una cuenta</option>
                    {accounts.map(a => (
                      <option key={a.id} value={a.id} className="bg-[#060612]">{a.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {step === 2 && (
                <>
                  <div>
                    <label className={labelClass} style={labelStyle}>País</label>
                    <select className={inputClass} style={inputStyle} value={countryCode}
                      onChange={e => setCountryCode(e.target.value)}>
                      {countries.length === 0 && <option value="CL" className="bg-[#060612]">Chile</option>}
                      {countries.map(c => (
                        <option key={c.key} value={c.key} className="bg-[#060612]">{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <CheckboxGrid
                    label={`Regiones ${selectedRegions.length === 0 ? '(país completo)' : `(${selectedRegions.length} seleccionadas)`}`}
                    items={regions}
                    selected={selectedRegions}
                    onToggle={toggleRegion}
                    loading={loadingRegions}
                  />

                  <ChipSearch
                    label="Comunas / ciudades (opcional)"
                    placeholder="Buscar comuna (ej. Providencia, Las Condes)..."
                    selected={selectedCities}
                    onAdd={item => setSelectedCities(prev => [...prev, item])}
                    onRemove={id => setSelectedCities(prev => prev.filter(c => c.id !== id))}
                    searchFn={searchCitiesFn}
                  />

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className={labelClass} style={labelStyle}>Presupuesto diario (CLP)</label>
                      <input type="number" min="1" className={inputClass} style={inputStyle} value={form.daily_budget}
                        onChange={e => setForm({ ...form, daily_budget: e.target.value })} placeholder="5000" />
                    </div>
                    <div>
                      <label className={labelClass} style={labelStyle}>Edad mín.</label>
                      <input type="number" min="18" max="65" className={inputClass} style={inputStyle} value={form.age_min}
                        onChange={e => setForm({ ...form, age_min: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelClass} style={labelStyle}>Edad máx.</label>
                      <input type="number" min="18" max="65" className={inputClass} style={inputStyle} value={form.age_max}
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

                  <div className="divider-tron" />
                  <p className="text-xs font-semibold" style={{ color: '#e0f7ff' }}>Segmentación detallada (opcional)</p>

                  <ChipSearch
                    label="Intereses"
                    placeholder="Buscar intereses (ej. emprendedores, tecnología)..."
                    selected={selectedInterests}
                    onAdd={item => setSelectedInterests(prev => [...prev, item])}
                    onRemove={id => setSelectedInterests(prev => prev.filter(i => i.id !== id))}
                    searchFn={searchInterestsFn}
                  />

                  <ChipSearch
                    label="Cargos de trabajo"
                    placeholder="Buscar cargo (ej. gerente, dueño de empresa)..."
                    selected={selectedWorkPositions}
                    onAdd={item => setSelectedWorkPositions(prev => [...prev, item])}
                    onRemove={id => setSelectedWorkPositions(prev => prev.filter(i => i.id !== id))}
                    searchFn={searchWorkPositionsFn}
                  />

                  <ChipSearch
                    label="Empleadores"
                    placeholder="Buscar empresa empleadora..."
                    selected={selectedEmployers}
                    onAdd={item => setSelectedEmployers(prev => [...prev, item])}
                    onRemove={id => setSelectedEmployers(prev => prev.filter(i => i.id !== id))}
                    searchFn={searchEmployersFn}
                  />

                  <ChipSearch
                    label="Comportamientos"
                    placeholder="Buscar comportamiento (ej. viajeros frecuentes)..."
                    selected={selectedBehaviors}
                    onAdd={item => setSelectedBehaviors(prev => [...prev, item])}
                    onRemove={id => setSelectedBehaviors(prev => prev.filter(i => i.id !== id))}
                    searchFn={searchBehaviorsFn}
                  />

                  <CheckboxGrid
                    label="Industrias"
                    items={industries}
                    selected={selectedIndustries}
                    onToggle={toggleIndustry}
                    loading={loadingIndustries}
                  />
                </>
              )}

              {step === 3 && (
                <>
                  <div>
                    <label className={labelClass} style={labelStyle}>Encabezado</label>
                    <input className={inputClass} style={inputStyle} value={form.headline}
                      onChange={e => setForm({ ...form, headline: e.target.value })} placeholder="Crea tu página web con Riava" />
                  </div>

                  <div>
                    <label className={labelClass} style={labelStyle}>Texto principal</label>
                    <textarea rows={3} className={inputClass} style={inputStyle} value={form.primary_text}
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
                </>
              )}

              {step === 4 && (
                <>
                  {!creatingNewForm ? (
                    <>
                      <div>
                        <label className={labelClass} style={labelStyle}>Formulario de leads existente</label>
                        <select disabled={loadingForms} className={inputClass} style={inputStyle} value={form.form_key}
                          onChange={e => setForm({ ...form, form_key: e.target.value })}>
                          <option value="">{loadingForms ? 'Cargando formularios...' : 'Selecciona un formulario'}</option>
                          {forms.map(f => (
                            <option key={`${f.page_id}|${f.form_id}`} value={`${f.page_id}|${f.form_id}`} className="bg-[#060612]">
                              {f.page_name} — {f.form_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button type="button" onClick={loadPagesForNewForm}
                        className="text-xs" style={{ color: '#00e5ff' }}>
                        + Crear formulario nuevo
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold" style={{ color: '#e0f7ff' }}>Nuevo formulario de leads</p>
                        <button type="button" onClick={() => setCreatingNewForm(false)}
                          className="text-xs" style={{ color: 'rgba(224,247,255,0.4)' }}>Usar uno existente</button>
                      </div>

                      <div>
                        <label className={labelClass} style={labelStyle}>Página</label>
                        <select disabled={loadingPages} className={inputClass} style={inputStyle} value={newFormPageId}
                          onChange={e => setNewFormPageId(e.target.value)}>
                          <option value="">{loadingPages ? 'Cargando páginas...' : 'Selecciona una página'}</option>
                          {pages.map(p => (
                            <option key={p.id} value={p.id} className="bg-[#060612]">{p.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={labelClass} style={labelStyle}>Nombre del formulario</label>
                        <input className={inputClass} style={inputStyle} value={newFormName}
                          onChange={e => setNewFormName(e.target.value)} placeholder="Formulario Leads — Web" />
                      </div>

                      <div>
                        <label className={labelClass} style={labelStyle}>Campos a solicitar</label>
                        <div className="flex flex-col gap-1.5">
                          {([
                            ['FULL_NAME', 'Nombre completo'],
                            ['EMAIL', 'Email'],
                            ['PHONE', 'Teléfono'],
                            ['ID_CL_RUT', 'RUT chileno'],
                          ] as [QuestionType, string][]).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: 'rgba(224,247,255,0.7)' }}>
                              <input type="checkbox" checked={newFormFields[key]}
                                onChange={() => setNewFormFields(prev => ({ ...prev, [key]: !prev[key] }))} />
                              {label}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className={labelClass} style={labelStyle}>URL de política de privacidad</label>
                        <input className={inputClass} style={inputStyle} value={privacyUrl}
                          onChange={e => setPrivacyUrl(e.target.value)} placeholder="https://www.riava.cl/politica-privacidad" />
                      </div>
                      <div>
                        <label className={labelClass} style={labelStyle}>Texto del enlace</label>
                        <input className={inputClass} style={inputStyle} value={privacyText}
                          onChange={e => setPrivacyText(e.target.value)} />
                      </div>

                      {newFormError && <p className="text-xs" style={{ color: 'rgba(240,0,80,0.8)' }}>{newFormError}</p>}

                      <button type="button" onClick={handleCreateLeadForm} disabled={savingNewForm}
                        className="btn-tron w-full py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-60">
                        {savingNewForm ? 'Creando...' : 'Crear formulario'}
                      </button>
                    </>
                  )}
                </>
              )}

              {step === 5 && (
                <div className="space-y-2 text-xs" style={{ color: 'rgba(224,247,255,0.7)' }}>
                  <p><span style={labelStyle}>Cuenta: </span>{accounts.find(a => a.id === form.ad_account_id)?.name ?? '—'}</p>
                  <p><span style={labelStyle}>Campaña: </span>{form.campaign_name || '—'} · ${form.daily_budget || '0'}/día</p>
                  <p><span style={labelStyle}>Edad: </span>{form.age_min}–{form.age_max} · {form.gender === 'all' ? 'Todos' : form.gender === 'male' ? 'Hombres' : 'Mujeres'}</p>
                  <p><span style={labelStyle}>Geografía: </span>
                    {selectedCities.length > 0 ? `${selectedCities.length} comuna(s)` : selectedRegions.length > 0 ? `${selectedRegions.length} región(es)` : 'País completo'}
                  </p>
                  <p><span style={labelStyle}>Segmentación: </span>
                    {selectedInterests.length + selectedWorkPositions.length + selectedEmployers.length + selectedBehaviors.length + selectedIndustries.length} categoría(s) seleccionada(s)
                  </p>
                  <p><span style={labelStyle}>Creativo: </span>{mediaTab === 'image' ? (imageFile?.name ?? 'Sin imagen') : (videoFile?.name ?? 'Sin video')}</p>
                  <p><span style={labelStyle}>Formulario: </span>{forms.find(f => `${f.page_id}|${f.form_id}` === form.form_key)?.form_name ?? '—'}</p>

                  <div>
                    <label className={labelClass} style={labelStyle}>Nombre de la campaña</label>
                    <input className={inputClass} style={inputStyle} value={form.campaign_name}
                      onChange={e => setForm({ ...form, campaign_name: e.target.value })} placeholder="Campaña Leads — Julio" />
                  </div>
                </div>
              )}

              {error && <p className="text-xs" style={{ color: 'rgba(240,0,80,0.8)' }}>{error}</p>}

              <div className="flex gap-3 pt-2">
                {step === 1 ? (
                  <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                    style={{ border: '1px solid rgba(0,229,255,0.15)', color: 'rgba(224,247,255,0.6)' }}>
                    Cancelar
                  </button>
                ) : (
                  <button type="button" onClick={goBack} className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                    style={{ border: '1px solid rgba(0,229,255,0.15)', color: 'rgba(224,247,255,0.6)' }}>
                    Atrás
                  </button>
                )}
                {step < TOTAL_STEPS ? (
                  <button type="button" onClick={goNext}
                    className="btn-tron flex-1 py-2.5 rounded-lg text-sm font-semibold text-white">
                    Siguiente
                  </button>
                ) : (
                  <button type="button" onClick={handleSubmit} disabled={saving || !form.campaign_name.trim()}
                    className="btn-tron flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60">
                    {saving ? 'Creando...' : 'Crear campaña'}
                  </button>
                )}
              </div>
            </div>
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
