import { createElement, useEffect, useState } from 'react'
import { reviewService, type Review } from '../../services/reviewService'
import { ReviewCard } from './ReviewCard'
import { useNavigate } from 'react-router-dom'
import { PortfolioWorkModal } from '../pro/portfolio/PortfolioWorkModal'
import type { PortfolioItem } from '../../types/registration'
import { ChevronLeft, Share2, Check, Star, MapPin, Clock, BadgeCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { useBack } from '../../hooks/useBack'
import { WorkPhotoGallery } from './WorkPhotoGallery'
import { BottomNav } from '../layout/BottomNav'
import { DateStrip } from '../availability/DateStrip'
import { TimeSlotGrid } from '../availability/TimeSlotGrid'
import { useAvailabilityStore } from '../../store/availabilityStore'
import type { ProfessionalWithProfile, WorkPhoto } from '../../hooks/useProfessionals'
import { getCategoryMeta, getCategoryIcon, CATEGORY_LABELS } from '../../lib/categories'
import { getInitials } from '../../lib/utils'
import { fadeUp, scaleIn, staggerContainer, SPRING_SOFT, SPRING_GENTLE } from '../../lib/motion'

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return h === 1 ? '1 hora' : `${h} horas`
  return `${h} hora ${m} min`
}

function ReviewsSection({ rating, professionalId }: { rating: number | null; professionalId: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    reviewService.fetchByProfessional(professionalId)
      .then(setReviews)
      .finally(() => setLoading(false))
  }, [professionalId])

  if (!rating && reviews.length === 0) return null

  const fullStars = Math.round(rating ?? 0)
  const bars = [5,4,3,2,1]
  const total = reviews.length
  const countByRating = (r: number) => reviews.filter(rv => rv.rating === r).length

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-black text-base" style={{ color: '#111', letterSpacing: '-0.3px' }}>
        Reseñas
      </h3>

      {rating && total > 0 && (
        <div className="flex gap-4 items-center p-4 rounded-2xl" style={{ background: '#FFFFFF', border: '1.5px solid #EDE8DE' }}>
          <div className="text-center flex-shrink-0">
            <div className="text-4xl font-black leading-none" style={{ color: '#111', letterSpacing: '-2px' }}>
              {rating.toFixed(1)}
            </div>
            <div className="mt-1.5">
              {[1,2,3,4,5].map(i => (
                <span key={i} style={{ color: i <= fullStars ? '#f59e0b' : '#ddd', fontSize: 12 }}>★</span>
              ))}
            </div>
            <div className="text-[9px] mt-1" style={{ color: '#999' }}>{total} reseña{total !== 1 ? 's' : ''}</div>
          </div>
          <div className="flex-1 flex flex-col gap-1">
            {bars.map((star) => {
              const count = countByRating(star)
              const pct = total > 0 ? (count / total) * 100 : 0
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-[10px] font-bold w-3" style={{ color: '#999' }}>{star}</span>
                  <div className="flex-1 rounded-full overflow-hidden" style={{ height: 5, background: '#EDE8DE' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#F59E0B' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {loading && <p className="text-sm text-center" style={{ color: '#999' }}>Cargando reseñas...</p>}

      {!loading && reviews.length === 0 && (
        <p className="text-sm text-center py-4" style={{ color: '#999' }}>Aún no tiene reseñas</p>
      )}

      <div className="flex flex-col gap-4">
        {reviews.map((r, i) => (
          <div key={r.id}>
            <ReviewCard review={r} />
            {i < reviews.length - 1 && <div style={{ height: 1, background: '#EDE8DE', marginTop: 16 }} />}
          </div>
        ))}
      </div>
    </div>
  )
}

interface Props {
  professional: ProfessionalWithProfile
  photos: WorkPhoto[]
  portfolio?: PortfolioItem[]
}


export function ProfessionalProfile({ professional, photos, portfolio = [] }: Props) {
  const navigate = useNavigate()
  const goBack = useBack('/buscar')
  const {
    profiles, bio, avg_rating, verified, zone, categories,
    id, jobs_count,
  } = professional

  const { label, emoji } = getCategoryMeta(categories[0] ?? '')
  const specialty = `${emoji} ${label}`
  const initials = getInitials(profiles.full_name)
  const [shared, setShared] = useState(false)
  const [selectedWork, setSelectedWork] = useState<PortfolioItem | null>(null)
  const [availDate, setAvailDate] = useState<string | null>(null)
  const getSlots = useAvailabilityStore((s) => s.getSlots)
  const schedules = useAvailabilityStore((s) => s.schedules)
  const proSchedule = schedules[id]
  const estimatedDuration = proSchedule?.serviceDurationMin ?? proSchedule?.intervalMin ?? null
  const availSlots = availDate ? getSlots(id, availDate) : []

  const handleShare = async () => {
    const url = `${window.location.origin}/profesional/${id}`
    const text = `Te recomiendo a ${profiles.full_name} — ${specialty} en OFIX`
    if (navigator.share) {
      try {
        await navigator.share({ title: profiles.full_name, text, url })
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    }
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-col min-h-screen"
      style={{ background: '#F5F0E8' }}
    >

      {/* ── HERO ── */}
      <motion.div variants={fadeUp}>
      {professional.featured_photo_url && (
        <div className="relative w-full" style={{ height: 200 }}>
          <img
            src={professional.featured_photo_url}
            alt="Trabajo destacado"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6))' }} />
        </div>
      )}
      <div
        className="relative flex flex-col items-center pt-14 pb-6 px-4"
        style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E0D4' }}
      >
        {/* Nav */}
        <div className="absolute top-10 left-4 right-4 flex justify-between items-center">
          <button
            type="button"
            onClick={goBack}
            aria-label="Volver"
            className="w-10 h-10 rounded-full flex items-center justify-center active:opacity-70 transition-opacity"
            style={{ background: '#F5F0E8', border: '1px solid #E8E0D4' }}
          >
            <ChevronLeft size={24} color="#111111" />
          </button>
          <motion.button
            type="button"
            onClick={handleShare}
            whileTap={{ scale: 0.9 }}
            transition={SPRING_SOFT}
            aria-label="Compartir perfil"
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: shared ? 'rgba(34,197,94,.12)' : '#F5F0E8', border: `1px solid ${shared ? 'rgba(34,197,94,.3)' : '#E8E0D4'}` }}
          >
            {shared
              ? <Check size={18} color="#22c55e" />
              : <Share2 size={18} color="#E8683A" />
            }
          </motion.button>
        </div>

        {/* Foto grande */}
        <div
          className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center mb-4 flex-shrink-0"
          style={{ border: '3px solid #EFA07A', boxShadow: '0 0 0 5px rgba(232,104,58,.08)' }}
        >
          {profiles.avatar_url ? (
            <img src={profiles.avatar_url} alt={profiles.full_name} className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white text-2xl font-black"
              style={{ background: 'linear-gradient(135deg,#E8683A,#c44d1f)' }}
            >
              {initials}
            </div>
          )}
        </div>

        {/* Nombre y rubro */}
        <h1 className="text-2xl font-black text-center leading-tight" style={{ color: '#111111', letterSpacing: '-0.5px' }}>
          {profiles.full_name}
        </h1>
        <p className="text-sm font-medium mt-1 mb-4" style={{ color: '#777777' }}>
          {specialty} · {zone}
        </p>

        {/* Stats destacados */}
        <motion.div variants={scaleIn} className="w-full" style={{ maxWidth: 320 }}>
          <div
            style={{
              display: 'flex',
              background: '#FFFFFF',
              border: '1px solid #ECE6DC',
              borderRadius: 16,
              boxShadow: '0 2px 6px rgba(60,40,20,.05)',
              overflow: 'hidden',
              marginTop: 4,
              marginBottom: 14,
            }}
          >
            <div style={{ flex: 1, padding: '12px 20px', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Star size={18} fill="#F5A623" color="#F5A623" />
                <span style={{ fontSize: 22, fontWeight: 800, color: '#1A1712' }}>
                  {avg_rating != null ? avg_rating.toFixed(1) : '—'}
                </span>
              </div>
              <div style={{ fontSize: 11, color: '#9C917E', fontWeight: 600, marginTop: 2 }}>Calificación</div>
            </div>
            <div style={{ width: 1, background: '#F0EAE0' }} />
            <div style={{ flex: 1, padding: '12px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#1A1712' }}>{jobs_count}</div>
              <div style={{ fontSize: 11, color: '#9C917E', fontWeight: 600, marginTop: 2 }}>Trabajos</div>
            </div>
          </div>

          {/* Chips secundarios */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {verified && (
              <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:10, background:'#F0FDF4', border:'1px solid #BBF7D0', color:'#15803D', fontSize:12, fontWeight:700 }}>
                <BadgeCheck size={14} /> Verificado
              </span>
            )}
            <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:10, background:'#FAF6F0', color:'#7A6E5E', fontSize:12, fontWeight:700 }}>
              <MapPin size={14} style={{ color:'#B3A794' }} /> {zone}
            </span>
            {estimatedDuration !== null && (
              <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:10, background:'#FAF6F0', color:'#7A6E5E', fontSize:12, fontWeight:700 }}>
                <Clock size={14} style={{ color:'#B3A794' }} /> {formatDuration(estimatedDuration)}
              </span>
            )}
          </div>
        </motion.div>
      </div>
      </motion.div>

      {/* ── BODY ── */}
      <div className="flex flex-col gap-3 px-4 pt-4 pb-36">

        {/* Sobre mí */}
        {bio && (
          <motion.div variants={fadeUp} className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1px solid #ECE6DC', borderRadius: 20, boxShadow: '0 2px 6px rgba(60,40,20,.04), 0 12px 28px -12px rgba(60,40,20,.14)' }}>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: '#8A7F6E' }}>Sobre mí</h3>
            <p className="text-sm text-[#888] leading-relaxed">{bio}</p>
          </motion.div>
        )}

        {/* Servicios */}
        <motion.div variants={fadeUp} className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1px solid #ECE6DC', borderRadius: 20, boxShadow: '0 2px 6px rgba(60,40,20,.04), 0 12px 28px -12px rgba(60,40,20,.14)' }}>
          <h3 className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: '#8A7F6E' }}>Servicios</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl"
                style={{ background: '#FAF6F0', color: '#7A6E5E', border: '1px solid #ECE4D8' }}
              >
                {createElement(getCategoryIcon(c), { size: 14, style: { color: '#D4571F' } })}
                {CATEGORY_LABELS[c] ?? c}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Portfolio / Trabajos realizados */}
        {(photos.length > 0 || portfolio.length > 0) && (
          <motion.div variants={fadeUp} className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1px solid #ECE6DC', borderRadius: 20, boxShadow: '0 2px 6px rgba(60,40,20,.04), 0 12px 28px -12px rgba(60,40,20,.14)' }}>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: '#8A7F6E' }}>Trabajos realizados</h3>
            {portfolio.length > 0 ? (
              <WorkPhotoGallery
                photos={portfolio.map((item) => ({
                  id: item.id,
                  professional_id: item.professional_id,
                  url: item.photos.find((p) => p.type === 'after')?.url
                    ?? item.photos.find((p) => p.type === 'general')?.url
                    ?? item.photos[0]?.url
                    ?? item.photo_urls[0]
                    ?? '',
                  caption: item.title,
                  uploaded_at: item.created_at,
                }))}
                featuredUrl={professional.featured_photo_url ?? undefined}
              />
            ) : (
              <WorkPhotoGallery photos={photos} featuredUrl={professional.featured_photo_url ?? undefined} />
            )}
          </motion.div>
        )}

        {/* Disponibilidad */}
        <motion.div variants={fadeUp} className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1px solid #ECE6DC', borderRadius: 20, boxShadow: '0 2px 6px rgba(60,40,20,.04), 0 12px 28px -12px rgba(60,40,20,.14)' }}>
          <h3 className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: '#8A7F6E' }}>Disponibilidad</h3>
          <DateStrip proId={id} selected={availDate} onSelect={setAvailDate} />
          {availDate && (
            <div className="mt-3">
              <div className="flex gap-3 text-[10px] font-bold mb-2" style={{ color: '#888' }}>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full inline-block" style={{ background: 'linear-gradient(135deg,#16A34A,#15803D)' }} />
                  Disponible
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full inline-block" style={{ background: 'linear-gradient(135deg,#DC2626,#B91C1C)' }} />
                  Ocupado
                </span>
              </div>
              <TimeSlotGrid slots={availSlots} selected={null} onSelect={() => {}} />
            </div>
          )}
          {!availDate && (
            <p className="text-xs mt-2" style={{ color: '#AAAAAA' }}>
              Tocá un día para ver los horarios disponibles
            </p>
          )}
        </motion.div>

        {/* Reseñas */}
        <motion.div variants={fadeUp}>
          <ReviewsSection rating={avg_rating} professionalId={id} />
        </motion.div>
      </div>

      {/* Modal galería */}
      {selectedWork && (
        <PortfolioWorkModal
          item={selectedWork}
          onClose={() => setSelectedWork(null)}
        />
      )}

      {/* ── CTA FIJO ── */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, ...SPRING_GENTLE }}
        className="fixed bottom-16 left-0 right-0 px-4 pb-4 pt-3"
        style={{
          background: 'linear-gradient(to top, #F5F0E8 60%, rgba(245,240,232,0))',
        }}
      >
        <motion.button
          type="button"
          onClick={() => navigate(`/solicitar/${id}`)}
          whileTap={{ scale: 0.97 }}
          transition={SPRING_SOFT}
          className="w-full py-3.5 text-sm font-bold flex items-center justify-center gap-1.5 text-white"
          style={{ background: '#e8683a', borderRadius: 16, boxShadow: '0 6px 20px -6px rgba(232,104,58,.45)' }}
        >
          Solicitar trabajo
        </motion.button>
        {/* v0.1 */}
      </motion.div>

      <BottomNav />
    </motion.div>
  )
}
