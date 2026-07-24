import { generateText, tool, isStepCount } from 'ai'
import { groq } from '@ai-sdk/groq'
import { z } from 'zod'
import { Redis } from '@upstash/redis'
import type { WaClient, WaMessage } from './wa-store'
import { BOOKING_SERVICES } from './constants'
import { getAllServices } from './services-store'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const FALLBACK_REPLY =
  'Gracias por tu mensaje 🥶 Se me congeló el cerebro un instante (cosas de robot). Intenta de nuevo en un par de minutos, ¡prometo estar más despierto!'

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

    const dedupeKey = `riava:wa:quote-sent:${clientEmail.toLowerCase()}`
    const lockAcquired = await redis.set(dedupeKey, '1', { nx: true, ex: 180 })
    if (!lockAcquired) {
      return {
        success: false,
        alreadySent: true,
        error: 'Ya se envió una cotización a este correo hace instantes. No la reenvíes de nuevo — pregúntale a la persona si le llegó.',
      }
    }

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
    if (!res.ok) {
      await redis.del(dedupeKey)
      return { success: false, error: 'No se pudo enviar la cotización' }
    }
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
          'La cotización SOLO se puede enviar por correo electrónico usando la herramienta createQuote. No puedes generar ni enviar archivos PDF, imágenes, ni ningún adjunto directamente por WhatsApp — no existe esa capacidad. Si te piden la cotización "por este medio", "por WhatsApp" o en PDF dentro del chat, explica amablemente que solo la puedes enviar por correo electrónico y pide el email.',
          'Llama createQuote como máximo UNA VEZ por solicitud de cotización. Si ya la enviaste en esta conversación (o la herramienta te dice que ya se envió recientemente), NO la vuelvas a enviar — solo responde con normalidad.',
          'Solo confirma que la cotización fue enviada después de que createQuote devuelva éxito. Si falla, informa el error.',
          'Después de confirmar el envío, pregunta a la persona si le llegó la cotización a su correo. Cuando responda (llegó o no), agradece y pregúntale si desea agendar una videollamada con un experto de RIAVA para asesorarlo. Si dice que sí y el agendamiento está disponible, sigue el flujo normal de agendamiento.',
        ].join('\n')
      : '',
    'REGLA CRÍTICA: nunca inventes ni simules el resultado de una herramienta (horarios, ids de horario, confirmaciones de cita, cotizaciones, códigos, archivos, links). Si necesitas datos que solo puede darte una herramienta, llama la herramienta correspondiente; si no tienes una herramienta para lo que te piden, dilo explícitamente en vez de fabricar una respuesta que parezca real.',
    'En el primer mensaje de una conversación nueva, solo saluda de forma breve y cordial, pregunta el nombre de la persona y en qué puedes ayudarla. No listes servicios, precios ni información extensa todavía.',
    'De ahí en adelante, responde solo lo que te preguntan, de forma breve y precisa. No ofrezcas proactivamente la lista completa de servicios ni información que no se pidió — espera a que la persona pregunte por algo específico antes de dar el detalle.',
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

const RETRY_DELAYS_MS = [1500, 4000, 8000]

export async function generateWaReply(
  client: WaClient,
  history: WaMessage[],
  message: string
): Promise<string> {
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      return await buildAndRun(client, history, message)
    } catch (err) {
      console.error(`[wa-brain] generateWaReply failed (attempt ${attempt + 1}/${RETRY_DELAYS_MS.length + 1}):`, err)
      if (attempt < RETRY_DELAYS_MS.length) {
        await new Promise(r => setTimeout(r, RETRY_DELAYS_MS[attempt]))
      }
    }
  }
  return FALLBACK_REPLY
}

