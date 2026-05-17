'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { RiavaLogo } from '@/components/ui/RiavaLogo'
import { BOOKING_SERVICES } from '@/lib/constants'

type Slot = { id: string; date: string; startTime: string; endTime: string; booked: boolean }
type FormState = { name: string; lastName: string; company: string; email: string; phone: string; service: string }

const MONTHS_ES       = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const MONTHS_ES_LONG  = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
const DAYS_ES_SHORT   = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']
const DAYS_ES_LONG    = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo']

function isoDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}
function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate() }
function firstDayOfMonth(y: number, m: number) { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1 }
function toISODate(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
function fmtDate(d: string) {
  const [y, m, day] = d.split('-')
  return `${parseInt(day)} de ${MONTHS_ES_LONG[parseInt(m) - 1]} de ${y}`
}
function dayLongName(dateStr: string) {
  const dow = new Date(dateStr + 'T12:00:00').getDay()
  return DAYS_ES_LONG[dow === 0 ? 6 : dow - 1]
}

const HOLIDAYS_FIXED = new Set(['01-01','05-01','05-21','07-16','08-15','09-18','09-19','10-31','11-01','12-08','12-25'])
const HOLIDAYS_VARIABLE: Record<number, string[]> = {
  2025: ['2025-04-18','2025-04-19','2025-06-20','2025-10-13'],
  2026: ['2026-04-03','2026-04-04','2026-06-22','2026-10-12'],
}
function isHoliday(dateStr: string): boolean {
  const [y, mm, dd] = dateStr.split('-')
  if (HOLIDAYS_FIXED.has(`${mm}-${dd}`)) return true
  return (HOLIDAYS_VARIABLE[+y] ?? []).includes(dateStr)
}

const inputStyle = { background: 'rgba(0,20,30,0.8)', border: '1px solid rgba(0,229,255,0.2)', color: '#e0f7ff', caretColor: '#00e5ff' }

export default function AgendarPage() {
  const today = new Date()
  const todayStr = toISODate(today)

  const slotsPanelRef = useRef<HTMLDivElement>(null)

  const [viewYear, setViewYear]   = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [slots, setSlots]         = useState<Slot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  const [selectedDay,  setSelectedDay]  = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [form, setForm] = useState<FormState>({ name: '', lastName: '', company: '', email: '', phone: '', service: '' })
  const [submitting, setSubmitting]   = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess]         = useState(false)
  const [bookedAppt, setBookedAppt]   = useState<{ date: string; startTime: string; endTime: string; meetLink: string; service: string; name: string; lastName: string } | null>(null)

  const fromStr = isoDate(viewYear, viewMonth, 1)
  const toStr   = isoDate(viewYear, viewMonth, daysInMonth(viewYear, viewMonth))

  const fetchSlots = useCallback(async () => {
    setLoadingSlots(true)
    const res = await fetch(`/api/appointments/slots?from=${fromStr}&to=${toStr}`)
    if (res.ok) setSlots(await res.json())
    setLoadingSlots(false)
  }, [fromStr, toStr])

  useEffect(() => { fetchSlots() }, [fetchSlots])

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) } else setViewMonth(m => m - 1)
    setSelectedDay(null); setSelectedSlot(null)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) } else setViewMonth(m => m + 1)
    setSelectedDay(null); setSelectedSlot(null)
  }

  const slotsForDay   = (date: string) => slots.filter(s => s.date === date).sort((a, b) => a.startTime.localeCompare(b.startTime))
  const hasAvailable  = (date: string) => slots.some(s => s.date === date && !s.booked)

  const handleFieldChange = (field: keyof FormState, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSlot) return
    setSubmitting(true); setSubmitError('')
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
    setBookedAppt({ date: data.date, startTime: data.startTime, endTime: data.endTime, meetLink: data.meetLink, service: form.service, name: form.name, lastName: form.lastName })
    setSuccess(true)
    setSlots(prev => prev.map(s => s.id === selectedSlot.id ? { ...s, booked: true } : s))
  }

  // Calendar grid
  const totalDays   = daysInMonth(viewYear, viewMonth)
  const startOffset = firstDayOfMonth(viewYear, viewMonth)
  const cells: (number | null)[] = [...Array(startOffset).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)

  const daySlots = selectedDay ? slotsForDay(selectedDay) : []

  const resetBooking = () => {
    setSuccess(false); setSelectedSlot(null); setSelectedDay(null)
    setForm({ name: '', lastName: '', company: '', email: '', phone: '', service: '' })
    fetchSlots()
  }

  function googleCalendarUrl(appt: NonNullable<typeof bookedAppt>) {
    const dtStart = `${appt.date.replace(/-/g, '')}T${appt.startTime.replace(':', '')}00`
    const dtEnd   = `${appt.date.replace(/-/g, '')}T${appt.endTime.replace(':', '')}00`
    const text    = encodeURIComponent(`Reunión RIAVA · ${appt.service}`)
    const details = encodeURIComponent(`Reunión agendada con RIAVA System SpA\nServicio: ${appt.service}${appt.meetLink ? `\nMeet: ${appt.meetLink}` : ''}`)
    const location = appt.meetLink ? encodeURIComponent(appt.meetLink) : ''
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dtStart}/${dtEnd}&details=${details}&location=${location}&ctz=America%2FSantiago`
  }

  function downloadICS(appt: NonNullable<typeof bookedAppt>) {
    const dtStart = `${appt.date.replace(/-/g, '')}T${appt.startTime.replace(':', '')}00`
    const dtEnd   = `${appt.date.replace(/-/g, '')}T${appt.endTime.replace(':', '')}00`
    const uid     = `${Date.now()}@riava.cl`
    const desc    = [`Servicio: ${appt.service}`, appt.meetLink ? `Meet: ${appt.meetLink}` : ''].filter(Boolean).join('\\n')
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//RIAVA System SpA//RIAVA//ES',
      'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `DTSTART;TZID=America/Santiago:${dtStart}`,
      `DTEND;TZID=America/Santiago:${dtEnd}`,
      `SUMMARY:Reunión RIAVA · ${appt.service}`,
      `DESCRIPTION:${desc}`,
      appt.meetLink ? `LOCATION:${appt.meetLink}` : '',
      `UID:${uid}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM', 'TRIGGER:-PT30M', 'ACTION:DISPLAY',
      'DESCRIPTION:Recordatorio: Reunión RIAVA en 30 min', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR',
    ].filter(Boolean).join('\r\n')
    const blob = new Blob([ics], { type: 'text/calendar' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'cita-riava.ics'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen" style={{ background: '#000a0f' }}>
      <div className="tron-scene">
        <div className="tron-sky-glow" />
        <div className="tron-perspective-wrap"><div className="tron-grid-floor" /></div>
        <div className="tron-horizon-line" />
        <div className="tron-scanlines" />
        <div className="tron-vignette" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(0,229,255,0.08)' }}>
        <Link href="/"><RiavaLogo variant="full" className="h-6 w-auto max-w-[140px]" /></Link>
        <Link href="/" className="flex items-center gap-1.5 text-xs transition-colors" style={{ color: 'rgba(0,229,255,0.5)' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#00e5ff' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(0,229,255,0.5)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          Volver al sitio
        </Link>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <p className="text-xs tracking-widest uppercase font-semibold mb-3" style={{ color: 'rgba(0,229,255,0.5)' }}>RIAVA System SpA</p>
          <h1 className="text-3xl lg:text-4xl font-bold mb-3" style={{ color: '#e0f7ff' }}>
            Agenda una <span className="text-tron">reunión</span>
          </h1>
          <p className="text-sm max-w-xl mx-auto" style={{ color: 'rgba(224,247,255,0.5)' }}>
            Elige un día disponible, selecciona tu horario y completa el formulario.
          </p>
        </div>

        {/* Success */}
        {success && bookedAppt ? (
          <div className="max-w-lg mx-auto">
            <div className="glass-tron rounded-2xl p-8 text-center" style={{ border: '1px solid rgba(0,229,255,0.2)', boxShadow: '0 0 60px rgba(0,229,255,0.08)' }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.3)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: '#e0f7ff' }}>¡Cita agendada!</h2>
              <p className="text-sm mb-5" style={{ color: 'rgba(224,247,255,0.6)' }}>Te enviamos un correo de confirmación con todos los detalles.</p>
              <div className="rounded-xl p-4 mb-5 text-left" style={{ background: 'rgba(0,20,30,0.7)', border: '1px solid rgba(0,229,255,0.1)' }}>
                <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'rgba(0,229,255,0.5)' }}>Detalles</p>
                <p className="text-sm" style={{ color: '#e0f7ff' }}>📅 {fmtDate(bookedAppt.date)}</p>
                <p className="text-sm mt-1" style={{ color: '#e0f7ff' }}>🕐 {bookedAppt.startTime} – {bookedAppt.endTime}</p>
              </div>
              {bookedAppt.meetLink && (
                <a href={bookedAppt.meetLink} target="_blank" rel="noopener noreferrer"
                  className="btn-tron inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold mb-4" style={{ color: '#000a0f' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
                  Unirse a Google Meet
                </a>
              )}

              {/* Calendar buttons */}
              <div className="flex flex-col gap-2 mb-4">
                <a href={googleCalendarUrl(bookedAppt)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: 'rgba(0,229,255,0.07)', border: '1px solid rgba(0,229,255,0.2)', color: '#00e5ff' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  Agregar a Google Calendar
                </a>
                <button onClick={() => downloadICS(bookedAppt)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.12)', color: 'rgba(0,229,255,0.7)' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Descargar invitación (.ics)
                </button>
              </div>

              <button onClick={resetBooking} className="block w-full text-center text-xs mt-2 transition-colors"
                style={{ color: 'rgba(0,229,255,0.4)' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#00e5ff' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(0,229,255,0.4)' }}>
                Agendar otra reunión
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col xl:flex-row gap-6">
            {/* Monthly calendar */}
            <div className="flex-1">
              <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(0,10,15,0.85)', border: '1px solid rgba(0,229,255,0.12)' }}>
                {/* Month nav */}
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(0,229,255,0.08)' }}>
                  <button onClick={prevMonth} className="p-2 rounded-lg transition-all"
                    style={{ color: 'rgba(0,229,255,0.6)', border: '1px solid rgba(0,229,255,0.12)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#00e5ff'; e.currentTarget.style.borderColor = 'rgba(0,229,255,0.35)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(0,229,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(0,229,255,0.12)' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  <span className="text-base font-semibold" style={{ color: '#e0f7ff' }}>{MONTHS_ES[viewMonth]} {viewYear}</span>
                  <button onClick={nextMonth} className="p-2 rounded-lg transition-all"
                    style={{ color: 'rgba(0,229,255,0.6)', border: '1px solid rgba(0,229,255,0.12)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#00e5ff'; e.currentTarget.style.borderColor = 'rgba(0,229,255,0.35)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(0,229,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(0,229,255,0.12)' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 px-2 sm:px-4 pt-4 pb-1">
                  {DAYS_ES_SHORT.map(d => (
                    <div key={d} className="text-center text-xs font-semibold uppercase pb-2" style={{ color: 'rgba(0,229,255,0.4)' }}>{d}</div>
                  ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-7 gap-1 px-2 sm:px-4 pb-5">
                  {cells.map((day, idx) => {
                    if (day === null) return <div key={idx} />
                    const dateStr  = isoDate(viewYear, viewMonth, day)
                    const isToday  = dateStr === todayStr
                    const isSelected = selectedDay === dateStr
                    const isPast   = dateStr < todayStr
                    const holiday  = isHoliday(dateStr)
                    const avail    = hasAvailable(dateStr)
                    const clickable = !isPast && !holiday && avail

                    return (
                      <button key={idx}
                        onClick={() => {
                          if (!clickable) return
                          const selecting = !isSelected
                          setSelectedDay(selecting ? dateStr : null)
                          setSelectedSlot(null)
                          setSubmitError('')
                          if (selecting) {
                            fetchSlots()
                            if (window.innerWidth < 1280) {
                              setTimeout(() => slotsPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
                            }
                          }
                        }}
                        disabled={!clickable}
                        className="relative flex flex-col items-center justify-start rounded-xl pt-2 pb-1.5 transition-all"
                        style={{
                          minHeight: 56,
                          background: isSelected ? 'rgba(0,229,255,0.12)' : holiday ? 'rgba(255,60,60,0.06)' : isToday ? 'rgba(0,229,255,0.05)' : 'transparent',
                          border: isSelected ? '1px solid rgba(0,229,255,0.4)' : holiday ? '1px solid rgba(255,60,60,0.3)' : isToday ? '1px solid rgba(0,229,255,0.2)' : '1px solid transparent',
                          opacity: isPast ? 0.3 : !avail && !holiday ? 0.4 : 1,
                          cursor: clickable ? 'pointer' : 'default',
                        }}>
                        <span className="text-sm font-medium" style={{ color: isSelected ? '#00e5ff' : holiday ? '#ff5555' : isToday ? '#00e5ff' : '#e0f7ff' }}>
                          {day}
                        </span>
                        <div className="flex gap-0.5 mt-1">
                          {holiday && <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#ff5555' }} />}
                          {!holiday && avail && <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#00e5ff' }} />}
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 px-6 pb-4 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(0,229,255,0.5)' }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: '#00e5ff' }} />Disponible
                  </div>
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,85,85,0.7)' }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: '#ff5555' }} />Feriado
                  </div>
                </div>
              </div>
            </div>

            {/* Right panel */}
            <div className="xl:w-96" ref={slotsPanelRef}>
              <div className="glass-tron rounded-2xl overflow-hidden min-h-64"
                style={{ border: '1px solid rgba(0,229,255,0.15)', boxShadow: '0 0 40px rgba(0,229,255,0.06)' }}>

                {/* No day selected */}
                {!selectedDay && (
                  <div className="flex flex-col items-center justify-center px-6 py-16 text-center gap-3">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(0,229,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <p className="text-sm" style={{ color: 'rgba(224,247,255,0.35)' }}>
                      Selecciona un día disponible en el calendario
                    </p>
                  </div>
                )}

                {/* Day selected — pick slot */}
                {selectedDay && !selectedSlot && (
                  <>
                    <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(0,229,255,0.1)', background: 'rgba(0,229,255,0.04)' }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold tracking-widest uppercase mb-0.5" style={{ color: 'rgba(0,229,255,0.5)' }}>Horarios disponibles</p>
                          <p className="text-sm font-bold" style={{ color: '#00e5ff' }}>{dayLongName(selectedDay)}, {fmtDate(selectedDay)}</p>
                        </div>
                        <button onClick={() => { setSelectedDay(null); setSelectedSlot(null) }}
                          style={{ color: 'rgba(0,229,255,0.4)' }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#00e5ff' }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(0,229,255,0.4)' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                    </div>
                    <div className="p-4 flex flex-col gap-2">
                      {loadingSlots ? (
                        <div className="py-8 text-center text-sm" style={{ color: 'rgba(0,229,255,0.4)' }}>Cargando...</div>
                      ) : daySlots.length === 0 || daySlots.every(s => s.booked) ? (
                        <div className="py-8 text-center">
                          <p className="text-sm" style={{ color: 'rgba(224,247,255,0.35)' }}>Sin horarios disponibles para este día</p>
                        </div>
                      ) : daySlots.map(slot => slot.booked ? (
                        <div key={slot.id}
                          className="w-full rounded-xl px-4 py-3 text-sm font-medium flex items-center justify-between"
                          style={{ background: 'rgba(255,60,60,0.05)', border: '1px solid rgba(255,60,60,0.2)', cursor: 'default' }}>
                          <span style={{ color: 'rgba(224,247,255,0.35)' }}>{slot.startTime} – {slot.endTime}</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,60,60,0.15)', color: '#ff5555', border: '1px solid rgba(255,60,60,0.3)' }}>
                            No disponible
                          </span>
                        </div>
                      ) : (
                        <button key={slot.id}
                          onClick={() => { setSelectedSlot(slot); setSubmitError('') }}
                          className="w-full rounded-xl px-4 py-3 text-sm font-medium flex items-center justify-between transition-all"
                          style={{ background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.15)', color: 'rgba(0,229,255,0.8)' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,229,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(0,229,255,0.35)'; e.currentTarget.style.color = '#00e5ff' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,229,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(0,229,255,0.15)'; e.currentTarget.style.color = 'rgba(0,229,255,0.8)' }}>
                          <span>{slot.startTime} – {slot.endTime}</span>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* Slot selected — booking form */}
                {selectedDay && selectedSlot && (
                  <>
                    <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(0,229,255,0.1)', background: 'rgba(0,229,255,0.04)' }}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'rgba(0,229,255,0.5)' }}>Horario seleccionado</p>
                          <p className="text-sm font-bold" style={{ color: '#00e5ff' }}>{dayLongName(selectedSlot.date)}, {fmtDate(selectedSlot.date)}</p>
                          <p className="text-sm" style={{ color: 'rgba(0,229,255,0.7)' }}>{selectedSlot.startTime} – {selectedSlot.endTime}</p>
                        </div>
                        <button onClick={() => setSelectedSlot(null)} style={{ color: 'rgba(0,229,255,0.4)', marginTop: 2 }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#00e5ff' }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(0,229,255,0.4)' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs mb-1 block tracking-wide" style={{ color: 'rgba(0,229,255,0.6)' }}>Nombre *</label>
                          <input required value={form.name} onChange={e => handleFieldChange('name', e.target.value)} placeholder="Ricardo"
                            className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle}
                            onFocus={e => { e.currentTarget.style.border = '1px solid rgba(0,229,255,0.5)' }}
                            onBlur={e => { e.currentTarget.style.border = '1px solid rgba(0,229,255,0.2)' }} />
                        </div>
                        <div>
                          <label className="text-xs mb-1 block tracking-wide" style={{ color: 'rgba(0,229,255,0.6)' }}>Apellido *</label>
                          <input required value={form.lastName} onChange={e => handleFieldChange('lastName', e.target.value)} placeholder="García"
                            className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle}
                            onFocus={e => { e.currentTarget.style.border = '1px solid rgba(0,229,255,0.5)' }}
                            onBlur={e => { e.currentTarget.style.border = '1px solid rgba(0,229,255,0.2)' }} />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs mb-1 block tracking-wide" style={{ color: 'rgba(0,229,255,0.6)' }}>Empresa</label>
                        <input value={form.company} onChange={e => handleFieldChange('company', e.target.value)} placeholder="Tu empresa"
                          className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle}
                          onFocus={e => { e.currentTarget.style.border = '1px solid rgba(0,229,255,0.5)' }}
                          onBlur={e => { e.currentTarget.style.border = '1px solid rgba(0,229,255,0.2)' }} />
                      </div>

                      <div>
                        <label className="text-xs mb-1 block tracking-wide" style={{ color: 'rgba(0,229,255,0.6)' }}>Correo electrónico *</label>
                        <input required type="email" value={form.email} onChange={e => handleFieldChange('email', e.target.value)} placeholder="correo@empresa.cl"
                          className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle}
                          onFocus={e => { e.currentTarget.style.border = '1px solid rgba(0,229,255,0.5)' }}
                          onBlur={e => { e.currentTarget.style.border = '1px solid rgba(0,229,255,0.2)' }} />
                      </div>

                      <div>
                        <label className="text-xs mb-1 block tracking-wide" style={{ color: 'rgba(0,229,255,0.6)' }}>Teléfono</label>
                        <input value={form.phone} onChange={e => handleFieldChange('phone', e.target.value)} placeholder="+56 9 XXXX XXXX"
                          className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle}
                          onFocus={e => { e.currentTarget.style.border = '1px solid rgba(0,229,255,0.5)' }}
                          onBlur={e => { e.currentTarget.style.border = '1px solid rgba(0,229,255,0.2)' }} />
                      </div>

                      <div>
                        <label className="text-xs mb-1 block tracking-wide" style={{ color: 'rgba(0,229,255,0.6)' }}>Servicio de interés *</label>
                        <select required value={form.service} onChange={e => handleFieldChange('service', e.target.value)}
                          className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle}
                          onFocus={e => { e.currentTarget.style.border = '1px solid rgba(0,229,255,0.5)' }}
                          onBlur={e => { e.currentTarget.style.border = '1px solid rgba(0,229,255,0.2)' }}>
                          <option value="" style={{ background: '#000a0f' }}>Selecciona un servicio...</option>
                          {BOOKING_SERVICES.map(s => <option key={s} value={s} style={{ background: '#000a0f' }}>{s}</option>)}
                        </select>
                      </div>

                      {submitError && (
                        <div className="rounded-lg px-4 py-3 text-sm" style={{ background: 'rgba(240,0,255,0.08)', border: '1px solid rgba(240,0,255,0.3)', color: '#f000ff' }}>
                          {submitError}
                        </div>
                      )}

                      <button type="submit" disabled={submitting}
                        className="btn-tron w-full py-3 rounded-xl text-sm font-bold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        style={{ color: '#000a0f' }}>
                        {submitting ? (
                          <>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                              style={{ animation: 'spin 1s linear infinite' }}>
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

      <footer className="relative z-10 mt-16 py-6 text-center" style={{ borderTop: '1px solid rgba(0,229,255,0.06)' }}>
        <p className="text-xs" style={{ color: 'rgba(61,112,128,0.6)' }}>© {new Date().getFullYear()} RIAVA System SpA · contacto@riava.cl</p>
      </footer>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
