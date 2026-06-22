// src/components/requests/RequestWizard.tsx
import { useState } from 'react'
import { DateStrip } from '../availability/DateStrip'
import { TimeSlotGrid } from '../availability/TimeSlotGrid'
import { useAvailabilityStore } from '../../store/availabilityStore'
import type { WorkType } from '../../store/requestStore'

export interface WizardData {
  work_type: WorkType | null
  description: string
  urgent: boolean
  contact_phone: string
  scheduled_date: string | null
  scheduled_time: string | null
}

interface Props {
  onSubmit: (data: WizardData) => Promise<void>
  loading?: boolean
  step: number
  onStep: (n: number) => void
  proId: string
}

const WORK_TYPES: { value: WorkType; label: string; subtitle: string; emoji: string }[] = [
  { value: 'reparacion',    label: 'Reparación',    subtitle: 'Arreglar algo que se rompió',  emoji: '🔧' },
  { value: 'instalacion',   label: 'Instalación',   subtitle: 'Instalar algo nuevo',           emoji: '⚙️' },
  { value: 'mantenimiento', label: 'Mantenimiento', subtitle: 'Revisión o mantenimiento',      emoji: '🛠️' },
  { value: 'otro',          label: 'Otro',          subtitle: 'Cualquier otro trabajo',        emoji: '📋' },
]

const TOTAL_STEPS = 5

const INPUT_STYLE: React.CSSProperties = {
  background: '#FFFFFF',
  border: '1.5px solid #E8E0D4',
  color: '#111111',
  borderRadius: 14,
  padding: '14px 16px',
  fontSize: 16,
  width: '100%',
  outline: 'none',
  resize: 'none',
  caretColor: '#E8683A',
}

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex gap-1.5 py-3">
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

