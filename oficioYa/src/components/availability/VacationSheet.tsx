import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAvailabilityStore } from '../../store/availabilityStore'

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

export function VacationSheet({ proId, open, onClose }: Props) {
  const addVacation = useAvailabilityStore((s) => s.addVacation)
  const today = new Date().toISOString().split('T')[0]

  const [fromDate, setFromDate] = useState(today)
  const [toDate, setToDate] = useState(today)
  const [error, setError] = useState('')

  function handleSave() {
    if (!fromDate || !toDate) { setError('Completá ambas fechas'); return }
    if (fromDate > toDate) { setError('La fecha de inicio debe ser antes del fin'); return }
    setError('')
    addVacation({ proId, fromDate, toDate })
    setFromDate(today)
    setToDate(today)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0"
            style={{ background: 'rgba(0,0,0,.5)', zIndex: 60 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className="fixed bottom-0 left-0 right-0 rounded-t-2xl"
            style={{ background: '#FFFFFF', maxWidth: 480, margin: '0 auto', padding: '20px 16px 32px', zIndex: 70 }}
          >
            <div className="flex items-center justify-between mb-5">
              <p className="text-base font-black" style={{ color: '#111111' }}>
                🏖️ Agregar período
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider mb-1 block" style={{ color: '#AAAAAA' }}>
                    Desde
                  </label>
                  <input
                    type="date" value={fromDate} min={today}
                    onChange={(e) => setFromDate(e.target.value)}
                    style={INPUT}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider mb-1 block" style={{ color: '#AAAAAA' }}>
                    Hasta
                  </label>
                  <input
                    type="date" value={toDate} min={fromDate}
                    onChange={(e) => setToDate(e.target.value)}
                    style={INPUT}
                  />
                </div>
              </div>

              {error && <p className="text-xs" style={{ color: '#EF4444' }}>{error}</p>}

              <button
                type="button" onClick={handleSave}
                className="w-full rounded-2xl py-3.5 text-sm font-bold text-white mt-1"
                style={{ background: '#E8683A', boxShadow: '0 4px 14px rgba(232,104,58,.3)' }}
              >
                Guardar período
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
