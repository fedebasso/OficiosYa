import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Share2, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { useBack } from '../../hooks/useBack'
import { WorkPhotoGallery } from './WorkPhotoGallery'
import { BottomNav } from '../layout/BottomNav'
import type { ProfessionalWithProfile, WorkPhoto } from '../../hooks/useProfessionals'
import { getCategoryMeta, CATEGORY_EMOJI, CATEGORY_LABELS } from '../../lib/categories'
import { getInitials } from '../../lib/utils'
import { fadeUp, scaleIn, staggerContainer, SPRING_SOFT, SPRING_GENTLE } from '../../lib/motion'

/* ── Mock reviews — reemplazar con datos reales de Supabase cuando estén disponibles ── */
const MOCK_REVIEWS: Record<string, { name: string; initials: string; color: string; rating: number; date: string; text: string }[]> = {
  default: [
    { name: 'Ana Martínez', initials: 'AM', color: '#e8683a', rating: 5, date: 'hace 2 días', text: 'Excelente profesional. Llegó puntual, resolvió el problema rápido y dejó todo limpio. 100% recomendado.' },
    { name: 'Juan González', initials: 'JG', color: '#3b82f6', rating: 5, date: 'hace 1 semana', text: 'Muy prolijo el trabajo y el precio fue justo. Ya lo tengo agendado para el próximo arreglo.' },
    { name: 'Laura Pérez', initials: 'LP', color: '#8b5cf6', rating: 4, date: 'hace 2 semanas', text: 'Buen trabajo, explicó todo lo que hacía. Llegó 10 minutos tarde pero avisó con anticipación.' },
  ],
}

function StarRow({ rating }: { rating: number }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= rating ? '#f59e0b' : '#333', fontSize: 12 }}>★</span>
      ))}
    </span>
  )
}

