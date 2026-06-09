import type { WorkPhoto } from '../../hooks/useProfessionals'

interface Props {
  photos: WorkPhoto[]
}

export function WorkPhotoGallery({ photos }: Props) {
  if (photos.length === 0)
    return <p className="text-sm text-center py-4" style={{ color: '#555' }}>Sin fotos aún</p>

  return (
    <div className="grid grid-cols-2 gap-2">
      {photos.map((photo) => (
        <div key={photo.id} className="flex flex-col gap-1">
          <img
            src={photo.url}
            alt={photo.caption}
            className="w-full h-28 object-cover rounded-lg"
          />
          {photo.caption && (
            <p className="text-xs px-1" style={{ color: '#555' }}>{photo.caption}</p>
          )}
        </div>
      ))}
    </div>
  )
}
