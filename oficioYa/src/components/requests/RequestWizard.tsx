import { useState } from 'react'
import { ChevronLeft, MapPin, Camera } from 'lucide-react'
import type { WorkType, UrgencyLevel, RequestType } from '../../store/requestStore'

interface WizardData {
  work_type: WorkType | null
  description: string
  photos: File[]
  location: string
  urgency_level: UrgencyLevel | null
  request_type: RequestType | null
  contact_phone: string
}

interface Props {
  onSubmit: (data: WizardData) => Promise<void>
  loading?: boolean
}

const WORK_TYPES: { value: WorkType; label: string; emoji: string }[] = [
  { value: 'reparacion', label: 'Reparación', emoji: '🔧' },
  { value: 'instalacion', label: 'Instalación', emoji: '⚙️' },
  { value: 'mantenimiento', label: 'Mantenimiento', emoji: '🛠️' },
  { value: 'otro', label: 'Otro', emoji: '📋' },
]

const URGENCY_LEVELS: { value: UrgencyLevel; label: string; emoji: string }[] = [
  { value: 'ahora', label: 'Ahora', emoji: '🔴' },
  { value: 'hoy', label: 'Hoy', emoji: '🟡' },
  { value: 'esta_semana', label: 'Esta semana', emoji: '🟢' },
  { value: 'sin_apuro', label: 'Sin apuro', emoji: '⚪' },
]

const REQUEST_TYPES: { value: RequestType; label: string; desc: string; emoji: string }[] = [
  { value: 'presupuesto', label: 'Quiero un presupuesto', desc: 'Te envío el costo estimado', emoji: '💰' },
  { value: 'visita', label: 'Necesito que vengan', desc: 'El profesional va a tu domicilio', emoji: '🏠' },
]

const TOTAL_STEPS = 7

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex gap-1 px-4 py-3">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className="h-1 flex-1 rounded-full transition-all duration-300"
          style={{ background: i < step ? '#E8683A' : '#E8E0D4' }}
        />
      ))}
    </div>
  )
}

function OptionButton({
  selected, onClick, children,
}: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-2xl p-4 flex items-center gap-3 active:opacity-80 transition-all"
      style={{
        background: selected ? '#FEF0EA' : '#FFFFFF',
        border: `1.5px solid ${selected ? '#E8683A' : '#E8E0D4'}`,
        boxShadow: selected ? '0 2px 8px rgba(232,104,58,.12)' : '0 1px 3px rgba(0,0,0,.04)',
      }}
    >
      {children}
    </button>
  )
}

const INPUT_STYLE = {
  background: '#FFFFFF',
  border: '1.5px solid #E8E0D4',
  color: '#111111',
  borderRadius: 14,
  padding: '14px 16px',
  fontSize: 16,
  width: '100%',
  outline: 'none',
  resize: 'none' as const,
  caretColor: '#E8683A',
}

