import { useState } from 'react'
import type { RegistrationState } from '../../../types/registration'

interface Props {
  initial: Partial<RegistrationState>
  avatarUrl: string | null
  onNext: (data: Partial<RegistrationState>, avatarFile?: File) => Promise<void>
  loading: boolean
}

export function Step1PersonalData({ initial, avatarUrl, onNext, loading }: Props) {
  const [form, setForm] = useState({
    cedula: initial.cedula ?? '',
    birth_date: initial.birth_date ?? '',
    address: initial.address ?? '',
    department: initial.department ?? '',
    city: initial.city ?? '',
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(avatarUrl)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!form.cedula.match(/^\d{7,8}$/)) e.cedula = 'Cédula inválida (7-8 dígitos)'
    if (!form.birth_date) e.birth_date = 'Requerido'
    if (!form.address.trim()) e.address = 'Requerido'
    if (!form.department) e.department = 'Requerido'
    if (!form.city.trim()) e.city = 'Requerido'
    if (!avatarPreview) e.avatar = 'La foto de perfil es obligatoria'
    return e
  }

  function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSubmit() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    await onNext(form, avatarFile ?? undefined)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Foto de perfil */}
      <div className="flex flex-col items-center gap-2">
        <div
          className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow"
          style={{ background: '#E8E0D4' }}
        >
          {avatarPreview
            ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>
          }
        </div>
        <label className="text-sm font-bold cursor-pointer" style={{ color: '#E8683A' }}>
          {avatarPreview ? 'Cambiar foto' : 'Subir foto *'}
          <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
        </label>
        {errors.avatar && <p className="text-red-500 text-xs">{errors.avatar}</p>}
      </div>

      {/* Campos */}
      {[
        { key: 'cedula', label: 'Cédula de identidad *', placeholder: '12345678', type: 'text' },
        { key: 'birth_date', label: 'Fecha de nacimiento *', placeholder: '', type: 'date' },
        { key: 'address', label: 'Dirección *', placeholder: 'Av. 18 de Julio 1234', type: 'text' },
        { key: 'city', label: 'Ciudad / Barrio *', placeholder: 'Pocitos', type: 'text' },
      ].map(({ key, label, placeholder, type }) => (
        <div key={key}>
          <label className="block text-sm font-bold mb-1" style={{ color: '#111111' }}>{label}</label>
          <input
            type={type}
            value={(form as Record<string, string>)[key]}
            placeholder={placeholder}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
            style={{ border: errors[key] ? '1.5px solid #ef4444' : '1.5px solid #E8E0D4', background: '#fff' }}
          />
          {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
        </div>
      ))}

      {/* Departamento select */}
      <div>
        <label className="block text-sm font-bold mb-1" style={{ color: '#111111' }}>Departamento *</label>
        <select
          value={form.department}
          onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
          style={{ border: errors.department ? '1.5px solid #ef4444' : '1.5px solid #E8E0D4', background: '#fff' }}
        >
          <option value="">Seleccioná...</option>
          {['Montevideo','Canelones','Maldonado','Colonia','San José','Flores','Florida','Soriano','Río Negro','Paysandú','Salto','Artigas','Rivera','Tacuarembó','Cerro Largo','Treinta y Tres','Rocha','Lavalleja','Durazno','Minas'].map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
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
