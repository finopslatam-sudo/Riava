'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { RiavaLogo } from '@/components/ui/RiavaLogo'

const NAV = [
  {
    href: '/dashboard/cotizaciones',
    label: 'Cotizaciones',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10,9 9,9 8,9" />
      </svg>
    ),
  },
  {
    href: '/dashboard/calendario',
    label: 'Calendario',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    href: '/dashboard/servicios',
    label: 'Servicios',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2.59 12.58a2 2 0 0 1 0-2.83l7.17-7.17a2 2 0 0 1 2.83 0l7.99 7.99a2 2 0 0 1 0 2.83Z" />
        <circle cx="8.5" cy="8.5" r="1.5" />
      </svg>
    ),
  },
  {
    href: '/dashboard/automatizaciones',
    label: 'Automatizaciones',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/cuenta',
    label: 'Mi Cuenta',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
]

const LEADS_NAV = [
  {
    href: '/dashboard/meta-ads',
    label: 'Meta Ads',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  {
    href: '/dashboard/campanas',
    label: 'Campañas',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    href: '/dashboard/leads',
    label: 'Leads',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: '/dashboard/pipeline',
    label: 'Pipeline',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="5" height="18" rx="1" />
        <rect x="10" y="3" width="5" height="12" rx="1" />
        <rect x="17" y="3" width="5" height="8" rx="1" />
      </svg>
    ),
  },
  {
    href: '/dashboard/analiticas',
    label: 'Analíticas',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
]

const WHATSAPP_NAV = [
  {
    href: '/dashboard/whatsapp',
    label: 'WhatsApp IA',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.5 8.5 0 0 1-11.8 7.8L3 21l1.8-6.1A8.5 8.5 0 1 1 21 11.5z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/conversaciones',
    label: 'Conversaciones',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#000a0f' }}>
        <div className="loader" />
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const initials = `${user.name[0]}${user.lastName[0]}`.toUpperCase()

  return (
    <div className="flex min-h-screen" style={{ background: '#000a0f' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          style={{ background: 'rgba(0,10,15,0.7)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 h-full flex flex-col transition-transform duration-300 lg:translate-x-0 lg:relative lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          width: 240,
          background: 'rgba(0,10,15,0.97)',
          borderRight: '1px solid rgba(0,229,255,0.12)',
          boxShadow: '4px 0 32px rgba(0,0,0,0.5)',
        }}
      >
        {/* Logo */}
        <div className="p-6 pb-4">
          <Link href="/" className="inline-block transition-opacity hover:opacity-75">
            <RiavaLogo variant="full" className="h-8 w-auto" />
          </Link>
          <div className="divider-tron mt-4" />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 flex flex-col gap-1 overflow-y-auto">
          {NAV.map(item => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  color: active ? '#00e5ff' : 'rgba(224,247,255,0.55)',
                  background: active ? 'rgba(0,229,255,0.08)' : 'transparent',
                  border: active ? '1px solid rgba(0,229,255,0.2)' : '1px solid transparent',
                }}
              >
                <span style={{ color: active ? '#00e5ff' : 'rgba(0,229,255,0.4)' }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}

          {/* Riava Leads */}
          <div className="mt-4 mb-1 px-3">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(0,229,255,0.35)' }}>
              Riava Leads
            </p>
          </div>
          <div className="divider-tron mx-3 mb-1" />
          {LEADS_NAV.map(item => {
            const active = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  color: active ? '#00e5ff' : 'rgba(224,247,255,0.5)',
                  background: active ? 'rgba(0,229,255,0.08)' : 'transparent',
                  border: active ? '1px solid rgba(0,229,255,0.2)' : '1px solid transparent',
                }}
              >
                <span style={{ color: active ? '#00e5ff' : 'rgba(0,229,255,0.4)' }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}

          {/* WhatsApp IA */}
          <div className="mt-4 mb-1 px-3">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(0,229,255,0.35)' }}>
              WhatsApp IA
            </p>
          </div>
          <div className="divider-tron mx-3 mb-1" />
          {WHATSAPP_NAV.map(item => {
            const active = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  color: active ? '#00e5ff' : 'rgba(224,247,255,0.5)',
                  background: active ? 'rgba(0,229,255,0.08)' : 'transparent',
                  border: active ? '1px solid rgba(0,229,255,0.2)' : '1px solid transparent',
                }}
              >
                <span style={{ color: active ? '#00e5ff' : 'rgba(0,229,255,0.4)' }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User + logout */}
        <div className="p-4" style={{ borderTop: '1px solid rgba(0,229,255,0.1)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="flex items-center justify-center rounded-full text-xs font-bold shrink-0"
              style={{
                width: 36,
                height: 36,
                background: 'linear-gradient(135deg, #00e5ff 0%, #f000ff 100%)',
                color: '#000a0f',
              }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: '#e0f7ff' }}>
                {user.name} {user.lastName}
              </p>
              <p className="text-xs truncate" style={{ color: 'rgba(0,229,255,0.5)' }}>
                {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all"
            style={{
              color: 'rgba(240,0,255,0.7)',
              border: '1px solid rgba(240,0,255,0.15)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(240,0,255,0.08)'
              e.currentTarget.style.color = '#f000ff'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'rgba(240,0,255,0.7)'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header
          className="lg:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-10"
          style={{
            background: 'rgba(0,10,15,0.95)',
            borderBottom: '1px solid rgba(0,229,255,0.1)',
          }}
        >
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="p-2 rounded-lg"
            style={{ color: '#00e5ff' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <RiavaLogo variant="full" className="h-6 w-auto" />
          <div style={{ width: 36 }} />
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
