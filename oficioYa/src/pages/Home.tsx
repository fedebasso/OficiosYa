import { useEffect, useRef, useState } from 'react'
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
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}

export default function Home() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)
  const [menuOpen, setMenuOpen] = useState(false)

  const urgRef   = useReveal()
  const catsRef  = useReveal()
  const statsRef = useReveal()
  const featRef  = useReveal()
  const ctaRef   = useReveal()

  const homeHeader = (
    <header
      className="px-4 pt-12 pb-3 sticky top-0 z-50"
      style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E8E0D4',
        boxShadow: '0 1px 0 #E8E0D4, 0 2px 8px rgba(0,0,0,.04)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-[28px] font-black leading-none" style={{ color: '#111111', letterSpacing: '-1px' }}>
          Oficio<span style={{ color: '#E8683A' }}>Ya</span>
        </h1>

        <div className="relative">
          <button
            type="button"
            onClick={() => user ? setMenuOpen(v => !v) : navigate('/login')}
            className="w-10 h-10 rounded-full flex items-center justify-center focus:outline-none flex-shrink-0 active:opacity-70 transition-opacity"
            style={{
              background: user ? '#FEF0EA' : '#F5F0E8',
              border: `2px solid ${user ? '#E8683A' : '#E8E0D4'}`,
            }}
            aria-label="Mi cuenta"
          >
            <span style={{ fontSize: 17 }}>👤</span>
          </button>

          {menuOpen && user && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div
                className="absolute right-0 z-50 rounded-2xl overflow-hidden min-w-[170px]"
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #E8E0D4',
                  boxShadow: '0 8px 24px rgba(0,0,0,.12)',
                  top: '48px',
                }}
              >
                <div className="px-4 py-3" style={{ borderBottom: '1px solid #F0EBE1' }}>
                  <p className="text-sm font-bold truncate" style={{ color: '#111111' }}>{user.full_name}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: '#999999' }}>
                    {user.role === 'professional' ? 'Profesional' : 'Cliente'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); navigate(user.role === 'professional' ? '/pro/perfil' : '/mis-solicitudes') }}
                  className="w-full px-4 py-3 text-left text-sm font-medium active:opacity-70"
                  style={{ color: '#111111', borderBottom: '1px solid #F0EBE1' }}
                >
                  Mi cuenta
                </button>
                <button
                  type="button"
                  onClick={async () => { setMenuOpen(false); await signOut(); navigate('/login') }}
                  className="w-full px-4 py-3 text-left text-sm font-medium active:opacity-70"
                  style={{ color: '#EF4444' }}
                >
                  Cerrar sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <SearchBar onSearch={(q) => navigate(q ? `/buscar?q=${encodeURIComponent(q)}` : '/buscar')} />
    </header>
  )

  return (
    <PageShell header={homeHeader} showBottomNav>
      <div className="px-4 py-5 flex flex-col gap-5">

        {/* Urgencias */}
        <section ref={urgRef as React.RefObject<HTMLElement>} className="reveal">
          <UrgenciasBanner />
        </section>

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
    </PageShell>
  )
}
