import type { ReactNode } from 'react'

const STEP_LABELS = [
  'Datos', 'Oficio', 'Experiencia', 'Portfolio',
  'Certificaciones', 'Zona', 'Disponibilidad', 'Contacto',
  'Identidad', 'Resumen',
]

interface Props {
  currentStep: number
  totalSteps: number
  onBack?: () => void
  children: ReactNode
  title: string
  subtitle?: string
}

export function RegistrationShell({ currentStep, totalSteps, onBack, children, title, subtitle }: Props) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F5F0E8' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-4" style={{ background: '#E8683A' }}>
        <div className="flex items-center gap-3 mb-4">
          {onBack && (
            <button onClick={onBack} className="text-white text-xl font-bold">←</button>
          )}
          <div>
            <h1 className="text-white font-black text-lg">{title}</h1>
            {subtitle && <p className="text-white/75 text-sm">{subtitle}</p>}
          </div>
        </div>
        {/* Barra de progreso */}
        <div className="flex items-center gap-2 mb-1">
          <div className="flex-1 h-2 rounded-full bg-white/30">
            <div
              className="h-2 rounded-full bg-white transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-white/90 text-xs font-bold">{currentStep}/{totalSteps}</span>
        </div>
        <p className="text-white/70 text-xs">{STEP_LABELS[currentStep - 1]}</p>
      </div>

      {/* Contenido */}
      <div className="flex-1 px-5 py-6 pb-10">
        {children}
      </div>
    </div>
  )
}
