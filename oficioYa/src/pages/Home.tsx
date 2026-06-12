import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { CategoryGrid } from '../components/home/CategoryGrid'
import { FeaturedProfessionals } from '../components/home/FeaturedProfessionals'
import { UrgenciasFAB } from '../components/home/UrgenciasFAB'
import { StatsBar } from '../components/home/StatsBar'

function useReveal() {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.disconnect() } },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}

export default function Home() {
  const navigate = useNavigate()

  const catsRef  = useReveal()
  const statsRef = useReveal()
  const featRef  = useReveal()
  const ctaRef   = useReveal()

  const homeHeader = (
    <header
      className="px-4 pt-3 pb-2 sticky top-0 z-50"
      style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E8E0D4',
        boxShadow: '0 1px 0 #E8E0D4, 0 2px 8px rgba(0,0,0,.04)',
      }}
    >
      <h1 className="text-[22px] font-black leading-none" style={{ color: '#111111', letterSpacing: '-0.5px' }}>
        Oficio<span style={{ color: '#E8683A' }}>Ya</span>
      </h1>
    </header>
  )

  return (
    <PageShell header={homeHeader} showBottomNav>
      <div className="flex flex-col gap-3 pt-3 pb-4">

        {/* Categorías */}
        <section ref={catsRef as React.RefObject<HTMLElement>} className="reveal">
          <h2 className="text-[11px] font-bold uppercase tracking-[.7px] mb-2.5" style={{ color: '#999999' }}>
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
          className="reveal rounded-2xl px-4 py-3.5 flex items-center justify-between gap-3"
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #E8E0D4',
            boxShadow: '0 1px 3px rgba(0,0,0,.06)',
          }}
        >
          <div>
            <h2 className="text-[14px] font-bold" style={{ color: '#111111' }}>¿Sos profesional?</h2>
            <p className="text-xs mt-0.5" style={{ color: '#999999' }}>
              Conseguí clientes en tu zona
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/pro/registro')}
            className="rounded-xl px-4 py-2.5 text-sm font-bold text-white active:opacity-80 transition-opacity flex-shrink-0"
            style={{ background: '#E8683A', boxShadow: '0 2px 8px rgba(232,104,58,.3)' }}
          >
            Registrarme →
          </button>
        </section>

      </div>

      {/* FAB de urgencias — flotante sobre el contenido */}
      <UrgenciasFAB />
    </PageShell>
  )
}
