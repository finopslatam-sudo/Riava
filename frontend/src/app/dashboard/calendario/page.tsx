'use client'

import { useState, useEffect, useCallback } from 'react'
import { BOOKING_SERVICES } from '@/lib/constants'

type Slot = {
  id: string; date: string; startTime: string; endTime: string
  booked: boolean; appointmentId?: string
}
type Appointment = {
  id: string; date: string; startTime: string; endTime: string
  name: string; lastName: string; company: string; email: string
  phone: string; service: string; meetLink: string
}

const DAYS_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const TIME_OPTIONS: string[] = []
for (let h = 7; h <= 21; h++) {
  TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:00`)
  TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:30`)
}

// ── Chilean holidays ──────────────────────────────────────────────────────────
const HOLIDAYS_FIXED = new Set([
  '01-01','05-01','05-21','07-16','08-15','09-18','09-19','10-31','11-01','12-08','12-25',
])
const HOLIDAYS_VARIABLE: Record<number, string[]> = {
  2025: ['2025-04-18','2025-04-19','2025-06-20','2025-10-13'],
  2026: ['2026-04-03','2026-04-04','2026-06-22','2026-10-12'],
}
const HOLIDAY_NAMES: Record<string, string> = {
  '01-01':'Año Nuevo','05-01':'Día del Trabajo','05-21':'Glorias Navales',
  '07-16':'Virgen del Carmen','08-15':'Asunción de la Virgen',
  '09-18':'Fiestas Patrias','09-19':'Glorias del Ejército',
  '10-31':'Iglesias Evangélicas','11-01':'Todos los Santos',
  '12-08':'Inmaculada Concepción','12-25':'Navidad',
  '2025-04-18':'Viernes Santo','2025-04-19':'Sábado Santo',
  '2025-06-20':'Pueblos Indígenas','2025-10-13':'Encuentro de Dos Mundos',
  '2026-04-03':'Viernes Santo','2026-04-04':'Sábado Santo',
  '2026-06-22':'Pueblos Indígenas','2026-10-12':'Encuentro de Dos Mundos',
}
function isHoliday(dateStr: string): boolean {
  const [y, mm, dd] = dateStr.split('-')
  if (HOLIDAYS_FIXED.has(`${mm}-${dd}`)) return true
  return (HOLIDAYS_VARIABLE[+y] ?? []).includes(dateStr)
}
function holidayName(dateStr: string): string {
  const [, mm, dd] = dateStr.split('-')
  return HOLIDAY_NAMES[`${mm}-${dd}`] ?? HOLIDAY_NAMES[dateStr] ?? 'Feriado'
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function addThirtyMinutes(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + 30
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}
function generateSlotsInRange(start: string, end: string) {
  const result: { startTime: string; endTime: string }[] = []
  let cur = start
  while (true) {
    const next = addThirtyMinutes(cur)
    if (next > end) break
    result.push({ startTime: cur, endTime: next })
    cur = next
  }
  return result
}
function isoDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}
function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate() }
function firstDayOfMonth(y: number, m: number) {
  const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1
}
function getWeekMonFri(dateStr: string): string[] {
  const d = new Date(dateStr + 'T12:00:00')
  const day = d.getDay()
  const monday = new Date(d)
  monday.setDate(d.getDate() + (day === 0 ? -6 : 1 - day))
  return Array.from({ length: 5 }, (_, i) => {
    const dd = new Date(monday); dd.setDate(monday.getDate() + i)
    return isoDate(dd.getFullYear(), dd.getMonth(), dd.getDate())
  })
}
function getSaturdaysInMonth(y: number, m: number): string[] {
  return Array.from({ length: daysInMonth(y, m) }, (_, i) => i + 1)
    .filter(d => new Date(y, m, d).getDay() === 6)
    .map(d => isoDate(y, m, d))
}
function getMonFriAllMonth(y: number, m: number): string[] {
  return Array.from({ length: daysInMonth(y, m) }, (_, i) => i + 1)
    .filter(d => { const dow = new Date(y, m, d).getDay(); return dow >= 1 && dow <= 5 })
    .map(d => isoDate(y, m, d))
}

const inputStyle = { background: 'rgba(0,20,30,0.7)', border: '1px solid rgba(0,229,255,0.18)', color: '#e0f7ff' }

