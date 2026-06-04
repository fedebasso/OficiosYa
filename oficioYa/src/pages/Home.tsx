import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { Button } from '../components/ui/Button'
import { SearchBar } from '../components/home/SearchBar'
import { CategoryGrid } from '../components/home/CategoryGrid'
import { FeaturedProfessionals } from '../components/home/FeaturedProfessionals'
import { UrgenciasBanner } from '../components/home/UrgenciasBanner'

export default function Home() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function handleSearch() {
    const trimmed = query.trim()
    navigate(trimmed ? `/buscar/${encodeURIComponent(trimmed)}` : '/buscar')
  }

  const homeHeader = (
    <header className="bg-primary px-4 pt-10 pb-5 sticky top-0 z-50">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-[22px] font-black text-white leading-none">
            Oficio<span className="text-accent">Ya</span>
          </h1>
          <p className="text-white/60 text-[11px] mt-0.5">📍 Montevideo</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          style={{ background: 'rgba(255,255,255,.15)', border: '1.5px solid rgba(255,255,255,.3)' }}
          aria-label="Mi cuenta"
        >
          👤
        </button>
      </div>
      <SearchBar value={query} onChange={setQuery} onSearch={handleSearch} />
    </header>
  )

  return (
    <PageShell header={homeHeader} showBottomNav>
      <div className="px-4 py-5 flex flex-col gap-6">

        {/* Categorías */}
        <section>
          <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-[.6px] mb-2.5">
            ¿Qué necesitás?
          </h2>
          <CategoryGrid />
        </section>

        {/* Profesionales destacados */}
        <FeaturedProfessionals />

        {/* Urgencias 24H */}
        <section>
          <UrgenciasBanner />
        </section>

        {/* CTA profesional */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
          <div>
            <h2 className="text-[13px] font-bold text-text-main">¿Sos profesional?</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Unite a OficiosYa y conseguí clientes en tu zona.
            </p>
          </div>
          <Button variant="secondary" size="md" fullWidth onClick={() => navigate('/pro/registro')}>
            Registrarme como profesional
          </Button>
        </section>

      </div>
    </PageShell>
  )
}
