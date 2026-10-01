import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { ServiceRequest } from '../../store/requestStore'

const MAX_AMOUNT = 500000

interface Props {
  req: ServiceRequest | null
  onConfirm: (amount: number) => Promise<void>
  onClose: () => void
}

export function CompleteJobSheet({ req, onConfirm, onClose }: Props) {
  const [raw, setRaw] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const submitting = useRef(false)
  const amount = Number(raw.replace(/[^\d]/g, ''))
  const valid = amount > 0 && amount <= MAX_AMOUNT

  function handleClose() {
    if (submitting.current) return
    setRaw('')
    setError('')
    onClose()
  }

  async function handleConfirm() {
    if (!valid || submitting.current) return
    submitting.current = true
    setSaving(true)
    setError('')
    try {
      await onConfirm(amount)
      setRaw('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar el trabajo. Reintentá.')
    } finally {
      submitting.current = false
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {req && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70]" style={{ background: 'rgba(20,15,10,.45)' }}
            onClick={handleClose}
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 420, damping: 36 }}
            className="fixed left-1/2 bottom-0 z-[71] w-full"
            style={{
              transform: 'translateX(-50%)', maxWidth: 480,
              background: '#FFFFFF', borderRadius: '22px 22px 0 0',
              paddingBottom: 'calc(20px + var(--safe-bottom, 0px))',
            }}
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-1">
              <p className="text-[15px] font-black" style={{ color: '#1A1712' }}>
                ¿Cuánto cobraste por este trabajo?
              </p>
              <button type="button" onClick={handleClose} disabled={saving} aria-label="Cerrar">
                <X size={20} style={{ color: '#9C917E' }} />
              </button>
            </div>
            <div className="px-5 pt-3">
              <div className="flex items-center gap-2 rounded-2xl px-4 py-3"
                   style={{ background: '#F5F0E8', border: '1.5px solid #ECE4D8' }}>
                <span className="text-2xl font-black" style={{ color: '#9C917E' }}>$</span>
                <input
                  autoFocus
                  inputMode="decimal"
                  aria-label="Monto cobrado en pesos uruguayos"
                  disabled={saving}
                  value={raw}
                  onChange={(e) => setRaw(e.target.value)}
                  placeholder="0"
                  className="flex-1 bg-transparent outline-none text-3xl font-black"
                  style={{ color: '#1A1712', fontVariantNumeric: 'tabular-nums' }}
                />
              </div>
              {amount > MAX_AMOUNT && (
                <p className="text-xs font-semibold mt-2" style={{ color: '#DC2626' }}>
                  El monto máximo es $ 500.000
                </p>
              )}
              {error && <p role="alert" className="text-sm text-red-700 mt-2">{error}</p>}
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!valid || saving}
                className="w-full mt-4 rounded-2xl py-3.5 text-[15px] font-black"
                style={{
                  background: valid ? '#E8683A' : '#E7DFD3',
                  color: valid ? '#fff' : '#B3A794',
                  transition: 'background .15s ease',
                }}
              >
                {saving ? 'Guardando…' : 'Finalizar trabajo'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
