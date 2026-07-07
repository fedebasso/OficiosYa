import { useState } from 'react'
import { formatUYU } from '../../lib/money'
import type { EarningJobView } from '../../services/earningsService'

function relativeDate(iso: string): string {
  const d = new Date(iso)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const that = new Date(d); that.setHours(0, 0, 0, 0)
  const diffDays = Math.round((today.getTime() - that.getTime()) / 86400000)
  const hhmm = d.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 0) return `hoy ${hhmm}`
  if (diffDays === 1) return 'ayer'
  const dias = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
  return `${dias[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`
}

export function EarningsJobList({ jobs }: { jobs: EarningJobView[] }) {
  const [showAll, setShowAll] = useState(false)
  if (jobs.length === 0) return null
  const visible = showAll ? jobs : jobs.slice(0, 10)

  return (
    <div className="px-5">
      <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#AAAAAA' }}>
        Últimos trabajos
      </p>
      <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', border: '1.5px solid #ECE4D8' }}>
        {visible.map((j, i) => (
          <div key={j.requestId} className="flex items-center justify-between px-4 py-3"
               style={{ borderTop: i === 0 ? 'none' : '1px solid #F0EAE0' }}>
            <div className="min-w-0">
              <p className="text-sm font-bold capitalize truncate" style={{ color: '#1A1712' }}>
                {j.category || 'Servicio'}
              </p>
              <p className="text-xs truncate" style={{ color: '#9C917E' }}>
                {j.clientName || 'Cliente'} · {relativeDate(j.completedAt)}
              </p>
            </div>
            <span className="text-sm font-black flex-shrink-0 ml-3"
                  style={{ color: '#1A1712', fontVariantNumeric: 'tabular-nums' }}>
              {formatUYU(j.amount)}
            </span>
          </div>
        ))}
      </div>
      {jobs.length > 10 && !showAll && (
        <button type="button" onClick={() => setShowAll(true)}
                className="w-full text-center text-[13px] font-bold py-2.5 mt-1" style={{ color: '#E8683A' }}>
          Ver todos ({jobs.length})
        </button>
      )}
    </div>
  )
}
