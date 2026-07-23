import { generateText, tool, isStepCount } from 'ai'
import { groq } from '@ai-sdk/groq'
import { z } from 'zod'
import type { WaClient, WaMessage } from './wa-store'
import { BOOKING_SERVICES } from './constants'

const FALLBACK_REPLY =
  'Gracias por tu mensaje. En este momento tenemos un problema técnico, en breve te responderemos.'

const SITE_BASE = 'https://www.riava.cl'

const getAvailableSlotsTool = tool({
  description: 'Consulta los horarios disponibles para agendar una reunión en un rango de fechas.',
  inputSchema: z.object({
    from: z.string().describe('Fecha de inicio del rango, formato YYYY-MM-DD'),
    to: z.string().describe('Fecha de fin del rango, formato YYYY-MM-DD'),
  }),
  execute: async ({ from, to }) => {
    const res = await fetch(`${SITE_BASE}/api/appointments/slots?from=${from}&to=${to}`)
    if (!res.ok) return { slots: [] }
    const slots = await res.json() as { id: string; date: string; startTime: string; endTime: string; booked: boolean }[]
    return {
      slots: slots.filter(s => !s.booked).map(s => ({ id: s.id, date: s.date, startTime: s.startTime, endTime: s.endTime })),
    }
  },
})

const bookAppointmentTool = tool({
  description: 'Agenda una reunión en un horario disponible específico obtenido con getAvailableSlots. No la uses sin haber confirmado antes nombre, apellido, correo y servicio con la persona.',
  inputSchema: z.object({
    slotId: z.string().describe('El id del horario disponible elegido, obtenido de getAvailableSlots'),
    name: z.string(),
    lastName: z.string(),
    email: z.string(),
    phone: z.string().optional(),
    company: z.string().optional(),
    service: z.enum(BOOKING_SERVICES),
  }),
  execute: async input => {
    const res = await fetch(`${SITE_BASE}/api/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    const data = await res.json()
    if (!res.ok) return { success: false, error: data.error ?? 'No se pudo agendar la reunión' }
    return { success: true, date: data.date, startTime: data.startTime, endTime: data.endTime }
  },
})

async function buildAndRun(client: WaClient, history: WaMessage[], message: string) {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' })

  const systemPrompt = [
    `Eres el asistente virtual de "${client.business_name}".`,
    client.tone ? `Tu tono debe ser: ${client.tone}.` : '',
    client.system_prompt || '',
    client.business_info ? `Información del negocio:\n${client.business_info}` : '',
    client.enable_scheduling
      ? [
          `Hoy es ${today} (zona horaria America/Santiago).`,
          `Servicios que ofrecemos: ${BOOKING_SERVICES.join(', ')}.`,
          'Si la persona quiere agendar una reunión, usa la herramienta getAvailableSlots para consultar horarios REALES disponibles antes de ofrecer una fecha u hora — nunca inventes ni asumas disponibilidad.',
          'Antes de usar bookAppointment necesitas: nombre, apellido, correo electrónico y el servicio de interés (uno de los listados arriba). Pide los datos que falten de forma natural en la conversación.',
          'Solo confirma una cita como agendada después de que bookAppointment devuelva éxito. Si falla, informa el error y ofrece otro horario.',
        ].join('\n')
      : '',
    'Responde siempre en español, de forma concisa y útil. No inventes información que no te hayan dado.',
  ]
    .filter(Boolean)
    .join('\n\n')

  const messages = [
    ...history.map(m => ({ role: m.role, content: m.content }) as const),
    { role: 'user' as const, content: message },
  ]

  const result = await generateText({
    model: groq('moonshotai/kimi-k2-instruct-0905'),
    system: systemPrompt,
    messages,
    tools: client.enable_scheduling
      ? { getAvailableSlots: getAvailableSlotsTool, bookAppointment: bookAppointmentTool }
      : undefined,
    stopWhen: isStepCount(5),
  })
  return result.text || FALLBACK_REPLY
}

export async function generateWaReply(
  client: WaClient,
  history: WaMessage[],
  message: string
): Promise<string> {
  try {
    return await buildAndRun(client, history, message)
  } catch (err) {
    console.error('[wa-brain] generateWaReply failed:', err)
    return FALLBACK_REPLY
  }
}

export async function generateWaReplyDebug(
  client: WaClient,
  history: WaMessage[],
  message: string
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  try {
    return { ok: true, text: await buildAndRun(client, history, message) }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? `${err.name}: ${err.stack ?? err.message}` : String(err) }
  }
}

