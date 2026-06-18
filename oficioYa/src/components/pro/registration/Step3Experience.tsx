import { useState } from 'react'
import type { RegistrationState, WorkMode } from '../../../types/registration'

interface Props {
  initial: Partial<RegistrationState>
  onNext: (data: Partial<RegistrationState>) => Promise<void>
  loading: boolean
}

export function Step3Experience({ initial, onNext, loading }: Props) {
  const [years, setYears] = useState(initial.years_experience?.toString() ?? '')
  const [workMode, setWorkMode] = useState<WorkMode | ''>(initial.work_mode ?? '')
  const [bio, setBio] = useState(initial.bio ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!years || isNaN(Number(years)) || Number(years) < 0) e.years = 'Ingresá los años de experiencia'
    if (!workMode) e.workMode = 'Seleccioná una opción'
    if (bio.length < 50) e.bio = `Mínimo 50 caracteres (${bio.length}/500)`
    if (bio.length > 500) e.bio = 'Máximo 500 caracteres'
    return e
  }

  async function handleSubmit() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    await onNext({ years_experience: Number(years), work_mode: workMode as WorkMode, bio })
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-bold mb-1" style={{ color: '#111111' }}>Años de experiencia *</label>
        <input
          type="number"
          value={years}
          min="0"
          max="60"
          onChange={(e) => setYears(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
          style={{ border: errors.years ? '1.5px solid #ef4444' : '1.5px solid #E8E0D4', background: '#fff' }}
        />
        {errors.years && <p className="text-red-500 text-xs mt-1">{errors.years}</p>}
      </div>

      <div>
        <p className="text-sm font-bold mb-2" style={{ color: '#111111' }}>¿Trabajás de forma...? *</p>
        <div className="flex gap-3">
          {(['independiente', 'empresa'] as WorkMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setWorkMode(m)}
              className="flex-1 py-3 rounded-xl border text-sm font-bold capitalize transition-all"
              style={{
                border: workMode === m ? '2px solid #E8683A' : '1.5px solid #E8E0D4',
                background: workMode === m ? '#FEF0EA' : '#fff',
                color: workMode === m ? '#E8683A' : '#555',
              }}
            >
              {m === 'independiente' ? 'Independiente' : 'En empresa'}
            </button>
          ))}
        </div>
        {errors.workMode && <p className="text-red-500 text-xs mt-1">{errors.workMode}</p>}
      </div>

      <div>
        <label className="block text-sm font-bold mb-1" style={{ color: '#111111' }}>
          Descripción profesional * <span className="font-normal text-gray-400">({bio.length}/500)</span>
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={500}
          rows={5}
          placeholder="Soy electricista con 12 años de experiencia realizando instalaciones residenciales y comerciales..."
          className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none"
          style={{ border: errors.bio ? '1.5px solid #ef4444' : '1.5px solid #E8E0D4', background: '#fff' }}
        />
        {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio}</p>}
      </div>

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
