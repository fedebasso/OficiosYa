import { motion } from 'framer-motion'

type BrandLogoSize = 'sm' | 'md' | 'lg'

interface BrandLogoProps {
  size?: BrandLogoSize
  theme?: 'dark' | 'light'
  showSubtitle?: boolean
  centered?: boolean
  subtitleColor?: string
}

const SIZES: Record<BrandLogoSize, { h: number; subtitleSize: number }> = {
  sm: { h: 26, subtitleSize: 11 },
  md: { h: 32, subtitleSize: 13 },
  lg: { h: 52, subtitleSize: 14 },
}

export function BrandLogo({
  size = 'md',
  theme = 'dark',
  showSubtitle = false,
  centered = false,
  subtitleColor = 'rgba(255,255,255,0.8)',
}: BrandLogoProps) {
  const { h, subtitleSize } = SIZES[size]
  const fixColor = theme === 'light' ? '#1A1712' : '#FFFFFF'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: centered ? 'center' : 'flex-start', gap: 8 }}>
      <motion.svg
        viewBox="120 320 800 384"
        height={h}
        style={{ display: 'block', width: 'auto' }}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        role="img"
        aria-label="OFIX"
      >
        <circle cx="310" cy="512" r="148" fill="none" stroke="#FF6B00" strokeWidth="68" />
        <text
          x="665" y="578"
          fontFamily="'Arial Black','Helvetica Neue',Arial,sans-serif"
          fontWeight="900" fontSize="300" letterSpacing="-6"
          textAnchor="middle" fill={fixColor}
        >FIX</text>
      </motion.svg>
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