export function RequestWizard({ onSubmit, loading, step, onStep, proId }: Props) {
  const getSlots = useAvailabilityStore((s) => s.getSlots)
  const schedules = useAvailabilityStore((s) => s.schedules)
  const proHasSchedule = Boolean(schedules[proId])

  const [data, setData] = useState<WizardData>({
    work_type: null,
    description: '',
    urgent: false,
    contact_phone: '',
    scheduled_date: null,
    scheduled_time: null,
  })
  const [descError, setDescError] = useState('')
  const [phoneError, setPhoneError] = useState('')

  const slots = data.scheduled_date ? getSlots(proId, data.scheduled_date) : []

  const canNext = (): boolean => {
    if (step === 1) return data.work_type !== null
    if (step === 2) return data.description.length >= 20
    if (step === 4) {
      // Si el pro no tiene agenda configurada, puede continuar sin seleccionar
      if (!proHasSchedule) return true
      return data.scheduled_date !== null && data.scheduled_time !== null
    }
    return true
  }

  const handleNext = () => {
    if (step === 2 && data.description.length < 20) {
      setDescError('Describí el trabajo (mín. 20 caracteres)')
      return
    }
    setDescError('')
    onStep(Math.min(step + 1, TOTAL_STEPS))
  }

  const handleSubmit = async () => {
    if (data.contact_phone.length < 8) {
      setPhoneError('Ingresá tu teléfono de contacto')
      return
    }
    setPhoneError('')
    await onSubmit(data)
  }

  const stepTitles = [
    '¿Qué tipo de trabajo?',
    'Contanos qué necesitás',
    '¿Es urgente?',
    '¿Cuándo lo necesitás?',
    'Confirmá tu solicitud',
  ]

  return (
    <div className="flex flex-col gap-4">
      <ProgressBar step={step} />

      <div className="px-1">
        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#AAAAAA' }}>
          Paso {step} de {TOTAL_STEPS}
        </p>
        <h2 className="text-xl font-black" style={{ color: '#111111', letterSpacing: '-0.3px' }}>
          {stepTitles[step - 1]}
        </h2>
      </div>

      {/* Paso 1: Tipo de trabajo */}
      {step === 1 && (
        <div className="flex flex-col gap-3">
          {WORK_TYPES.map((w) => {
            const selected = data.work_type === w.value
            return (
              <button
                key={w.value}
                type="button"
                onClick={() => setData((d) => ({ ...d, work_type: w.value }))}
                className="w-full text-left rounded-2xl p-4 flex items-center gap-3 active:opacity-80 transition-all"
                style={{
                  background: selected ? '#FEF0EA' : '#FFFFFF',
                  border: `1.5px solid ${selected ? '#E8683A' : '#E8E0D4'}`,
                  boxShadow: selected ? '0 2px 8px rgba(232,104,58,.12)' : '0 1px 3px rgba(0,0,0,.04)',
                }}
              >
                <span className="text-2xl flex-shrink-0">{w.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-bold" style={{ color: '#111111' }}>{w.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#999999' }}>{w.subtitle}</div>
                </div>
                {selected && (
                  <span className="font-black text-lg flex-shrink-0" style={{ color: '#E8683A' }}>✓</span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Paso 2: Descripción */}
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
            {descError
              ? <p className="text-xs" style={{ color: '#ef4444' }}>{descError}</p>
              : <span />
            }
            <p className="text-xs" style={{ color: data.description.length >= 20 ? '#16A34A' : '#AAAAAA' }}>
              {data.description.length}/20 mín.
            </p>
          </div>
        </div>
      )}

      {/* Paso 3: Urgencia */}
      {step === 3 && (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            role="switch"
            aria-pressed={data.urgent}
            onClick={() => setData((d) => ({ ...d, urgent: !d.urgent }))}
            className="w-full text-left rounded-2xl p-4 flex items-center gap-3 active:opacity-80 transition-all"
            style={{
              background: data.urgent ? '#FFF5F5' : '#FFFFFF',
              border: `2px solid ${data.urgent ? '#EF4444' : '#E8E0D4'}`,
              boxShadow: data.urgent ? '0 2px 12px rgba(239,68,68,.1)' : '0 1px 3px rgba(0,0,0,.04)',
            }}
          >
            <span className="text-3xl flex-shrink-0">🚨</span>
            <div className="flex-1 min-w-0">
              <div className="text-base font-bold" style={{ color: data.urgent ? '#DC2626' : '#111111' }}>
                Es urgente
              </div>
            </div>
            <div
              className="flex-shrink-0 transition-all duration-200"
              style={{ width: 44, height: 24, borderRadius: 12, background: data.urgent ? '#EF4444' : '#E8E0D4', position: 'relative' }}
            >
              <div
                className="absolute top-1 transition-all duration-200"
                style={{ width: 16, height: 16, borderRadius: '50%', background: '#FFFFFF', left: data.urgent ? 24 : 4, boxShadow: '0 1px 3px rgba(0,0,0,.2)' }}
              />
            </div>
          </button>
        </div>
      )}

      {/* Paso 4: Fecha y horario */}
      {step === 4 && (
        <div className="flex flex-col gap-4">
          <p className="text-sm" style={{ color: '#555555' }}>
            Seleccioná el día y horario más conveniente para vos
          </p>

          <DateStrip
            proId={proId}
            selected={data.scheduled_date}
            onSelect={(date) => setData((d) => ({ ...d, scheduled_date: date, scheduled_time: null }))}
          />

          {data.scheduled_date ? (
            <div>
              <div className="flex gap-3 text-[10px] font-bold mb-3" style={{ color: '#888' }}>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full inline-block" style={{ background: 'linear-gradient(135deg,#16A34A,#15803D)' }} />
                  Disponible
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full inline-block" style={{ background: 'linear-gradient(135deg,#DC2626,#B91C1C)' }} />
                  Ocupado
                </span>
              </div>
              <TimeSlotGrid
                slots={slots}
                selected={data.scheduled_time}
                onSelect={(time) => setData((d) => ({ ...d, scheduled_time: time }))}
              />
            </div>
          ) : (
            <p className="text-sm text-center py-4" style={{ color: '#AAAAAA' }}>
              Seleccioná un día para ver los horarios disponibles
            </p>
          )}
        </div>
      )}

      {/* Paso 5: Confirmación */}
      {step === 5 && (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl overflow-hidden" style={{ border: '1.5px solid #E8E0D4' }}>
            {[
              { label: 'Tipo',        value: WORK_TYPES.find((w) => w.value === data.work_type)?.label ?? '' },
              { label: 'Descripción', value: data.description },
              { label: 'Urgencia',    value: data.urgent ? '🚨 Urgente' : 'Pedido normal' },
              {
                label: 'Horario',
                value: data.scheduled_date && data.scheduled_time
                  ? `📅 ${data.scheduled_date} · ${data.scheduled_time}hs`
                  : 'A coordinar por chat',
              },
            ].map((item, i, arr) => (
              <div
                key={item.label}
                className="flex gap-3 px-4 py-3"
                style={{ borderBottom: i < arr.length - 1 ? '1px solid #E8E0D4' : undefined, background: '#FFFFFF' }}
              >
                <span
                  className="text-xs font-bold uppercase tracking-wider flex-shrink-0 pt-0.5"
                  style={{ color: '#AAAAAA', width: 80 }}
                >
                  {item.label}
                </span>
                <span className="text-sm font-semibold flex-1" style={{ color: '#111111' }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>

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

      {/* Navegación */}
      <div className="flex gap-3 pt-2">
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