export default function CalendarioPage() {
  const today = new Date()
  const todayStr = isoDate(today.getFullYear(), today.getMonth(), today.getDate())

  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)

  // Add slot form
  const [newStart, setNewStart] = useState('09:00')
  const [newEnd, setNewEnd] = useState('12:00')
  const [addError, setAddError] = useState('')
  const [addLoading, setAddLoading] = useState(false)

  // Edit slot
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null)
  const [editStart, setEditStart] = useState('09:00')
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')

  // Lunch block
  const [lunchStart, setLunchStart] = useState('13:00')
  const [lunchEnd, setLunchEnd] = useState('14:00')
  const [lunchLoading, setLunchLoading] = useState(false)
  const [lunchMsg, setLunchMsg] = useState('')

  // Block full day
  const [blockDayLoading, setBlockDayLoading] = useState(false)
  const [blockDayMsg, setBlockDayMsg] = useState('')
  const [blockDayConfirm, setBlockDayConfirm] = useState(false)

  // Repeat
  const [repeatMonFriWeekLoading, setRepeatMonFriWeekLoading] = useState(false)
  const [repeatMonFriMonthLoading, setRepeatMonFriMonthLoading] = useState(false)
  const [repeatSatLoading, setRepeatSatLoading] = useState(false)
  const [repeatMsg, setRepeatMsg] = useState('')

  const fetchSlots = useCallback(async () => {
    setLoading(true)
    const from = isoDate(viewYear, viewMonth, 1)
    const to   = isoDate(viewYear, viewMonth, daysInMonth(viewYear, viewMonth))
    const res = await fetch(`/api/appointments/slots?from=${from}&to=${to}`)
    if (res.ok) setSlots(await res.json())
    setLoading(false)
  }, [viewYear, viewMonth])

  const fetchAppointments = useCallback(async (date: string) => {
    const res = await fetch(`/api/appointments?date=${date}`)
    if (res.ok) setAppointments(await res.json())
  }, [])

  useEffect(() => { fetchSlots() }, [fetchSlots])
  useEffect(() => {
    const id = setInterval(fetchSlots, 60000)
    return () => clearInterval(id)
  }, [fetchSlots])
  useEffect(() => {
    if (selectedDate) fetchAppointments(selectedDate); else setAppointments([])
  }, [selectedDate, fetchAppointments])

  const slotsForDate = (date: string) => slots.filter(s => s.date === date)
  const hasAvailable = (date: string) => slots.some(s => s.date === date && !s.booked)
  const hasBooked    = (date: string) => slots.some(s => s.date === date && s.booked)

  const previewSlots = generateSlotsInRange(newStart, newEnd)

  const addSlots = async () => {
    if (!selectedDate) return
    setAddError('')
    if (previewSlots.length === 0) { setAddError('El horario de fin debe ser al menos 30 min después del inicio.'); return }
    setAddLoading(true)
    let created = 0
    for (const s of previewSlots) {
      const res = await fetch('/api/appointments/slots', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, startTime: s.startTime, endTime: s.endTime }),
      })
      if (res.ok) { const data = await res.json(); setSlots(prev => [...prev, data]); created++ }
    }
    setAddLoading(false)
    if (created === 0) setAddError('No se pudo crear ningún horario (quizás ya existen).')
  }

  const startEdit = (slot: Slot) => { setEditingSlotId(slot.id); setEditStart(slot.startTime); setEditError('') }

  const saveEdit = async (slotId: string) => {
    setEditLoading(true); setEditError('')
    const res = await fetch(`/api/appointments/slots/${slotId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startTime: editStart, endTime: addThirtyMinutes(editStart) }),
    })
    const data = await res.json()
    setEditLoading(false)
    if (!res.ok) { setEditError(data.error ?? 'Error al guardar'); return }
    setSlots(prev => prev.map(s => s.id === slotId ? { ...s, startTime: data.startTime, endTime: data.endTime } : s))
    setEditingSlotId(null)
  }

  const deleteSlot = async (id: string) => {
    const res = await fetch(`/api/appointments/slots/${id}`, { method: 'DELETE' })
    if (res.ok) setSlots(prev => prev.filter(s => s.id !== id))
  }

  const blockDay = async () => {
    if (!selectedDate) return
    setBlockDayLoading(true); setBlockDayMsg(''); setBlockDayConfirm(false)
    const toDelete = slotsForDate(selectedDate).filter(s => !s.booked)
    let deleted = 0
    for (const slot of toDelete) {
      const res = await fetch(`/api/appointments/slots/${slot.id}`, { method: 'DELETE' })
      if (res.ok) { setSlots(prev => prev.filter(s => s.id !== slot.id)); deleted++ }
    }
    setBlockDayLoading(false)
    if (deleted === 0) setBlockDayMsg('No hay horarios libres para eliminar.')
    else setBlockDayMsg(`✓ ${deleted} horario${deleted !== 1 ? 's' : ''} eliminado${deleted !== 1 ? 's' : ''} · día bloqueado`)
    setTimeout(() => setBlockDayMsg(''), 4000)
  }

  const blockLunchSlots = async (scope: 'day' | 'month') => {
    if (!selectedDate) return
    setLunchLoading(true); setLunchMsg('')
    let targets: string[]
    if (scope === 'day') {
      targets = [selectedDate]
    } else {
      targets = getMonFriAllMonth(viewYear, viewMonth)
    }
    let deleted = 0
    for (const date of targets) {
      const toDelete = slotsForDate(date).filter(
        s => !s.booked && s.startTime >= lunchStart && s.startTime < lunchEnd
      )
      for (const slot of toDelete) {
        const res = await fetch(`/api/appointments/slots/${slot.id}`, { method: 'DELETE' })
        if (res.ok) { setSlots(prev => prev.filter(s => s.id !== slot.id)); deleted++ }
      }
    }
    setLunchLoading(false)
    if (deleted === 0) setLunchMsg('No hay horarios en ese rango para eliminar.')
    else setLunchMsg(`✓ ${deleted} horario${deleted !== 1 ? 's' : ''} eliminado${deleted !== 1 ? 's' : ''}`)
    setTimeout(() => setLunchMsg(''), 3000)
  }

  async function postSlotsToDate(date: string, daySlots: Slot[]): Promise<number> {
    let created = 0
    for (const slot of daySlots) {
      try {
        const res = await fetch('/api/appointments/slots', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date, startTime: slot.startTime, endTime: slot.endTime }),
          signal: AbortSignal.timeout(8000),
        })
        if (res.ok) created++
      } catch { /* slot ya existe o timeout — continuar */ }
    }
    return created
  }

  const repeatMonFriWeek = async () => {
    if (!selectedDate) return
    const daySlots = slotsForDate(selectedDate).filter(s => !s.booked)
    if (daySlots.length === 0) { setRepeatMsg('Sin horarios disponibles para repetir.'); setTimeout(() => setRepeatMsg(''), 3000); return }
    setRepeatMonFriWeekLoading(true)
    setRepeatMsg('')
    try {
      const targets = getWeekMonFri(selectedDate).filter(d => d !== selectedDate)
      let created = 0
      for (const date of targets) created += await postSlotsToDate(date, daySlots)
      await fetchSlots()
      setRepeatMsg(`✓ ${created} horario${created !== 1 ? 's' : ''} creado${created !== 1 ? 's' : ''} (Lun–Vie semana)`)
      setTimeout(() => setRepeatMsg(''), 4000)
    } catch {
      setRepeatMsg('Error al repetir horarios. Intenta nuevamente.')
      setTimeout(() => setRepeatMsg(''), 4000)
    } finally {
      setRepeatMonFriWeekLoading(false)
    }
  }

  const repeatMonFriMonth = async () => {
    if (!selectedDate) return
    const daySlots = slotsForDate(selectedDate).filter(s => !s.booked)
    if (daySlots.length === 0) { setRepeatMsg('Sin horarios disponibles para repetir.'); setTimeout(() => setRepeatMsg(''), 3000); return }
    setRepeatMonFriMonthLoading(true)
    setRepeatMsg('')
    try {
      const targets = getMonFriAllMonth(viewYear, viewMonth).filter(d => d !== selectedDate)
      let created = 0
      for (const date of targets) created += await postSlotsToDate(date, daySlots)
      await fetchSlots()
      setRepeatMsg(`✓ ${created} horario${created !== 1 ? 's' : ''} creado${created !== 1 ? 's' : ''} (Lun–Vie ${MONTHS_ES[viewMonth]})`)
      setTimeout(() => setRepeatMsg(''), 4000)
    } catch {
      setRepeatMsg('Error al repetir horarios. Intenta nuevamente.')
      setTimeout(() => setRepeatMsg(''), 4000)
    } finally {
      setRepeatMonFriMonthLoading(false)
    }
  }

  const repeatSaturdays = async () => {
    if (!selectedDate) return
    const daySlots = slotsForDate(selectedDate).filter(s => !s.booked)
    if (daySlots.length === 0) { setRepeatMsg('Sin horarios disponibles para repetir.'); setTimeout(() => setRepeatMsg(''), 3000); return }
    setRepeatSatLoading(true)
    setRepeatMsg('')
    try {
      const targets = getSaturdaysInMonth(viewYear, viewMonth).filter(d => d !== selectedDate)
      let created = 0
      for (const date of targets) created += await postSlotsToDate(date, daySlots)
      await fetchSlots()
      setRepeatMsg(`✓ ${created} horario${created !== 1 ? 's' : ''} creado${created !== 1 ? 's' : ''} (Sábados de ${MONTHS_ES[viewMonth]})`)
      setTimeout(() => setRepeatMsg(''), 4000)
    } catch {
      setRepeatMsg('Error al repetir horarios. Intenta nuevamente.')
      setTimeout(() => setRepeatMsg(''), 4000)
    } finally {
      setRepeatSatLoading(false)
    }
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) } else setViewMonth(m => m - 1)
    setSelectedDate(null); setBlockDayConfirm(false)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) } else setViewMonth(m => m + 1)
    setSelectedDate(null); setBlockDayConfirm(false)
  }

  const totalDays = daysInMonth(viewYear, viewMonth)
  const startOffset = firstDayOfMonth(viewYear, viewMonth)
  const cells: (number | null)[] = [...Array(startOffset).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)

  const selectedSlots = selectedDate ? slotsForDate(selectedDate) : []
  const selectedApptsMap = Object.fromEntries(appointments.map(a => [a.id, a]))
  const hasRepeatableSlots = selectedSlots.some(s => !s.booked)
  const anyRepeatLoading = repeatMonFriWeekLoading || repeatMonFriMonthLoading || repeatSatLoading

  return (
    <div className="p-4 lg:p-8 min-h-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#e0f7ff' }}>Calendario de citas</h1>
        <p className="text-sm mt-0.5" style={{ color: 'rgba(0,229,255,0.5)' }}>Gestiona tu disponibilidad y revisa las citas agendadas</p>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Calendar */}
        <div className="flex-1 rounded-2xl overflow-hidden" style={{ background: 'rgba(0,10,15,0.85)', border: '1px solid rgba(0,229,255,0.12)' }}>
          {/* Month nav */}
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(0,229,255,0.08)' }}>
            <button onClick={prevMonth} className="p-2 rounded-lg transition-all"
              style={{ color: 'rgba(0,229,255,0.6)', border: '1px solid rgba(0,229,255,0.12)' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#00e5ff'; e.currentTarget.style.borderColor = 'rgba(0,229,255,0.35)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(0,229,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(0,229,255,0.12)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <h2 className="text-base font-semibold" style={{ color: '#e0f7ff' }}>{MONTHS_ES[viewMonth]} {viewYear}</h2>
            <button onClick={nextMonth} className="p-2 rounded-lg transition-all"
              style={{ color: 'rgba(0,229,255,0.6)', border: '1px solid rgba(0,229,255,0.12)' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#00e5ff'; e.currentTarget.style.borderColor = 'rgba(0,229,255,0.35)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(0,229,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(0,229,255,0.12)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 px-4 pt-4 pb-1">
            {DAYS_ES.map(d => (
              <div key={d} className="text-center text-xs font-semibold tracking-wide uppercase pb-2" style={{ color: 'rgba(0,229,255,0.4)' }}>{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1 px-4 pb-5">
            {loading && cells.length === 0 ? (
              <div className="col-span-7 py-8 text-center text-sm" style={{ color: 'rgba(0,229,255,0.4)' }}>Cargando...</div>
            ) : cells.map((day, idx) => {
              if (day === null) return <div key={idx} />
              const dateStr = isoDate(viewYear, viewMonth, day)
              const isToday = dateStr === todayStr
              const isSelected = selectedDate === dateStr
              const avail = hasAvailable(dateStr)
              const booked = hasBooked(dateStr)
              const isPast = dateStr < todayStr
              const holiday = isHoliday(dateStr)

              return (
                <button
                  key={idx}
                  onClick={() => { setSelectedDate(isSelected ? null : dateStr); setBlockDayConfirm(false) }}
                  title={holiday ? holidayName(dateStr) : undefined}
                  className="relative flex flex-col items-center justify-start rounded-xl pt-2 pb-1.5 transition-all"
                  style={{
                    minHeight: 56,
                    background: isSelected ? 'rgba(0,229,255,0.12)' : holiday ? 'rgba(255,170,0,0.05)' : isToday ? 'rgba(0,229,255,0.05)' : 'transparent',
                    border: isSelected ? '1px solid rgba(0,229,255,0.4)' : holiday ? '1px solid rgba(255,170,0,0.25)' : isToday ? '1px solid rgba(0,229,255,0.2)' : '1px solid transparent',
                    opacity: isPast ? 0.4 : 1,
                  }}
                >
                  <span className="text-sm font-medium" style={{ color: isSelected ? '#00e5ff' : holiday ? '#ffaa00' : isToday ? '#00e5ff' : '#e0f7ff' }}>
                    {day}
                  </span>
                  <div className="flex gap-0.5 mt-1">
                    {holiday && <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#ffaa00' }} />}
                    {avail && <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#00e5ff' }} />}
                    {booked && <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#f000ff' }} />}
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
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(240,0,255,0.5)' }}>
              <span className="w-2 h-2 rounded-full" style={{ background: '#f000ff' }} />Con cita
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,170,0,0.6)' }}>
              <span className="w-2 h-2 rounded-full" style={{ background: '#ffaa00' }} />Feriado
            </div>
          </div>
        </div>

        {/* Day panel */}
        <div className="xl:w-96 rounded-2xl overflow-hidden flex flex-col"
          style={{ background: 'rgba(0,10,15,0.85)', border: '1px solid rgba(0,229,255,0.12)', minHeight: 480 }}>
          {!selectedDate ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center gap-3">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(0,229,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <p className="text-sm" style={{ color: 'rgba(224,247,255,0.3)' }}>Selecciona un día para gestionar sus horarios</p>
            </div>
          ) : (
            <>
              {/* Panel header */}
              <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(0,229,255,0.08)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: '#e0f7ff' }}>
                      {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </h3>
                    {isHoliday(selectedDate) && (
                      <p className="text-xs mt-0.5" style={{ color: '#ffaa00' }}>🎌 {holidayName(selectedDate)}</p>
                    )}
                  </div>
                  <button onClick={() => setSelectedDate(null)}
                    style={{ color: 'rgba(0,229,255,0.4)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#00e5ff' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(0,229,255,0.4)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">

                {/* ── Add slots ── */}
                <div>
                  <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'rgba(0,229,255,0.5)' }}>Agregar horarios disponibles</p>
                  <div className="flex gap-2 mb-2">
                    <div className="flex-1">
                      <label className="text-xs mb-1 block" style={{ color: 'rgba(0,229,255,0.4)' }}>Desde</label>
                      <select value={newStart} onChange={e => setNewStart(e.target.value)}
                        className="w-full rounded-lg px-2 py-1.5 text-sm outline-none" style={inputStyle}>
                        {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs mb-1 block" style={{ color: 'rgba(0,229,255,0.4)' }}>Hasta</label>
                      <select value={newEnd} onChange={e => setNewEnd(e.target.value)}
                        className="w-full rounded-lg px-2 py-1.5 text-sm outline-none" style={inputStyle}>
                        {TIME_OPTIONS.filter(t => t > newStart).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  {previewSlots.length > 0 ? (
                    <div className="rounded-lg px-3 py-2 mb-2 flex items-center gap-2"
                      style={{ background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.12)' }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      <p className="text-xs" style={{ color: 'rgba(0,229,255,0.7)' }}>
                        Se crearán <strong style={{ color: '#00e5ff' }}>{previewSlots.length} horarios</strong> de 30 min
                        {' '}({previewSlots[0].startTime} → {previewSlots[previewSlots.length - 1].endTime})
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs mb-2" style={{ color: 'rgba(240,0,255,0.6)' }}>El horario de fin debe ser al menos 30 min después del inicio.</p>
                  )}
                  {addError && <p className="text-xs mb-2" style={{ color: '#f000ff' }}>{addError}</p>}
                  <button onClick={addSlots} disabled={addLoading || previewSlots.length === 0}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                    style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.25)', color: '#00e5ff' }}
                    onMouseEnter={e => { if (!addLoading) e.currentTarget.style.background = 'rgba(0,229,255,0.14)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,229,255,0.08)' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    {addLoading ? 'Guardando...' : `Agregar ${previewSlots.length > 0 ? previewSlots.length + ' horario' + (previewSlots.length !== 1 ? 's' : '') : 'horarios'}`}
                  </button>
                </div>

                {/* ── Block full day ── */}
                <div style={{ borderTop: '1px solid rgba(0,229,255,0.07)', paddingTop: 16 }}>
                  <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'rgba(240,0,255,0.6)' }}>Bloquear día completo</p>
                  <p className="text-xs mb-3" style={{ color: 'rgba(224,247,255,0.35)' }}>
                    Elimina todos los horarios libres de este día. Los horarios con cita no se verán afectados.
                  </p>
                  {blockDayMsg && (
                    <p className="text-xs mb-2" style={{ color: blockDayMsg.startsWith('✓') ? '#00e5ff' : '#f000ff' }}>{blockDayMsg}</p>
                  )}
                  {!blockDayConfirm ? (
                    <button
                      onClick={() => setBlockDayConfirm(true)}
                      disabled={blockDayLoading || slotsForDate(selectedDate).filter(s => !s.booked).length === 0}
                      className="w-full py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-40"
                      style={{ background: 'rgba(240,0,255,0.06)', border: '1px solid rgba(240,0,255,0.25)', color: 'rgba(240,0,255,0.8)' }}
                      onMouseEnter={e => { if (!blockDayLoading) e.currentTarget.style.background = 'rgba(240,0,255,0.12)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(240,0,255,0.06)' }}>
                      {slotsForDate(selectedDate).filter(s => !s.booked).length === 0
                        ? 'Sin horarios libres'
                        : `Bloquear día · ${slotsForDate(selectedDate).filter(s => !s.booked).length} horario${slotsForDate(selectedDate).filter(s => !s.booked).length !== 1 ? 's' : ''} libre${slotsForDate(selectedDate).filter(s => !s.booked).length !== 1 ? 's' : ''}`}
                    </button>
                  ) : (
                    <div className="rounded-xl p-3" style={{ background: 'rgba(240,0,255,0.05)', border: '1px solid rgba(240,0,255,0.2)' }}>
                      <p className="text-xs mb-3" style={{ color: 'rgba(240,0,255,0.9)' }}>
                        ¿Confirmas que deseas eliminar todos los horarios libres de este día?
                      </p>
                      <div className="flex gap-2">
                        <button onClick={blockDay} disabled={blockDayLoading}
                          className="flex-1 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50"
                          style={{ background: 'rgba(240,0,255,0.2)', border: '1px solid rgba(240,0,255,0.4)', color: '#f000ff' }}>
                          {blockDayLoading ? 'Eliminando...' : 'Sí, bloquear'}
                        </button>
                        <button onClick={() => setBlockDayConfirm(false)}
                          className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
                          style={{ background: 'transparent', border: '1px solid rgba(224,247,255,0.1)', color: 'rgba(224,247,255,0.4)' }}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Lunch block ── */}
                <div style={{ borderTop: '1px solid rgba(0,229,255,0.07)', paddingTop: 16 }}>
                  <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'rgba(255,170,0,0.6)' }}>Bloquear almuerzo</p>
                  <div className="flex gap-2 mb-2">
                    <div className="flex-1">
                      <label className="text-xs mb-1 block" style={{ color: 'rgba(0,229,255,0.4)' }}>Desde</label>
                      <select value={lunchStart} onChange={e => setLunchStart(e.target.value)}
                        className="w-full rounded-lg px-2 py-1.5 text-sm outline-none" style={inputStyle}>
                        {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs mb-1 block" style={{ color: 'rgba(0,229,255,0.4)' }}>Hasta</label>
                      <select value={lunchEnd} onChange={e => setLunchEnd(e.target.value)}
                        className="w-full rounded-lg px-2 py-1.5 text-sm outline-none" style={inputStyle}>
                        {TIME_OPTIONS.filter(t => t > lunchStart).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  {lunchMsg && (
                    <p className="text-xs mb-2" style={{ color: lunchMsg.startsWith('✓') ? '#00e5ff' : '#f000ff' }}>{lunchMsg}</p>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => blockLunchSlots('day')} disabled={lunchLoading}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                      style={{ background: 'rgba(255,170,0,0.06)', border: '1px solid rgba(255,170,0,0.2)', color: 'rgba(255,170,0,0.8)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,170,0,0.12)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,170,0,0.06)' }}>
                      {lunchLoading ? 'Eliminando...' : 'Este día'}
                    </button>
                    <button onClick={() => blockLunchSlots('month')} disabled={lunchLoading}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                      style={{ background: 'rgba(255,170,0,0.06)', border: '1px solid rgba(255,170,0,0.2)', color: 'rgba(255,170,0,0.8)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,170,0,0.12)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,170,0,0.06)' }}>
                      {lunchLoading ? 'Eliminando...' : 'Lun–Vie del mes'}
                    </button>
                  </div>
                </div>

                {/* ── Repeat ── */}
                {hasRepeatableSlots && (
                  <div style={{ borderTop: '1px solid rgba(0,229,255,0.07)', paddingTop: 16 }}>
                    <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'rgba(0,229,255,0.4)' }}>Repetir horarios</p>

                    <div className="flex flex-col gap-2">
                      <button onClick={repeatMonFriWeek} disabled={anyRepeatLoading}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                        style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.15)', color: 'rgba(0,229,255,0.7)' }}
                        onMouseEnter={e => { if (!anyRepeatLoading) e.currentTarget.style.background = 'rgba(0,229,255,0.09)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,229,255,0.04)' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        {repeatMonFriWeekLoading ? 'Creando...' : 'Repetir Lun–Vie esta semana'}
                      </button>

                      <button onClick={repeatMonFriMonth} disabled={anyRepeatLoading}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                        style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.15)', color: 'rgba(0,229,255,0.7)' }}
                        onMouseEnter={e => { if (!anyRepeatLoading) e.currentTarget.style.background = 'rgba(0,229,255,0.09)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,229,255,0.04)' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        {repeatMonFriMonthLoading ? 'Creando...' : `Repetir Lun–Vie todo ${MONTHS_ES[viewMonth]}`}
                      </button>

                      <button onClick={repeatSaturdays} disabled={anyRepeatLoading}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                        style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.15)', color: 'rgba(0,229,255,0.7)' }}
                        onMouseEnter={e => { if (!anyRepeatLoading) e.currentTarget.style.background = 'rgba(0,229,255,0.09)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,229,255,0.04)' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        {repeatSatLoading ? 'Creando...' : `Repetir Sábados de ${MONTHS_ES[viewMonth]}`}
                      </button>

                      {repeatMsg && (
                        <p className="text-xs text-center" style={{ color: repeatMsg.startsWith('✓') ? '#00e5ff' : '#f000ff' }}>{repeatMsg}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Slots list ── */}
                {selectedSlots.length > 0 && (
                  <div style={{ borderTop: '1px solid rgba(0,229,255,0.07)', paddingTop: 16 }}>
                    <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'rgba(0,229,255,0.5)' }}>
                      Horarios del día ({selectedSlots.length})
                    </p>
                    <div className="flex flex-col gap-2">
                      {selectedSlots.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(slot => {
                        const appt = slot.appointmentId ? selectedApptsMap[slot.appointmentId] : null
                        const isEditing = editingSlotId === slot.id
                        return (
                          <div key={slot.id} className="rounded-xl p-3"
                            style={{
                              background: slot.booked ? 'rgba(240,0,255,0.05)' : 'rgba(0,20,30,0.5)',
                              border: `1px solid ${slot.booked ? 'rgba(240,0,255,0.2)' : 'rgba(0,229,255,0.1)'}`,
                            }}>
                            {isEditing ? (
                              <div>
                                <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(0,229,255,0.6)' }}>Editar horario</p>
                                <div className="flex gap-2 mb-2">
                                  <div className="flex-1">
                                    <label className="text-xs mb-1 block" style={{ color: 'rgba(0,229,255,0.4)' }}>Inicio</label>
                                    <select value={editStart} onChange={e => setEditStart(e.target.value)}
                                      className="w-full rounded-lg px-2 py-1.5 text-xs outline-none" style={inputStyle}>
                                      {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                  </div>
                                  <div className="flex-1 flex items-end pb-1.5">
                                    <p className="text-xs" style={{ color: 'rgba(0,229,255,0.4)' }}>
                                      → {addThirtyMinutes(editStart)} <span style={{ color: 'rgba(0,229,255,0.25)' }}>(30 min)</span>
                                    </p>
                                  </div>
                                </div>
                                {editError && <p className="text-xs mb-2" style={{ color: '#f000ff' }}>{editError}</p>}
                                <div className="flex gap-2">
                                  <button onClick={() => saveEdit(slot.id)} disabled={editLoading}
                                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
                                    style={{ background: 'rgba(0,229,255,0.12)', border: '1px solid rgba(0,229,255,0.3)', color: '#00e5ff' }}>
                                    {editLoading ? 'Guardando...' : 'Guardar'}
                                  </button>
                                  <button onClick={() => { setEditingSlotId(null); setEditError('') }}
                                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
                                    style={{ background: 'transparent', border: '1px solid rgba(224,247,255,0.1)', color: 'rgba(224,247,255,0.4)' }}>
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-semibold" style={{ color: slot.booked ? '#f000ff' : '#00e5ff' }}>
                                    {slot.startTime} – {slot.endTime}
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs px-2 py-0.5 rounded-full"
                                      style={{ background: slot.booked ? 'rgba(240,0,255,0.12)' : 'rgba(0,229,255,0.1)', color: slot.booked ? '#f000ff' : '#00e5ff' }}>
                                      {slot.booked ? 'Reservado' : 'Libre'}
                                    </span>
                                    {!slot.booked && (
                                      <>
                                        <button onClick={() => startEdit(slot)}
                                          className="p-1 rounded transition-colors"
                                          style={{ color: 'rgba(0,229,255,0.4)' }}
                                          onMouseEnter={e => { e.currentTarget.style.color = '#00e5ff' }}
                                          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(0,229,255,0.4)' }}
                                          title="Editar">
                                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                        </button>
                                        <button onClick={() => deleteSlot(slot.id)}
                                          className="p-1 rounded transition-colors"
                                          style={{ color: 'rgba(240,0,255,0.4)' }}
                                          onMouseEnter={e => { e.currentTarget.style.color = '#f000ff' }}
                                          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(240,0,255,0.4)' }}
                                          title="Eliminar">
                                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                                {slot.booked && appt && (
                                  <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(240,0,255,0.1)' }}>
                                    <p className="text-xs font-semibold" style={{ color: '#e0f7ff' }}>{appt.name} {appt.lastName}</p>
                                    {appt.company && <p className="text-xs" style={{ color: 'rgba(224,247,255,0.5)' }}>{appt.company}</p>}
                                    <p className="text-xs" style={{ color: 'rgba(0,229,255,0.5)' }}>{appt.email}</p>
                                    {appt.phone && <p className="text-xs" style={{ color: 'rgba(0,229,255,0.5)' }}>{appt.phone}</p>}
                                    <p className="text-xs mt-1 font-medium" style={{ color: '#a78bfa' }}>{appt.service}</p>
                                    {appt.meetLink && (
                                      <a href={appt.meetLink} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 mt-1.5 text-xs font-medium"
                                        style={{ color: '#00e5ff' }}>
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
                                        Abrir Meet
                                      </a>
                                    )}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {selectedSlots.length === 0 && (
                  <p className="text-xs text-center py-4" style={{ color: 'rgba(224,247,255,0.25)' }}>Sin horarios agregados para este día</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Services ref */}
      <div className="mt-6 rounded-2xl p-5" style={{ background: 'rgba(0,10,15,0.6)', border: '1px solid rgba(0,229,255,0.08)' }}>
        <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'rgba(0,229,255,0.4)' }}>Servicios disponibles</p>
        <div className="flex flex-wrap gap-2">
          {BOOKING_SERVICES.map(s => (
            <span key={s} className="text-xs px-3 py-1 rounded-full"
              style={{ background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.12)', color: 'rgba(0,229,255,0.6)' }}>
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
