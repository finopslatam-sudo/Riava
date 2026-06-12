'use client'

import { useState, useEffect } from 'react'
import { leadsAuth, leadsMetaApi, type MetaConnection } from '@/lib/leads-api'

type Step = 'check' | 'register' | 'connected'

export default function MetaAdsPage() {
  const [step, setStep] = useState<Step>('check')
  const [connections, setConnections] = useState<MetaConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Registration form
  const [form, setForm] = useState({ company_name: '', name: '', last_name: '', email: '', password: '' })
  const [registering, setRegistering] = useState(false)
  const [regError, setRegError] = useState('')

  useEffect(() => {
    if (!leadsAuth.isConnected()) {
      setStep('register')
      setLoading(false)
      return
    }
    leadsMetaApi.listConnections()
      .then(data => {
        setConnections(data)
        setStep(data.length > 0 ? 'connected' : 'check')
      })
      .catch(() => setStep('check'))
      .finally(() => setLoading(false))
  }, [])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegistering(true)
    setRegError('')
    try {
      const tokens = await leadsAuth.register(form)
      leadsAuth.saveTokens(tokens)
      setStep('check')
      setLoading(true)
      const data = await leadsMetaApi.listConnections().catch(() => [])
      setConnections(data)
      setStep(data.length > 0 ? 'connected' : 'check')
    } catch (err: unknown) {
      const e = err as { body?: { detail?: string } }
      setRegError(e?.body?.detail ?? 'Error al registrar. Verifica los datos.')
    } finally {
      setRegistering(false)
      setLoading(false)
    }
  }

  const handleConnectMeta = async () => {
    setError('')
    try {
      const { url } = await leadsMetaApi.getOAuthUrl()
      window.location.href = url
    } catch {
      setError('No se pudo obtener el enlace de conexión. Asegúrate de que el backend está activo.')
    }
  }

  const handleDisconnect = async (id: string) => {
    try {
      await leadsMetaApi.disconnect(id)
      setConnections(prev => prev.filter(c => c.id !== id))
    } catch {
      setError('Error al desconectar la cuenta.')
    }
  }

  const inputStyle = {
    background: 'rgba(0,20,30,0.7)',
    border: '1px solid rgba(0,229,255,0.15)',
    color: '#e0f7ff',
    caretColor: '#00e5ff',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="loader" />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#e0f7ff' }}>Conexión Meta Ads</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(0,229,255,0.5)' }}>
          Conecta tus cuentas publicitarias de Facebook e Instagram para capturar leads automáticamente
        </p>
      </div>

      {/* Register Step */}
      {step === 'register' && (
        <div className="max-w-lg mx-auto">
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(0,10,18,0.9)', border: '1px solid rgba(0,229,255,0.15)' }}>
            <div className="px-6 py-5" style={{ borderBottom: '1px solid rgba(0,229,255,0.1)' }}>
              <h2 className="text-base font-semibold" style={{ color: '#00e5ff' }}>Crear cuenta Riava Leads</h2>
              <p className="text-xs mt-1" style={{ color: 'rgba(0,229,255,0.4)' }}>
                Necesitas una cuenta para gestionar tus conexiones con Meta Ads
              </p>
            </div>
            <form onSubmit={handleRegister} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'rgba(0,229,255,0.5)' }}>Nombre</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Juan" required
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'rgba(0,229,255,0.5)' }}>Apellido</label>
                  <input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                    placeholder="Pérez" required
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} />
                </div>
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'rgba(0,229,255,0.5)' }}>Empresa</label>
                <input value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
                  placeholder="Mi Empresa SpA" required
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'rgba(0,229,255,0.5)' }}>Email</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="tu@empresa.cl" required
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'rgba(0,229,255,0.5)' }}>Contraseña</label>
                <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Mínimo 8 chars, una mayúscula y un número" required
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} />
              </div>
              {regError && (
                <p className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(240,0,80,0.1)', border: '1px solid rgba(240,0,80,0.3)', color: '#f00050' }}>
                  {regError}
                </p>
              )}
              <button type="submit" disabled={registering}
                className="btn-tron w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                style={{ color: '#000a0f', opacity: registering ? 0.7 : 1 }}>
                {registering ? 'Registrando...' : 'Crear cuenta y continuar'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Check / Connect Step */}
      {step === 'check' && (
        <div className="max-w-2xl mx-auto">
          {/* Info card */}
          <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(0,10,18,0.9)', border: '1px solid rgba(0,229,255,0.15)' }}>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, #1877f2 0%, #0050c8 100%)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-base" style={{ color: '#e0f7ff' }}>Conectar Meta Business</h3>
                <p className="text-sm mt-1" style={{ color: 'rgba(224,247,255,0.5)' }}>
                  Autoriza a Riava Leads para acceder a tus cuentas publicitarias de Facebook e Instagram y comenzar a importar leads de tus formularios de captación.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {[
                { icon: '📋', title: 'Lead Forms', desc: 'Captura automática desde formularios de Meta' },
                { icon: '🔄', title: 'Sync en tiempo real', desc: 'Leads disponibles en segundos vía webhook' },
                { icon: '🔒', title: 'Seguro', desc: 'Tokens encriptados, permisos mínimos necesarios' },
              ].map(f => (
                <div key={f.title} className="px-4 py-3 rounded-xl" style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.1)' }}>
                  <div className="text-lg mb-1">{f.icon}</div>
                  <p className="text-xs font-semibold" style={{ color: '#e0f7ff' }}>{f.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(224,247,255,0.4)' }}>{f.desc}</p>
                </div>
              ))}
            </div>

            {error && (
              <p className="text-xs px-3 py-2 rounded-lg mb-4" style={{ background: 'rgba(240,0,80,0.1)', border: '1px solid rgba(240,0,80,0.3)', color: '#f00050' }}>
                {error}
              </p>
            )}

            <button onClick={handleConnectMeta}
              className="btn-tron w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-3"
              style={{ color: '#000a0f' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
              Conectar con Meta Business
            </button>
          </div>

          <p className="text-xs text-center" style={{ color: 'rgba(0,229,255,0.3)' }}>
            Al conectar, aceptas los términos de la API de Meta para negocios. Puedes desconectar en cualquier momento.
          </p>
        </div>
      )}

      {/* Connected Step */}
      {step === 'connected' && (
        <div className="max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: '#00e564' }} />
              <span className="text-sm font-medium" style={{ color: 'rgba(224,247,255,0.7)' }}>
                {connections.length} cuenta{connections.length !== 1 ? 's' : ''} conectada{connections.length !== 1 ? 's' : ''}
              </span>
            </div>
            <button onClick={handleConnectMeta}
              className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              style={{ background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.2)', color: '#00e5ff' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Agregar cuenta
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {connections.map(conn => (
              <div key={conn.id} className="px-5 py-4 rounded-2xl flex items-center gap-4"
                style={{ background: 'rgba(0,10,18,0.9)', border: '1px solid rgba(0,229,255,0.12)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, #1877f2 0%, #0050c8 100%)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#e0f7ff' }}>{conn.page_name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(0,229,255,0.5)' }}>
                    Cuenta: {conn.ad_account_name} · {conn.ad_account_id}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1.5"
                    style={{
                      background: conn.is_active ? 'rgba(0,229,100,0.1)' : 'rgba(255,160,0,0.1)',
                      border: `1px solid ${conn.is_active ? 'rgba(0,229,100,0.3)' : 'rgba(255,160,0,0.3)'}`,
                      color: conn.is_active ? '#00e564' : '#ffa000',
                    }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'currentColor' }} />
                    {conn.is_active ? 'Activa' : 'Inactiva'}
                  </span>
                  <button onClick={() => handleDisconnect(conn.id)}
                    className="text-xs px-3 py-1.5 rounded-lg transition-all"
                    style={{ color: 'rgba(240,0,255,0.5)', border: '1px solid rgba(240,0,255,0.15)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#f000ff'; e.currentTarget.style.background = 'rgba(240,0,255,0.08)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(240,0,255,0.5)'; e.currentTarget.style.background = 'transparent' }}>
                    Desconectar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
