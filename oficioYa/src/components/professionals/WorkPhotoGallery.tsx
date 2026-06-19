import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { PortfolioLightbox } from '../portfolio/PortfolioLightbox'
import type { WorkPhoto } from '../../hooks/useProfessionals'

interface Props {
  photos: WorkPhoto[]
  featuredUrl?: string
}

export function WorkPhotoGallery({ photos, featuredUrl }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const lightboxPhotos = photos.map((p) => ({ url: p.url, caption: p.caption }))
  const heroUrl = featuredUrl ?? photos[0]?.url

  if (photos.length === 0 && !featuredUrl) {
    return (
      <div
        className="flex flex-col items-center gap-2 py-8 rounded-2xl"
        style={{ background: '#F5F0E8' }}
      >
        <p className="text-2xl">📷</p>
        <p className="text-sm" style={{ color: '#999' }}>Sin fotos de trabajos aún</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Hero — foto destacada */}
      {heroUrl && (
        <div
          className="relative rounded-2xl overflow-hidden cursor-pointer active:opacity-90"
          style={{ aspectRatio: '16/9', background: '#EDE8DE' }}
          onClick={() => setLightboxIndex(0)}
        >
          <img src={heroUrl} alt="Trabajo destacado" className="w-full h-full object-cover" />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 50%)' }}
          />
          <div className="absolute bottom-3 left-3">
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded-lg"
              style={{ background: '#E8683A', color: '#fff' }}
            >
              ⭐ Trabajo destacado
            </span>
          </div>
          {photos.length > 1 && (
            <div
              className="absolute bottom-3 right-3 px-2 py-1 rounded-lg text-[10px] font-bold text-white"
              style={{ background: 'rgba(0,0,0,0.5)' }}
            >
              +{photos.length - 1} fotos
            </div>
          )}
        </div>
      )}

      {/* Grid */}
      {photos.length > 1 && (
        <div className="grid grid-cols-2 gap-2">
          {photos.slice(1, 7).map((photo, i) => (
            <div
              key={photo.id}
              className="relative rounded-xl overflow-hidden cursor-pointer active:opacity-90"
              style={{ aspectRatio: '4/3', background: '#EDE8DE' }}
              onClick={() => setLightboxIndex(i + 1)}
            >
              <img
                src={photo.url}
                alt={photo.caption ?? `Foto ${i + 2}`}
                className="w-full h-full object-cover"
              />
              {/* "+N" overlay en el último si hay más de 7 */}
              {i === 5 && photos.length > 7 && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.55)' }}
                >
                  <span className="text-white font-black text-lg">+{photos.length - 7}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <PortfolioLightbox
            photos={lightboxPhotos}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
