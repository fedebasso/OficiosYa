import { useParams, useNavigate } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { Header } from '../components/layout/Header'
import { ProfessionalProfile } from '../components/professionals/ProfessionalProfile'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { useProfessionalById } from '../hooks/useProfessionals'

export default function ProfessionalDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { professional, loading, error } = useProfessionalById(id ?? '')

  return (
    <PageShell
      showBottomNav={false}
      header={<Header title="Perfil" showBack onBack={() => navigate(-1)} />}
    >
      <div className="p-4">
        {loading && <div className="flex justify-center py-8"><LoadingSpinner /></div>}
        {error && <p className="text-center text-red-500 py-8">{error}</p>}
        {!loading && !error && !professional && (
          <p className="text-center text-gray-400 py-8">Profesional no encontrado</p>
        )}
        {professional && <ProfessionalProfile professional={professional} photos={[]} />}
      </div>
    </PageShell>
  )
}
