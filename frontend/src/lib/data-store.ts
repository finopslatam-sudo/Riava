import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

export type TimeSlot = {
  id: string
  date: string       // YYYY-MM-DD
  startTime: string  // HH:mm
  endTime: string    // HH:mm
  booked: boolean
  appointmentId?: string
}

export type Appointment = {
  id: string
  slotId: string
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
  createdAt: string
}

function readJSON<T>(filename: string, fallback: T): T {
  ensureDir()
  const p = path.join(DATA_DIR, filename)
  try {
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf-8')) as T
  } catch {}
  return fallback
}

function writeJSON<T>(filename: string, data: T): void {
  ensureDir()
  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2), 'utf-8')
}

export const getSlots = (): TimeSlot[] => readJSON<TimeSlot[]>('slots.json', [])
export const saveSlots = (slots: TimeSlot[]): void => writeJSON('slots.json', slots)
export const getAppointments = (): Appointment[] => readJSON<Appointment[]>('appointments.json', [])
export const saveAppointments = (appts: Appointment[]): void => writeJSON('appointments.json', appts)
