import { useState, useEffect } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { registrationService } from '../../../services/registrationService'
import { PortfolioItemCard } from './PortfolioItemCard'
import { PortfolioItemForm } from './PortfolioItemForm'
import type { PortfolioItem } from '../../../types/registration'
import { Plus } from 'lucide-react'

export function ProPortfolio() {
  const user = useAuthStore((s) => s.user)
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<PortfolioItem | null | 'new'>()
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      registrationService.getPortfolio(user.id)
        .then(setItems)
        .finally(() => setLoading(false))
    }
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
    setDeleting(id)
    try {
      await registrationService.deletePortfolioItem(id)
      setItems((prev) => prev.filter((i) => i.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 py-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-2xl" style={{ aspectRatio: '4/3', background: '#EDE8DE', border: '1.5px solid #E8E0D4' }} />
        ))}
      </div>
    )
  }

  return (
    <div className="py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold" style={{ color: '#555' }}>
          {items.length} trabajo{items.length !== 1 ? 's' : ''}
        </p>
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold"
          style={{ background: '#E8683A', color: '#fff' }}
        >
          <Plus size={14} /> Agregar
        </button>
      </div>

      {/* Grid */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center rounded-2xl" style={{ border: '1.5px dashed #E8E0D4' }}>
          <p className="text-4xl">📸</p>
          <div>
            <p className="font-black text-sm" style={{ color: '#111' }}>Aún no tenés trabajos</p>
            <p className="text-xs mt-1" style={{ color: '#AAA' }}>Subí fotos de tus trabajos para generar confianza en los clientes</p>
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
              onDelete={() => {
                if (window.confirm(`¿Eliminar "${item.title}"?`)) handleDelete(item.id)
              }}
            />
          ))}
        </div>
      )}

      {/* Modal confirm delete */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="rounded-2xl p-6 mx-5" style={{ background: '#fff' }}>
            <p className="font-bold text-center" style={{ color: '#111' }}>Eliminando...</p>
          </div>
        </div>
      )}

      {/* Form modal */}
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
