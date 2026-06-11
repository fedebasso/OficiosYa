import { useParams } from 'react-router-dom'
import { ProfessionalProfile } from '../components/professionals/ProfessionalProfile'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { useProfessionalById, useProfessionalPhotos } from '../hooks/useProfessionals'

export default function ProfessionalDetail() {
  const { id } = useParams<{ id: string }>()
  const { professional, loading, error } = useProfessionalById(id ?? '')
  const { photos } = useProfessionalPhotos(id ?? '')

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !professional) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-3 px-6 text-center">
        <div className="text-4xl">😕</div>
        <p className="font-bold text-[#111111]">Profesional no encontrado</p>
        <p className="text-sm text-[#555]">{error ?? 'No pudimos cargar este perfil'}</p>
      </div>
    )
  }

  return <ProfessionalProfile professional={professional} photos={photos} />
}
