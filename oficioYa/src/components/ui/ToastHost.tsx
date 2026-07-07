import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useToastStore } from '../../store/toastStore'

export function ToastHost() {
  const message = useToastStore((s) => s.message)
  const action = useToastStore((s) => s.action)
  const hide = useToastStore((s) => s.hide)
  const navigate = useNavigate()

  useEffect(() => {
    if (!message) return
    const t = setTimeout(hide, 4000)
    return () => clearTimeout(t)
  }, [message, hide])

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 34 }}
          className="fixed left-1/2 z-[60] flex items-center gap-3 rounded-2xl px-4 py-3"
          style={{
            bottom: 'calc(72px + var(--safe-bottom, 0px))',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 32px)', maxWidth: 448,
            background: '#1A1712', color: '#fff',
            boxShadow: '0 8px 28px -8px rgba(0,0,0,.4)',
          }}
        >
          <span className="text-sm font-semibold flex-1">{message}</span>
          {action && (
            <button
              type="button"
              onClick={() => { const to = action.to; hide(); navigate(to) }}
              className="text-sm font-black flex-shrink-0"
              style={{ color: '#E8683A' }}
            >
              {action.label}
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