function ReviewsSection({ rating, jobsCount, professionalId }: { rating: number | null; jobsCount: number; professionalId: string }) {
  const reviews = MOCK_REVIEWS[professionalId] ?? MOCK_REVIEWS.default
  if (!rating) return null

  const fullStars = Math.round(rating)
  const bars = [5,4,3,2,1]
  const fakeCounts = [Math.round(jobsCount * .75), Math.round(jobsCount * .15), Math.round(jobsCount * .06), Math.round(jobsCount * .02), Math.round(jobsCount * .02)]

  return (
    <div className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}>
      <h3 className="text-xs font-bold text-[#555] uppercase tracking-widest mb-4">Reseñas</h3>

      {/* Rating overview */}
      <div className="flex gap-4 mb-4 pb-4" style={{ borderBottom: '1px solid #E8E0D4' }}>
        <div className="text-center flex-shrink-0">
          <div className="text-4xl font-black leading-none" style={{ color: '#111111', letterSpacing: '-2px' }}>
            {rating}
          </div>
          <div className="mt-1.5"><StarRow rating={fullStars} /></div>
          <div className="text-[9px] mt-1" style={{ color: '#999999' }}>{jobsCount} reseñas</div>
        </div>
        <div className="flex-1 flex flex-col justify-center gap-1">
          {bars.map((star, i) => {
            const pct = jobsCount > 0 ? Math.round((fakeCounts[i] / jobsCount) * 100) : 0
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-[10px] w-2" style={{ color: '#999999' }}>{star}</span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#E8E0D4' }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#f59e0b' }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Review cards */}
      <div className="flex flex-col gap-3">
        {reviews.map((r, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                style={{ background: r.color }}
              >
                {r.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold leading-tight" style={{ color: '#111111' }}>{r.name}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <StarRow rating={r.rating} />
                  <span className="text-[10px]" style={{ color: '#999999' }}>{r.date}</span>
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#555555', paddingLeft: 44 }}>{r.text}</p>
            {i < reviews.length - 1 && <div style={{ height: 1, background: '#E8E0D4', marginTop: 4 }} />}
          </div>
        ))}
      </div>
    </div>
  )
}

interface Props {
  professional: ProfessionalWithProfile
  photos: WorkPhoto[]
}


export function ProfessionalProfile({ professional, photos }: Props) {
  const navigate = useNavigate()
  const goBack = useBack('/buscar')
  const {
    profiles, bio, avg_rating, verified, zone, categories,
    whatsapp, id, jobs_count,
  } = professional

  const { label, emoji } = getCategoryMeta(categories[0] ?? '')
  const specialty = `${emoji} ${label}`
  const initials = getInitials(profiles.full_name)
  const [shared, setShared] = useState(false)

  const handleShare = async () => {
    const url = `${window.location.origin}/profesional/${id}`
    const text = `Te recomiendo a ${profiles.full_name} — ${specialty} en OficioYa`
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
          style={{ border: '3px solid #E8683A', boxShadow: '0 0 0 6px rgba(232,104,58,.08)' }}
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

        {/* Indicadores de confianza */}
        <motion.div variants={scaleIn} className="flex items-center gap-4 flex-wrap justify-center">
          {avg_rating != null && (
            <div className="flex items-center gap-1">
              <span style={{ color: '#F59E0B', fontSize: 18 }}>★</span>
              <span className="font-black text-base" style={{ color: '#111111' }}>{avg_rating}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <span style={{ fontSize: 14 }}>🔨</span>
            <span className="font-semibold text-sm" style={{ color: '#555555' }}>{jobs_count} trabajos</span>
          </div>
          {verified && (
            <div className="flex items-center gap-1">
              <span style={{ fontSize: 14 }}>✅</span>
              <span className="font-semibold text-sm" style={{ color: '#3B82F6' }}>Verificado</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <span style={{ fontSize: 14 }}>📍</span>
            <span className="font-semibold text-sm" style={{ color: '#555555' }}>{zone}</span>
          </div>
        </motion.div>
      </div>
      </motion.div>

      {/* ── BODY ── */}
      <div className="flex flex-col gap-3 px-4 pt-4 pb-36">

        {/* Sobre mí */}
        {bio && (
          <motion.div variants={fadeUp} className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}>
            <h3 className="text-xs font-bold text-[#555] uppercase tracking-widest mb-2">Sobre mí</h3>
            <p className="text-sm text-[#888] leading-relaxed">{bio}</p>
          </motion.div>
        )}

        {/* Servicios */}
        <motion.div variants={fadeUp} className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}>
          <h3 className="text-xs font-bold text-[#555] uppercase tracking-widest mb-3">Servicios</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <span
                key={c}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl"
                style={{ background: 'rgba(232,104,58,.1)', color: '#e8683a', border: '1px solid rgba(232,104,58,.2)' }}
              >
                {CATEGORY_EMOJI[c] ?? '🛠️'} {CATEGORY_LABELS[c] ?? c}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Fotos */}
        {photos.length > 0 && (
          <motion.div variants={fadeUp} className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}>
            <h3 className="text-xs font-bold text-[#555] uppercase tracking-widest mb-3">Trabajos realizados</h3>
            <WorkPhotoGallery photos={photos} />
          </motion.div>
        )}

        {/* Reseñas */}
        <motion.div variants={fadeUp}>
          <ReviewsSection rating={avg_rating} jobsCount={jobs_count} professionalId={id} />
        </motion.div>
      </div>

      {/* ── CTA FIJO ── */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, ...SPRING_GENTLE }}
        className="fixed bottom-16 left-0 right-0 px-4 pb-4 pt-3 grid gap-3"
        style={{
          gridTemplateColumns: '1fr 2fr',
          background: 'linear-gradient(to top, #F5F0E8 60%, rgba(245,240,232,0))',
        }}
      >
        <motion.button
          type="button"
          onClick={() => window.open(`https://wa.me/${whatsapp}`, '_blank', 'noopener,noreferrer')}
          whileTap={{ scale: 0.97 }}
          transition={SPRING_SOFT}
          className="rounded-2xl py-3.5 text-sm font-bold text-[#888] flex items-center justify-center gap-1.5"
          style={{ border: '1.5px solid #E8E0D4', background: '#FFFFFF' }}
        >
          💬 Chat
        </motion.button>
        <motion.button
          type="button"
          onClick={() => navigate(`/ticket?pro=${id}`)}
          whileTap={{ scale: 0.97 }}
          transition={SPRING_SOFT}
          className="rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-1.5 text-white"
          style={{ background: '#e8683a', boxShadow: '0 4px 16px rgba(232,104,58,.3)' }}
        >
          Solicitar trabajo
        </motion.button>
      </motion.div>

      <BottomNav />
    </motion.div>
  )
}
