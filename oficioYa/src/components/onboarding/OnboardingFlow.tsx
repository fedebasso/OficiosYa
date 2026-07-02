import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Zap, MessageCircle, Briefcase, ClipboardList, CalendarClock, Star, ArrowRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { OnboardingSlide } from './OnboardingSlide'

interface OnboardingFlowProps {
  role: 'client' | 'professional'
  userId: string
  onDone: () => void
}

interface Slide { Icon: LucideIcon; title: string; description: string }

const CLIENT_SLIDES: Slide[] = [
  { Icon: Sparkles,      title: 'Bienvenido a OFIX',     description: 'Encontrá profesionales de confianza en Montevideo para cualquier trabajo del hogar' },
  { Icon: Zap,           title: 'Servicios y Urgencias', description: '¿Es urgente? Activá el modo urgencia y recibí respuesta en minutos. Electricistas, plomeros, pintores y más' },
  { Icon: MessageCircle, title: 'Chateá y coordiná',     description: 'Hablá directo con el profesional, revisá sus reseñas y coordiná todo sin salir de la app' },
]

const PRO_SLIDES: Slide[] = [
  { Icon: Briefcase,     title: 'Bienvenido a OFIX',          description: 'Tu plataforma para conseguir más clientes en Montevideo' },
  { Icon: ClipboardList, title: 'Recibí solicitudes',         description: 'Los clientes te contactan directamente según tu categoría y zona de trabajo' },
  { Icon: CalendarClock, title: 'Urgencias y disponibilidad', description: 'Activá tu disponibilidad y aparecé primero cuando hay urgencias cerca tuyo' },
  { Icon: Star,          title: 'Construí tu reputación',     description: 'Acumulá reseñas reales, subí fotos de tus trabajos y destacate del resto' },
]

export function OnboardingFlow({ role, userId, onDone }: OnboardingFlowProps) {
  const [index, setIndex] = useState(0)
  const slides = role === 'client' ? CLIENT_SLIDES : PRO_SLIDES
  const isLast = index === slides.length - 1
  const current = slides[index]

  const finish = () => {
    localStorage.setItem(`onboarding_done_${userId}`, '1')
    onDone()
  }

  const next = () => {
    if (isLast) { finish(); return }
    setIndex((i) => i + 1)
  }

  return (
    <div className="fixed inset-0 flex flex-col" style={{ zIndex: 9998, maxWidth: 480, margin: '0 auto', background: '#F5F0E8' }}>
      {/* Saltar */}
      <div className="flex justify-end" style={{ padding: '48px 20px 0' }}>
        <button type="button" onClick={finish} className="text-sm font-bold px-2 py-1" style={{ color: '#9C917E' }}>
          Saltar
        </button>
      </div>

      {/* Slide */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <OnboardingSlide Icon={current.Icon} title={current.title} description={current.description} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer: progreso + botón */}
      <div className="flex flex-col gap-5" style={{ padding: '0 28px 40px' }}>
        <div className="flex items-center gap-1.5">
          {slides.map((_, i) => (
            <div key={i} className="flex-1 overflow-hidden" style={{ height: 4, borderRadius: 2, background: '#E7DFD2' }}>
              <div style={{ height: '100%', borderRadius: 2, background: '#E8683A', width: i <= index ? '100%' : '0%', transition: 'width 0.4s ease' }} />
            </div>
          ))}
        </div>

        <motion.button
          type="button"
          onClick={next}
          whileTap={{ scale: 0.97 }}
          className="w-full flex items-center justify-center gap-2 font-black text-white"
          style={{ height: 54, borderRadius: 16, background: '#E8683A', boxShadow: '0 8px 20px -6px rgba(232,104,58,.5)', fontSize: 16 }}
        >
          {isLast ? '¡Empezar!' : 'Continuar'}
          {!isLast && <ArrowRight size={18} />}
        </motion.button>
      </div>
    </div>
  )
}
