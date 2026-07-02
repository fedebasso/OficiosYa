import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BrandLogo } from './common/BrandLogo'

export function SplashScreen() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 1200)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            background: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <BrandLogo size="lg" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
