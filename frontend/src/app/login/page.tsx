'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { RiavaLogo } from '@/components/ui/RiavaLogo'

export default function LoginPage() {
  const { login, user, loading } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard/cotizaciones')
  }, [user, loading, router])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const ok = login(email.trim(), password)
    if (ok) {
      router.push('/dashboard/cotizaciones')
    } else {
      setError('Credenciales incorrectas. Verifica tu correo y contraseña.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#000a0f' }}>
        <div className="loader" />
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: '#000a0f' }}
    >
      {/* Tron grid background */}
      <div className="tron-scene">
        <div className="tron-sky-glow" />
        <div className="tron-perspective-wrap">
          <div className="tron-grid-floor" />
        </div>
        <div className="tron-horizon-line" />
        <div className="tron-scanlines" />
        <div className="tron-vignette" />
      </div>

      {/* Ambient glows */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: '10%',
          left: '20%',
          width: 480,
          height: 480,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,229,255,0.07) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="pointer-events-none absolute"
        style={{
          bottom: '15%',
          right: '15%',
          width: 360,
          height: 360,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(240,0,255,0.06) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        <div
          className="glass-tron rounded-2xl p-8"
          style={{
            border: '1px solid rgba(0,229,255,0.2)',
            boxShadow: '0 0 60px rgba(0,229,255,0.08), 0 24px 48px rgba(0,0,0,0.6)',
          }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <RiavaLogo variant="full" className="h-12 w-auto mb-4" />
            <div className="divider-tron w-full" />
            <p className="mt-4 text-sm" style={{ color: 'rgba(0,229,255,0.6)' }}>
              Panel de administración
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium tracking-widest uppercase" style={{ color: 'rgba(0,229,255,0.7)' }}>
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="correo@riava.cl"
                className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-all"
                style={{
                  background: 'rgba(0,20,30,0.8)',
                  border: '1px solid rgba(0,229,255,0.2)',
                  color: '#e0f7ff',
                  caretColor: '#00e5ff',
                }}
                onFocus={e => { e.currentTarget.style.border = '1px solid rgba(0,229,255,0.6)' }}
                onBlur={e => { e.currentTarget.style.border = '1px solid rgba(0,229,255,0.2)' }}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium tracking-widest uppercase" style={{ color: 'rgba(0,229,255,0.7)' }}>
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-lg px-4 py-3 pr-12 text-sm outline-none transition-all"
                  style={{
                    background: 'rgba(0,20,30,0.8)',
                    border: '1px solid rgba(0,229,255,0.2)',
                    color: '#e0f7ff',
                    caretColor: '#00e5ff',
                  }}
                  onFocus={e => { e.currentTarget.style.border = '1px solid rgba(0,229,255,0.6)' }}
                  onBlur={e => { e.currentTarget.style.border = '1px solid rgba(0,229,255,0.2)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors"
                  style={{ color: 'rgba(0,229,255,0.5)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#00e5ff' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(0,229,255,0.5)' }}
                  tabIndex={-1}
                >
                  {showPass ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="rounded-lg px-4 py-3 text-sm"
                style={{
                  background: 'rgba(240,0,255,0.08)',
                  border: '1px solid rgba(240,0,255,0.3)',
                  color: '#f000ff',
                }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="btn-tron w-full rounded-lg py-3 text-sm font-semibold tracking-wider uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={{ color: '#000a0f' }}
            >
              {submitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="text-center text-xs mt-6" style={{ color: 'rgba(61,112,128,0.8)' }}>
            Acceso restringido · Solo administradores
          </p>
        </div>
      </div>
    </div>
  )
}
