import { getInitials } from '../../lib/utils'
import type { Review } from '../../services/reviewService'

interface Props { review: Review }

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'hoy'
  if (days === 1) return 'ayer'
  if (days < 7) return `hace ${days} días`
  if (days < 30) return `hace ${Math.floor(days / 7)} sem.`
  if (days < 365) return `hace ${Math.floor(days / 30)} meses`
  return `hace ${Math.floor(days / 365)} año${Math.floor(days / 365) > 1 ? 's' : ''}`
}

export function ReviewCard({ review }: Props) {
  const name = review.profiles?.full_name ?? 'Cliente'
  const initials = getInitials(name)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <div
          className="rounded-full flex items-center justify-center font-black text-white flex-shrink-0"
          style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #f5b99a, #E8683A)', fontSize: 13 }}
        >
          {review.profiles?.avatar_url
            ? <img src={review.profiles.avatar_url} alt={name} className="w-full h-full object-cover rounded-full" />
            : initials
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate" style={{ color: '#111' }}>{name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span style={{ fontSize: 11 }} role="img" aria-label={`${review.rating} de 5 estrellas`}>
              {[1,2,3,4,5].map(i => (
                <span key={i} aria-hidden="true" style={{ color: i <= review.rating ? '#f59e0b' : '#ddd' }}>★</span>
              ))}
            </span>
            <span className="text-[10px]" style={{ color: '#999' }}>{timeAgo(review.created_at)}</span>
          </div>
        </div>
      </div>

      {review.comment && (
        <p className="text-sm leading-relaxed" style={{ color: '#555', paddingLeft: 44 }}>
          {review.comment}
        </p>
      )}

      {review.photo_url && (
        <div style={{ paddingLeft: 44 }}>
          <img
            src={review.photo_url}
            alt="foto del trabajo"
            className="rounded-xl object-cover"
            style={{ width: '100%', maxHeight: 200 }}
          />
        </div>
      )}
    </div>
  )
}
