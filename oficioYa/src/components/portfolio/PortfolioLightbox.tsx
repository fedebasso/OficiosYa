import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface Photo {
  url: string
  caption?: string
}

interface Props {
  photos: Photo[]
  initialIndex: number
  onClose: () => void
}

export function PortfolioLightbox({ photos, initialIndex, onClose }: Props) {
  const [current, setCurrent] = useState(initialIndex)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setCurrent((c) => Math.min(c + 1, photos.length - 1))
      if (e.key === 'ArrowLeft') setCurrent((c) => Math.max(c - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [photos.length, onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  function prev() { setCurrent((c) => Math.max(c - 1, 0)) }
  function next() { setCurrent((c) => Math.min(c + 1, photos.length - 1)) }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ background: 'rgba(0,0,0,0.95)' }}
      onClick={onClose}
    >
      {/* Header */}
      <div
        className="flex justify-between items-center px-4 pt-12 pb-4 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-white text-sm font-bold" style={{ opacity: 0.6 }}>
          {current + 1} / {photos.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center active:opacity-70"
          style={{ background: 'rgba(255,255,255,0.15)' }}
        >
          <X size={18} color="white" />
        </button>
      </div>

      {/* Imagen central */}
      <div
        className="flex-1 flex items-center justify-center px-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={photos[current].url}
            alt={photos[current].caption ?? `Foto ${current + 1}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="max-w-full object-contain rounded-2xl"
            style={{ maxHeight: 'calc(100dvh - 200px)' }}
          />
        </AnimatePresence>

        {/* Flecha anterior */}
        {current > 0 && (
          <button
            type="button"
            onClick={prev}
            className="absolute left-2 w-10 h-10 rounded-full flex items-center justify-center active:opacity-70"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <ChevronLeft size={20} color="white" />
          </button>
        )}

        {/* Flecha siguiente */}
        {current < photos.length - 1 && (
          <button
            type="button"
            onClick={next}
            className="absolute right-2 w-10 h-10 rounded-full flex items-center justify-center active:opacity-70"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <ChevronRight size={20} color="white" />
          </button>
        )}
      </div>

      {/* Caption + dots */}
      <div
        className="flex flex-col items-center gap-3 px-6 py-6 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {photos[current].caption && (
          <p className="text-sm text-center" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {photos[current].caption}
          </p>
        )}
        {photos.length > 1 && (
          <div className="flex gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                className="rounded-full transition-all"
                style={{
                  width: i === current ? 20 : 6,
                  height: 6,
                  background: i === current ? '#E8683A' : 'rgba(255,255,255,0.35)',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
