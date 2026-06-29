import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Camera } from 'lucide-react'
import { reviewService } from '../../services/reviewService'

interface Props {
  requestId: string
  clientId: string
  professionalId: string
  professionalName: string
  onClose: () => void
}

const LABELS = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', '¡Excelente!']

export function ReviewSheet({ requestId, clientId, professionalId, professionalName, onClose }: Props) {
  const [rating, setRating]   = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [photo, setPhoto]     = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert('La foto no puede superar 5MB'); return }
    setPhoto(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (rating === 0) return
    setLoading(true)
    try {
      await reviewService.submit({ requestId, clientId, professionalId, rating, comment, photoFile: photo })
      localStorage.setItem(`reviewed_${requestId}`, '1')
      setDone(true)
    } catch {
      alert('Error al enviar la reseña. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    localStorage.setItem(`reviewed_${requestId}`, '1')
    onClose()
  }

  if (done) return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <div className="text-5xl">⭐</div>
      <p className="font-black text-lg" style={{ color: '#111' }}>¡Gracias por tu reseña!</p>
      <p className="text-sm" style={{ color: '#999' }}>Tu opinión ayuda a otros clientes a elegir mejor</p>
      <button type="button" onClick={onClose}
        className="mt-2 px-6 py-2.5 rounded-xl font-bold text-white text-sm"
        style={{ background: '#E8683A' }}>
        Cerrar
      </button>
    </div>
  )

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: '#E8683A' }}>
            Calificar servicio
          </p>
          <h3 className="text-base font-black" style={{ color: '#111' }}>
            ¿Cómo fue el trabajo de {professionalName}?
          </h3>
        </div>
        <button type="button" onClick={handleClose}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: '#F5F0E8', border: '1.5px solid #E8E0D4' }}>
          <X size={14} style={{ color: '#555' }} />
        </button>
      </div>

      <div className="flex justify-center gap-3">
        {[1,2,3,4,5].map((i) => {
          const active = i <= (hovered || rating)
          return (
            <button key={i} type="button"
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(i)}
              style={{ transform: active ? 'scale(1.2)' : 'scale(1)', transition: 'transform .15s ease' }}>
              <span className="text-3xl" style={{ color: active ? '#E8683A' : '#E8E0D4', transition: 'color .12s' }}>★</span>
            </button>
          )
        })}
      </div>

      {rating > 0 && (
        <p className="text-center text-xs font-bold" style={{ color: '#E8683A' }}>{LABELS[rating]}</p>
      )}

      <textarea value={comment} onChange={(e) => setComment(e.target.value)}
        rows={3} placeholder="Contá tu experiencia (opcional)..."
        className="w-full rounded-xl px-3.5 py-3 text-sm resize-none focus:outline-none"
        style={{ background: '#F5F0E8', border: '1.5px solid #E8E0D4', color: '#111', caretColor: '#E8683A' }}
      />

      <div>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp"
          className="hidden" onChange={handlePhoto} />
        {preview ? (
          <div className="relative rounded-xl overflow-hidden" style={{ height: 140 }}>
            <img src={preview} alt="foto del trabajo" className="w-full h-full object-cover" />
            <button type="button" onClick={() => { setPhoto(null); setPreview(null) }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.6)' }}>
              <X size={13} color="#fff" />
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => inputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold"
            style={{ background: '#F5F0E8', border: '1.5px dashed #E8E0D4', color: '#999' }}>
            <Camera size={16} /> Agregar foto del trabajo (opcional)
          </button>
        )}
      </div>

      <div className="flex gap-2.5">
        <button type="button" onClick={handleClose}
          className="flex-1 rounded-xl py-3 text-sm font-bold"
          style={{ background: '#EDE8DE', color: '#555', border: '1.5px solid #E8E0D4' }}>
          Ahora no
        </button>
        <button type="button" onClick={handleSubmit}
          disabled={rating === 0 || loading}
          className="flex-1 rounded-xl py-3 text-sm font-bold text-white disabled:opacity-40"
          style={{ background: rating > 0 ? '#E8683A' : '#E8E0D4', boxShadow: rating > 0 ? '0 4px 14px rgba(232,104,58,.25)' : 'none' }}>
          {loading ? 'Enviando...' : 'Enviar reseña'}
        </button>
      </div>
    </div>
  )
}
