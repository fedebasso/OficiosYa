import { Star } from 'lucide-react'

interface Props {
  rating: number | null
  size?: 'sm' | 'md'
}

export function RatingStars({ rating, size = 'md' }: Props) {
  if (rating === null) return <span className="text-xs" style={{ color: '#999999' }}>Sin calificación</span>

  const px = size === 'sm' ? 12 : 16
  const full = Math.round(rating)

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={px}
          style={{ color: i <= full ? '#f59e0b' : '#333' }}
          fill={i <= full ? 'currentColor' : 'none'}
        />
      ))}
      <span
        className={`ml-1 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}
        style={{ color: '#555555' }}
      >
        {rating.toFixed(1)}
      </span>
    </div>
  )
}
