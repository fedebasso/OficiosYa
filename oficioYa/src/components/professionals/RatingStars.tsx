import { Star } from 'lucide-react'

interface Props {
  rating: number | null
  size?: 'sm' | 'md'
}

export function RatingStars({ rating, size = 'md' }: Props) {
  if (rating === null) return <span className="text-xs text-gray-400">Sin calificación</span>

  const px = size === 'sm' ? 12 : 16
  const full = Math.round(rating)

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={px}
          className={i <= full ? 'text-yellow-400' : 'text-gray-300'}
          fill={i <= full ? 'currentColor' : 'none'}
        />
      ))}
      <span className={`ml-1 ${size === 'sm' ? 'text-xs' : 'text-sm'} text-gray-600`}>
        {rating.toFixed(1)}
      </span>
    </div>
  )
}
