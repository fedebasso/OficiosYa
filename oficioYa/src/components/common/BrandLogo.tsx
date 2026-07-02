import { motion } from 'framer-motion'

type BrandLogoSize = 'sm' | 'md' | 'lg'

interface BrandLogoProps {
  size?: BrandLogoSize
  showSubtitle?: boolean
  centered?: boolean
  subtitleColor?: string
}

const SIZES: Record<BrandLogoSize, { px: number; radius: number; subtitleSize: number }> = {
  sm: { px: 34, radius: 9,  subtitleSize: 11 },
  md: { px: 40, radius: 9,  subtitleSize: 13 },
  lg: { px: 72, radius: 16, subtitleSize: 14 },
}

export function BrandLogo({
  size = 'md',
  showSubtitle = false,
  centered = false,
  subtitleColor = 'rgba(255,255,255,0.8)',
}: BrandLogoProps) {
  const { px, radius, subtitleSize } = SIZES[size]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: centered ? 'center' : 'flex-start', gap: 8 }}>
      <motion.img
        src="/ofix-icon.svg"
        alt="OFIX"
        width={px}
        height={px}
        style={{ borderRadius: radius, display: 'block' }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      />
      {showSubtitle && (
        <motion.p
          style={{ fontSize: subtitleSize, color: subtitleColor, fontWeight: 500, margin: 0 }}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          Profesionales de confianza en Montevideo
        </motion.p>
      )}
    </div>
  )
}
