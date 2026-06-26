// Handler de eventos push reales — fase 2 (servidor via Supabase Edge Function)
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {}
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Ofix', {
      body: data.body ?? '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: data.url ?? '/' },
    })
  )
})

// Al tocar la notificación → navegar a la URL correcta dentro de la app
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Buscar una pestaña existente del mismo scope
      const existing = clientList.find(
        (c) => c.url.startsWith(self.registration.scope) && 'focus' in c
      )
      if (existing) {
        // Usar navigate() en vez de postMessage — no depende del listener React
        return existing.focus().then(() => existing.navigate(url))
      }
      // Cold start: openWindow ya navega a la URL correcta
      return clients.openWindow(url)
    })
  )
})
