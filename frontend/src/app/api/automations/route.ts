import { NextResponse } from 'next/server'
import { getAllAutomations, AUTOMATION_DEFINITIONS } from '@/lib/automations-store'

export async function GET() {
  const settings = await getAllAutomations()
  return NextResponse.json({ definitions: AUTOMATION_DEFINITIONS, settings })
}
