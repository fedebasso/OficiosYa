import { useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { PageShell } from '../components/layout/PageShell'
import { ProfessionalCard } from '../components/professionals/ProfessionalCard'
import { ProfessionalCardSkeleton } from '../components/ui/Skeleton'
import { useFavoritesStore } from '../store/favoritesStore'
import { useProfessionals } from '../hooks/useProfessionals'

export default function Favoritos() {
  const navigate = useNavigate()
  const { ids } = useFavoritesStore()
  const { professionals, loading } = useProfessionals()

  const favorites = professionals.filter((p) => ids.includes(p.id))

  const header = (
    <div
      className="px-4 pt-12 pb-3 sticky top-0 z-50"
      style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E8E0D4',
        boxShadow: '0 1px 0 #E8E0D4, 0 2px 8px rgba(0,0,0,.04)',
      }}
    >
      <h1 className="text-2xl font-black" style={{ color: '#111111', letterSpacing: '-0.5px' }}>
        Favoritos
      </h1>
      {!loading && favorites.length > 0 && (
        <p className="text-xs mt-0.5" style={{ color: '#999999' }}>
          {favorites.length} profesional{favorites.length !== 1 ? 'es' : ''} guardado{favorites.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )

  return (
    <PageShell header={header} showBottomNav>
      <div className="p-4 flex flex-col gap-3">

        {loading && [0, 1, 2].map((i) => <ProfessionalCardSkeleton key={i} />)}

        {!loading && ids.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ background: '#FEF0EA', border: '1.5px solid #FDDCC8' }}
            >
              <Heart size={32} style={{ color: '#E8683A' }} />
            </div>
            <div>
              <p className="font-black text-base" style={{ color: '#111111' }}>
                Sin favoritos aún
              </p>
              <p className="text-sm mt-1 leading-relaxed" style={{ color: '#999999' }}>
                Guardá profesionales de confianza<br />para contactarlos rápido cuando los necesités
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/buscar')}
              className="rounded-2xl px-6 py-3 text-sm font-bold text-white active:opacity-80 transition-opacity"
              style={{ background: '#E8683A', boxShadow: '0 2px 8px rgba(232,104,58,.3)' }}
            >
              Buscar profesionales
            </button>
          </div>
        )}

        {!loading && ids.length > 0 && favorites.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="font-bold text-sm" style={{ color: '#111111' }}>
              Los profesionales que guardaste ya no están disponibles
            </p>
            <button
              type="button"
              onClick={() => navigate('/buscar')}
              className="text-sm font-bold"
              style={{ color: '#E8683A' }}
            >
              Buscar nuevos profesionales →
            </button>
          </div>
        )}

        {favorites.map((pro, i) => (
          <div key={pro.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
            <ProfessionalCard
              professional={pro}
              onClick={() => navigate(`/profesional/${pro.id}`)}
            />
          </div>
        ))}

      </div>
    </PageShell>
  )
}
