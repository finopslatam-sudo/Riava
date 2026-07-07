import { NextResponse } from 'next/server'
import { getAllLeads, updateLead } from '@/lib/leads-store'
import { scoreLead, HEURISTIC_FALLBACK_REASONING } from '@/lib/lead-scoring'

export async function POST() {
  const leads = await getAllLeads()
  const pending = leads.filter(l => l.ai_reasoning === HEURISTIC_FALLBACK_REASONING || !l.ai_reasoning)

  let rescored = 0
  let stillFallback = 0

  for (const lead of pending) {
    const { score, reasoning } = await scoreLead({
      full_name: lead.full_name,
      email: lead.email,
      phone: lead.phone,
      company_name: lead.company_name,
      source_campaign: lead.source_campaign,
      custom_fields: lead.custom_fields,
    })
    await updateLead(lead.id, { score, ai_reasoning: reasoning })
    if (reasoning === HEURISTIC_FALLBACK_REASONING) stillFallback++
    else rescored++
  }

  return NextResponse.json({ rescored, still_fallback: stillFallback, total_pending: pending.length })
}
