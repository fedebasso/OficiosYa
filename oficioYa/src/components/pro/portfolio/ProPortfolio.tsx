import { useState, useEffect } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { registrationService } from '../../../services/registrationService'
import { IS_DEMO_MODE } from '../../../lib/env'
import { PortfolioItemCard } from './PortfolioItemCard'
import { PortfolioItemForm } from './PortfolioItemForm'
import type { PortfolioItem } from '../../../types/registration'
import { Plus } from 'lucide-react'

const MOCK_PORTFOLIO: PortfolioItem[] = [
  {
    id: 'p1',
    professional_id: 'mock-pro-1',
    title: 'Instalación tablero eléctrico',
    category: 'electricista',
    description: 'Cambio completo de tablero en departamento de Pocitos.',
    work_date: '2024-03-10',
    photo_urls: [],
    photos: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', type: 'after' }],
    location: 'Pocitos',
    request_id: null,
    is_featured: true,
    created_at: '2024-03-10T10:00:00Z',
  },
  {
    id: 'p2',
    professional_id: 'mock-pro-1',
    title: 'Tomacorrientes cocina',
    category: 'electricista',
    description: 'Instalación de 3 tomacorrientes nuevos.',
    work_date: '2024-02-20',
    photo_urls: [],
    photos: [{ url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&q=80', type: 'general' }],
    location: 'Malvín',
    request_id: null,
    is_featured: false,
    created_at: '2024-02-20T10:00:00Z',
  },
  {
    id: 'p3',
    professional_id: 'mock-pro-1',
    title: 'Iluminación living con LED',
    category: 'electricista',
    description: 'Diseño de iluminación con luces LED empotradas.',
    work_date: '2024-01-15',
    photo_urls: [],
    photos: [{ url: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=400&q=80', type: 'after' }],
    location: 'Punta Carretas',
    request_id: null,
    is_featured: false,
    created_at: '2024-01-15T10:00:00Z',
  },
]

export function ProPortfolio() {
  const user = useAuthStore((s) => s.user)
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<PortfolioItem | null | 'new'>()
  const [togglingFeatured, setTogglingFeatured] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) return
    if (IS_DEMO_MODE) {
      setItems(MOCK_PORTFOLIO)
      setLoading(false)
      return
    }
    registrationService.getPortfolio(user.id)
      .then(setItems)
      .finally(() => setLoading(false))
  }, [user?.id])

  function handleSaved(saved: PortfolioItem) {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === saved.id)
      return idx >= 0
        ? prev.map((i) => i.id === saved.id ? saved : i)
        : [saved, ...prev]
    })
    setEditing(undefined)
  }

  async function handleDelete(id: string) {
    if (!window.confirm('¿Eliminar este trabajo?')) return
    if (!IS_DEMO_MODE) await registrationService.deletePortfolioItem(id)
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  async function handleToggleFeatured(item: PortfolioItem) {
    if (!user?.id) return
    const primaryPhotoUrl = item.photos[0]?.url ?? item.photo_urls[0] ?? ''
    setTogglingFeatured(item.id)
    try {
      if (!IS_DEMO_MODE) {
        await registrationService.toggleFeatured(user.id, item.id, primaryPhotoUrl)
      }
      setItems((prev) => prev.map((i) => ({
        ...i,
        is_featured: i.id === item.id ? !item.is_featured : false,
      })))
    } finally {
      setTogglingFeatured(null)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 py-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-2xl"
            style={{ aspectRatio: '4/3', background: '#EDE8DE', border: '1.5px solid #E8E0D4' }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold" style={{ color: '#555' }}>
          {items.length} trabajo{items.length !== 1 ? 's' : ''}
        </p>
        {items.length < 30 && (
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold"
            style={{ background: '#E8683A', color: '#fff' }}
          >
            <Plus size={14} /> Agregar
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div
          className="flex flex-col items-center gap-4 py-16 text-center rounded-2xl"
          style={{ border: '1.5px dashed #E8E0D4' }}
        >
          <p className="text-4xl">📸</p>
          <div>
            <p className="font-black text-sm" style={{ color: '#111' }}>Mostrá tus mejores trabajos</p>
            <p className="text-xs mt-1" style={{ color: '#AAA' }}>
              Subí fotos para generar confianza en los clientes
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: '#E8683A', color: '#fff' }}
          >
            Agregar primer trabajo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => (
            <PortfolioItemCard
              key={item.id}
              item={item}
              onEdit={() => setEditing(item)}
              onDelete={() => handleDelete(item.id)}
              onToggleFeatured={() => handleToggleFeatured(item)}
              togglingFeatured={togglingFeatured === item.id}
            />
          ))}
        </div>
      )}

      {editing !== undefined && (
        <PortfolioItemForm
          item={editing === 'new' ? null : editing}
          proId={user?.id ?? ''}
          onSave={handleSaved}
          onClose={() => setEditing(undefined)}
        />
      )}
    </div>
  )
}
