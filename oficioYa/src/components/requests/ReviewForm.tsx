import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '../ui/Button'

interface Props {
  requestId: string
  onSubmit: (rating: number, comment: string) => Promise<void>
  onClose: () => void
}

export function ReviewForm({ requestId: _requestId, onSubmit, onClose }: Props) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

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
      <div className="text-center py-4">
        <p className="text-primary font-medium">¡Gracias por tu reseña!</p>
        <Button variant="ghost" onClick={onClose} className="mt-2">Cerrar</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-500 text-center">¿Cómo fue el servicio?</p>
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(i)}
          >
            <Star
              size={32}
              className={i <= (hovered || rating) ? 'text-yellow-400' : 'text-gray-300'}
              fill={i <= (hovered || rating) ? 'currentColor' : 'none'}
            />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="Comentario opcional..."
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
      />
      <div className="flex gap-2">
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" fullWidth onClick={handleSubmit} disabled={rating === 0 || loading}>
          {loading ? 'Enviando...' : 'Enviar reseña'}
        </Button>
      </div>
    </div>
  )
}
