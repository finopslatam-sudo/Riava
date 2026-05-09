'use client'

import { useState, useEffect, useCallback } from 'react'
import { BOOKING_SERVICES } from '@/lib/constants'

type Slot = {
  id: string
  date: string
  startTime: string
  endTime: string
  booked: boolean
  appointmentId?: string
}

type Appointment = {
  id: string
  date: string
  startTime: string
  endTime: string
  name: string
  lastName: string
  company: string
  email: string
  phone: string
  service: string
  meetLink: string
}

const DAYS_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const TIME_OPTIONS: string[] = []
for (let h = 7; h <= 21; h++) {
  TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:00`)
  TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:30`)
}

function isoDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function daysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate()
}

function firstDayOfMonth(y: number, m: number) {
  const d = new Date(y, m, 1).getDay()
  return d === 0 ? 6 : d - 1 // Mon=0
}

export default function CalendarioPage() {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)

  // New slot form
  const [newStart, setNewStart] = useState('09:00')
  const [newEnd, setNewEnd] = useState('10:00')
  const [addError, setAddError] = useState('')
  const [addLoading, setAddLoading] = useState(false)

  // Fetch slots for current month view
  const fetchSlots = useCallback(async () => {
    setLoading(true)
    const from = isoDate(viewYear, viewMonth, 1)
    const to   = isoDate(viewYear, viewMonth, daysInMonth(viewYear, viewMonth))
    const res = await fetch(`/api/appointments/slots?from=${from}&to=${to}`)
    if (res.ok) setSlots(await res.json())
    setLoading(false)
  }, [viewYear, viewMonth])

  // Fetch appointments for selected date
  const fetchAppointments = useCallback(async (date: string) => {
    const res = await fetch(`/api/appointments?date=${date}`)
    if (res.ok) setAppointments(await res.json())
  }, [])

  useEffect(() => { fetchSlots() }, [fetchSlots])

  useEffect(() => {
    if (selectedDate) fetchAppointments(selectedDate)
    else setAppointments([])
  }, [selectedDate, fetchAppointments])

  const slotsForDate = (date: string) => slots.filter(s => s.date === date)
  const hasAvailable = (date: string) => slots.some(s => s.date === date && !s.booked)
  const hasBooked = (date: string) => slots.some(s => s.date === date && s.booked)

  const addSlot = async () => {
    if (!selectedDate) return
    setAddError('')

    if (newStart >= newEnd) {
      setAddError('La hora de fin debe ser posterior a la de inicio.')
      return
    }

    setAddLoading(true)
    const res = await fetch('/api/appointments/slots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: selectedDate, startTime: newStart, endTime: newEnd }),
    })
    const data = await res.json()
    setAddLoading(false)

    if (!res.ok) { setAddError(data.error ?? 'Error al crear horario'); return }
    setSlots(prev => [...prev, data])
  }

  const deleteSlot = async (id: string) => {
    const res = await fetch(`/api/appointments/slots/${id}`, { method: 'DELETE' })
    if (res.ok) setSlots(prev => prev.filter(s => s.id !== id))
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
    setSelectedDate(null)
  }

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
    setSelectedDate(null)
  }

  // Build calendar grid
  const totalDays = daysInMonth(viewYear, viewMonth)
  const startOffset = firstDayOfMonth(viewYear, viewMonth)
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const inputStyle = {
    background: 'rgba(0,20,30,0.7)',
    border: '1px solid rgba(0,229,255,0.18)',
    color: '#e0f7ff',
  }

  const selectedSlots = selectedDate ? slotsForDate(selectedDate) : []
  const selectedApptsMap = Object.fromEntries(appointments.map(a => [a.id, a]))

  return (
    <div className="p-4 lg:p-8 min-h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#e0f7ff' }}>Calendario de citas</h1>
        <p className="text-sm mt-0.5" style={{ color: 'rgba(0,229,255,0.5)' }}>
          Gestiona tu disponibilidad y revisa las citas agendadas
        </p>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Calendar */}
        <div
          className="flex-1 rounded-2xl overflow-hidden"
          style={{ background: 'rgba(0,10,15,0.85)', border: '1px solid rgba(0,229,255,0.12)' }}
        >
          {/* Month nav */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid rgba(0,229,255,0.08)' }}
          >
            <button
              onClick={prevMonth}
              className="p-2 rounded-lg transition-all"
              style={{ color: 'rgba(0,229,255,0.6)', border: '1px solid rgba(0,229,255,0.12)' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#00e5ff'; e.currentTarget.style.borderColor = 'rgba(0,229,255,0.35)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(0,229,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(0,229,255,0.12)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <h2 className="text-base font-semibold" style={{ color: '#e0f7ff' }}>
              {MONTHS_ES[viewMonth]} {viewYear}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg transition-all"
              style={{ color: 'rgba(0,229,255,0.6)', border: '1px solid rgba(0,229,255,0.12)' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#00e5ff'; e.currentTarget.style.borderColor = 'rgba(0,229,255,0.35)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(0,229,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(0,229,255,0.12)' }}
            >
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
              const isToday = dateStr === isoDate(today.getFullYear(), today.getMonth(), today.getDate())
              const isSelected = selectedDate === dateStr
              const avail = hasAvailable(dateStr)
              const booked = hasBooked(dateStr)
              const isPast = dateStr < isoDate(today.getFullYear(), today.getMonth(), today.getDate())

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  className="relative flex flex-col items-center justify-start rounded-xl pt-2 pb-1.5 transition-all"
                  style={{
                    minHeight: 56,
                    background: isSelected
                      ? 'rgba(0,229,255,0.12)'
                      : isToday
                        ? 'rgba(0,229,255,0.05)'
                        : 'transparent',
                    border: isSelected
                      ? '1px solid rgba(0,229,255,0.4)'
                      : isToday
                        ? '1px solid rgba(0,229,255,0.2)'
                        : '1px solid transparent',
                    opacity: isPast ? 0.4 : 1,
                  }}
                >
                  <span
                    className="text-sm font-medium"
                    style={{ color: isSelected ? '#00e5ff' : isToday ? '#00e5ff' : '#e0f7ff' }}
                  >
                    {day}
                  </span>
                  {(avail || booked) && (
                    <div className="flex gap-0.5 mt-1">
                      {avail && <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#00e5ff' }} />}
                      {booked && <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#f000ff' }} />}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 px-6 pb-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(0,229,255,0.5)' }}>
              <span className="w-2 h-2 rounded-full" style={{ background: '#00e5ff' }} />
              Disponible
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(240,0,255,0.5)' }}>
              <span className="w-2 h-2 rounded-full" style={{ background: '#f000ff' }} />
              Con cita
            </div>
          </div>
        </div>

        {/* Day panel */}
        <div
          className="xl:w-96 rounded-2xl overflow-hidden flex flex-col"
          style={{ background: 'rgba(0,10,15,0.85)', border: '1px solid rgba(0,229,255,0.12)', minHeight: 480 }}
        >
          {!selectedDate ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center gap-3">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(0,229,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <p className="text-sm" style={{ color: 'rgba(224,247,255,0.3)' }}>Selecciona un día para gestionar sus horarios</p>
            </div>
          ) : (
            <>
              {/* Panel header */}
              <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(0,229,255,0.08)' }}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold" style={{ color: '#e0f7ff' }}>
                    {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </h3>
                  <button
                    onClick={() => setSelectedDate(null)}
                    style={{ color: 'rgba(0,229,255,0.4)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#00e5ff' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(0,229,255,0.4)' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
                {/* Add slot form */}
                <div>
                  <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'rgba(0,229,255,0.5)' }}>
                    Agregar horario disponible
                  </p>
                  <div className="flex gap-2 items-center mb-2">
                    <div className="flex-1">
                      <label className="text-xs mb-1 block" style={{ color: 'rgba(0,229,255,0.4)' }}>Desde</label>
                      <select
                        value={newStart}
                        onChange={e => setNewStart(e.target.value)}
                        className="w-full rounded-lg px-2 py-1.5 text-sm outline-none"
                        style={inputStyle}
                      >
                        {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs mb-1 block" style={{ color: 'rgba(0,229,255,0.4)' }}>Hasta</label>
                      <select
                        value={newEnd}
                        onChange={e => setNewEnd(e.target.value)}
                        className="w-full rounded-lg px-2 py-1.5 text-sm outline-none"
                        style={inputStyle}
                      >
                        {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  {addError && (
                    <p className="text-xs mb-2" style={{ color: '#f000ff' }}>{addError}</p>
                  )}
                  <button
                    onClick={addSlot}
                    disabled={addLoading}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                    style={{
                      background: 'rgba(0,229,255,0.08)',
                      border: '1px solid rgba(0,229,255,0.25)',
                      color: '#00e5ff',
                    }}
                    onMouseEnter={e => { if (!addLoading) e.currentTarget.style.background = 'rgba(0,229,255,0.14)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,229,255,0.08)' }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    {addLoading ? 'Guardando...' : 'Agregar horario'}
                  </button>
                </div>

                {/* Slots list */}
                {selectedSlots.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'rgba(0,229,255,0.5)' }}>
                      Horarios del día ({selectedSlots.length})
                    </p>
                    <div className="flex flex-col gap-2">
                      {selectedSlots
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map(slot => {
                          const appt = slot.appointmentId ? selectedApptsMap[slot.appointmentId] : null

                          return (
                            <div
                              key={slot.id}
                              className="rounded-xl p-3"
                              style={{
                                background: slot.booked ? 'rgba(240,0,255,0.05)' : 'rgba(0,20,30,0.5)',
                                border: `1px solid ${slot.booked ? 'rgba(240,0,255,0.2)' : 'rgba(0,229,255,0.1)'}`,
                              }}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-semibold" style={{ color: slot.booked ? '#f000ff' : '#00e5ff' }}>
                                  {slot.startTime} – {slot.endTime}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span
                                    className="text-xs px-2 py-0.5 rounded-full"
                                    style={{
                                      background: slot.booked ? 'rgba(240,0,255,0.12)' : 'rgba(0,229,255,0.1)',
                                      color: slot.booked ? '#f000ff' : '#00e5ff',
                                    }}
                                  >
                                    {slot.booked ? 'Reservado' : 'Libre'}
                                  </span>
                                  {!slot.booked && (
                                    <button
                                      onClick={() => deleteSlot(slot.id)}
                                      className="p-1 rounded transition-colors"
                                      style={{ color: 'rgba(240,0,255,0.4)' }}
                                      onMouseEnter={e => { e.currentTarget.style.color = '#f000ff' }}
                                      onMouseLeave={e => { e.currentTarget.style.color = 'rgba(240,0,255,0.4)' }}
                                      title="Eliminar horario"
                                    >
                                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                                    </button>
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
                                    <a
                                      href={appt.meetLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 mt-1.5 text-xs font-medium"
                                      style={{ color: '#00e5ff' }}
                                    >
                                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
                                      Abrir Meet
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                    </div>
                  </div>
                )}

                {selectedSlots.length === 0 && (
                  <p className="text-xs text-center py-4" style={{ color: 'rgba(224,247,255,0.25)' }}>
                    Sin horarios agregados para este día
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Service reference */}
      <div className="mt-6 rounded-2xl p-5" style={{ background: 'rgba(0,10,15,0.6)', border: '1px solid rgba(0,229,255,0.08)' }}>
        <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'rgba(0,229,255,0.4)' }}>
          Servicios disponibles para agendar
        </p>
        <div className="flex flex-wrap gap-2">
          {BOOKING_SERVICES.map(s => (
            <span
              key={s}
              className="text-xs px-3 py-1 rounded-full"
              style={{ background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.12)', color: 'rgba(0,229,255,0.6)' }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
