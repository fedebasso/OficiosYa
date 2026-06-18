import { useState, useEffect } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { registrationService } from '../../../services/registrationService'
import type { PortfolioItem } from '../../../types/registration'

interface Props {
  onNext: () => Promise<void>
  loading: boolean
}

export function Step4Portfolio({ onNext, loading }: Props) {
  const user = useAuthStore((s) => s.user)
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', category: '', work_date: '' })
  const [photos, setPhotos] = useState<File[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.id) registrationService.getPortfolio(user.id).then(setItems)
  }, [user?.id])

  async function handleAddItem() {
    if (!form.title.trim()) { setError('El título es obligatorio'); return }
    if (photos.length === 0) { setError('Subí al menos una foto'); return }
    if (!user?.id) return
    setUploading(true)
    try {
      const urls = await Promise.all(
        photos.map((f) => registrationService.uploadFile('pro-portfolio', user.id!, f))
      )
      const item = await registrationService.addPortfolioItem(user.id, {
        title: form.title,
        description: form.description || null,
        category: form.category || null,
        work_date: form.work_date || null,
        photo_urls: urls,
      })
      setItems((prev) => [item, ...prev])
      setShowForm(false)
      setForm({ title: '', description: '', category: '', work_date: '' })
      setPhotos([])
      setError('')
    } catch (e) {
      setError('Error al subir el trabajo')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id: string) {
    await registrationService.deletePortfolioItem(id)
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const canProceed = items.length >= 5

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl p-4" style={{ background: '#fff', border: '1.5px solid #E8E0D4' }}>
        <p className="text-sm font-bold" style={{ color: '#111' }}>
          Trabajos subidos: <span style={{ color: canProceed ? '#0F6E56' : '#E8683A' }}>{items.length}</span>/5 mínimo
        </p>
        {!canProceed && <p className="text-xs mt-1" style={{ color: '#888' }}>Necesitás al menos 5 fotos para continuar</p>}
      </div>

      {items.map((item) => (
        <div key={item.id} className="rounded-2xl p-4 flex gap-3" style={{ background: '#fff', border: '1.5px solid #E8E0D4' }}>
          {item.photo_urls[0] && (
            <img src={item.photo_urls[0]} alt={item.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate" style={{ color: '#111' }}>{item.title}</p>
            {item.description && <p className="text-xs text-gray-500 truncate">{item.description}</p>}
            <p className="text-xs text-gray-400">{item.photo_urls.length} foto(s)</p>
          </div>
          <button onClick={() => handleDelete(item.id)} className="text-red-400 text-sm">✕</button>
        </div>
      ))}

      {showForm ? (
        <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: '#fff', border: '2px solid #E8683A' }}>
          <p className="font-bold text-sm" style={{ color: '#111' }}>Nuevo trabajo</p>
          {[
            { key: 'title', label: 'Título *', placeholder: 'Instalación eléctrica completa' },
            { key: 'description', label: 'Descripción', placeholder: 'Recableado y colocación de tablero...' },
            { key: 'work_date', label: 'Fecha aproximada', placeholder: '', type: 'date' },
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
            <label className="text-xs font-bold" style={{ color: '#555' }}>Fotos *</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setPhotos(Array.from(e.target.files ?? []))}
              className="w-full text-sm mt-1"
            />
            {photos.length > 0 && <p className="text-xs text-gray-500">{photos.length} foto(s) seleccionada(s)</p>}
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 py-2 rounded-xl border text-sm font-bold"
              style={{ border: '1.5px solid #E8E0D4', color: '#555' }}
            >
              Cancelar
            </button>
            <button
              onClick={handleAddItem}
              disabled={uploading}
              className="flex-1 py-2 rounded-xl text-sm font-bold text-white"
              style={{ background: uploading ? '#ccc' : '#E8683A' }}
            >
              {uploading ? 'Subiendo...' : 'Agregar'}
            </button>
          </div>
        </div>
      ) : (
        items.length < 30 && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-3 rounded-2xl border-2 border-dashed text-sm font-bold"
            style={{ borderColor: '#E8683A', color: '#E8683A' }}
          >
            + Agregar trabajo
          </button>
        )
      )}

      <button
        onClick={onNext}
        disabled={!canProceed || loading}
        className="w-full py-4 rounded-2xl font-black text-white mt-2"
        style={{ background: (!canProceed || loading) ? '#ccc' : '#E8683A' }}
      >
        {loading ? 'Guardando...' : canProceed ? 'Siguiente →' : `Necesitás ${5 - items.length} foto(s) más`}
      </button>
    </div>
  )
}
