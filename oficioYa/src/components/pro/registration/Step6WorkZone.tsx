import { useState } from 'react'
import { DEPARTMENTS_UY } from '../../../lib/categories'
import type { RegistrationState } from '../../../types/registration'

interface Props {
  initial: Partial<RegistrationState>
  onNext: (data: Partial<RegistrationState>) => Promise<void>
  loading: boolean
}

const RADIUS_OPTIONS = [
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '20 km', value: 20 },
  { label: '50 km', value: 50 },
  { label: 'Todo el departamento', value: null },
]

export function Step6WorkZone({ initial, onNext, loading }: Props) {
  const [departments, setDepartments] = useState<string[]>(initial.coverage_departments ?? [])
  const [radius, setRadius] = useState<number | null>(initial.coverage_radius_km ?? null)
  const [anywhere, setAnywhere] = useState(initial.travels_anywhere ?? false)
  const [error, setError] = useState('')

  function toggleDept(d: string) {
    setDepartments((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d])
  }

  async function handleSubmit() {
    if (!anywhere && departments.length === 0) { setError('Seleccioná al menos un departamento'); return }
    setError('')
    await onNext({ coverage_departments: departments, coverage_radius_km: radius, travels_anywhere: anywhere })
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer" style={{ background: '#fff', border: anywhere ? '2px solid #E8683A' : '1.5px solid #E8E0D4' }}>
        <input type="checkbox" checked={anywhere} onChange={(e) => setAnywhere(e.target.checked)} className="w-5 h-5 accent-orange-500" />
        <div>
          <p className="font-bold text-sm" style={{ color: '#111' }}>Me desplazo a cualquier zona</p>
          <p className="text-xs" style={{ color: '#888' }}>Uruguay entero</p>
        </div>
      </label>

      {!anywhere && (
        <>
          <div>
            <p className="text-sm font-bold mb-2" style={{ color: '#111' }}>Departamentos *</p>
            <div className="flex flex-wrap gap-2">
              {DEPARTMENTS_UY.map((d) => (
                <button
                  key={d}
                  onClick={() => toggleDept(d)}
                  className="px-3 py-2 rounded-xl text-sm font-medium border transition-all"
                  style={{
                    border: departments.includes(d) ? '1.5px solid #E8683A' : '1.5px solid #E8E0D4',
                    background: departments.includes(d) ? '#FEF0EA' : '#fff',
                    color: departments.includes(d) ? '#E8683A' : '#555',
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          <div>
            <p className="text-sm font-bold mb-2" style={{ color: '#111' }}>Radio de cobertura</p>
            <div className="flex flex-wrap gap-2">
              {RADIUS_OPTIONS.map(({ label, value }) => (
                <button
                  key={label}
                  onClick={() => setRadius(value)}
                  className="px-3 py-2 rounded-xl text-sm font-medium border transition-all"
                  style={{
                    border: radius === value ? '1.5px solid #E8683A' : '1.5px solid #E8E0D4',
                    background: radius === value ? '#FEF0EA' : '#fff',
                    color: radius === value ? '#E8683A' : '#555',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <button onClick={handleSubmit} disabled={loading} className="w-full py-4 rounded-2xl font-black text-white mt-2" style={{ background: loading ? '#ccc' : '#E8683A' }}>
        {loading ? 'Guardando...' : 'Siguiente →'}
      </button>
    </div>
  )
}
