import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { Button } from '../components/ui/Button'
import { SearchBar } from '../components/home/SearchBar'
import { CategoryGrid } from '../components/home/CategoryGrid'

export default function Home() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function handleSearch() {
    const trimmed = query.trim()
    if (trimmed) {
      navigate(`/buscar/${encodeURIComponent(trimmed)}`)
    } else {
      navigate('/buscar')
    }
  }

  const homeHeader = (
    <header className="bg-primary text-white px-4 pt-5 pb-4 sticky top-0 z-50 shadow-md">
      <div className="mb-1">
        <h1 className="text-2xl font-bold tracking-tight leading-none">
          Oficio<span className="text-accent">Ya</span>
        </h1>
        <p className="text-white/70 text-sm mt-0.5">Encontrá profesionales en Montevideo</p>
      </div>
      <div className="mt-3">
        <SearchBar value={query} onChange={setQuery} onSearch={handleSearch} />
      </div>
    </header>
  )

  return (
    <PageShell header={homeHeader} showBottomNav={true}>
      <div className="px-4 py-5 space-y-6">
        {/* Category section */}
        <section>
          <h2 className="text-base font-semibold text-text-main mb-3">¿Qué necesitás?</h2>
          <CategoryGrid />
        </section>

        {/* Professional CTA section */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-3">
          <div>
            <h2 className="text-base font-semibold text-text-main">¿Sos profesional?</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Unite a OficiosYa y conseguí clientes en tu zona.
            </p>
          </div>
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={() => navigate('/pro/registro')}
          >
            Registrarme como profesional
          </Button>
        </section>
      </div>
    </PageShell>
  )
}
