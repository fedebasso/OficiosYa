import { useState, useEffect } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { registrationService } from '../../../services/registrationService'
import type { CertificationItem, CertType } from '../../../types/registration'

interface Props {
  onNext: () => Promise<void>
  loading: boolean
}

const CERT_TYPES: { value: CertType; label: string }[] = [
  { value: 'titulo',       label: 'Título técnico' },
  { value: 'certificado',  label: 'Certificado profesional' },
  { value: 'curso',        label: 'Curso realizado' },
  { value: 'carnet',       label: 'Carnet habilitante' },
]

export function Step5Certifications({ onNext, loading }: Props) {
  const user = useAuthStore((s) => s.user)
  const [items, setItems] = useState<CertificationItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({ type: 'titulo' as CertType, title: '', institution: '', issue_date: '' })
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.id) registrationService.getCertifications(user.id).then(setItems)
  }, [user?.id])

  async function handleAdd() {
    if (!form.title.trim()) { setError('El nombre del certificado es obligatorio'); return }
    if (!file) { setError('Subí el archivo del certificado'); return }
    if (!user?.id) return
    setUploading(true)
    try {
      const url = await registrationService.uploadFile('pro-certifications', user.id, file)
      const item = await registrationService.addCertification(user.id, {
        type: form.type,
        title: form.title,
        institution: form.institution || null,
        issue_date: form.issue_date || null,
        file_url: url,
      })
      setItems((prev) => [item, ...prev])
      setShowForm(false)
      setForm({ type: 'titulo', title: '', institution: '', issue_date: '' })
      setFile(null)
      setError('')
    } catch {
      setError('Error al subir la certificación')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm" style={{ color: '#555' }}>
        Opcional, pero suma 10 puntos a tu score. Podés agregar más después.
      </p>

      {items.map((item) => (
        <div key={item.id} className="rounded-2xl p-4" style={{ background: '#fff', border: '1.5px solid #E8E0D4' }}>
          <p className="font-bold text-sm" style={{ color: '#111' }}>{item.title}</p>
          <p className="text-xs text-gray-500">{CERT_TYPES.find((t) => t.value === item.type)?.label}</p>
          {item.institution && <p className="text-xs text-gray-400">{item.institution}</p>}
        </div>
      ))}

      {showForm ? (
        <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: '#fff', border: '2px solid #E8683A' }}>
          <div>
            <label className="text-xs font-bold" style={{ color: '#555' }}>Tipo *</label>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as CertType }))}
              className="w-full px-3 py-2 rounded-xl border text-sm outline-none mt-1"
              style={{ border: '1.5px solid #E8E0D4', background: '#F9F7F4' }}
            >
              {CERT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          {[
            { key: 'title',       label: 'Nombre *',         placeholder: 'Técnico Electricista' },
            { key: 'institution', label: 'Institución',      placeholder: 'UTU' },
            { key: 'issue_date',  label: 'Fecha de emisión', placeholder: '', type: 'date' },
          ].map(({ key, label, placeholder, type }) => (
            <div key={key}>
              <label className="text-xs font-bold" style={{ color: '#555' }}>{label}</label>
              <input
                type={type ?? 'text'}
                value={(form as Record<string, string>)[key]}
                placeholder={placeholder}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border text-sm outline-none mt-1"
                style={{ border: '1.5px solid #E8E0D4', background: '#F9F7F4' }}
              />
            </div>
          ))}
          <div>
            <label className="text-xs font-bold" style={{ color: '#555' }}>Archivo (PDF o imagen) *</label>
            <input type="file" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="w-full text-sm mt-1" />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-xl border text-sm font-bold" style={{ border: '1.5px solid #E8E0D4', color: '#555' }}>Cancelar</button>
            <button onClick={handleAdd} disabled={uploading} className="flex-1 py-2 rounded-xl text-sm font-bold text-white" style={{ background: uploading ? '#ccc' : '#E8683A' }}>
              {uploading ? 'Subiendo...' : 'Agregar'}
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="w-full py-3 rounded-2xl border-2 border-dashed text-sm font-bold" style={{ borderColor: '#E8683A', color: '#E8683A' }}>
          + Agregar certificación
        </button>
      )}

      <button onClick={onNext} disabled={loading} className="w-full py-4 rounded-2xl font-black text-white mt-2" style={{ background: loading ? '#ccc' : '#E8683A' }}>
        {loading ? 'Guardando...' : items.length > 0 ? 'Siguiente →' : 'Omitir por ahora →'}
      </button>
    </div>
  )
}
