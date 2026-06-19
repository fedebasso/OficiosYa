import { useState } from 'react'
import { registrationService } from '../../../services/registrationService'
import { ALL_TRADES } from '../../../lib/categories'
import type { PortfolioItem, WorkPhoto, PhotoType } from '../../../types/registration'
import { X } from 'lucide-react'

interface Props {
  item: PortfolioItem | null
  proId: string
  onSave: (item: PortfolioItem) => void
  onClose: () => void
  prefill?: { category?: string | null; description?: string | null; request_id?: string | null }
}

export function PortfolioItemForm({ item, proId, onSave, onClose, prefill }: Props) {
  const [title, setTitle]       = useState(item?.title ?? '')
  const [category, setCategory] = useState(item?.category ?? prefill?.category ?? '')
  const [description, setDesc]  = useState(item?.description ?? prefill?.description ?? '')
  const [workDate, setWorkDate] = useState(item?.work_date ?? '')
  const [location, setLocation] = useState(item?.location ?? '')
  const [featured, setFeatured] = useState(item?.is_featured ?? false)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  // Fotos nuevas a subir por tipo
  const [newPhotos, setNewPhotos] = useState<Record<PhotoType, File[]>>({
    general: [], before: [], after: [],
  })

  // Fotos ya guardadas (para edición)
  const [existingPhotos] = useState<WorkPhoto[]>(item?.photos ?? [])

  async function handleSave() {
    if (!title.trim()) { setError('El título es obligatorio'); return }
    if (!category) { setError('Seleccioná una categoría'); return }
    const totalPhotos = existingPhotos.length + Object.values(newPhotos).flat().length
    if (totalPhotos === 0) { setError('Subí al menos una foto'); return }

    setSaving(true)
    setError('')
    try {
      // Subir fotos nuevas
      const uploadedPhotos: WorkPhoto[] = [...existingPhotos]
      for (const type of ['general', 'before', 'after'] as PhotoType[]) {
        for (const file of newPhotos[type]) {
          const url = await registrationService.uploadFile('pro-portfolio', proId, file)
          uploadedPhotos.push({ url, type })
        }
      }

      // Campos que siempre existieron en work_portfolio (seguros sin migración)
      const baseData = {
        title,
        category,
        description: description || null,
        work_date: workDate || null,
        photo_urls: uploadedPhotos.map((p) => p.url),
      }

      // Campos nuevos (requieren migración 20260618_portfolio_mejoras.sql)
      // Se agregan si están disponibles; si la migración no corrió, el INSERT igual funciona con baseData
      const extendedData = {
        ...baseData,
        location: location || null,
        photos: uploadedPhotos,
        request_id: item?.request_id ?? prefill?.request_id ?? null,
        is_featured: featured,
      }

      let saved: PortfolioItem
      try {
        if (item) {
          saved = await registrationService.updatePortfolioItem(item.id, extendedData)
        } else {
          saved = await registrationService.addPortfolioItem(proId, extendedData as Parameters<typeof registrationService.addPortfolioItem>[1])
        }
      } catch {
        // Si falló con los campos nuevos (migración no ejecutada), reintentar solo con campos base
        if (item) {
          saved = await registrationService.updatePortfolioItem(item.id, baseData)
        } else {
          saved = await registrationService.addPortfolioItem(proId, baseData as Parameters<typeof registrationService.addPortfolioItem>[1])
        }
      }

      // Si estamos quitando el destacado de un item que antes era destacado
      if (item && item.is_featured && !featured) {
        await import('../../../lib/supabase').then(({ supabase }) =>
          supabase.from('professionals').update({ featured_photo_url: null }).eq('id', proId)
        )
      }

      onSave(saved)

      // Si se marcó como destacado, intentar actualizar foto destacada
      // (no bloquea si falla — el item ya fue guardado exitosamente)
      if (featured) {
        const firstPhoto = uploadedPhotos[0]?.url ?? null
        if (firstPhoto) {
          registrationService.toggleFeatured(proId, saved.id, firstPhoto).catch(() => {
            // foto destacada no se actualizó, pero el trabajo sí se guardó
          })
        }
      }
    } catch (e) {
      setError('Error al guardar el trabajo')
    } finally {
      setSaving(false)
    }
  }

  const PHOTO_TYPES: { type: PhotoType; label: string }[] = [
    { type: 'general', label: 'Fotos generales *' },
    { type: 'before',  label: 'Fotos antes (opcional)' },
    { type: 'after',   label: 'Fotos después (opcional)' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div
        className="rounded-t-3xl flex flex-col overflow-y-auto"
        style={{ background: '#F5F0E8', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3" style={{ borderBottom: '1px solid #E8E0D4' }}>
          <h2 className="font-black text-lg" style={{ color: '#111' }}>
            {item ? 'Editar trabajo' : 'Nuevo trabajo'}
          </h2>
          <button type="button" onClick={onClose}><X size={20} style={{ color: '#888' }} /></button>
        </div>

        <div className="flex flex-col gap-4 px-5 py-4 pb-10">
          {/* Título */}
          <div>
            <label className="block text-xs font-bold mb-1" style={{ color: '#555' }}>Título *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Instalación eléctrica completa"
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
              style={{ border: '1.5px solid #E8E0D4', background: '#fff' }}
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-xs font-bold mb-1" style={{ color: '#555' }}>Categoría *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
              style={{ border: '1.5px solid #E8E0D4', background: '#fff' }}
            >
              <option value="">Seleccioná...</option>
              {ALL_TRADES.map(({ value, label, emoji }) => (
                <option key={value} value={value}>{emoji} {label}</option>
              ))}
            </select>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-bold mb-1" style={{ color: '#555' }}>
              Descripción <span style={{ color: '#AAA' }}>({description.length}/300)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDesc(e.target.value.slice(0, 300))}
              rows={3}
              placeholder="Describí brevemente el trabajo realizado..."
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none"
              style={{ border: '1.5px solid #E8E0D4', background: '#fff' }}
            />
          </div>

          {/* Fecha y Ubicación */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-bold mb-1" style={{ color: '#555' }}>Fecha aprox.</label>
              <input
                type="date"
                value={workDate}
                onChange={(e) => setWorkDate(e.target.value)}
                className="w-full px-3 py-3 rounded-xl border text-sm outline-none"
                style={{ border: '1.5px solid #E8E0D4', background: '#fff' }}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold mb-1" style={{ color: '#555' }}>Ubicación</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ej: Pocitos"
                className="w-full px-3 py-3 rounded-xl border text-sm outline-none"
                style={{ border: '1.5px solid #E8E0D4', background: '#fff' }}
              />
            </div>
          </div>

          {/* Fotos por tipo */}
          {PHOTO_TYPES.map(({ type, label }) => (
            <div key={type}>
              <label className="block text-xs font-bold mb-1" style={{ color: '#555' }}>{label}</label>
              {existingPhotos.filter((p) => p.type === type).length > 0 && (
                <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
                  {existingPhotos.filter((p) => p.type === type).map((p, i) => (
                    <img key={i} src={p.url} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                  ))}
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setNewPhotos((prev) => ({ ...prev, [type]: Array.from(e.target.files ?? []) }))}
                className="w-full text-sm"
              />
              {newPhotos[type].length > 0 && (
                <p className="text-[11px] mt-1" style={{ color: '#888' }}>{newPhotos[type].length} foto(s) nueva(s)</p>
              )}
            </div>
          ))}

          {/* Destacado */}
          <label
            className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer"
            style={{ background: '#fff', border: featured ? '2px solid #E8683A' : '1.5px solid #E8E0D4' }}
          >
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-5 h-5 accent-orange-500"
            />
            <div>
              <p className="font-bold text-sm" style={{ color: '#111' }}>📌 Marcar como trabajo destacado</p>
              <p className="text-xs" style={{ color: '#888' }}>Aparecerá en tu perfil público y en los resultados de búsqueda</p>
            </div>
          </label>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 rounded-2xl font-black text-white"
            style={{ background: saving ? '#ccc' : '#E8683A' }}
          >
            {saving ? 'Guardando...' : item ? 'Guardar cambios' : 'Agregar trabajo'}
          </button>
        </div>
      </div>
    </div>
  )
}
