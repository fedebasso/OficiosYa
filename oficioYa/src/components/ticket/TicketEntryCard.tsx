// src/components/ticket/TicketEntryCard.tsx
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Sparkles, ArrowRight } from 'lucide-react'
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
      whileTap={{ scale: 0.98 }}
      transition={SPRING_SOFT}
      className="relative w-full text-left flex items-center gap-3.5 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #FFFFFF 0%, #FEF4EE 100%)',
        border: '1.5px solid rgba(232,104,58,.22)',
        borderRadius: 20,
        boxShadow: '0 2px 6px rgba(232,104,58,.06), 0 14px 30px -12px rgba(232,104,58,.30)',
        padding: 16,
      }}
    >
      {/* Orb con glow */}
      <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: 52, height: 52 }}>
        <div style={{ position: 'absolute', width: 44, height: 44, borderRadius: '50%', background: '#F28C4A', opacity: 0.35, filter: 'blur(14px)' }} />
        <motion.div
          className="relative flex items-center justify-center"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity }}
          style={{
            width: 48,
            height: 48,
            borderRadius: 15,
            background: 'linear-gradient(135deg, #E8683A 0%, #F28C4A 100%)',
            boxShadow: '0 6px 16px -4px rgba(232,104,58,.5)',
          }}
        >
          <Sparkles size={23} color="#FFFFFF" strokeWidth={2.2} />
        </motion.div>
      </div>

      {/* Texto */}
      <div className="flex-1 min-w-0">
        <span
          className="inline-flex items-center gap-1 font-black uppercase tracking-widest"
          style={{ fontSize: 9, color: '#D4571F', letterSpacing: '1px' }}
        >
          <Sparkles size={9} /> Con IA
        </span>
        <p className="font-black leading-tight" style={{ color: '#1A1712', fontSize: 15, letterSpacing: '-0.2px', marginTop: 1 }}>
          Describí tu problema
        </p>
        <p style={{ color: '#7A6E5E', fontSize: 12.5, marginTop: 1 }}>
          La IA encuentra al profesional ideal
        </p>
      </div>

      {/* Flecha */}
      <motion.span
        className="flex items-center justify-center flex-shrink-0"
        animate={{ x: [0, 3, 0] }}
        transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
        style={{ width: 32, height: 32, borderRadius: 12, background: '#FEF0EA', color: '#E8683A' }}
      >
        <ArrowRight size={17} />
      </motion.span>
    </motion.button>
  )
}
