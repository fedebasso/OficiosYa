export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Ahora'
  if (m < 60) return `hace ${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `hace ${h}h`
  return `hace ${Math.floor(h / 24)}d`
}

export function formatScheduled(iso: string): string {
  const d = new Date(iso)
  const date = d.toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' })
  const hasTime = iso.includes('T') && !iso.endsWith('T00:00:00')
  const time = hasTime ? d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }) : null
  return time ? `${date} · ${time}hs` : date
}
