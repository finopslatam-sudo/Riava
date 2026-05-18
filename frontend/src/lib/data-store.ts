import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

export type TimeSlot = {
  id: string
  date: string       // YYYY-MM-DD
  startTime: string  // HH:mm
  endTime: string    // HH:mm
  booked: boolean
  blocked?: boolean
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

export async function getSlots(): Promise<TimeSlot[]> {
  const slots = await redis.get<TimeSlot[]>('riava:slots')
  return slots ?? []
}

export async function saveSlots(slots: TimeSlot[]): Promise<void> {
  await redis.set('riava:slots', slots)
}

export async function getAppointments(): Promise<Appointment[]> {
  const appts = await redis.get<Appointment[]>('riava:appointments')
  return appts ?? []
}

export async function saveAppointments(appts: Appointment[]): Promise<void> {
  await redis.set('riava:appointments', appts)
}
