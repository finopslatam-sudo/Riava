import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const KEY = 'riava:automations'

export type AutomationId = 'lead_followup' | 'appointment_reminder'

export type AutomationDefinition = {
  id: AutomationId
  name: string
  description: string
  fields: { key: string; label: string; unit: string; min: number; max: number }[]
}

export type AutomationSettings = {
  id: AutomationId
  enabled: boolean
  config: Record<string, number>
}

export const AUTOMATION_DEFINITIONS: AutomationDefinition[] = [
  {
    id: 'lead_followup',
    name: 'Seguimiento de leads por correo',
    description: 'Reenvía un correo de seguimiento a los leads que siguen en estado "Nuevo" (no han respondido ni avanzado de estado).',
    fields: [
      { key: 'interval_days', label: 'Enviar cada', unit: 'días', min: 1, max: 30 },
      { key: 'period_days', label: 'Durante un máximo de', unit: 'días desde el primer contacto', min: 1, max: 180 },
    ],
  },
  {
    id: 'appointment_reminder',
    name: 'Recordatorio de reunión agendada',
    description: 'Envía un correo recordatorio a quien agendó una reunión, un tiempo antes de que comience.',
    fields: [
      { key: 'hours_before', label: 'Enviar', unit: 'horas antes de la reunión', min: 1, max: 72 },
    ],
  },
]

const DEFAULTS: Record<AutomationId, AutomationSettings> = {
  lead_followup: { id: 'lead_followup', enabled: true, config: { interval_days: 2, period_days: 30 } },
  appointment_reminder: { id: 'appointment_reminder', enabled: true, config: { hours_before: 24 } },
}

export async function getAllAutomations(): Promise<AutomationSettings[]> {
  const stored = (await redis.get<Record<string, AutomationSettings>>(KEY)) ?? {}
  return AUTOMATION_DEFINITIONS.map(def => stored[def.id] ?? DEFAULTS[def.id])
}

export async function getAutomation(id: AutomationId): Promise<AutomationSettings> {
  const stored = (await redis.get<Record<string, AutomationSettings>>(KEY)) ?? {}
  return stored[id] ?? DEFAULTS[id]
}

export async function updateAutomation(
  id: AutomationId,
  updates: Partial<Pick<AutomationSettings, 'enabled'>> & { config?: Record<string, number> }
): Promise<AutomationSettings> {
  const stored = (await redis.get<Record<string, AutomationSettings>>(KEY)) ?? {}
  const current = stored[id] ?? DEFAULTS[id]
  const updated: AutomationSettings = {
    ...current,
    enabled: updates.enabled ?? current.enabled,
    config: updates.config ? { ...current.config, ...updates.config } : current.config,
  }
  stored[id] = updated
  await redis.set(KEY, stored)
  return updated
}
