// src/lib/motion.ts
import type { Variants, Transition } from 'framer-motion'

export const SPRING_SOFT: Transition = { type: 'spring', stiffness: 300, damping: 30 }
export const SPRING_SNAPPY: Transition = { type: 'spring', stiffness: 500, damping: 35 }
export const SPRING_GENTLE: Transition = { type: 'spring', stiffness: 200, damping: 28 }

export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: SPRING_GENTLE },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.15 } },
}

export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.15 } },
}

export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: SPRING_SNAPPY },
}

export const staggerContainer: Variants = {
  hidden:  {},
  visible: { transition: { delayChildren: 0.05, staggerChildren: 0.07 } },
}

export const staggerFast: Variants = {
  hidden:  {},
  visible: { transition: { delayChildren: 0, staggerChildren: 0.06 } },
}

