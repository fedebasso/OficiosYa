import { useState } from 'react'
import { ALL_TRADES, SPECIALTIES_BY_TRADE } from '../../../lib/categories'
import type { RegistrationState } from '../../../types/registration'

interface Props {
  initial: Partial<RegistrationState>
  onNext: (data: Partial<RegistrationState>) => Promise<void>
  loading: boolean
}

export function Step2TradeInfo({ initial, onNext, loading }: Props) {
  const [trade, setTrade] = useState(initial.trade ?? '')
  const [specialties, setSpecialties] = useState<string[]>(initial.specialties ?? [])
  const [error, setError] = useState('')

  const available = trade ? (SPECIALTIES_BY_TRADE[trade] ?? []) : []

  function toggleSpecialty(s: string) {
    setSpecialties((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])
  }

  async function handleSubmit() {
    if (!trade) { setError('Seleccioná tu oficio principal'); return }
    setError('')
    await onNext({ trade, specialties })
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm font-bold mb-3" style={{ color: '#111111' }}>Oficio principal *</p>
        <div className="grid grid-cols-3 gap-2">
          {ALL_TRADES.map(({ value, label, emoji }) => (
            <button
              key={value}
              onClick={() => { setTrade(value); setSpecialties([]) }}
              className="flex flex-col items-center gap-1 py-3 px-2 rounded-2xl border text-xs font-bold transition-all"
              style={{
                border: trade === value ? '2px solid #E8683A' : '1.5px solid #E8E0D4',
                background: trade === value ? '#FEF0EA' : '#fff',
                color: trade === value ? '#E8683A' : '#555',
              }}
            >
              <span className="text-2xl">{emoji}</span>
              {label}
            </button>
          ))}
        </div>
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
      </div>

      {available.length > 0 && (
        <div>
          <p className="text-sm font-bold mb-2" style={{ color: '#111111' }}>Especialidades (opcional)</p>
          <div className="flex flex-wrap gap-2">
            {available.map((s) => (
              <button
                key={s}
                onClick={() => toggleSpecialty(s)}
                className="px-3 py-2 rounded-xl text-sm font-medium border transition-all"
                style={{
                  border: specialties.includes(s) ? '1.5px solid #E8683A' : '1.5px solid #E8E0D4',
                  background: specialties.includes(s) ? '#FEF0EA' : '#fff',
                  color: specialties.includes(s) ? '#E8683A' : '#555',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-4 rounded-2xl font-black text-white mt-2"
        style={{ background: loading ? '#ccc' : '#E8683A' }}
      >
        {loading ? 'Guardando...' : 'Siguiente →'}
      </button>
    </div>
  )
}
