import { useState } from 'react'

const STORAGE_KEY = 'oficioya_how_it_works_seen'

export function HowItWorks() {
  const [visible, setVisible] = useState(() => !localStorage.getItem(STORAGE_KEY))

  if (!visible) return null

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#FFFFFF',
        border: '1.5px solid #E8E0D4',
        boxShadow: '0 2px 10px rgba(0,0,0,.06)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: '#E8683A' }}>
            Bienvenido
          </p>
          <h3 className="text-base font-black leading-tight" style={{ color: '#111111', letterSpacing: '-0.3px' }}>
            ¿Cómo funciona OficioYa? 👋
          </h3>
        </div>
      </div>

      {/* Pasos */}
      <div className="flex flex-col gap-3 px-4 pb-4">
        {[
          {
            n: 1,
            title: 'Encontrá al profesional ideal',
            desc: 'Buscá por categoría, leé reseñas reales y elegí según calificación y zona.',
          },
          {
            n: 2,
            title: 'Pedí en menos de 1 minuto',
            desc: 'Completá 4 pasos simples: qué necesitás, descripción, urgencia y tu teléfono.',
          },
          {
            n: 3,
            title: 'Coordiná directo por WhatsApp',
            desc: 'El profesional recibe tu pedido y te contacta para acordar fecha y precio.',
          },
        ].map((step) => (
          <div key={step.n} className="flex items-start gap-3">
            <div
              className="flex items-center justify-center flex-shrink-0 font-black text-white"
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: '#E8683A',
                fontSize: 12,
                marginTop: 1,
              }}
            >
              {step.n}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold leading-tight mb-0.5" style={{ color: '#111111' }}>
                {step.title}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: '#888888' }}>
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ borderTop: '1px solid #F0EBE1', padding: '10px 14px' }}>
        <button
          type="button"
          onClick={dismiss}
          className="w-full rounded-xl py-2.5 text-sm font-bold active:opacity-70 transition-opacity"
          style={{ background: '#E8683A', color: '#FFFFFF', boxShadow: '0 2px 8px rgba(232,104,58,.25)' }}
        >
          Entendido, ¡empecemos! →
        </button>
      </div>
    </div>
  )
}
