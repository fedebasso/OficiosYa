import { create } from 'zustand'
import { authService } from '../services/authService'

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

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: false,
  error: null,

  init: async () => {
    const user = await authService.getSession()
    set({ user })
    authService.onAuthChange((u) => set({ user: u }))
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const user = await authService.signIn(email, password)
      set({ user, loading: false })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Error al iniciar sesión', loading: false })
      throw e
    }
  },

  signUp: async (email, password, fullName, role) => {
    set({ loading: true, error: null })
    try {
      const user = await authService.signUp(email, password, fullName, role)
      set({ user, loading: false })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Error al registrarse', loading: false })
      throw e
    }
  },

  signOut: async () => {
    await authService.signOut()
    set({ user: null })
  },
}))
