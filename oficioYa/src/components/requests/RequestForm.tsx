import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../ui/Button'

const schema = z.object({
  description: z.string().min(20, 'Describe el problema (mín. 20 caracteres)'),
  contact_phone: z.string().min(8, 'Ingresa tu teléfono de contacto'),
  urgency: z.boolean(),
})

type FormData = z.infer<typeof schema>

interface Props {
  onSubmit: (data: FormData) => Promise<void>
  loading?: boolean
}

export function RequestForm({ onSubmit, loading }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { urgency: false },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-text-main">Descripción del problema</label>
        <textarea
          {...register('description')}
          rows={4}
          placeholder="Ej: Se cortó la luz en el baño, el tomacorriente no funciona..."
          className="border border-border-dark rounded-lg px-3 py-2 text-sm text-text-main bg-bg-elevated placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
        {errors.description && (
          <p className="text-xs text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-text-main">Teléfono de contacto</label>
        <input
          {...register('contact_phone')}
          type="tel"
          placeholder="Ej: 099 123 456"
          className="border border-border-dark rounded-lg px-3 py-2 text-sm text-text-main bg-bg-elevated placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.contact_phone && (
          <p className="text-xs text-red-500">{errors.contact_phone.message}</p>
        )}
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          {...register('urgency')}
          className="w-4 h-4 accent-primary"
        />
        <span className="text-sm text-text-main">Es urgente</span>
      </label>

      <Button type="submit" variant="primary" fullWidth disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar solicitud'}
      </Button>
    </form>
  )
}
