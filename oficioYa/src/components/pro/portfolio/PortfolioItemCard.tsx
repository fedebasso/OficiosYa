import { Star, Loader2 } from 'lucide-react'
import { getCategoryMeta } from '../../../lib/categories'
import type { PortfolioItem, WorkPhoto } from '../../../types/registration'

function getPrimaryPhoto(photos: WorkPhoto[], fallbackUrls: string[]): string | null {
  return (
    photos.find((p) => p.type === 'after')?.url ??
    photos.find((p) => p.type === 'general')?.url ??
    photos[0]?.url ??
    fallbackUrls[0] ??
    null
  )
}

interface Props {
  item: PortfolioItem
  onEdit: () => void
  onDelete: () => void
  onToggleFeatured: () => void
  togglingFeatured?: boolean
}

export function PortfolioItemCard({ item, onEdit, onDelete, onToggleFeatured, togglingFeatured }: Props) {
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

        {/* Badge destacado */}
        {item.is_featured && (
          <div
            className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold"
            style={{ background: '#E8683A', color: '#fff' }}
          >
            <Star size={9} fill="currentColor" /> Destacado
          </div>
        )}

        {/* Botón destacar — top right */}
        <button
          type="button"
          onClick={onToggleFeatured}
          disabled={togglingFeatured}
          className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          style={{
            background: item.is_featured ? '#E8683A' : 'rgba(255,255,255,0.9)',
            border: `1.5px solid ${item.is_featured ? '#E8683A' : '#E8E0D4'}`,
          }}
          title={item.is_featured ? 'Quitar destacado' : 'Marcar como destacado'}
        >
          {togglingFeatured ? (
            <Loader2
              size={12}
              style={{ color: item.is_featured ? '#fff' : '#E8683A', animation: 'spin 1s linear infinite' }}
            />
          ) : (
            <Star
              size={12}
              fill={item.is_featured ? '#fff' : 'none'}
              style={{ color: item.is_featured ? '#fff' : '#E8683A' }}
            />
          )}
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="font-bold text-sm truncate" style={{ color: '#111111' }}>{item.title}</p>
        <p className="text-[11px] mt-0.5 truncate" style={{ color: '#888' }}>
          {emoji} {label}
          {item.work_date && ` · ${new Date(item.work_date).toLocaleDateString('es', { month: 'short', year: 'numeric' })}`}
        </p>
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
            🗑️
          </button>
        </div>
      </div>
    </div>
  )
}
