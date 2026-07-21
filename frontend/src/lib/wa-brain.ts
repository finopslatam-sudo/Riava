import { generateText } from 'ai'
import type { WaClient, WaMessage } from './wa-store'

const FALLBACK_REPLY =
  'Gracias por tu mensaje. En este momento tenemos un problema técnico, en breve te responderemos.'

export async function generateWaReply(
  client: WaClient,
  history: WaMessage[],
  message: string
): Promise<string> {
  const systemPrompt = [
    `Eres el asistente virtual de "${client.business_name}".`,
    client.tone ? `Tu tono debe ser: ${client.tone}.` : '',
    client.system_prompt || '',
    client.business_info ? `Información del negocio:\n${client.business_info}` : '',
    'Responde siempre en español, de forma concisa y útil. No inventes información que no te hayan dado.',
  ]
    .filter(Boolean)
    .join('\n\n')

  const messages = [
    ...history.map(m => ({ role: m.role, content: m.content }) as const),
    { role: 'user' as const, content: message },
  ]

  try {
    const result = await generateText({
      model: 'anthropic/claude-sonnet-5',
      system: systemPrompt,
      messages,
    })
    return result.text
  } catch {
    return FALLBACK_REPLY
  }
}
