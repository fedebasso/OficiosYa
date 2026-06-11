import { useState } from 'react'
import { X } from 'lucide-react'

interface Props {
  requestId: string
  onSubmit: (rating: number, comment: string) => Promise<void>
  onClose: () => void
}

export function ReviewForm({ requestId: _requestId, onSubmit, onClose }: Props) {
  const [rating, setRating]   = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) return
    setLoading(true)
    try {
      await onSubmit(rating, comment)
      setDone(true)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
          style={{ background: 'rgba(232,104,58,.12)', border: '1px solid rgba(232,104,58,.25)' }}
        >
          ★
        </div>
        <div>
          <p className="font-black text-base" style={{ color: '#111111' }}>¡Gracias por tu reseña!</p>
          <p className="text-xs mt-1" style={{ color: '#999999' }}>Tu opinión ayuda a otros clientes</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-sm font-bold active:opacity-70 transition-opacity"
          style={{ color: '#e8683a' }}
        >
          Cerrar
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: '#e8683a' }}>
            Calificar servicio
          </p>
          <h3 className="text-base font-black" style={{ color: '#111111' }}>¿Cómo fue el trabajo?</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center active:opacity-60 transition-opacity"
          style={{ background: '#F5F0E8', border: '1.5px solid #E8E0D4' }}
        >
          <X size={14} style={{ color: '#555555' }} />
        </button>
      </div>

      {/* Estrellas */}
      <div className="flex justify-center gap-3">
        {[1, 2, 3, 4, 5].map((i) => {
          const active = i <= (hovered || rating)
          return (
            <button
              key={i}
              type="button"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(i)}
              className="transition-transform active:scale-90"
              style={{ transform: active ? 'scale(1.15)' : 'scale(1)', transition: 'transform .15s ease' }}
            >
              <span
                className="text-3xl"
                style={{ color: active ? '#E8683A' : '#E8E0D4', transition: 'color .12s ease' }}
              >
                ★
              </span>
            </button>
          )
        })}
      </div>

      {rating > 0 && (
        <p className="text-center text-xs font-bold" style={{ color: '#e8683a' }}>
          {['', 'Muy malo', 'Malo', 'Regular', 'Bueno', '¡Excelente!'][rating]}
        </p>
      )}

      {/* Comentario */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="Comentario opcional..."
        className="w-full rounded-xl px-3.5 py-3 text-sm resize-none focus:outline-none"
        style={{
          background: '#EDE8DE',
          border: '1.5px solid #E8E0D4',
          color: '#111111',
          caretColor: '#e8683a',
        }}
      />

      {/* Acciones */}
      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-xl py-3 text-sm font-bold active:opacity-70 transition-opacity"
          style={{ background: '#EDE8DE', color: '#555555', border: '1.5px solid #E8E0D4' }}
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={rating === 0 || loading}
          className="flex-1 rounded-xl py-3 text-sm font-bold text-white active:opacity-80 transition-opacity disabled:opacity-40"
          style={{ background: rating > 0 ? '#E8683A' : '#E8E0D4', boxShadow: rating > 0 ? '0 4px 14px rgba(232,104,58,.25)' : 'none' }}
        >
          {loading ? 'Enviando...' : 'Enviar reseña'}
        </button>
      </div>
    </div>
  )
}
