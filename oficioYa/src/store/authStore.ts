import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export interface UserProfile {
  id: string
  role: 'client' | 'professional'
  full_name: string
  phone: string | null
  avatar_url: string | null
  city: string
}

interface AuthStore {
  user: UserProfile | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string, role: 'client' | 'professional') => Promise<void>
  signOut: () => Promise<void>
  init: () => Promise<void>
}

const isPlaceholder = () =>
  (import.meta.env.VITE_SUPABASE_URL ?? '').includes('placeholder')

// Mock para demo
const MOCK_USERS: Record<string, { password: string; profile: UserProfile }> = {
  'cliente@demo.com': {
    password: 'demo123',
    profile: { id: 'mock-client-1', role: 'client', full_name: 'María González', phone: '099111222', avatar_url: null, city: 'Montevideo' },
  },
  'pro@demo.com': {
    password: 'demo123',
    profile: { id: 'mock-pro-1', role: 'professional', full_name: 'Carlos Méndez', phone: '099333444', avatar_url: null, city: 'Montevideo' },
  },
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: false,
  error: null,

  init: async () => {
    if (isPlaceholder()) {
      const stored = localStorage.getItem('oficioYa_mock_user')
      if (stored) set({ user: JSON.parse(stored) })
      return
    }
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      if (data) set({ user: data as UserProfile })
    }
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
        if (data) set({ user: data as UserProfile })
      } else {
        set({ user: null })
      }
    })
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null })
    try {
      if (isPlaceholder()) {
        const mockUser = MOCK_USERS[email]
        if (!mockUser || mockUser.password !== password) throw new Error('Credenciales incorrectas')
        localStorage.setItem('oficioYa_mock_user', JSON.stringify(mockUser.profile))
        set({ user: mockUser.profile, loading: false })
        return
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Error al iniciar sesión', loading: false })
      throw e
    }
    set({ loading: false })
  },

  signUp: async (email, password, fullName, role) => {
    set({ loading: true, error: null })
    try {
      if (isPlaceholder()) {
        const profile: UserProfile = { id: `mock-${Date.now()}`, role, full_name: fullName, phone: null, avatar_url: null, city: 'Montevideo' }
        localStorage.setItem('oficioYa_mock_user', JSON.stringify(profile))
        set({ user: profile, loading: false })
        return
      }
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      if (data.user) {
        await supabase.from('profiles').insert({ id: data.user.id, role, full_name: fullName, city: 'Montevideo' })
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Error al registrarse', loading: false })
      throw e
    }
    set({ loading: false })
  },

  signOut: async () => {
    if (isPlaceholder()) {
      localStorage.removeItem('oficioYa_mock_user')
      set({ user: null })
      return
    }
    await supabase.auth.signOut()
    set({ user: null })
  },
}))
