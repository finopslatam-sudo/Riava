'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChipSearch, type ChipItem } from '../meta-ads/ChipSearch'
import { CheckboxGrid, type GridItem } from '../meta-ads/CheckboxGrid'

type Gender = 'all' | 'male' | 'female'

type AdSetDetail = {
  id: string
  name: string
  status: string
  daily_budget?: string
  age_min?: number
  age_max?: number
  genders?: number[]
  geo_locations?: {
    countries?: string[]
    regions?: { key: string; name?: string }[]
    cities?: { key: string; name?: string }[]
  }
  flexible_spec?: Record<string, { id: string; name?: string }[]>[]
}

const inputClass = 'w-full px-3 py-2 rounded-lg text-sm bg-transparent border focus:outline-none'
const inputStyle = { borderColor: 'rgba(0,229,255,0.15)', color: '#e0f7ff' }
const labelClass = 'text-xs font-mono mb-1.5 block'
const labelStyle = { color: 'rgba(0,229,255,0.5)' }

export function EditCampaignModal({
  campaignId,
  onClose,
  onSaved,
}: {
  campaignId: string
  onClose: () => void
  onSaved: () => void
}) {
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saved, setSaved] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [name, setName] = useState('')
  const [status, setStatus] = useState<'ACTIVE' | 'PAUSED'>('PAUSED')
  const [dailyBudget, setDailyBudget] = useState('')
  const [ageMin, setAgeMin] = useState('18')
  const [ageMax, setAgeMax] = useState('65')
  const [gender, setGender] = useState<Gender>('all')

  const [countries, setCountries] = useState<GridItem[]>([])
  const [countryCode, setCountryCode] = useState('CL')
  const [regions, setRegions] = useState<GridItem[]>([])
  const [loadingRegions, setLoadingRegions] = useState(false)
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [selectedCities, setSelectedCities] = useState<ChipItem[]>([])
  const [selectedInterests, setSelectedInterests] = useState<ChipItem[]>([])

  useEffect(() => {
    fetch(`/api/meta/campaigns/${campaignId}`)
      .then(r => r.json())
      .then((data: { campaign?: { name: string; status: string }; adset?: AdSetDetail; error?: string }) => {
        if (data.error) { setLoadError(data.error); return }
        if (data.campaign) {
          setName(data.campaign.name)
          setStatus(data.campaign.status === 'ACTIVE' ? 'ACTIVE' : 'PAUSED')
        }
        const adset = data.adset
        if (adset) {
          if (adset.daily_budget) setDailyBudget(String(Math.round(Number(adset.daily_budget))))
          if (adset.age_min) setAgeMin(String(adset.age_min))
          if (adset.age_max) setAgeMax(String(adset.age_max))
          if (adset.genders?.length) setGender(adset.genders[0] === 1 ? 'male' : 'female')
          if (adset.geo_locations?.countries?.[0]) setCountryCode(adset.geo_locations.countries[0])
          if (adset.geo_locations?.regions) {
            setSelectedRegions(adset.geo_locations.regions.map(r => r.key))
          }
          if (adset.geo_locations?.cities) {
            setSelectedCities(adset.geo_locations.cities.map(c => ({ id: c.key, name: c.name ?? c.key })))
          }
          const interestsSpec = adset.flexible_spec?.find(spec => 'interests' in spec)
          if (interestsSpec) {
            setSelectedInterests(interestsSpec.interests.map(i => ({ id: i.id, name: i.name ?? i.id })))
          }
        }
      })
      .catch(() => setLoadError('No se pudo cargar la campaña'))
      .finally(() => setLoading(false))

    fetch('/api/meta/ads/countries')
      .then(r => r.json())
      .then(data => setCountries(data.countries ?? []))
  }, [campaignId])

  useEffect(() => {
    setLoadingRegions(true)
    fetch(`/api/meta/ads/regions?country=${countryCode}`)
      .then(r => r.json())
      .then(data => setRegions(data.regions ?? []))
      .finally(() => setLoadingRegions(false))
  }, [countryCode])

  const toggleRegion = (key: string) => {
    setSelectedRegions(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
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

  const handleSave = async () => {
    setSaving(true)
    setSaveError('')
    setSaved(false)
    try {
      const res = await fetch(`/api/meta/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          status,
          daily_budget: dailyBudget ? Number(dailyBudget) : undefined,
          age_min: Number(ageMin),
          age_max: Number(ageMax),
          gender,
          country_code: countryCode,
          region_keys: selectedRegions,
          city_keys: selectedCities.map(c => c.id),
          interest_ids: selectedInterests.map(i => i.id),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al guardar los cambios')
      setSaved(true)
      onSaved()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Error al guardar los cambios')
    } finally {
      setSaving(false)
    }
  }

  const setCampaignStatus = async (newStatus: 'ARCHIVED' | 'DELETED') => {
    setSaveError('')
    setSaved(false)
    const setLoadingFlag = newStatus === 'ARCHIVED' ? setArchiving : setDeleting
    setLoadingFlag(true)
    try {
      const res = await fetch(`/api/meta/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al actualizar la campaña')
      onSaved()
      onClose()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Error al actualizar la campaña')
    } finally {
      setLoadingFlag(false)
    }
  }

  const handleArchive = () => {
    if (!confirm('¿Archivar esta campaña? Dejará de estar activa y no gastará más, pero queda guardada y se puede reactivar después.')) return
    setCampaignStatus('ARCHIVED')
  }

  const handleDelete = () => {
    if (!confirm('¿Eliminar esta campaña de forma DEFINITIVA? Meta no permite deshacer esta acción — la campaña desaparecerá para siempre.')) return
    if (!confirm('Confirma una vez más: esto es permanente. ¿Eliminar de todas formas?')) return
    setCampaignStatus('DELETED')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,10,15,0.75)' }} onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ background: '#0a0e18', border: '1px solid rgba(0,229,255,0.15)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold" style={{ color: '#e0f7ff' }}>Editar campaña</h2>
          <button onClick={onClose} className="text-xs" style={{ color: 'rgba(224,247,255,0.4)' }}>Cerrar ✕</button>
        </div>
        <p className="text-xs mb-5" style={{ color: 'rgba(224,247,255,0.4)' }}>
          Cambios permitidos por Meta: nombre, estado, presupuesto y audiencia. El texto/imagen del anuncio no se puede editar — solo se puede reemplazar creando uno nuevo.
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="loader" />
          </div>
        ) : loadError ? (
          <p className="text-sm" style={{ color: 'rgba(240,0,80,0.8)' }}>{loadError}</p>
        ) : (
          <div className="space-y-4">
            <div>
              <label className={labelClass} style={labelStyle}>Nombre de la campaña</label>
              <input className={inputClass} style={inputStyle} value={name} onChange={e => setName(e.target.value)} />
            </div>

            <div>
              <label className={labelClass} style={labelStyle}>Estado</label>
              <select className={inputClass} style={inputStyle} value={status} onChange={e => setStatus(e.target.value as 'ACTIVE' | 'PAUSED')}>
                <option value="PAUSED" className="bg-[#060612]">Pausada</option>
                <option value="ACTIVE" className="bg-[#060612]">Activa</option>
              </select>
            </div>

            <div>
              <label className={labelClass} style={labelStyle}>Presupuesto diario (CLP)</label>
              <input type="number" min="1" className={inputClass} style={inputStyle} value={dailyBudget}
                onChange={e => setDailyBudget(e.target.value)} placeholder="5000" />
            </div>

            <div className="divider-tron" />
            <p className="text-xs font-semibold" style={{ color: '#e0f7ff' }}>Audiencia</p>

            <div>
              <label className={labelClass} style={labelStyle}>País</label>
              <select className={inputClass} style={inputStyle} value={countryCode} onChange={e => setCountryCode(e.target.value)}>
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
              placeholder="Buscar comuna..."
              selected={selectedCities}
              onAdd={item => setSelectedCities(prev => [...prev, item])}
              onRemove={id => setSelectedCities(prev => prev.filter(c => c.id !== id))}
              searchFn={searchCitiesFn}
            />

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass} style={labelStyle}>Edad mín.</label>
                <input type="number" min="18" max="65" className={inputClass} style={inputStyle} value={ageMin}
                  onChange={e => setAgeMin(e.target.value)} />
              </div>
              <div>
                <label className={labelClass} style={labelStyle}>Edad máx.</label>
                <input type="number" min="18" max="65" className={inputClass} style={inputStyle} value={ageMax}
                  onChange={e => setAgeMax(e.target.value)} />
              </div>
              <div>
                <label className={labelClass} style={labelStyle}>Género</label>
                <select className={inputClass} style={inputStyle} value={gender} onChange={e => setGender(e.target.value as Gender)}>
                  <option value="all" className="bg-[#060612]">Todos</option>
                  <option value="male" className="bg-[#060612]">Hombres</option>
                  <option value="female" className="bg-[#060612]">Mujeres</option>
                </select>
              </div>
            </div>

            <ChipSearch
              label="Intereses"
              placeholder="Buscar intereses..."
              selected={selectedInterests}
              onAdd={item => setSelectedInterests(prev => [...prev, item])}
              onRemove={id => setSelectedInterests(prev => prev.filter(i => i.id !== id))}
              searchFn={searchInterestsFn}
            />

            {saveError && <p className="text-xs" style={{ color: 'rgba(240,0,80,0.8)' }}>{saveError}</p>}
            {saved && !saveError && <p className="text-xs" style={{ color: '#00e564' }}>Cambios guardados ✓</p>}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                style={{ border: '1px solid rgba(0,229,255,0.15)', color: 'rgba(224,247,255,0.6)' }}>
                Cerrar
              </button>
              <button type="button" onClick={handleSave} disabled={saving}
                className="btn-tron flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60">
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>

            <div className="divider-tron" />
            <p className="text-xs font-semibold" style={{ color: '#e0f7ff' }}>Zona de riesgo</p>
            <div className="flex gap-3">
              <button type="button" onClick={handleArchive} disabled={archiving || deleting}
                className="flex-1 py-2.5 rounded-lg text-xs font-semibold disabled:opacity-60"
                style={{ border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}>
                {archiving ? 'Archivando...' : 'Archivar campaña'}
              </button>
              <button type="button" onClick={handleDelete} disabled={archiving || deleting}
                className="flex-1 py-2.5 rounded-lg text-xs font-semibold disabled:opacity-60"
                style={{ border: '1px solid rgba(240,0,80,0.3)', color: 'rgba(240,0,80,0.85)' }}>
                {deleting ? 'Eliminando...' : 'Eliminar definitivamente'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
