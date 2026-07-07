import { create } from 'zustand'

export interface ToastAction { label: string; to: string }
interface ToastState {
  message: string | null
  action: ToastAction | null
  show: (message: string, action?: ToastAction) => void
  hide: () => void
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  action: null,
  show: (message, action) => set({ message, action: action ?? null }),
  hide: () => set({ message: null, action: null }),
}))
