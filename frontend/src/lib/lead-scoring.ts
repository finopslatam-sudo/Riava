import { generateText, Output } from 'ai'
import { z } from 'zod'

const scoreSchema = z.object({
  score: z.number().min(0).max(100),
  reasoning: z.string(),
})

export type LeadScoreInput = {
  full_name: string
  email: string
  phone: string
  company_name: string
  source_campaign: string
  custom_fields: Record<string, string>
}

export type LeadScoreResult = {
  score: number
  reasoning: string
}

function heuristicFallback(input: LeadScoreInput): LeadScoreResult {
  let score = 0
  if (input.full_name) score += 25
  if (input.email) score += 25
  if (input.phone) score += 25
  if (input.company_name) score += 15
  if (Object.keys(input.custom_fields).length > 0) score += 10
  return {
    score: Math.min(score, 100),
    reasoning: 'Lead evaluado con reglas básicas de completitud de formulario (la evaluación con IA no estuvo disponible).',
  }
}

export async function scoreLead(input: LeadScoreInput): Promise<LeadScoreResult> {
  const customFieldsText = Object.entries(input.custom_fields)
    .map(([question, answer]) => `- ${question}: ${answer || '(sin respuesta)'}`)
    .join('\n')

  const prompt = `Evalúa la calidad de este lead de un formulario de Meta Ads (Instagram/Facebook) para un negocio de creación de páginas web, en una escala de 0 a 100.

Campaña: ${input.source_campaign || 'desconocida'}
Nombre: ${input.full_name || '(sin nombre)'}
Email: ${input.email || '(sin email)'}
Teléfono: ${input.phone || '(sin teléfono)'}
Empresa: ${input.company_name || '(sin especificar)'}

Respuestas del formulario:
${customFieldsText || '(sin preguntas personalizadas)'}

Considera: completitud de los datos de contacto, consistencia y especificidad de las respuestas, y señales de urgencia o intención real de compra declaradas en el formulario. No hay forma de validar los datos externamente, así que basa el puntaje solo en las respuestas explícitas.

Da un score de 0 a 100 y un razonamiento breve (1-3 frases, en español) explicando por qué se calificó así.`

  try {
    const result = await generateText({
      model: 'anthropic/claude-sonnet-5',
      output: Output.object({ schema: scoreSchema }),
      prompt,
    })
    return result.output
  } catch {
    return heuristicFallback(input)
  }
}
