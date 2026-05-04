'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

const DEFAULT_CREDENTIALS = {
  email: 'contacto@riava.cl',
  password: 'Riava@.01',
}

type User = {
  email: string
  name: string
  lastName: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => boolean
  logout: () => void
  updateUser: (data: Partial<User>) => void
  updatePassword: (newPassword: string) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('riava_user')
      if (stored) setUser(JSON.parse(stored))
    } catch {
      // ignore
    }
    setLoading(false)
  }, [])

  const login = (email: string, password: string): boolean => {
    const storedPassword = localStorage.getItem('riava_password') ?? DEFAULT_CREDENTIALS.password
    const storedEmail = localStorage.getItem('riava_email') ?? DEFAULT_CREDENTIALS.email
    if (email === storedEmail && password === storedPassword) {
      const u: User = {
        email,
        name: localStorage.getItem('riava_name') ?? 'Richard',
        lastName: localStorage.getItem('riava_lastname') ?? 'Chamorro Huircan',
      }
      setUser(u)
      localStorage.setItem('riava_user', JSON.stringify(u))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('riava_user')
  }

  const updateUser = (data: Partial<User>) => {
    if (!user) return
    const updated = { ...user, ...data }
    setUser(updated)
    localStorage.setItem('riava_user', JSON.stringify(updated))
    if (data.name) localStorage.setItem('riava_name', data.name)
    if (data.lastName) localStorage.setItem('riava_lastname', data.lastName)
    if (data.email) localStorage.setItem('riava_email', data.email)
  }

  const updatePassword = (newPassword: string) => {
    localStorage.setItem('riava_password', newPassword)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, updatePassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
