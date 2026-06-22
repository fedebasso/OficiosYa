import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAvailabilityStore } from '../../store/availabilityStore'

export const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2).toString().padStart(2, '0')
  const m = i % 2 === 0 ? '00' : '30'
  return `${h}:${m}`
})

const INPUT: React.CSSProperties = {
  background: '#FFFFFF',
  border: '1.5px solid #E8E0D4',
  borderRadius: 12,
  padding: '11px 14px',
  fontSize: 14,
  color: '#111111',
  width: '100%',
  outline: 'none',
}

interface Props {
  proId: string
  open: boolean
  onClose: () => void
}

export function BlockSlotSheet({ proId, open, onClose }: Props) {
  const addBlockedSlot = useAvailabilityStore((s) => s.addBlockedSlot)
  const today = new Date().toISOString().split('T')[0]

  const [date, setDate] = useState(today)
  const [fromTime, setFromTime] = useState('09:00')
  const [toTime, setToTime] = useState('10:00')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  function handleSave() {
    if (!date) { setError('Seleccioná una fecha'); return }
    if (fromTime >= toTime) { setError('La hora de inicio debe ser antes del fin'); return }
    setError('')
    addBlockedSlot({ proId, date, fromTime, toTime, reason: reason.trim() || undefined })
    setDate(today)
    setFromTime('09:00')
    setToTime('10:00')
    setReason('')
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,.5)' }}
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl"
            style={{ background: '#FFFFFF', maxWidth: 480, margin: '0 auto', padding: '20px 16px 32px' }}
          >
            <div className="flex items-center justify-between mb-5">
              <p className="text-base font-black" style={{ color: '#111111' }}>
                ➕ Bloquear horario
              </p>
              <button
                type="button" onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: '#F5F0E8', color: '#555', fontWeight: 900, fontSize: 16 }}
              >
                ×
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider mb-1 block" style={{ color: '#AAAAAA' }}>
                  Fecha
                </label>
                <input
                  type="date"
                  value={date}
                  min={today}
                  onChange={(e) => setDate(e.target.value)}
                  style={INPUT}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider mb-1 block" style={{ color: '#AAAAAA' }}>
                    Desde
                  </label>
                  <select value={fromTime} onChange={(e) => setFromTime(e.target.value)} style={INPUT}>
                    {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider mb-1 block" style={{ color: '#AAAAAA' }}>
                    Hasta
                  </label>
                  <select value={toTime} onChange={(e) => setToTime(e.target.value)} style={INPUT}>
                    {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider mb-1 block" style={{ color: '#AAAAAA' }}>
                  Motivo (opcional)
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ej: Trabajo externo, dentista..."
                  style={INPUT}
                />
              </div>

              {error && <p className="text-xs" style={{ color: '#EF4444' }}>{error}</p>}

              <button
                type="button" onClick={handleSave}
                className="w-full rounded-2xl py-3.5 text-sm font-bold text-white mt-1"
                style={{ background: '#E8683A', boxShadow: '0 4px 14px rgba(232,104,58,.3)' }}
              >
                Guardar bloqueo
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
