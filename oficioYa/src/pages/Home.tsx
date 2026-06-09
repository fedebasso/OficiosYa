import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { SearchBar } from '../components/home/SearchBar'
import { CategoryGrid } from '../components/home/CategoryGrid'
import { FeaturedProfessionals } from '../components/home/FeaturedProfessionals'
import { UrgenciasBanner } from '../components/home/UrgenciasBanner'
import { StatsBar } from '../components/home/StatsBar'
import { useAuthStore } from '../store/authStore'

function useReveal() {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.disconnect() } },
      { threshold: 0.12 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}

export default function Home() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const heroRef    = useReveal()
  const urgRef     = useReveal()
  const catsRef    = useReveal()
  const statsRef   = useReveal()
  const featRef    = useReveal()
  const ctaRef     = useReveal()

  const homeHeader = (
    <header className="border-b border-[#1e1e1e] px-4 pt-10 pb-5 sticky top-0 z-50" style={{ background: '#0f0f0f' }}>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-[32px] font-black leading-none" style={{ color: '#f5f0e8', letterSpacing: '-1px' }}>
          Oficio<span style={{ color: '#e8683a' }}>Ya</span>
        </h1>
        <button
          type="button"
          onClick={() => navigate(user ? (user.role === 'professional' ? '/pro/perfil' : '/mis-solicitudes') : '/login')}
          className="w-11 h-11 rounded-full flex items-center justify-center focus:outline-none flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #2a1f10 0%, #3d2c16 100%)',
            border: '2px solid #e8683a',
            boxShadow: '0 0 12px rgba(232,104,58,.25)',
          }}
          aria-label="Mi cuenta"
        >
          <span style={{ fontSize: 18 }}>👤</span>
        </button>
      </div>
      <SearchBar onSearch={() => navigate('/buscar')} />
    </header>
  )

  return (
    <PageShell header={homeHeader} showBottomNav>
      <div className="px-4 py-5 flex flex-col gap-6">

        {/* Hero */}
        <section
          ref={heroRef as React.RefObject<HTMLElement>}
          className="reveal rounded-2xl overflow-hidden px-5 py-6 relative"
          style={{
            background: 'linear-gradient(135deg, #1a1008 0%, #2d1f0e 50%, #1a1008 100%)',
            border: '1px solid #2a1f10',
          }}
        >
          <div
            className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(232,104,58,.12) 0%, transparent 70%)' }}
          />
          <div
            className="inline-block text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
            style={{ background: 'rgba(232,104,58,.15)', border: '1px solid rgba(232,104,58,.3)', color: '#e8683a' }}
          >
            Disponible ahora
          </div>
          <h2 className="text-2xl font-black text-[#f5f0e8] leading-tight mb-2">
            Tu <span className="text-[#e8683a]">oficio</span>,<br />cuando lo necesitás
          </h2>
          <p className="text-[#888] text-xs leading-relaxed">
            Electricistas, plomeros, albañiles y más — verificados y disponibles en tu zona.
          </p>
        </section>

        {/* Urgencias Banner */}
        <section
          ref={urgRef as React.RefObject<HTMLElement>}
          className="reveal"
        >
          <UrgenciasBanner />
        </section>

        {/* Categorías */}
        <section ref={catsRef as React.RefObject<HTMLElement>} className="reveal">
          <h2 className="text-[11px] font-bold text-[#888] uppercase tracking-[.6px] mb-2.5">
            ¿Qué necesitás?
          </h2>
          <CategoryGrid />
        </section>

        {/* Stats */}
        <section ref={statsRef as React.RefObject<HTMLElement>} className="reveal">
          <StatsBar />
        </section>

        {/* Más recomendados */}
        <section ref={featRef as React.RefObject<HTMLElement>} className="reveal">
          <FeaturedProfessionals />
        </section>

        {/* CTA profesional */}
        <section
          ref={ctaRef as React.RefObject<HTMLElement>}
          className="reveal rounded-2xl p-4 flex flex-col gap-3"
          style={{ background: '#141414', border: '1px solid #1e1e1e' }}
        >
          <div>
            <h2 className="text-[13px] font-bold text-[#f5f0e8]">¿Sos profesional?</h2>
            <p className="text-xs text-[#888] mt-0.5">
              Unite a OficiosYa y conseguí clientes en tu zona.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/pro/registro')}
            className="w-full rounded-xl py-3 text-sm font-bold text-[#f5f0e8] transition-opacity active:opacity-70"
            style={{ background: '#1e1e1e', border: '1px solid #2a2a2a' }}
          >
            Registrarme como profesional
          </button>
        </section>

      </div>
    </PageShell>
  )
}
