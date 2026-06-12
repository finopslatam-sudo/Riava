'use client'

import { useState, type FormEvent } from 'react'
import { useAuth } from '@/lib/auth-context'

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
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
  )
}

function SuccessAlert({ message }: { message: string }) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
      style={{
        background: 'rgba(0,255,136,0.07)',
        border: '1px solid rgba(0,255,136,0.25)',
        color: '#00ff88',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      {message}
    </div>
  )
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
      style={{
        background: 'rgba(240,0,255,0.07)',
        border: '1px solid rgba(240,0,255,0.25)',
        color: '#f000ff',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      {message}
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(0,10,15,0.85)',
  border: '1px solid rgba(0,229,255,0.12)',
  borderRadius: 16,
  padding: 28,
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(0,20,30,0.7)',
  border: '1px solid rgba(0,229,255,0.15)',
  color: '#e0f7ff',
  caretColor: '#00e5ff',
}

const labelStyle: React.CSSProperties = {
  color: 'rgba(0,229,255,0.55)',
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: 2,
  display: 'block',
  marginBottom: 6,
}

export default function CuentaPage() {
  const { user, updateUser, updatePassword } = useAuth()

  // Profile form
  const [name, setName] = useState(user?.name ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Password form
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleProfileSave = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !lastName.trim() || !email.trim()) {
      setProfileMsg({ type: 'error', text: 'Todos los campos son obligatorios.' })
      return
    }
    updateUser({ name: name.trim(), lastName: lastName.trim(), email: email.trim() })
    setProfileMsg({ type: 'success', text: 'Datos actualizados correctamente.' })
    setTimeout(() => setProfileMsg(null), 4000)
  }

  const handlePasswordSave = (e: FormEvent) => {
    e.preventDefault()
    const storedPassword = localStorage.getItem('riava_password') ?? 'Riava@.01'
    if (currentPass !== storedPassword) {
      setPassMsg({ type: 'error', text: 'La contraseña actual no es correcta.' })
      return
    }
    if (newPass.length < 6) {
      setPassMsg({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres.' })
      return
    }
    if (newPass !== confirmPass) {
      setPassMsg({ type: 'error', text: 'Las contraseñas no coinciden.' })
      return
    }
    updatePassword(newPass)
    setCurrentPass('')
    setNewPass('')
    setConfirmPass('')
    setPassMsg({ type: 'success', text: 'Contraseña actualizada correctamente.' })
    setTimeout(() => setPassMsg(null), 4000)
  }

  const inputCls = 'w-full rounded-xl px-4 py-3 text-sm outline-none transition-all'

  const initials = user ? `${user.name[0]}${user.lastName[0]}`.toUpperCase() : 'RC'

  return (
    <div className="p-4 lg:p-8 min-h-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#e0f7ff' }}>Mi Cuenta</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(0,229,255,0.5)' }}>
          Administra tu información personal y seguridad
        </p>
      </div>

      {/* Avatar card */}
      <div className="flex items-center gap-5 mb-6 p-5 rounded-2xl" style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.1)' }}>
        <div
          className="flex items-center justify-center rounded-full text-xl font-bold shrink-0"
          style={{
            width: 64,
            height: 64,
            background: 'linear-gradient(135deg, #00e5ff 0%, #f000ff 100%)',
            color: '#000a0f',
            boxShadow: '0 0 24px rgba(0,229,255,0.3)',
          }}
        >
          {initials}
        </div>
        <div>
          <p className="font-bold text-base" style={{ color: '#e0f7ff' }}>
            {user?.name} {user?.lastName}
          </p>
          <p className="text-sm" style={{ color: 'rgba(0,229,255,0.5)' }}>{user?.email}</p>
          <span
            className="mt-1 inline-block text-xs px-2 py-0.5 rounded-full"
            style={{
              background: 'rgba(0,229,255,0.08)',
              border: '1px solid rgba(0,229,255,0.2)',
              color: '#00e5ff',
              fontSize: 10,
            }}
          >
            Super Administrador
          </span>
        </div>
      </div>

      {/* Profile form */}
      <div style={cardStyle} className="mb-5">
        <h2 className="font-semibold text-base mb-5 flex items-center gap-2" style={{ color: '#e0f7ff' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
          Información personal
        </h2>

        <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label style={labelStyle}>Nombre</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Tu nombre"
                className={inputCls}
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.border = '1px solid rgba(0,229,255,0.5)' }}
                onBlur={e => { e.currentTarget.style.border = '1px solid rgba(0,229,255,0.15)' }}
              />
            </div>
            {/* Last name */}
            <div>
              <label style={labelStyle}>Apellido</label>
              <input
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Tu apellido"
                className={inputCls}
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.border = '1px solid rgba(0,229,255,0.5)' }}
                onBlur={e => { e.currentTarget.style.border = '1px solid rgba(0,229,255,0.15)' }}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={labelStyle}>Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="correo@riava.cl"
              className={inputCls}
              style={inputStyle}
              onFocus={e => { e.currentTarget.style.border = '1px solid rgba(0,229,255,0.5)' }}
              onBlur={e => { e.currentTarget.style.border = '1px solid rgba(0,229,255,0.15)' }}
            />
          </div>

          {profileMsg && (
            profileMsg.type === 'success'
              ? <SuccessAlert message={profileMsg.text} />
              : <ErrorAlert message={profileMsg.text} />
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="btn-tron px-6 py-2.5 rounded-xl text-sm font-semibold"
              style={{ color: '#000a0f' }}
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>

      {/* Password form */}
      <div style={cardStyle}>
        <h2 className="font-semibold text-base mb-5 flex items-center gap-2" style={{ color: '#e0f7ff' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Cambiar contraseña
        </h2>

        <form onSubmit={handlePasswordSave} className="flex flex-col gap-4">
          {/* Current password */}
          <div>
            <label style={labelStyle}>Contraseña actual</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPass}
                onChange={e => setCurrentPass(e.target.value)}
                placeholder="••••••••"
                className={`${inputCls} pr-12`}
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.border = '1px solid rgba(0,229,255,0.5)' }}
                onBlur={e => { e.currentTarget.style.border = '1px solid rgba(0,229,255,0.15)' }}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors"
                style={{ color: 'rgba(0,229,255,0.4)' }}
                tabIndex={-1}
                onMouseEnter={e => { e.currentTarget.style.color = '#00e5ff' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(0,229,255,0.4)' }}
              >
                <EyeIcon open={showCurrent} />
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label style={labelStyle}>Nueva contraseña</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className={`${inputCls} pr-12`}
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.border = '1px solid rgba(0,229,255,0.5)' }}
                onBlur={e => { e.currentTarget.style.border = '1px solid rgba(0,229,255,0.15)' }}
              />
              <button
                type="button"
                onClick={() => setShowNew(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors"
                style={{ color: 'rgba(0,229,255,0.4)' }}
                tabIndex={-1}
                onMouseEnter={e => { e.currentTarget.style.color = '#00e5ff' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(0,229,255,0.4)' }}
              >
                <EyeIcon open={showNew} />
              </button>
            </div>
            {/* Strength indicator */}
            {newPass && (
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4].map(level => {
                  const strength = newPass.length >= 12 ? 4 : newPass.length >= 8 ? 3 : newPass.length >= 6 ? 2 : 1
                  const colors = ['#f000ff', '#fb923c', '#00e5ff', '#00ff88']
                  return (
                    <div
                      key={level}
                      className="flex-1 h-1 rounded-full transition-all"
                      style={{ background: level <= strength ? colors[strength - 1] : 'rgba(255,255,255,0.1)' }}
                    />
                  )
                })}
                <span className="text-xs ml-1" style={{ color: 'rgba(0,229,255,0.4)', fontSize: 10 }}>
                  {newPass.length < 6 ? 'Débil' : newPass.length < 8 ? 'Regular' : newPass.length < 12 ? 'Buena' : 'Fuerte'}
                </span>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label style={labelStyle}>Confirmar nueva contraseña</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)}
                placeholder="Repite la nueva contraseña"
                className={`${inputCls} pr-12`}
                style={{
                  ...inputStyle,
                  border: confirmPass && newPass && confirmPass !== newPass
                    ? '1px solid rgba(240,0,255,0.5)'
                    : confirmPass && confirmPass === newPass
                    ? '1px solid rgba(0,255,136,0.4)'
                    : inputStyle.border,
                }}
                onFocus={e => {
                  if (!confirmPass || confirmPass === newPass) {
                    e.currentTarget.style.border = '1px solid rgba(0,229,255,0.5)'
                  }
                }}
                onBlur={e => {
                  if (confirmPass && newPass && confirmPass !== newPass) {
                    e.currentTarget.style.border = '1px solid rgba(240,0,255,0.5)'
                  } else if (confirmPass && confirmPass === newPass) {
                    e.currentTarget.style.border = '1px solid rgba(0,255,136,0.4)'
                  } else {
                    e.currentTarget.style.border = '1px solid rgba(0,229,255,0.15)'
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors"
                style={{ color: 'rgba(0,229,255,0.4)' }}
                tabIndex={-1}
                onMouseEnter={e => { e.currentTarget.style.color = '#00e5ff' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(0,229,255,0.4)' }}
              >
                <EyeIcon open={showConfirm} />
              </button>
              {/* Match indicator */}
              {confirmPass && (
                <div className="absolute right-10 top-1/2 -translate-y-1/2">
                  {confirmPass === newPass ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f000ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  )}
                </div>
              )}
            </div>
          </div>

          {passMsg && (
            passMsg.type === 'success'
              ? <SuccessAlert message={passMsg.text} />
              : <ErrorAlert message={passMsg.text} />
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="btn-tron px-6 py-2.5 rounded-xl text-sm font-semibold"
              style={{ color: '#000a0f' }}
            >
              Actualizar contraseña
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
