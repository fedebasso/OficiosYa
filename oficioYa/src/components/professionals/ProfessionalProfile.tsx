import { useNavigate } from 'react-router-dom'
import { WorkPhotoGallery } from './WorkPhotoGallery'
import type { ProfessionalWithProfile, WorkPhoto } from '../../hooks/useProfessionals'

interface Props {
  professional: ProfessionalWithProfile
  photos: WorkPhoto[]
}

const CATEGORY_LABELS: Record<string, string> = {
  electricista:       'Electricista',
  plomero:            'Plomero',
  aire_acondicionado: 'Aire Acondicionado',
  cerrajero:          'Cerrajero/a',
  albanil:            'Albañil',
}

const CATEGORY_EMOJI: Record<string, string> = {
  electricista:       '⚡',
  plomero:            '🔧',
  albanil:            '🏗️',
  cerrajero:          '🔑',
  aire_acondicionado: '❄️',
}

const CATEGORY_COVER: Record<string, string> = {
  electricista:       'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  plomero:            'https://images.unsplash.com/photo-1621905251189-08b45249a5c5?w=800&q=80',
  albanil:            'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
  cerrajero:          'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80',
  aire_acondicionado: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80',
}

function getInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')
}

export function ProfessionalProfile({ professional, photos }: Props) {
  const navigate = useNavigate()
  const {
    profiles, bio, avg_rating, verified, zone, categories,
    whatsapp, id, jobs_count, response_time_min, available_now,
  } = professional

  const cat      = categories[0] ?? ''
  const specialty = `${CATEGORY_EMOJI[cat] ?? '🛠️'} ${CATEGORY_LABELS[cat] ?? cat}`
  const cover    = CATEGORY_COVER[cat] ?? 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80'
  const initials = getInitials(profiles.full_name)

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#0f0f0f' }}>

      {/* ── HERO ── */}
      <div className="relative h-72 overflow-hidden flex-shrink-0" style={{ background: '#111' }}>
        <img src={cover} alt={specialty} className="w-full h-full object-cover opacity-40" />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(15,15,15,.3) 0%, rgba(15,15,15,.85) 100%)' }}
        />

        {/* Nav */}
        <div className="absolute top-10 left-4 right-4 flex justify-between items-center z-10">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Volver"
            className="w-9 h-9 rounded-full flex items-center justify-center text-text-main text-base"
            style={{ background: 'rgba(255,255,255,.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,.12)' }}
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Guardar"
            className="w-9 h-9 rounded-full flex items-center justify-center text-text-main text-base"
            style={{ background: 'rgba(255,255,255,.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,.12)' }}
          >
            ♡
          </button>
        </div>

        {/* Contenido centrado */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-5 z-10">
          {/* Avatar circular con borde naranja */}
          <div
            className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center mb-3 flex-shrink-0"
            style={{ border: '3px solid rgba(232,104,58,.7)', boxShadow: '0 0 0 6px rgba(232,104,58,.08)' }}
          >
            {profiles.avatar_url ? (
              <img src={profiles.avatar_url} alt={profiles.full_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-main text-2xl font-black"
                style={{ background: 'rgba(232,104,58,.2)' }}>
                {initials}
              </div>
            )}
          </div>

          {available_now && (
            <div
              className="flex items-center gap-1.5 text-text-main text-[10px] font-bold px-3 py-1.5 rounded-full mb-2"
              style={{ background: 'rgba(232,104,58,.15)', border: '1px solid rgba(232,104,58,.25)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Disponible ahora
            </div>
          )}

          <h1
            className="font-display text-2xl text-text-main text-center leading-tight px-4"
            style={{ letterSpacing: '-0.5px' }}
          >
            {profiles.full_name}
          </h1>
          <p className="text-text-secondary text-sm font-medium mt-1">{specialty} · {zone}</p>

          {/* Stats pill */}
          <div
            className="flex mt-4 rounded-2xl overflow-hidden"
            style={{ background: 'rgba(0,0,0,.35)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,.08)' }}
          >
            <div className="px-5 py-2.5 text-center border-r" style={{ borderColor: 'rgba(255,255,255,.08)' }}>
              <div className="text-sm font-black text-text-main">
                {avg_rating != null ? <><span className="text-star">★</span> {avg_rating}</> : '–'}
              </div>
              <div className="text-[9px] text-text-muted mt-0.5 uppercase tracking-wider">Rating</div>
            </div>
            <div className="px-5 py-2.5 text-center border-r" style={{ borderColor: 'rgba(255,255,255,.08)' }}>
              <div className="text-sm font-black text-text-main">{jobs_count}</div>
              <div className="text-[9px] text-text-muted mt-0.5 uppercase tracking-wider">Trabajos</div>
            </div>
            <div className="px-5 py-2.5 text-center">
              <div className="text-sm font-black text-text-main">
                {available_now ? `~${response_time_min}m` : '–'}
              </div>
              <div className="text-[9px] text-text-muted mt-0.5 uppercase tracking-wider">Respuesta</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="flex flex-col gap-3 px-4 pt-4 pb-28">

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {verified && (
            <span className="rounded-full text-[11px] font-semibold px-3 py-1"
              style={{ background: 'rgba(59,130,246,.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,.2)' }}>
              ✓ Verificado
            </span>
          )}
          {jobs_count >= 50 && avg_rating != null && avg_rating >= 4.8 && (
            <span className="rounded-full text-[11px] font-black px-3 py-1"
              style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#fff' }}>
              ★ Top Pro
            </span>
          )}
          {available_now && (
            <span className="rounded-full text-[11px] font-semibold px-3 py-1"
              style={{ background: 'rgba(232,104,58,.1)', color: '#e8683a', border: '1px solid rgba(232,104,58,.2)' }}>
              ● Disponible
            </span>
          )}
          <span className="rounded-full text-[11px] font-semibold px-3 py-1"
            style={{ background: '#1a1a1a', color: '#888', border: '1px solid #2a2a2a' }}>
            📍 {zone}
          </span>
        </div>

        {/* Sobre mí */}
        {bio && (
          <div className="rounded-2xl p-4" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Sobre mí</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{bio}</p>
          </div>
        )}

        {/* Servicios */}
        <div className="rounded-2xl p-4" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Servicios</h3>
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
        </div>

        {/* Fotos */}
        {photos.length > 0 && (
          <div className="rounded-2xl p-4" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Trabajos realizados</h3>
            <WorkPhotoGallery photos={photos} />
          </div>
        )}
      </div>

      {/* ── CTA FIJO ── */}
      <div
        className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 grid gap-3"
        style={{
          gridTemplateColumns: '1fr 2fr',
          background: 'linear-gradient(to top, #0f0f0f 70%, transparent)',
        }}
      >
        <button
          type="button"
          onClick={() => window.open(`https://wa.me/${whatsapp}`, '_blank', 'noopener,noreferrer')}
          className="rounded-2xl py-3.5 text-sm font-bold text-text-secondary flex items-center justify-center gap-1.5 active:opacity-70 transition-opacity"
          style={{ border: '1px solid #2a2a2a', background: '#141414' }}
        >
          💬 Chat
        </button>
        <button
          type="button"
          onClick={() => navigate(`/solicitar/${id}`)}
          className="rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-1.5 active:opacity-80 transition-opacity text-white"
          style={{ background: '#e8683a', boxShadow: '0 4px 16px rgba(232,104,58,.3)' }}
        >
          Solicitar trabajo
        </button>
      </div>

    </div>
  )
}
