import { useNavigate } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { RatingStars } from './RatingStars'
import { WorkPhotoGallery } from './WorkPhotoGallery'
import type { ProfessionalWithProfile, WorkPhoto } from '../../hooks/useProfessionals'

interface Props {
  professional: ProfessionalWithProfile
  photos: WorkPhoto[]
}

export function ProfessionalProfile({ professional, photos }: Props) {
  const navigate = useNavigate()
  const { profiles, bio, avg_rating, verified, zone, categories, whatsapp, id } = professional

  return (
    <div className="flex flex-col gap-4 pb-6">
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center gap-2 text-center">
        <Avatar src={profiles.avatar_url} name={profiles.full_name} size="lg" />
        <div>
          <h2 className="font-semibold text-lg text-text-main">{profiles.full_name}</h2>
          <p className="text-sm text-gray-500">{zone} · {profiles.city}</p>
        </div>
        {verified && <Badge variant="verified">Verificado</Badge>}
        <RatingStars rating={avg_rating} />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="font-medium text-sm text-gray-500 uppercase tracking-wide mb-2">Sobre mí</h3>
        <p className="text-sm text-text-main">{bio}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="font-medium text-sm text-gray-500 uppercase tracking-wide mb-2">Servicios</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <span key={cat} className="text-xs bg-accent/30 text-primary px-2 py-1 rounded-full">{cat}</span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="font-medium text-sm text-gray-500 uppercase tracking-wide mb-2">Trabajos anteriores</h3>
        <WorkPhotoGallery photos={photos} />
      </div>

      <div className="flex flex-col gap-2 px-1">
        <Button variant="primary" fullWidth onClick={() => navigate(`/solicitar/${id}`)}>
          Solicitar servicio
        </Button>
        <Button
          variant="secondary"
          fullWidth
          onClick={() => window.open(`https://wa.me/${whatsapp}`, '_blank')}
        >
          <MessageCircle size={16} className="inline mr-1" />
          Contactar por WhatsApp
        </Button>
      </div>
    </div>
  )
}
