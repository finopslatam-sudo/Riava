'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { RiavaLogo } from '@/components/ui/RiavaLogo'
import { BOOKING_SERVICES } from '@/lib/constants'

type Slot = {
  id: string
  date: string
  startTime: string
  endTime: string
  booked: boolean
}

type FormState = {
  name: string
  lastName: string
  company: string
  email: string
  phone: string
  service: string
}

const DAYS_ES_LONG  = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const DAYS_ES_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MONTHS_ES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']

function addDays(date: Date, n: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getMonday(d: Date) {
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  return addDays(d, diff)
}

function fmtDate(d: string) {
  const [y, m, day] = d.split('-')
  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
  return `${parseInt(day)} de ${months[parseInt(m) - 1]} de ${y}`
}

const inputStyle = {
  background: 'rgba(0,20,30,0.8)',
  border: '1px solid rgba(0,229,255,0.2)',
  color: '#e0f7ff',
  caretColor: '#00e5ff',
}

export default function AgendarPage() {
  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(new Date()))
  const [slots, setSlots] = useState<Slot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [form, setForm] = useState<FormState>({ name: '', lastName: '', company: '', email: '', phone: '', service: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess] = useState(false)
  const [bookedAppt, setBookedAppt] = useState<{ date: string; startTime: string; endTime: string; meetLink: string } | null>(null)

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const fromStr = toISODate(weekStart)
  const toStr   = toISODate(addDays(weekStart, 6))

  const fetchSlots = useCallback(async () => {
    setLoadingSlots(true)
    const res = await fetch(`/api/appointments/slots?from=${fromStr}&to=${toStr}`)
    if (res.ok) setSlots(await res.json())
    setLoadingSlots(false)
  }, [fromStr, toStr])

  useEffect(() => { fetchSlots() }, [fetchSlots])

  const prevWeek = () => { setWeekStart(d => addDays(d, -7)); setSelectedSlot(null) }
  const nextWeek = () => { setWeekStart(d => addDays(d, 7)); setSelectedSlot(null) }

  const slotsForDay = (date: string) =>
    slots.filter(s => s.date === date && !s.booked).sort((a, b) => a.startTime.localeCompare(b.startTime))

  const handleFieldChange = (field: keyof FormState, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSlot) return
    setSubmitting(true)
    setSubmitError('')

    let res: Response
    try {
      res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId: selectedSlot.id, ...form }),
        signal: AbortSignal.timeout(25000),
      })
    } catch {
      setSubmitting(false)
      setSubmitError('La solicitud tardó demasiado. Por favor intenta de nuevo.')
      return
    }
    const data = await res.json()
    setSubmitting(false)

    if (!res.ok) { setSubmitError(data.error ?? 'Error al agendar la cita. Intenta de nuevo.'); return }

    setBookedAppt({ date: data.date, startTime: data.startTime, endTime: data.endTime, meetLink: data.meetLink })
    setSuccess(true)
    setSlots(prev => prev.map(s => s.id === selectedSlot.id ? { ...s, booked: true } : s))
  }

  const todayStr = toISODate(new Date())
  const weekLabel = `${weekDays[0].getDate()} ${MONTHS_ES[weekDays[0].getMonth()]} – ${weekDays[6].getDate()} ${MONTHS_ES[weekDays[6].getMonth()]} ${weekDays[6].getFullYear()}`

  return (
    <div className="min-h-screen" style={{ background: '#000a0f' }}>
      {/* Tron bg */}
      <div className="tron-scene">
        <div className="tron-sky-glow" />
        <div className="tron-perspective-wrap"><div className="tron-grid-floor" /></div>
        <div className="tron-horizon-line" />
        <div className="tron-scanlines" />
        <div className="tron-vignette" />
      </div>

      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(0,229,255,0.08)' }}>
        <Link href="/">
          <RiavaLogo variant="full" className="h-8 w-auto" />
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs transition-colors"
          style={{ color: 'rgba(0,229,255,0.5)' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#00e5ff' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(0,229,255,0.5)' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Volver al sitio
        </Link>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <p className="text-xs tracking-widest uppercase font-semibold mb-3" style={{ color: 'rgba(0,229,255,0.5)' }}>
            RIAVA System SpA
          </p>
          <h1 className="text-3xl lg:text-4xl font-bold mb-3" style={{ color: '#e0f7ff' }}>
            Agenda una <span className="text-tron">reunión</span>
          </h1>
          <p className="text-sm max-w-xl mx-auto" style={{ color: 'rgba(224,247,255,0.5)' }}>
            Selecciona un horario disponible y completa el formulario. Recibirás un correo con la confirmación y el enlace de Google Meet.
          </p>
        </div>

        {/* Success state */}
        {success && bookedAppt ? (
          <div className="max-w-lg mx-auto">
            <div
              className="glass-tron rounded-2xl p-8 text-center"
              style={{ border: '1px solid rgba(0,229,255,0.2)', boxShadow: '0 0 60px rgba(0,229,255,0.08)' }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.3)' }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: '#e0f7ff' }}>¡Cita agendada!</h2>
              <p className="text-sm mb-5" style={{ color: 'rgba(224,247,255,0.6)' }}>
                Te enviamos un correo de confirmación con todos los detalles.
              </p>
              <div
                className="rounded-xl p-4 mb-5 text-left"
                style={{ background: 'rgba(0,20,30,0.7)', border: '1px solid rgba(0,229,255,0.1)' }}
              >
                <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'rgba(0,229,255,0.5)' }}>Detalles</p>
                <p className="text-sm" style={{ color: '#e0f7ff' }}>📅 {fmtDate(bookedAppt.date)}</p>
                <p className="text-sm mt-1" style={{ color: '#e0f7ff' }}>🕐 {bookedAppt.startTime} – {bookedAppt.endTime}</p>
              </div>
              {bookedAppt.meetLink && (
                <a
                  href={bookedAppt.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-tron inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold mb-4"
                  style={{ color: '#000a0f' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
                  Unirse a Google Meet
                </a>
              )}
              <button
                onClick={() => { setSuccess(false); setSelectedSlot(null); setForm({ name: '', lastName: '', company: '', email: '', phone: '', service: '' }) }}
                className="block w-full text-center text-xs mt-2 transition-colors"
                style={{ color: 'rgba(0,229,255,0.4)' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#00e5ff' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(0,229,255,0.4)' }}
              >
                Agendar otra reunión
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col xl:flex-row gap-6">
            {/* Weekly calendar */}
            <div className="flex-1">
              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: 'rgba(0,10,15,0.85)', border: '1px solid rgba(0,229,255,0.12)' }}
              >
                {/* Week nav */}
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(0,229,255,0.08)' }}>
                  <button
                    onClick={prevWeek}
                    className="p-2 rounded-lg transition-all"
                    style={{ color: 'rgba(0,229,255,0.6)', border: '1px solid rgba(0,229,255,0.12)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#00e5ff'; e.currentTarget.style.borderColor = 'rgba(0,229,255,0.35)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(0,229,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(0,229,255,0.12)' }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  <span className="text-sm font-medium" style={{ color: '#e0f7ff' }}>{weekLabel}</span>
                  <button
                    onClick={nextWeek}
                    className="p-2 rounded-lg transition-all"
                    style={{ color: 'rgba(0,229,255,0.6)', border: '1px solid rgba(0,229,255,0.12)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#00e5ff'; e.currentTarget.style.borderColor = 'rgba(0,229,255,0.35)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(0,229,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(0,229,255,0.12)' }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                </div>

                {/* Day columns */}
                <div className="grid grid-cols-7 divide-x" style={{ borderColor: 'rgba(0,229,255,0.06)' }}>
                  {weekDays.map((day, idx) => {
                    const dateStr = toISODate(day)
                    const daySlots = slotsForDay(dateStr)
                    const isPast = dateStr < todayStr
                    const isToday = dateStr === todayStr

                    return (
                      <div
                        key={dateStr}
                        className="flex flex-col"
                        style={{ borderColor: 'rgba(0,229,255,0.06)', opacity: isPast ? 0.45 : 1 }}
                      >
                        {/* Day header */}
                        <div
                          className="px-1 py-3 text-center"
                          style={{ borderBottom: '1px solid rgba(0,229,255,0.06)', background: isToday ? 'rgba(0,229,255,0.04)' : 'transparent' }}
                        >
                          <p className="text-xs font-semibold" style={{ color: isToday ? '#00e5ff' : 'rgba(0,229,255,0.4)' }}>
                            {DAYS_ES_SHORT[idx]}
                          </p>
                          <p
                            className="text-sm font-bold mt-0.5"
                            style={{ color: isToday ? '#00e5ff' : 'rgba(224,247,255,0.7)' }}
                          >
                            {day.getDate()}
                          </p>
                        </div>

                        {/* Slots */}
                        <div className="flex flex-col gap-1.5 p-1.5 min-h-24">
                          {loadingSlots ? (
                            <div className="flex-1 flex items-center justify-center">
                              <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(0,229,255,0.2)' }} />
                            </div>
                          ) : daySlots.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center">
                              <span className="text-xs" style={{ color: 'rgba(224,247,255,0.15)' }}>—</span>
                            </div>
                          ) : daySlots.map(slot => {
                            const isSelected = selectedSlot?.id === slot.id
                            return (
                              <button
                                key={slot.id}
                                onClick={() => { if (!isPast) { setSelectedSlot(isSelected ? null : slot); setSubmitError('') } }}
                                disabled={isPast}
                                className="w-full rounded-lg px-1 py-1.5 text-xs font-medium transition-all text-center"
                                style={{
                                  background: isSelected ? 'rgba(0,229,255,0.18)' : 'rgba(0,229,255,0.06)',
                                  border: `1px solid ${isSelected ? 'rgba(0,229,255,0.5)' : 'rgba(0,229,255,0.15)'}`,
                                  color: isSelected ? '#00e5ff' : 'rgba(0,229,255,0.7)',
                                  cursor: isPast ? 'default' : 'pointer',
                                }}
                              >
                                {slot.startTime}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* No slots notice */}
                {!loadingSlots && slots.filter(s => !s.booked && s.date >= fromStr && s.date <= toStr).length === 0 && (
                  <div className="px-6 py-5 text-center" style={{ borderTop: '1px solid rgba(0,229,255,0.06)' }}>
                    <p className="text-sm" style={{ color: 'rgba(224,247,255,0.3)' }}>Sin horarios disponibles esta semana</p>
                    <p className="text-xs mt-1" style={{ color: 'rgba(0,229,255,0.3)' }}>Prueba avanzando a la próxima semana</p>
                  </div>
                )}
              </div>
            </div>

            {/* Booking form */}
            <div className="xl:w-96">
              <div
                className="glass-tron rounded-2xl overflow-hidden"
                style={{ border: '1px solid rgba(0,229,255,0.15)', boxShadow: '0 0 40px rgba(0,229,255,0.06)' }}
              >
                {!selectedSlot ? (
                  <div className="flex flex-col items-center justify-center px-6 py-16 text-center gap-3">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(0,229,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <p className="text-sm" style={{ color: 'rgba(224,247,255,0.35)' }}>
                      Selecciona un horario disponible en el calendario
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Selected slot info */}
                    <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(0,229,255,0.1)', background: 'rgba(0,229,255,0.04)' }}>
                      <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'rgba(0,229,255,0.5)' }}>Horario seleccionado</p>
                      <p className="text-sm font-bold" style={{ color: '#00e5ff' }}>
                        {DAYS_ES_LONG[new Date(selectedSlot.date + 'T12:00:00').getDay() === 0 ? 6 : new Date(selectedSlot.date + 'T12:00:00').getDay() - 1]}, {fmtDate(selectedSlot.date)}
                      </p>
                      <p className="text-sm" style={{ color: 'rgba(0,229,255,0.7)' }}>
                        {selectedSlot.startTime} – {selectedSlot.endTime}
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs mb-1 block tracking-wide" style={{ color: 'rgba(0,229,255,0.6)' }}>Nombre *</label>
                          <input
                            required
                            value={form.name}
                            onChange={e => handleFieldChange('name', e.target.value)}
                            placeholder="Ricardo"
                            className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                            style={inputStyle}
                            onFocus={e => { e.currentTarget.style.border = '1px solid rgba(0,229,255,0.5)' }}
                            onBlur={e => { e.currentTarget.style.border = '1px solid rgba(0,229,255,0.2)' }}
                          />
                        </div>
                        <div>
                          <label className="text-xs mb-1 block tracking-wide" style={{ color: 'rgba(0,229,255,0.6)' }}>Apellido *</label>
                          <input
                            required
                            value={form.lastName}
                            onChange={e => handleFieldChange('lastName', e.target.value)}
                            placeholder="García"
                            className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                            style={inputStyle}
                            onFocus={e => { e.currentTarget.style.border = '1px solid rgba(0,229,255,0.5)' }}
                            onBlur={e => { e.currentTarget.style.border = '1px solid rgba(0,229,255,0.2)' }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs mb-1 block tracking-wide" style={{ color: 'rgba(0,229,255,0.6)' }}>Empresa</label>
                        <input
                          value={form.company}
                          onChange={e => handleFieldChange('company', e.target.value)}
                          placeholder="Nombre de tu empresa"
                          className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                          style={inputStyle}
                          onFocus={e => { e.currentTarget.style.border = '1px solid rgba(0,229,255,0.5)' }}
                          onBlur={e => { e.currentTarget.style.border = '1px solid rgba(0,229,255,0.2)' }}
                        />
                      </div>

                      <div>
                        <label className="text-xs mb-1 block tracking-wide" style={{ color: 'rgba(0,229,255,0.6)' }}>Correo electrónico *</label>
                        <input
                          required
                          type="email"
                          value={form.email}
                          onChange={e => handleFieldChange('email', e.target.value)}
                          placeholder="correo@empresa.cl"
                          className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                          style={inputStyle}
                          onFocus={e => { e.currentTarget.style.border = '1px solid rgba(0,229,255,0.5)' }}
                          onBlur={e => { e.currentTarget.style.border = '1px solid rgba(0,229,255,0.2)' }}
                        />
                      </div>

                      <div>
                        <label className="text-xs mb-1 block tracking-wide" style={{ color: 'rgba(0,229,255,0.6)' }}>Teléfono</label>
                        <input
                          value={form.phone}
                          onChange={e => handleFieldChange('phone', e.target.value)}
                          placeholder="+56 9 XXXX XXXX"
                          className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                          style={inputStyle}
                          onFocus={e => { e.currentTarget.style.border = '1px solid rgba(0,229,255,0.5)' }}
                          onBlur={e => { e.currentTarget.style.border = '1px solid rgba(0,229,255,0.2)' }}
                        />
                      </div>

                      <div>
                        <label className="text-xs mb-1 block tracking-wide" style={{ color: 'rgba(0,229,255,0.6)' }}>Servicio de interés *</label>
                        <select
                          required
                          value={form.service}
                          onChange={e => handleFieldChange('service', e.target.value)}
                          className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                          style={inputStyle}
                          onFocus={e => { e.currentTarget.style.border = '1px solid rgba(0,229,255,0.5)' }}
                          onBlur={e => { e.currentTarget.style.border = '1px solid rgba(0,229,255,0.2)' }}
                        >
                          <option value="" style={{ background: '#000a0f' }}>Selecciona un servicio...</option>
                          {BOOKING_SERVICES.map(s => (
                            <option key={s} value={s} style={{ background: '#000a0f' }}>{s}</option>
                          ))}
                        </select>
                      </div>

                      {submitError && (
                        <div
                          className="rounded-lg px-4 py-3 text-sm"
                          style={{ background: 'rgba(240,0,255,0.08)', border: '1px solid rgba(240,0,255,0.3)', color: '#f000ff' }}
                        >
                          {submitError}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn-tron w-full py-3 rounded-xl text-sm font-bold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        style={{ color: '#000a0f' }}
                      >
                        {submitting ? (
                          <>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                            </svg>
                            Agendando...
                          </>
                        ) : 'Confirmar cita'}
                      </button>

                      <p className="text-xs text-center" style={{ color: 'rgba(224,247,255,0.3)' }}>
                        Recibirás confirmación por correo con el enlace de Google Meet
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-16 py-6 text-center" style={{ borderTop: '1px solid rgba(0,229,255,0.06)' }}>
        <p className="text-xs" style={{ color: 'rgba(61,112,128,0.6)' }}>
          © {new Date().getFullYear()} RIAVA System SpA · contacto@riava.cl
        </p>
      </footer>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
