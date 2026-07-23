import { NextResponse } from 'next/server'
import { updateAutomation, type AutomationId } from '@/lib/automations-store'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { enabled, config } = body as { enabled?: boolean; config?: Record<string, number> }

  const updated = await updateAutomation(id as AutomationId, { enabled, config })
  return NextResponse.json({ settings: updated })
}
