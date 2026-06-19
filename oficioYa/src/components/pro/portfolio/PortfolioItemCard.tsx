import { Star } from 'lucide-react'
import { getCategoryMeta } from '../../../lib/categories'
import type { PortfolioItem, WorkPhoto } from '../../../types/registration'

function getPrimaryPhoto(photos: WorkPhoto[], fallbackUrls: string[]): string | null {
  return (
    photos.find((p) => p.type === 'after')?.url ??
    photos.find((p) => p.type === 'general')?.url ??
    photos[0]?.url ??
    fallbackUrls[0] ??  // fallback para items guardados antes de la migración
    null
  )
}

interface Props {
  item: PortfolioItem
  onEdit: () => void
  onDelete: () => void
}

export function PortfolioItemCard({ item, onEdit, onDelete }: Props) {
  const { emoji, label } = getCategoryMeta(item.category ?? '')
  const photo = getPrimaryPhoto(item.photos, item.photo_urls)

  return (
    <div
      className="rounded-2xl overflow-hidden relative"
      style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}
    >
      {/* Foto */}
      <div className="relative" style={{ aspectRatio: '4/3', background: '#F5F0E8' }}>
        {photo ? (
          <img src={photo} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">📷</div>
        )}
        {item.is_featured && (
          <div
            className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold"
            style={{ background: '#E8683A', color: '#fff' }}
          >
            <Star size={9} fill="currentColor" /> Destacado
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="font-bold text-sm truncate" style={{ color: '#111111' }}>{item.title}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[11px]" style={{ color: '#888' }}>
            {emoji} {label}
            {item.work_date && ` · ${new Date(item.work_date).toLocaleDateString('es', { month: 'short', year: 'numeric' })}`}
          </span>
          <span className="text-[10px]" style={{ color: '#AAA' }}>
            {item.photos.length} foto{item.photos.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={onEdit}
            className="flex-1 py-1.5 rounded-xl text-xs font-bold"
            style={{ background: '#FEF0EA', color: '#E8683A', border: '1px solid #FDDCC8' }}
          >
            ✏️ Editar
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex-1 py-1.5 rounded-xl text-xs font-bold"
            style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}
          >
            🗑️ Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
