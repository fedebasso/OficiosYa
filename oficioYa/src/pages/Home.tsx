import { useNavigate } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { FeaturedProfessionals } from '../components/home/FeaturedProfessionals'
import { UrgenciasFAB } from '../components/home/UrgenciasFAB'

export default function Home() {
  const navigate = useNavigate()

  const homeHeader = (
    <header
      className="sticky top-0 z-50"
      style={{
        background: '#FFFFFF',
        boxShadow: '0 1px 0 #EDE8DE, 0 2px 8px rgba(0,0,0,.04)',
      }}
    >
      {/* Fila 1: logo + ubicación */}
      <div
        className="flex items-center justify-between"
        style={{ padding: 'calc(12px + var(--safe-top)) var(--px-container) 8px' }}
      >
        <div>
          <h1
            className="font-black leading-none"
            style={{ fontSize: 'var(--text-xl)', color: '#111111', letterSpacing: '-0.5px' }}
          >
            Oficio<span style={{ color: '#E8683A' }}>Ya</span>
          </h1>
          <p style={{ fontSize: 'var(--text-xs)', color: '#AAAAAA', marginTop: 2 }}>
            📍 Montevideo
          </p>
        </div>
      </div>

      {/* Fila 2: search bar */}
      <div style={{ padding: '0 var(--px-container) 12px' }}>
        <button
          type="button"
          onClick={() => navigate('/buscar')}
          className="w-full flex items-center gap-3 active:opacity-80 transition-opacity"
          style={{
            height: 44,
            background: '#F5F0E8',
            border: '1.5px solid #EDE8DE',
            borderRadius: 14,
            padding: '0 14px',
          }}
        >
          <span style={{ fontSize: 15 }}>🔍</span>
          <span style={{ fontSize: 'var(--text-sm)', color: '#BBBBBB' }}>
            ¿Qué servicio necesitás?
          </span>
        </button>
      </div>
    </header>
  )

  return (
    <PageShell header={homeHeader} showBottomNav>
      <div className="flex flex-col gap-5 pt-4 pb-4">
        <section>
          <FeaturedProfessionals />
        </section>
      </div>
      <UrgenciasFAB />
    </PageShell>
  )
}
