import { useState } from 'react'
import type { RegistrationState } from '../../../types/registration'

interface Props {
  initial: Partial<RegistrationState>
  onNext: (data: Partial<RegistrationState>) => Promise<void>
  loading: boolean
}

export function Step8ContactInfo({ initial, onNext, loading }: Props) {
  const [whatsapp, setWhatsapp] = useState(initial.whatsapp ?? '')
  const [email, setEmail] = useState(initial.contact_email ?? '')
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!whatsapp.trim() && !email.trim()) { setError('Ingresá al menos WhatsApp o email'); return }
    setError('')
    await onNext({ whatsapp: whatsapp || null, contact_email: email || null })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl p-4" style={{ background: '#FEF3C7', border: '1.5px solid #FDE68A' }}>
        <p className="text-sm font-bold" style={{ color: '#92400E' }}>🔒 Datos privados</p>
        <p className="text-xs mt-1" style={{ color: '#92400E' }}>
          Tu WhatsApp y email nunca se muestran en tu perfil público. Solo se comparten cuando un cliente te envía una solicitud.
        </p>
      </div>

      <div>
        <label className="block text-sm font-bold mb-1" style={{ color: '#111' }}>WhatsApp</label>
        <div className="flex">
          <span className="px-3 py-3 rounded-l-xl border border-r-0 text-sm bg-gray-50" style={{ border: '1.5px solid #E8E0D4', borderRight: 'none', color: '#555' }}>+598</span>
          <input
            type="tel"
            value={whatsapp}
            placeholder="099 123 456"
            onChange={(e) => setWhatsapp(e.target.value)}
            className="flex-1 px-3 py-3 rounded-r-xl border text-sm outline-none"
            style={{ border: '1.5px solid #E8E0D4', background: '#fff' }}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold mb-1" style={{ color: '#111' }}>Email de contacto</label>
        <input
          type="email"
          value={email}
          placeholder="tu@email.com"
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
          style={{ border: '1.5px solid #E8E0D4', background: '#fff' }}
        />
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <button onClick={handleSubmit} disabled={loading} className="w-full py-4 rounded-2xl font-black text-white mt-2" style={{ background: loading ? '#ccc' : '#E8683A' }}>
        {loading ? 'Guardando...' : 'Siguiente →'}
      </button>
    </div>
  )
}
