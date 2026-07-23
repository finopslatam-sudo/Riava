import { NextResponse } from 'next/server'
import { getAllLeads, updateLead } from '@/lib/leads-store'

const TARGET_EMAILS = new Set([
  'hnaquira@hotelholidaysuites.com',
  'multimediaperusac@gmail.com',
  'abogados969@gmail.com',
  'j.sosa@emhydint.com',
  'empresa.john.fordan.com@gmail.com',
  'gabrielticonaquenta@gmail.com',
  'hardmc_jmpc@hotmail.com',
  'perucusco@hotmail.com',
  'gabosoto012@gmail.com',
  'librosdelviento@gmail.com',
  'franquiciapresidente@gmail.com',
  'patomainoli@gmail.com',
])

export async function POST() {
  const leads = await getAllLeads()
  const now = new Date().toISOString()
  let updated = 0
  for (const lead of leads) {
    if (!TARGET_EMAILS.has(lead.email.toLowerCase())) continue
    await updateLead(lead.id, { first_contact_at: now, last_contact_at: now, follow_up_count: 0 })
    updated++
  }
  return NextResponse.json({ updated })
}
