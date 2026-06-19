import { useState } from 'react'
import { X } from 'lucide-react'
import { getCategoryMeta } from '../../../lib/categories'
import type { PortfolioItem, PhotoType } from '../../../types/registration'

interface Props {
  item: PortfolioItem
  onClose: () => void
}

const TAB_LABELS: Record<PhotoType, string> = {
  general: 'General',
  before:  'Antes',
  after:   'Después',
}

export function PortfolioWorkModal({ item, onClose }: Props) {
  const { emoji, label } = getCategoryMeta(item.category ?? '')
  const types = (['general', 'before', 'after'] as PhotoType[]).filter(
    (t) => item.photos.some((p) => p.type === t)
  )
  const [activeType, setActiveType] = useState<PhotoType>(types[0] ?? 'general')
  const [activeIdx, setActiveIdx] = useState(0)

  const visiblePhotos = item.photos.filter((p) => p.type === activeType)

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div
        className="rounded-t-3xl overflow-y-auto"
        style={{ background: '#F5F0E8', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3">
          <div className="flex-1">
            <p className="font-black text-lg" style={{ color: '#111' }}>{item.title}</p>
            <p className="text-xs mt-0.5" style={{ color: '#888' }}>
              {emoji} {label}
              {item.work_date && ` · ${new Date(item.work_date).toLocaleDateString('es', { month: 'long', year: 'numeric' })}`}
              {item.location && ` · ${item.location}`}
            </p>
          </div>
          <button type="button" onClick={onClose} className="ml-3 mt-0.5">
            <X size={20} style={{ color: '#888' }} />
          </button>
        </div>

        {/* Descripción */}
        {item.description && (
          <p className="px-5 pb-3 text-sm leading-relaxed" style={{ color: '#555' }}>{item.description}</p>
        )}

        {/* Tabs de tipo */}
        {types.length > 1 && (
          <div className="flex px-5 gap-2 mb-3">
            {types.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setActiveType(t); setActiveIdx(0) }}
                className="px-3 py-1.5 rounded-full text-xs font-bold"
                style={{
                  background: activeType === t ? '#E8683A' : '#fff',
                  color: activeType === t ? '#fff' : '#555',
                  border: activeType === t ? 'none' : '1.5px solid #E8E0D4',
                }}
              >
                {TAB_LABELS[t]}
              </button>
            ))}
          </div>
        )}

        {/* Foto principal */}
        {visiblePhotos.length > 0 && (
          <div className="px-5">
            <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: '4/3', background: '#EDE8DE' }}>
              <img
                src={visiblePhotos[activeIdx]?.url}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Thumbnails */}
        {visiblePhotos.length > 1 && (
          <div className="flex gap-2 px-5 mt-3 overflow-x-auto pb-1">
            {visiblePhotos.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIdx(i)}
                className="flex-shrink-0 rounded-xl overflow-hidden"
                style={{
                  width: 56, height: 56,
                  border: activeIdx === i ? '2px solid #E8683A' : '2px solid transparent',
                }}
              >
                <img src={p.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="h-8" />
      </div>
    </div>
  )
}
