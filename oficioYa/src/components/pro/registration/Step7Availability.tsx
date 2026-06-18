import { useState } from 'react'
import type { RegistrationState } from '../../../types/registration'

interface Props {
  initial: Partial<RegistrationState>
  onNext: (data: Partial<RegistrationState>) => Promise<void>
  loading: boolean
}

const DAYS = [
  { value: 'lunes',     label: 'Lun' },
  { value: 'martes',    label: 'Mar' },
  { value: 'miercoles', label: 'Mié' },
  { value: 'jueves',    label: 'Jue' },
  { value: 'viernes',   label: 'Vie' },
  { value: 'sabado',    label: 'Sáb' },
  { value: 'domingo',   label: 'Dom' },
]

export function Step7Availability({ initial, onNext, loading }: Props) {
  const [days, setDays] = useState<string[]>(initial.availability_days ?? [])
  const [from, setFrom] = useState(initial.availability_from ?? '08:00')
  const [to, setTo] = useState(initial.availability_to ?? '18:00')
  const [emergency, setEmergency] = useState(initial.emergency_24h ?? false)
  const [error, setError] = useState('')

  function toggleDay(d: string) {
    setDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d])
  }

  async function handleSubmit() {
    if (days.length === 0) { setError('Seleccioná al menos un día'); return }
    setError('')
    await onNext({ availability_days: days, availability_from: from, availability_to: to, emergency_24h: emergency })
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm font-bold mb-2" style={{ color: '#111' }}>Días disponibles *</p>
        <div className="flex gap-2">
          {DAYS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => toggleDay(value)}
              className="flex-1 py-3 rounded-xl border text-xs font-bold transition-all"
              style={{
                border: days.includes(value) ? '2px solid #E8683A' : '1.5px solid #E8E0D4',
                background: days.includes(value) ? '#FEF0EA' : '#fff',
                color: days.includes(value) ? '#E8683A' : '#555',
              }}
            >
              {label}
            </button>
          ))}
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>

      <div className="flex gap-3">
        {[{ label: 'Desde', value: from, set: setFrom }, { label: 'Hasta', value: to, set: setTo }].map(({ label, value, set }) => (
          <div key={label} className="flex-1">
            <label className="block text-sm font-bold mb-1" style={{ color: '#111' }}>{label}</label>
            <input type="time" value={value} onChange={(e) => set(e.target.value)} className="w-full px-3 py-3 rounded-xl border text-sm outline-none" style={{ border: '1.5px solid #E8E0D4', background: '#fff' }} />
          </div>
        ))}
      </div>

      <label className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer" style={{ background: '#fff', border: emergency ? '2px solid #E8683A' : '1.5px solid #E8E0D4' }}>
        <input type="checkbox" checked={emergency} onChange={(e) => setEmergency(e.target.checked)} className="w-5 h-5 accent-orange-500" />
        <div>
          <p className="font-bold text-sm" style={{ color: '#111' }}>Emergencias 24 horas</p>
          <p className="text-xs" style={{ color: '#888' }}>Disponible para urgencias fuera de horario</p>
        </div>
      </label>

      <button onClick={handleSubmit} disabled={loading} className="w-full py-4 rounded-2xl font-black text-white mt-2" style={{ background: loading ? '#ccc' : '#E8683A' }}>
        {loading ? 'Guardando...' : 'Siguiente →'}
      </button>
    </div>
  )
}
