import { supabase } from '../lib/supabase'
import { IS_DEMO_MODE } from '../lib/env'
import type { UserProfile } from '../store/authStore'

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

const STORAGE_KEY = 'oficioYa_mock_user'

export const authService = {
  async getSession(): Promise<UserProfile | null> {
    if (IS_DEMO_MODE) {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? (JSON.parse(stored) as UserProfile) : null
    }
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return null
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
    return data as UserProfile | null
  },

  onAuthChange(cb: (user: UserProfile | null) => void) {
    if (IS_DEMO_MODE) return () => {}
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
        cb(data as UserProfile ?? null)
      } else {
        cb(null)
      }
    })
    return () => subscription.unsubscribe()
  },

  async signIn(email: string, password: string): Promise<UserProfile> {
    if (IS_DEMO_MODE) {
      const mock = MOCK_USERS[email]
      if (!mock || mock.password !== password) throw new Error('Credenciales incorrectas')
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mock.profile))
      return mock.profile
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    const profile = await authService.getSession()
    if (!profile) throw new Error('No se pudo obtener el perfil')
    return profile
  },

  async signUp(email: string, password: string, fullName: string, role: 'client' | 'professional'): Promise<UserProfile> {
    if (IS_DEMO_MODE) {
      const profile: UserProfile = {
        id: `mock-${Date.now()}`,
        role,
        full_name: fullName,
        phone: null,
        avatar_url: null,
        city: 'Montevideo',
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
      return profile
    }
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    if (data.user) {
      await supabase.from('profiles').insert({ id: data.user.id, role, full_name: fullName, city: 'Montevideo' })
    }
    const profile = await authService.getSession()
    if (!profile) throw new Error('No se pudo obtener el perfil')
    return profile
  },

  async signOut(): Promise<void> {
    if (IS_DEMO_MODE) {
      localStorage.removeItem(STORAGE_KEY)
      return
    }
    await supabase.auth.signOut()
  },
}
