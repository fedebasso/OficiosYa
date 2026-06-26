import { create } from 'zustand'
import type { NotifPayload, NotifPermission } from '../types/notifications'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined
const STORAGE_SUBSCRIPTION_KEY = 'ofix_push_subscription'
const STORAGE_BANNER_KEY = 'ofix_notif_banner_dismissed'

interface NotificationState {
  permission: NotifPermission
  subscription: PushSubscription | null
  bannerDismissed: boolean
  init: () => void
  requestPermission: () => Promise<void>
  dismissBanner: () => void
  sendLocalNotification: (payload: NotifPayload) => Promise<void>
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  permission: 'default',
  subscription: null,
  bannerDismissed: false,

  init: () => {
    if (!('Notification' in window)) return
    set({
      permission: Notification.permission as NotifPermission,
      bannerDismissed: localStorage.getItem(STORAGE_BANNER_KEY) === 'true',
    })
  },

  requestPermission: async () => {
    if (!('Notification' in window)) return
    const result = await Notification.requestPermission()
    set({ permission: result as NotifPermission })
    if (result !== 'granted') return

    try {
      const reg = await navigator.serviceWorker.ready
      const options: PushSubscriptionOptionsInit = { userVisibleOnly: true }
      if (VAPID_PUBLIC_KEY) {
        const key = Uint8Array.from(atob(VAPID_PUBLIC_KEY.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))
        options.applicationServerKey = key
      }
      const sub = await reg.pushManager.subscribe(options)
      localStorage.setItem(STORAGE_SUBSCRIPTION_KEY, JSON.stringify(sub))
      set({ subscription: sub })
    } catch (_e) { /* SW no disponible en desarrollo */ }
  },

  dismissBanner: () => {
    localStorage.setItem(STORAGE_BANNER_KEY, 'true')
    set({ bannerDismissed: true })
  },

  sendLocalNotification: async (payload) => {
    if (get().permission !== 'granted') return
    if (!('serviceWorker' in navigator)) return
    try {
      const reg = await navigator.serviceWorker.ready
      await reg.showNotification(payload.title, {
        body: payload.body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        data: { url: payload.url },
      })
    } catch (_e) { /* falla silenciosamente en contextos sin SW */ }
  },
}))
