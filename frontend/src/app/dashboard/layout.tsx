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
    href: '/dashboard/plantillas',
    label: 'Plantillas Web',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
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
        <nav className="flex-1 px-3 py-2 flex flex-col gap-1">
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
        </nav>

        {/* User + logout */}
        <div className="p-4" style={{ borderTop: '1px solid rgba(0,229,255,0.1)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0"
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
