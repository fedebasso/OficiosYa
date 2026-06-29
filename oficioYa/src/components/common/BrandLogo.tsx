import { motion } from 'framer-motion'

type BrandLogoSize = 'sm' | 'md' | 'lg'

interface BrandLogoProps {
  size?: BrandLogoSize
  showSubtitle?: boolean
  centered?: boolean
  subtitleColor?: string
}

const SIZES: Record<BrandLogoSize, { fontSize: number; letterSpacing: string; subtitleSize: number }> = {
  sm: { fontSize: 22, letterSpacing: '-1px',   subtitleSize: 11 },
  md: { fontSize: 32, letterSpacing: '-1.5px', subtitleSize: 13 },
  lg: { fontSize: 40, letterSpacing: '-2px',   subtitleSize: 14 },
}

const GRADIENT = 'linear-gradient(90deg, #E8683A 0%, #F28C4A 50%, #2A2A2A 100%)'

export function BrandLogo({
  size = 'md',
  showSubtitle = false,
  centered = false,
  subtitleColor = 'rgba(255,255,255,0.8)',
}: BrandLogoProps) {
  const { fontSize, letterSpacing, subtitleSize } = SIZES[size]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: centered ? 'center' : 'flex-start', gap: 4 }}>
      <motion.span
        className="font-black"
        style={{
          fontSize,
          letterSpacing,
          lineHeight: 1,
          background: GRADIENT,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
        initial={{ opacity: 0, x: centered ? 0 : -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        OFIX
      </motion.span>
      {showSubtitle && (
        <motion.p
          style={{
            fontSize: subtitleSize,
            color: subtitleColor,
            fontWeight: 500,
            margin: 0,
          }}
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
