import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { OnboardingSlide } from './OnboardingSlide'

interface OnboardingFlowProps {
  role: 'client' | 'professional'
  userId: string
  onDone: () => void
}

const CLIENT_SLIDES = [
  {
    icon: '🏠',
    title: 'Bienvenido a OFIX',
    description: 'Encontrá profesionales de confianza en Montevideo para cualquier trabajo del hogar',
    gradient: true,
  },
  {
    icon: '⚡',
    title: 'Servicios y Urgencias',
    description: '¿Es urgente? Activá el modo urgencia y recibís respuesta en minutos. Electricistas, plomeros, pintores y más',
    gradient: false,
  },
  {
    icon: '💬',
    title: 'Chateá y coordiná',
    description: 'Hablá directo con el profesional, revisá sus reseñas y coordiná todo sin salir de la app',
    gradient: false,
  },
]

const PRO_SLIDES = [
  {
    icon: '👷',
    title: 'Bienvenido a OFIX',
    description: 'Tu plataforma para conseguir más clientes en Montevideo',
    gradient: true,
  },
  {
    icon: '📋',
    title: 'Recibí solicitudes',
    description: 'Los clientes te contactan directamente según tu categoría y zona de trabajo',
    gradient: false,
  },
  {
    icon: '⚡',
    title: 'Urgencias y disponibilidad',
    description: 'Activá tu disponibilidad y aparecé primero cuando hay urgencias cerca tuyo',
    gradient: false,
  },
  {
    icon: '⭐',
    title: 'Construí tu reputación',
    description: 'Acumulá reseñas reales, subí fotos de tus trabajos y destacate del resto',
    gradient: false,
  },
]

export function OnboardingFlow({ role, userId, onDone }: OnboardingFlowProps) {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const slides = role === 'client' ? CLIENT_SLIDES : PRO_SLIDES
  const isLast = index === slides.length - 1
  const current = slides[index]

  const finish = () => {
    localStorage.setItem(`onboarding_done_${userId}`, '1')
    onDone()
  }

  const next = () => {
    if (isLast) { finish(); return }
    setDirection(1)
    setIndex((i) => i + 1)
  }

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ zIndex: 9998, maxWidth: 480, margin: '0 auto' }}
    >
      {/* Botón saltar */}
      <div className="absolute top-12 right-5 z-10">
        <button
          type="button"
          onClick={finish}
          className="text-sm font-bold px-3 py-1.5 rounded-full"
          style={{
            color: current.gradient ? 'rgba(255,255,255,0.8)' : '#999999',
            background: current.gradient ? 'rgba(255,255,255,0.15)' : 'transparent',
          }}
        >
          Saltar
        </button>
      </div>

      {/* Slide */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ x: direction > 0 ? '100%' : '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction > 0 ? '-100%' : '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <OnboardingSlide
              icon={current.icon}
              title={current.title}
              description={current.description}
              gradient={current.gradient}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer: dots + botón */}
      <div
        className="flex flex-col items-center gap-5 px-6 pb-12 pt-6"
        style={{ background: current.gradient ? 'linear-gradient(160deg, #E8683A 0%, #c44d1f 100%)' : '#FFFFFF' }}
      >
        {/* Dots */}
        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === index ? 20 : 6,
                height: 6,
                borderRadius: 3,
                background: current.gradient
                  ? i === index ? '#FFFFFF' : 'rgba(255,255,255,0.35)'
                  : i === index ? '#E8683A' : '#E8E0D4',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Botón siguiente / empezar */}
        <button
          type="button"
          onClick={next}
          className="w-full rounded-2xl py-4 text-base font-black transition-opacity active:opacity-80"
          style={{
            background: current.gradient ? '#FFFFFF' : '#E8683A',
            color: current.gradient ? '#E8683A' : '#FFFFFF',
            boxShadow: current.gradient ? 'none' : '0 4px 14px rgba(232,104,58,0.3)',
          }}
        >
          {isLast ? '¡Empezar!' : index === 0 ? 'Empezar' : 'Siguiente'}
        </button>
      </div>
    </div>
  )
}
