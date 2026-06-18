import { useAuthStore } from '../../store/authStore'
import { useRegistration } from '../../hooks/useRegistration'
import { registrationService } from '../../services/registrationService'
import { supabase } from '../../lib/supabase'
import { RegistrationShell } from '../../components/pro/registration/RegistrationShell'
import { Step1PersonalData } from '../../components/pro/registration/Step1PersonalData'
import { Step2TradeInfo } from '../../components/pro/registration/Step2TradeInfo'
import { Step3Experience } from '../../components/pro/registration/Step3Experience'
import type { RegistrationState } from '../../types/registration'

export default function ProRegistration() {
  const user = useAuthStore((s) => s.user)
  const { state, loading, saveStep, goBack } = useRegistration()

  const currentStep = state?.registration_step ?? 1

  async function handleStep1(data: Partial<RegistrationState>, avatarFile?: File) {
    if (avatarFile && user?.id) {
      try {
        const url = await registrationService.uploadFile('pro-avatars', user.id, avatarFile)
        await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id)
      } catch (e) {
        console.error('Avatar upload failed:', e)
        // Do not advance wizard if avatar upload fails
        return
      }
    }
    await saveStep(1, data)
  }

  const STEP_TITLES: Record<number, { title: string; subtitle: string }> = {
    1:  { title: 'Datos personales',      subtitle: 'Paso 1 de 10' },
    2:  { title: 'Tu oficio',             subtitle: 'Paso 2 de 10' },
    3:  { title: 'Experiencia',           subtitle: 'Paso 3 de 10' },
    4:  { title: 'Portfolio',             subtitle: 'Paso 4 de 10' },
    5:  { title: 'Certificaciones',       subtitle: 'Paso 5 de 10' },
    6:  { title: 'Zona de trabajo',       subtitle: 'Paso 6 de 10' },
    7:  { title: 'Disponibilidad',        subtitle: 'Paso 7 de 10' },
    8:  { title: 'Medios de contacto',    subtitle: 'Paso 8 de 10' },
    9:  { title: 'Verificación',          subtitle: 'Paso 9 de 10' },
    10: { title: 'Resumen',               subtitle: 'Paso 10 de 10' },
  }

  const meta = STEP_TITLES[currentStep] ?? STEP_TITLES[1]

  if (loading && !state) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#F5F0E8' }}>
        <div className="text-center">
          <div className="text-4xl mb-3">🔧</div>
          <p style={{ color: '#555' }}>Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <RegistrationShell
      currentStep={currentStep}
      totalSteps={10}
      title={meta.title}
      subtitle={meta.subtitle}
      onBack={currentStep > 1 ? goBack : undefined}
    >
      {currentStep === 1 && (
        <Step1PersonalData
          initial={state ?? {}}
          avatarUrl={user?.avatar_url ?? null}
          onNext={handleStep1}
          loading={loading}
        />
      )}
      {currentStep === 2 && (
        <Step2TradeInfo
          initial={state ?? {}}
          onNext={(data) => saveStep(2, data)}
          loading={loading}
        />
      )}
      {currentStep === 3 && (
        <Step3Experience
          initial={state ?? {}}
          onNext={(data) => saveStep(3, data)}
          loading={loading}
        />
      )}
      {currentStep > 3 && (
        <div className="text-center py-10" style={{ color: '#555' }}>
          <p className="text-lg font-bold mb-2">Paso {currentStep}</p>
          <p className="text-sm">Próximamente en la siguiente tarea...</p>
        </div>
      )}
    </RegistrationShell>
  )
}
