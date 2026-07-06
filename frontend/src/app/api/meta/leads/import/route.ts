import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAllLeads, createLead } from '@/lib/leads-store'

type FieldData = { name: string; values: string[] }

function field(data: FieldData[], ...keys: string[]): string {
  for (const key of keys) {
    const found = data.find(f => f.name.toLowerCase() === key.toLowerCase())
    if (found?.values?.[0]) return found.values[0]
  }
  return ''
}

export async function POST() {
  const cookieStore = await cookies()
  const token = cookieStore.get('meta_access_token')?.value
  if (!token) return NextResponse.json({ error: 'No conectado a Meta' }, { status: 401 })

  // Get ad accounts
  const accsRes = await fetch(
    `https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name&access_token=${token}`
  )
  if (!accsRes.ok) return NextResponse.json({ error: 'Error obteniendo cuentas' }, { status: 502 })
  const { data: accounts } = await accsRes.json() as { data: { id: string; name: string }[] }

  // Collect unique lead form IDs from ads across all accounts (bypasses page access limitation)
  const formIds = new Map<string, string>() // formId → campaign/ad name fallback

  for (const acc of accounts) {
    const adsRes = await fetch(
      `https://graph.facebook.com/v19.0/${acc.id}/ads?` +
      new URLSearchParams({
        fields: 'id,name,campaign{name},creative{lead_gen_form_id}',
        limit: '200',
        access_token: token,
      })
    )
    if (!adsRes.ok) continue
    const { data: ads } = await adsRes.json() as {
      data: {
        id: string
        name: string
        campaign?: { name?: string }
        creative?: { lead_gen_form_id?: string }
      }[]
    }
    for (const ad of (ads ?? [])) {
      const fid = ad.creative?.lead_gen_form_id
      if (fid && !formIds.has(fid)) formIds.set(fid, ad.campaign?.name ?? ad.name)
    }
  }

  const existingLeads = await getAllLeads()
  const existingEmails = new Set(existingLeads.map(l => l.email.toLowerCase()))

  let imported = 0
  let skipped = 0

  for (const [formId, fallbackName] of formIds) {
    const formInfoRes = await fetch(
      `https://graph.facebook.com/v19.0/${formId}?fields=id,name&access_token=${token}`
    )
    const formName = formInfoRes.ok
      ? ((await formInfoRes.json()) as { name?: string }).name ?? fallbackName
      : fallbackName

    const leadsRes = await fetch(
      `https://graph.facebook.com/v19.0/${formId}/leads?` +
      new URLSearchParams({
        fields: 'id,created_time,campaign_name,field_data',
        limit: '200',
        access_token: token,
      })
    )
    if (!leadsRes.ok) continue
    const { data: metaLeads } = await leadsRes.json() as {
      data: { id: string; created_time: string; campaign_name?: string; field_data: FieldData[] }[]
    }

    for (const ml of (metaLeads ?? [])) {
      const email = field(ml.field_data, 'email', 'correo_electronico', 'correo', 'e-mail')
      if (!email || existingEmails.has(email.toLowerCase())) { skipped++; continue }

      const full_name =
        field(ml.field_data, 'full_name', 'nombre_completo', 'nombre', 'name') ||
        [
          field(ml.field_data, 'first_name', 'nombre', 'primer_nombre'),
          field(ml.field_data, 'last_name', 'apellido', 'apellidos'),
        ].filter(Boolean).join(' ') ||
        'Sin nombre'

      await createLead({
        full_name,
        email,
        phone: field(ml.field_data, 'phone_number', 'telefono', 'teléfono', 'celular', 'mobile', 'phone'),
        company_name: field(ml.field_data, 'company_name', 'empresa', 'compania', 'company'),
        source_campaign: ml.campaign_name ?? formName,
        status: 'new',
      })

      existingEmails.add(email.toLowerCase())
      imported++
    }
  }

  return NextResponse.json({ imported, skipped, total: imported + skipped, forms_found: formIds.size })
}
