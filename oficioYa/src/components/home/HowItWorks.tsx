import { useState } from 'react'
import { motion } from 'framer-motion'
import { fadeUp, staggerContainer, SPRING_SOFT } from '../../lib/motion'

const STORAGE_KEY = 'oficioya_how_it_works_seen'

export function HowItWorks() {
  const [visible, setVisible] = useState(() => !localStorage.getItem(STORAGE_KEY))

  if (!visible) return null

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  return (
    <motion.div
      className="rounded-2xl overflow-hidden"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      style={{
        background: '#FFFFFF',
        border: '1.5px solid #E8E0D4',
        boxShadow: '0 2px 10px rgba(0,0,0,.06)',
      }}
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between px-4 pt-4 pb-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: '#E8683A' }}>
            👋 Bienvenido
          </p>
          <h3 className="text-base font-black leading-tight" style={{ color: '#111111', letterSpacing: '-0.3px' }}>
            ¿Cómo funciona OficioYa?
          </h3>
        </div>
      </motion.div>

      {/* Pasos */}
      <div className="flex flex-col gap-3 px-4 pb-4">
        {[
          {
            n: '1️⃣',
            title: 'Encontrá al profesional ideal',
            desc: 'Buscá por categoría, leé reseñas reales y elegí según calificación, experiencia y zona.',
          },
          {
            n: '2️⃣',
            title: 'Hacé tu solicitud en menos de 1 minuto',
            desc: 'Completá unos simples pasos explicando qué necesitás y cuándo lo necesitás.',
          },
          {
            n: '3️⃣',
            title: 'Chateá y coordiná dentro de la app',
            desc: 'Hablá directamente con el profesional, enviá mensajes y coordiná fecha, precio y detalles sin salir de OficioYa.',
          },
        ].map((step) => (
          <motion.div key={step.n} variants={fadeUp} className="flex items-start gap-3">
            <span className="flex-shrink-0 text-xl leading-none mt-0.5">{step.n}</span>
            <div className="flex-1">
              <p className="text-sm font-bold leading-tight mb-0.5" style={{ color: '#111111' }}>
                {step.title}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: '#888888' }}>
                {step.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ borderTop: '1px solid #F0EBE1', padding: '10px 14px' }}>
        <motion.button
          type="button"
          onClick={dismiss}
          variants={fadeUp}
          whileTap={{ scale: 0.97 }}
          transition={SPRING_SOFT}
          className="w-full rounded-xl py-2.5 text-sm font-bold"
          style={{ background: '#E8683A', color: '#FFFFFF', boxShadow: '0 2px 8px rgba(232,104,58,.25)' }}
        >
          Entendido, ¡empecemos! →
        </motion.button>
      </div>
    </motion.div>
  )
}
