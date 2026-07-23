import { generateText, tool, isStepCount } from 'ai'
import { groq } from '@ai-sdk/groq'
import { z } from 'zod'
import type { WaClient, WaMessage } from './wa-store'
import { BOOKING_SERVICES } from './constants'
import { getAllServices } from './services-store'

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

const createQuoteTool = tool({
  description: 'Arma y envía por correo una cotización usando ítems reales del catálogo de servicios (obtenidos de la lista de servicios disponibles en tus instrucciones). No inventes ítems ni precios que no estén en el catálogo. No la uses sin haber confirmado antes nombre, correo electrónico y qué ítems quiere cotizar la persona.',
  inputSchema: z.object({
    clientName: z.string(),
    clientCompany: z.string().optional(),
    clientEmail: z.string(),
    clientPhone: z.string().optional(),
    itemIds: z.array(z.object({
      itemId: z.string().describe('El id exacto del ítem del catálogo, tal como aparece en tus instrucciones'),
      qty: z.number().min(1).default(1),
    })).min(1),
    notes: z.string().optional().describe('Notas o condiciones adicionales para incluir en la cotización'),
  }),
  execute: async ({ clientName, clientCompany, clientEmail, clientPhone, itemIds, notes }) => {
    const services = await getAllServices()
    const catalogItems = services.flatMap(s => s.items)

    const items = itemIds.map(({ itemId, qty }) => {
      const found = catalogItems.find(i => i.id === itemId)
      return found ? { id: itemId, description: found.name, qty, unitPrice: found.price } : null
    })
    if (items.some(i => i === null)) {
      return { success: false, error: 'Uno o más ítems no existen en el catálogo. Vuelve a revisar los ítems disponibles.' }
    }
    const resolvedItems = items as { id: string; description: string; qty: number; unitPrice: number }[]

    const subtotal = resolvedItems.reduce((sum, i) => sum + i.qty * i.unitPrice, 0)
    const ivaAmount = Math.round(subtotal * 0.19)
    const total = subtotal + ivaAmount
    const quoteNum = `WA-${Date.now()}`
    const date = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' })

    const res = await fetch(`${SITE_BASE}/api/cotizacion/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: clientEmail,
        subject: `Cotización RIAVA System N° ${quoteNum}`,
        body: `Hola ${clientName}, gracias por tu interés. Adjuntamos el detalle de tu cotización.`,
        quoteData: {
          quoteNum,
          date,
          clientName,
          clientCompany: clientCompany ?? '',
          clientEmail,
          clientPhone: clientPhone ?? '',
          items: resolvedItems,
          subtotal,
          discountAmount: 0,
          discountPct: 0,
          afterDiscount: subtotal,
          ivaAmount,
          total,
          notes: notes ?? '',
          validDays: 30,
        },
        attachTerminos: true,
      }),
    })
    if (!res.ok) return { success: false, error: 'No se pudo enviar la cotización' }
    return { success: true, quoteNum, total }
  },
})

async function buildAndRun(client: WaClient, history: WaMessage[], message: string) {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' })

  const catalogText = client.enable_quotes
    ? (await getAllServices())
        .map(s => {
          const itemsText = s.items.length
            ? s.items.map(i => `  - id: ${i.id} | ${i.name} | $${i.price.toLocaleString('es-CL')}`).join('\n')
            : '  (sin ítems cargados)'
          return `${s.name}${s.detail ? ` — ${s.detail}` : ''}\n${itemsText}`
        })
        .join('\n\n')
    : ''

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
    client.enable_quotes
      ? [
          'Catálogo de servicios disponible para cotizar (usa exactamente estos ids, nombres y precios, nunca inventes otros):',
          catalogText || '(sin servicios cargados en el catálogo todavía)',
          'Si la persona pide una cotización, conversa qué ítems del catálogo le interesan, y antes de usar createQuote necesitas su nombre completo y correo electrónico. Confirma con la persona el detalle antes de enviarla.',
          'Solo confirma que la cotización fue enviada después de que createQuote devuelva éxito. Si falla, informa el error.',
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

  const tools = {
    ...(client.enable_scheduling ? { getAvailableSlots: getAvailableSlotsTool, bookAppointment: bookAppointmentTool } : {}),
    ...(client.enable_quotes ? { createQuote: createQuoteTool } : {}),
  }

  const result = await generateText({
    model: groq('openai/gpt-oss-120b'),
    system: systemPrompt,
    messages,
    tools: Object.keys(tools).length > 0 ? tools : undefined,
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
    console.error('[wa-brain] generateWaReply failed, retrying once:', err)
  }
  try {
    await new Promise(r => setTimeout(r, 1500))
    return await buildAndRun(client, history, message)
  } catch (err) {
    console.error('[wa-brain] generateWaReply retry failed:', err)
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

