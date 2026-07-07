import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatUYU } from '../../lib/money'
import type { DailyEarning } from '../../services/earningsService'

interface Props {
  data: DailyEarning[]
  labels: string[]          // etiqueta por barra (ej. 'L','M',... o 'S1')
  highlightIndex?: number   // barra resaltada (día/semana actual)
}

export function EarningsBars({ data, labels, highlightIndex }: Props) {
  const [sel, setSel] = useState<number | null>(null)
  const max = Math.max(1, ...data.map((d) => d.amount))
  const selected = sel !== null ? data[sel] : null

  return (
    <div className="px-5">
      <div className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1.5px solid #ECE4D8' }}>
        <div className="h-10 mb-3">
          {selected ? (
            <div>
              <p className="text-lg font-black" style={{ color: '#1A1712', fontVariantNumeric: 'tabular-nums' }}>
                {formatUYU(selected.amount)}
              </p>
              <p className="text-[11px] font-semibold" style={{ color: '#9C917E' }}>
                {selected.jobs} trabajo{selected.jobs !== 1 ? 's' : ''}
              </p>
            </div>
          ) : (
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#C4B8A6' }}>
              Tocá una barra para ver el detalle
            </p>
          )}
        </div>
        <div className="flex items-end justify-between gap-1.5" style={{ height: 140 }}>
          {data.map((d, i) => {
            const isHi = i === highlightIndex
            const isSel = i === sel
            const h = Math.round((d.amount / max) * 120)
            return (
              <button
                key={d.date + i}
                type="button"
                onClick={() => setSel(isSel ? null : i)}
                className="flex-1 flex flex-col items-center justify-end gap-1.5"
                style={{ height: '100%' }}
              >
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: Math.max(3, h) }}
                  transition={{ delay: i * 0.03, type: 'spring', stiffness: 320, damping: 30 }}
                  style={{
                    width: '100%', maxWidth: 30, borderRadius: 6,
                    background: isHi ? '#E8683A' : '#F0C3AE',
                    opacity: isSel ? 1 : isHi ? 1 : 0.9,
                    outline: isSel ? '2px solid #E8683A' : 'none',
                    outlineOffset: 2,
                  }}
                />
                <span className="text-[10px] font-bold" style={{ color: isHi ? '#E8683A' : '#B3A794' }}>
                  {labels[i]}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