export function RequestWizard({ onSubmit, loading }: Props) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<WizardData>({
    work_type: null,
    description: '',
    photos: [],
    location: 'Montevideo',
    urgency_level: null,
    request_type: null,
    contact_phone: '',
  })
  const [descError, setDescError] = useState('')
  const [phoneError, setPhoneError] = useState('')

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS))
  const back = () => setStep((s) => Math.max(s - 1, 1))

  const canNext = (): boolean => {
    if (step === 1) return data.work_type !== null
    if (step === 2) return data.description.length >= 20
    if (step === 5) return data.urgency_level !== null
    if (step === 6) return data.request_type !== null
    return true
  }

  const handleNext = () => {
    if (step === 2 && data.description.length < 20) {
      setDescError('Describí el trabajo (mín. 20 caracteres)')
      return
    }
    setDescError('')
    next()
  }

  const handleSubmit = async () => {
    if (data.contact_phone.length < 8) {
      setPhoneError('Ingresá tu teléfono de contacto')
      return
    }
    setPhoneError('')
    await onSubmit(data)
  }

  const stepTitle = [
    '¿Qué necesitás?',
    'Descripción del trabajo',
    'Fotos del trabajo',
    'Ubicación',
    'Nivel de urgencia',
    'Tipo de solicitud',
    'Confirmar solicitud',
  ][step - 1]

  return (
    <div className="flex flex-col gap-4">
      <ProgressBar step={step} />

      {/* Step title */}
      <div className="px-1">
        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#AAAAAA' }}>
          Paso {step} de {TOTAL_STEPS}
        </p>
        <h2 className="text-xl font-black" style={{ color: '#111111', letterSpacing: '-0.3px' }}>
          {stepTitle}
        </h2>
      </div>

      {/* Step 1: Tipo de trabajo */}
      {step === 1 && (
        <div className="flex flex-col gap-3">
          {WORK_TYPES.map((w) => (
            <OptionButton
              key={w.value}
              selected={data.work_type === w.value}
              onClick={() => setData((d) => ({ ...d, work_type: w.value }))}
            >
              <span className="text-2xl">{w.emoji}</span>
              <span className="text-base font-bold" style={{ color: '#111111' }}>{w.label}</span>
              {data.work_type === w.value && (
                <span className="ml-auto font-black text-lg" style={{ color: '#E8683A' }}>✓</span>
              )}
            </OptionButton>
          ))}
        </div>
      )}

      {/* Step 2: Descripción */}
      {step === 2 && (
        <div className="flex flex-col gap-2">
          <textarea
            value={data.description}
            onChange={(e) => { setData((d) => ({ ...d, description: e.target.value })); setDescError('') }}
            rows={5}
            placeholder="Ej: Se me rompió el caño bajo el lavatorio, hay agua en el piso..."
            style={{ ...INPUT_STYLE, paddingTop: 14, paddingBottom: 14 }}
            autoFocus
          />
          <div className="flex justify-between items-center">
            {descError ? (
              <p className="text-xs" style={{ color: '#ef4444' }}>{descError}</p>
            ) : (
              <span />
            )}
            <p className="text-xs" style={{ color: data.description.length >= 20 ? '#16A34A' : '#AAAAAA' }}>
              {data.description.length}/20 mín.
            </p>
          </div>
        </div>
      )}

      {/* Step 3: Fotos */}
      {step === 3 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm" style={{ color: '#777777' }}>
            Las fotos ayudan al profesional a entender mejor el trabajo. Es opcional.
          </p>
          <label
            className="flex flex-col items-center justify-center gap-2 rounded-2xl cursor-pointer active:opacity-80 transition-opacity"
            style={{
              height: 120,
              border: '2px dashed #E8E0D4',
              background: '#F5F0E8',
            }}
          >
            <Camera size={28} style={{ color: '#AAAAAA' }} />
            <span className="text-sm font-semibold" style={{ color: '#999999' }}>Agregar fotos</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? [])
                setData((d) => ({ ...d, photos: [...d.photos, ...files].slice(0, 5) }))
              }}
            />
          </label>
          {data.photos.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {data.photos.map((f, i) => (
                <div key={i} className="relative">
                  <img
                    src={URL.createObjectURL(f)}
                    className="w-20 h-20 object-cover rounded-xl"
                    alt={`foto ${i + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => setData((d) => ({ ...d, photos: d.photos.filter((_, j) => j !== i) }))}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-black"
                    style={{ background: '#EF4444' }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 4: Ubicación */}
      {step === 4 && (
        <div className="flex flex-col gap-3">
          <div
            className="flex items-center gap-3 rounded-2xl p-4"
            style={{ background: '#EFF6FF', border: '1.5px solid rgba(59,130,246,.2)' }}
          >
            <MapPin size={18} style={{ color: '#3B82F6', flexShrink: 0 }} />
            <p className="text-sm font-semibold" style={{ color: '#1D4ED8' }}>
              Ubicación detectada: Montevideo
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider" style={{ color: '#999999' }}>
              Dirección exacta (opcional)
            </label>
            <input
              type="text"
              value={data.location}
              onChange={(e) => setData((d) => ({ ...d, location: e.target.value }))}
              placeholder="Ej: Av. 18 de Julio 1234, apto 3"
              style={INPUT_STYLE}
            />
          </div>
        </div>
      )}

      {/* Step 5: Urgencia */}
      {step === 5 && (
        <div className="flex flex-col gap-3">
          {URGENCY_LEVELS.map((u) => (
            <OptionButton
              key={u.value}
              selected={data.urgency_level === u.value}
              onClick={() => setData((d) => ({ ...d, urgency_level: u.value }))}
            >
              <span className="text-xl">{u.emoji}</span>
              <span className="text-base font-bold" style={{ color: '#111111' }}>{u.label}</span>
              {data.urgency_level === u.value && (
                <span className="ml-auto font-black text-lg" style={{ color: '#E8683A' }}>✓</span>
              )}
            </OptionButton>
          ))}
        </div>
      )}

      {/* Step 6: Tipo de solicitud */}
      {step === 6 && (
        <div className="flex flex-col gap-3">
          {REQUEST_TYPES.map((r) => (
            <OptionButton
              key={r.value}
              selected={data.request_type === r.value}
              onClick={() => setData((d) => ({ ...d, request_type: r.value }))}
            >
              <span className="text-2xl">{r.emoji}</span>
              <div className="flex flex-col flex-1">
                <span className="text-base font-bold" style={{ color: '#111111' }}>{r.label}</span>
                <span className="text-xs mt-0.5" style={{ color: '#999999' }}>{r.desc}</span>
              </div>
              {data.request_type === r.value && (
                <span className="font-black text-lg" style={{ color: '#E8683A' }}>✓</span>
              )}
            </OptionButton>
          ))}
        </div>
      )}

      {/* Step 7: Confirmación */}
      {step === 7 && (
        <div className="flex flex-col gap-4">
          {/* Resumen */}
          <div className="rounded-2xl overflow-hidden" style={{ border: '1.5px solid #E8E0D4' }}>
            {[
              { label: 'Tipo', value: WORK_TYPES.find((w) => w.value === data.work_type)?.label ?? '' },
              { label: 'Descripción', value: data.description },
              { label: 'Ubicación', value: data.location },
              { label: 'Urgencia', value: URGENCY_LEVELS.find((u) => u.value === data.urgency_level)?.label ?? '' },
              { label: 'Solicitud', value: REQUEST_TYPES.find((r) => r.value === data.request_type)?.label ?? '' },
            ].map((item, i, arr) => (
              <div
                key={item.label}
                className="flex gap-3 px-4 py-3"
                style={{ borderBottom: i < arr.length - 1 ? '1px solid #E8E0D4' : undefined, background: '#FFFFFF' }}
              >
                <span className="text-xs font-bold uppercase tracking-wider flex-shrink-0 pt-0.5 w-20" style={{ color: '#AAAAAA' }}>
                  {item.label}
                </span>
                <span className="text-sm font-semibold flex-1" style={{ color: '#111111' }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {/* Teléfono */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider" style={{ color: '#999999' }}>
              Teléfono de contacto
            </label>
            <input
              type="tel"
              value={data.contact_phone}
              onChange={(e) => { setData((d) => ({ ...d, contact_phone: e.target.value })); setPhoneError('') }}
              placeholder="Ej: 099 123 456"
              style={INPUT_STYLE}
            />
            {phoneError && <p className="text-xs" style={{ color: '#ef4444' }}>{phoneError}</p>}
          </div>
        </div>
      )}

      {/* Nav buttons */}
      <div className="flex gap-3 pt-2">
        {step > 1 && (
          <button
            type="button"
            onClick={back}
            className="flex items-center justify-center gap-1 rounded-2xl py-3.5 px-5 text-sm font-bold active:opacity-70 transition-opacity"
            style={{ background: '#EDE8DE', color: '#555555', border: '1.5px solid #E8E0D4' }}
          >
            <ChevronLeft size={16} />
            Atrás
          </button>
        )}
        {step < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={!canNext()}
            className="flex-1 rounded-2xl py-3.5 text-base font-bold text-white active:opacity-80 disabled:opacity-40 transition-opacity"
            style={{ background: '#E8683A', boxShadow: '0 4px 14px rgba(232,104,58,.3)' }}
          >
            Continuar
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 rounded-2xl py-3.5 text-base font-bold text-white active:opacity-80 disabled:opacity-50 transition-opacity"
            style={{ background: '#E8683A', boxShadow: '0 4px 14px rgba(232,104,58,.3)' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Enviando...
              </span>
            ) : 'Enviar solicitud'}
          </button>
        )}
      </div>
    </div>
  )
}
