import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface OnboardingSlideProps {
  Icon: LucideIcon
  title: string
  description: string
}

export function OnboardingSlide({ Icon, title, description }: OnboardingSlideProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-7 gap-7 h-full">
      {/* Composición del ícono */}
      <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
        <div style={{ position: 'absolute', width: 90, height: 90, borderRadius: '50%', background: '#F28C4A', opacity: 0.25, filter: 'blur(28px)', top: 8, left: 18 }} />
        <div style={{ position: 'absolute', width: 80, height: 80, borderRadius: '50%', background: '#E8683A', opacity: 0.22, filter: 'blur(30px)', bottom: 6, right: 16 }} />
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="relative flex items-center justify-center"
          style={{
            width: 120,
            height: 120,
            borderRadius: 32,
            background: 'linear-gradient(135deg, #E8683A 0%, #F28C4A 100%)',
            boxShadow: '0 12px 32px -8px rgba(232,104,58,.45)',
          }}
        >
          <Icon size={52} color="#FFFFFF" strokeWidth={2} />
        </motion.div>
      </div>

      <div className="flex flex-col gap-3">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="font-black"
          style={{ fontSize: 30, letterSpacing: '-0.8px', color: '#1A1712', lineHeight: 1.1 }}
        >
          {title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.4 }}
          className="font-medium mx-auto"
          style={{ fontSize: 15.5, color: '#7A6E5E', lineHeight: 1.5, maxWidth: 300 }}
        >
          {description}
        </motion.p>
      </div>
    </div>
  )
}
