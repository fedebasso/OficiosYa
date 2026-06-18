import { useAuthStore } from '../../../store/authStore'
import { registrationService } from '../../../services/registrationService'
import { useState } from 'react'
import type { RegistrationState } from '../../../types/registration'
import { ALL_TRADES } from '../../../lib/categories'
import { useNavigate } from 'react-router-dom'

interface Props {
  state: RegistrationState
}

const STEP_LABELS = ['Datos personales','Oficio','Experiencia','Portfolio','Certificaciones','Zona','Disponibilidad','Contacto','Identidad']

export function Step10Summary({ state }: Props) {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const tradeMeta = ALL_TRADES.find((t) => t.value === state.trade)

  async function handleSubmit() {
    if (!user?.id) return
    setSubmitting(true)
    await registrationService.submitForReview(user.id)
    setDone(true)
    setSubmitting(false)
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <div className="text-6xl">🎉</div>
        <h2 className="text-xl font-black" style={{ color: '#111' }}>¡Registro enviado!</h2>
        <p className="text-sm" style={{ color: '#555' }}>
          Tu perfil está en revisión. Te avisaremos cuando sea aprobado (generalmente en 24-48 hs).
        </p>
        <div className="rounded-2xl p-4 w-full" style={{ background: '#F0FDF4', border: '1.5px solid #86EFAC' }}>
          <p className="text-sm font-bold" style={{ color: '#166534' }}>Score actual: {state.quality_score}/100</p>
        </div>
        <button onClick={() => navigate('/pro/perfil')} className="w-full py-4 rounded-2xl font-black text-white" style={{ background: '#0F6E56' }}>
          Ver mi perfil
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Score */}
      <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1.5px solid #E8E0D4' }}>
        <div className="flex items-center justify-between mb-3">
          <p className="font-black text-base" style={{ color: '#111' }}>Score de perfil</p>
          <span className="text-2xl font-black" style={{ color: '#E8683A' }}>{state.quality_score}/100</span>
        </div>
        <div className="h-3 rounded-full bg-gray-100">
          <div className="h-3 rounded-full transition-all" style={{ width: `${state.quality_score}%`, background: state.quality_score >= 70 ? '#0F6E56' : '#E8683A' }} />
        </div>
      </div>

      {/* Resumen de pasos */}
      {STEP_LABELS.map((label, i) => {
        const step = i + 1
        const completed = state.registration_step > step
        return (
          <div key={step} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#fff', border: '1.5px solid #E8E0D4' }}>
            <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: completed ? '#0F6E56' : '#E8E0D4', color: '#fff' }}>
              {completed ? '✓' : step}
            </span>
            <p className="text-sm font-medium" style={{ color: completed ? '#111' : '#888' }}>{label}</p>
          </div>
        )
      })}

      {/* Oficio */}
      {tradeMeta && (
        <div className="rounded-2xl p-4" style={{ background: '#FEF0EA', border: '1.5px solid #FDDCC8' }}>
          <p className="text-sm font-bold" style={{ color: '#E8683A' }}>{tradeMeta.emoji} {tradeMeta.label}</p>
          {state.specialties?.length > 0 && (
            <p className="text-xs text-gray-600 mt-1">{state.specialties.join(', ')}</p>
          )}
        </div>
      )}

      <p className="text-xs text-center" style={{ color: '#888' }}>
        Al enviar, tu perfil quedará en revisión. No aparecerás en búsquedas hasta ser aprobado.
      </p>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full py-4 rounded-2xl font-black text-white"
        style={{ background: submitting ? '#ccc' : '#0F6E56' }}
      >
        {submitting ? 'Enviando...' : 'Enviar a revisión ✓'}
      </button>
    </div>
  )
}
