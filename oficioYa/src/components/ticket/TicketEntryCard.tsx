// src/components/ticket/TicketEntryCard.tsx
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { SPRING_SOFT, fadeUp } from '../../lib/motion'

export function TicketEntryCard() {
  const navigate = useNavigate()

  return (
    <motion.button
      type="button"
      onClick={() => navigate('/ticket')}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      whileTap={{ scale: 0.97 }}
      transition={SPRING_SOFT}
      className="w-full text-left flex items-center gap-3 rounded-2xl p-4"
      style={{
        background: '#FFFFFF',
        border: '2px solid #E8683A',
        boxShadow: '0 2px 12px rgba(232,104,58,.12)',
      }}
    >
      {/* Orb animado */}
      <motion.div
        className="flex items-center justify-center flex-shrink-0"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity }}
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: 'linear-gradient(135deg,#E8683A,#c44d1f)',
          fontSize: 22,
        }}
      >
        ✨
      </motion.div>

      {/* Texto */}
      <div className="flex-1 min-w-0">
        <p className="font-black text-sm leading-tight" style={{ color: '#111111' }}>
          Describí tu problema
        </p>
        <p className="text-xs mt-0.5" style={{ color: '#888888' }}>
          La IA encuentra al profesional ideal
        </p>
      </div>

      {/* Flecha animada */}
      <motion.span
        animate={{ x: [0, 3, 0] }}
        transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
        className="text-lg flex-shrink-0"
        style={{ color: '#E8683A' }}
      >
        ›
      </motion.span>
    </motion.button>
  )
}
