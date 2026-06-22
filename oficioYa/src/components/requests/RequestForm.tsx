import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  description: z.string().min(20, 'Describe el problema (mín. 20 caracteres)'),
  contact_phone: z.string().min(8, 'Ingresá tu teléfono de contacto'),
  urgency: z.boolean(),
})

type FormData = z.infer<typeof schema>

interface Props {
  onSubmit: (data: FormData) => Promise<void>
  loading?: boolean
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

export function RequestForm({ onSubmit, loading }: Props) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { urgency: false },
  })

  const urgency = useWatch({ control, name: 'urgency' })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

      {/* Descripción */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-wider" style={{ color: '#999999' }}>
          Descripción del problema
        </label>
        <textarea
          {...register('description')}
          rows={4}
          placeholder="Ej: Se cortó la luz en el baño, el tomacorriente no funciona..."
          style={{ ...INPUT_STYLE, paddingTop: 14, paddingBottom: 14 }}
        />
        {errors.description && (
          <p className="text-xs" style={{ color: '#ef4444' }}>{errors.description.message}</p>
        )}
      </div>

      {/* Teléfono */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-wider" style={{ color: '#999999' }}>
          Teléfono de contacto
        </label>
        <input
          {...register('contact_phone')}
          type="tel"
          placeholder="Ej: 099 123 456"
          style={INPUT_STYLE}
        />
        {errors.contact_phone && (
          <p className="text-xs" style={{ color: '#ef4444' }}>{errors.contact_phone.message}</p>
        )}
      </div>

      {/* Urgencia toggle */}
      <button
        type="button"
        onClick={() => {
          const el = document.getElementById('urgency-cb') as HTMLInputElement
          if (el) el.click()
        }}
        className="flex items-center gap-3 rounded-2xl p-4 text-left active:opacity-80 transition-opacity"
        style={{
          background: urgency ? '#FEF2F2' : '#FFFFFF',
          border: `1.5px solid ${urgency ? '#FECACA' : '#E8E0D4'}`,
          boxShadow: urgency ? '0 2px 8px rgba(239,68,68,.06)' : '0 1px 3px rgba(0,0,0,.04)',
        }}
      >
        <div
          className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
          style={{
            background: urgency ? '#EF4444' : '#FFFFFF',
            border: `2px solid ${urgency ? '#EF4444' : '#E8E0D4'}`,
          }}
        >
          {urgency && <span style={{ color: '#fff', fontSize: 11, fontWeight: 900 }}>✓</span>}
        </div>
        <input id="urgency-cb" type="checkbox" {...register('urgency')} className="hidden" />
        <div>
          <p className="text-sm font-bold" style={{ color: urgency ? '#DC2626' : '#111111' }}>
            🚨 Es urgente
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#999999' }}>
            El profesional priorizará tu solicitud
          </p>
        </div>
      </button>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl py-4 text-base font-bold text-white active:opacity-80 disabled:opacity-50 transition-opacity"
        style={{ background: '#e8683a', boxShadow: '0 4px 14px rgba(232,104,58,.3)' }}
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

    </form>
  )
}
