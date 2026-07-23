import { NextResponse } from 'next/server'
import { getAllLeads } from '@/lib/leads-store'
import { buildWelcomeEmail } from '@/lib/leads-import'
import { sendEmail } from '@/lib/mailer'

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
  const targets = leads.filter(l => TARGET_EMAILS.has(l.email.toLowerCase()))

  const results: { email: string; ok: boolean }[] = []
  for (const lead of targets) {
    try {
      await sendEmail({
        to: lead.email,
        subject: `Gracias por contactar a RIAVA System, ${lead.full_name.split(' ')[0]}`,
        html: buildWelcomeEmail(lead.full_name),
      })
      results.push({ email: lead.email, ok: true })
    } catch {
      results.push({ email: lead.email, ok: false })
    }
  }

  return NextResponse.json({ sent: results.filter(r => r.ok).length, total: targets.length, results })
}
