/**
 * Script para obtener el Google OAuth2 Refresh Token (ejecutar UNA VEZ).
 *
 * Instrucciones:
 * 1. Ve a https://console.cloud.google.com/apis/credentials
 * 2. Selecciona el proyecto "riava-reuniones-meet" (o el que corresponda)
 * 3. Haz clic en "+ Crear credenciales" → "ID de cliente OAuth 2.0"
 * 4. Tipo de aplicación: "Aplicación de escritorio"
 * 5. Descarga el JSON y copia client_id y client_secret abajo
 * 6. Ejecuta: node get-google-refresh-token.mjs
 * 7. Visita la URL que aparece, autoriza con tu cuenta Google personal
 * 8. Copia el código de la URL de redireccionamiento y pégalo cuando se pida
 * 9. Guarda el refresh_token en Vercel como GOOGLE_OAUTH_REFRESH_TOKEN
 */

import { createServer } from 'http'
import { createInterface } from 'readline'

// ── CONFIGURA ESTOS VALORES ───────────────────────────────────────────────────
const CLIENT_ID     = process.env.GOOGLE_OAUTH_CLIENT_ID     || 'PEGA_TU_CLIENT_ID_AQUI'
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET || 'PEGA_TU_CLIENT_SECRET_AQUI'
const REDIRECT_URI  = 'urn:ietf:wg:oauth:2.0:oob'  // Para apps de escritorio (sin servidor local)
// ─────────────────────────────────────────────────────────────────────────────

const SCOPES = 'https://www.googleapis.com/auth/calendar'

const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
authUrl.searchParams.set('client_id',     CLIENT_ID)
authUrl.searchParams.set('redirect_uri',  REDIRECT_URI)
authUrl.searchParams.set('response_type', 'code')
authUrl.searchParams.set('scope',         SCOPES)
authUrl.searchParams.set('access_type',   'offline')
authUrl.searchParams.set('prompt',        'consent')  // Fuerza que entregue refresh_token

console.log('\n═══════════════════════════════════════════════════════════════')
console.log('  PASO 1: Visita esta URL en tu navegador (con tu cuenta Google):')
console.log('═══════════════════════════════════════════════════════════════\n')
console.log(authUrl.toString())
console.log('\n═══════════════════════════════════════════════════════════════')
console.log('  PASO 2: Autoriza el acceso y copia el código que aparece.')
console.log('═══════════════════════════════════════════════════════════════\n')

const rl = createInterface({ input: process.stdin, output: process.stdout })
rl.question('Pega el código de autorización aquí: ', async (code) => {
  rl.close()
  code = code.trim()

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri:  REDIRECT_URI,
      grant_type:    'authorization_code',
    }).toString(),
  })

  const data = await res.json()

  if (!res.ok || !data.refresh_token) {
    console.error('\n❌ Error:', JSON.stringify(data, null, 2))
    console.log('\nVerifica que CLIENT_ID y CLIENT_SECRET sean correctos.')
    process.exit(1)
  }

  console.log('\n✅ ¡Listo! Agrega estas variables en Vercel:\n')
  console.log(`GOOGLE_OAUTH_CLIENT_ID     = ${CLIENT_ID}`)
  console.log(`GOOGLE_OAUTH_CLIENT_SECRET = ${CLIENT_SECRET}`)
  console.log(`GOOGLE_OAUTH_REFRESH_TOKEN = ${data.refresh_token}`)
  console.log(`\nTambién asegúrate de tener:`)
  console.log(`GOOGLE_CALENDAR_ID         = tu-email@gmail.com`)
  console.log('\nEl GOOGLE_OAUTH_REFRESH_TOKEN no expira (a menos que revoques el acceso).')
})
