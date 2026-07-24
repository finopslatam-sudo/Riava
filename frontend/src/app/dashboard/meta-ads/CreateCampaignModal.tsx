'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChipSearch, type ChipItem } from './ChipSearch'
import { CheckboxGrid, type GridItem } from './CheckboxGrid'

export type AdAccount = { id: string; name: string; account_status: number }

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

export function CreateCampaignModal({
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
