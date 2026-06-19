# Portfolio Profesional Mejorado — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir a profesionales gestionar una galería de trabajos con fotos antes/después y foto destacada, visible en su perfil público para generar confianza en los clientes.

**Architecture:** Extensión de la tabla `work_portfolio` existente con columnas `photos jsonb[]`, `location`, `request_id`, `is_featured`, y `featured_photo_url` en `professionals`. El servicio `registrationService` se extiende con `updatePortfolioItem` y `toggleFeatured`. El panel del pro agrega una tab "Mis Trabajos" en `ProProfile`. El perfil público muestra hero con foto destacada + grid de trabajos con modal de galería.

**Tech Stack:** React 19 + TypeScript + Vite, Tailwind CSS v3, Supabase (DB + Storage `pro-portfolio`), Lucide React, sin librerías nuevas.

## Global Constraints

- Colores: fondo `#F5F0E8`, acento `#E8683A`, texto `#111111`, secundario `#555555`, borde `#E8E0D4`
- Textos en español rioplatense (vos, no tú)
- Bucket de storage: `pro-portfolio` (ya existe y es público)
- `WorkPhoto.type`: exactamente `'before' | 'after' | 'general'`
- `PortfolioItem` nuevo: reemplaza `photo_urls: string[]` con `photos: WorkPhoto[]`
- Solo un trabajo puede tener `is_featured = true` por profesional
- `npm run build` debe pasar 0 errores TypeScript en cada task
- No hay suite de tests — verificar con `npm run build` + `npm run dev`

---

## File Map

| Acción | Archivo |
|---|---|
| Crear | `supabase/migrations/20260618_portfolio_mejoras.sql` |
| Modificar | `src/types/registration.ts` |
| Modificar | `src/services/registrationService.ts` |
| Crear | `src/components/pro/portfolio/PortfolioItemCard.tsx` |
| Crear | `src/components/pro/portfolio/PortfolioItemForm.tsx` |
| Crear | `src/components/pro/portfolio/ProPortfolio.tsx` |
| Crear | `src/components/pro/portfolio/PortfolioWorkModal.tsx` |
| Modificar | `src/pages/pro/ProProfile.tsx` |
| Modificar | `src/pages/ProfessionalDetail.tsx` |
| Modificar | `src/components/professionals/ProfessionalProfile.tsx` |
| Modificar | `src/pages/SolicitudDetail.tsx` |

---

## Task 1: Migración SQL + tipos TypeScript

**Files:**
- Create: `supabase/migrations/20260618_portfolio_mejoras.sql`
- Modify: `src/types/registration.ts`

**Interfaces:**
- Produce:
  - `WorkPhoto` interface: `{ url: string; type: 'before' | 'after' | 'general' }`
  - `PortfolioItem` interface actualizado con `photos: WorkPhoto[]`, `location`, `request_id`, `is_featured`
  - Tipo `PhotoType = 'before' | 'after' | 'general'`

- [ ] **Step 1: Crear migración SQL**

Crear `supabase/migrations/20260618_portfolio_mejoras.sql`:

```sql
-- Ampliar work_portfolio con nuevas columnas
ALTER TABLE work_portfolio
  ADD COLUMN IF NOT EXISTS photos      jsonb[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS location    text,
  ADD COLUMN IF NOT EXISTS request_id  uuid REFERENCES requests(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;

-- Migrar photo_urls existentes al nuevo formato jsonb
UPDATE work_portfolio
SET photos = (
  SELECT array_agg(jsonb_build_object('url', u, 'type', 'general'))
  FROM unnest(photo_urls) AS u
)
WHERE photo_urls != '{}' AND (photos IS NULL OR photos = '{}');

-- Agregar featured_photo_url al profesional
ALTER TABLE professionals
  ADD COLUMN IF NOT EXISTS featured_photo_url text;

-- Solo un trabajo destacado por profesional (constraint via trigger o manual en app)
-- No se agrega UNIQUE constraint porque se maneja en el servicio
```

- [ ] **Step 2: Ejecutar migración en Supabase**

En Supabase Dashboard → SQL Editor: pegar y ejecutar el archivo.

Verificar que las columnas nuevas aparecen en `work_portfolio` y `professionals`.

- [ ] **Step 3: Actualizar `src/types/registration.ts`**

Reemplazar la interfaz `PortfolioItem` existente y agregar los nuevos tipos:

```typescript
export type PhotoType = 'before' | 'after' | 'general'

export interface WorkPhoto {
  url: string
  type: PhotoType
}

export interface PortfolioItem {
  id: string
  professional_id: string
  title: string
  description: string | null
  work_date: string | null
  category: string | null
  photo_urls: string[]      // legacy — mantener para no romper el paso 4 del registro
  photos: WorkPhoto[]       // nuevo formato con tipo de foto
  location: string | null
  request_id: string | null
  is_featured: boolean
  created_at: string
}
```

**Nota:** `photo_urls` se mantiene en el tipo para no romper `Step4Portfolio.tsx` del registro. Las nuevas funciones usan `photos`.

- [ ] **Step 4: Verificar build**

```bash
npm run build
```

Expected: 0 errores TypeScript.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260618_portfolio_mejoras.sql src/types/registration.ts
git commit -m "feat: migración portfolio v2 — fotos tipadas, foto destacada, location"
```

---

## Task 2: Extender `registrationService` con updatePortfolioItem y toggleFeatured

**Files:**
- Modify: `src/services/registrationService.ts`

**Interfaces:**
- Consumes: `WorkPhoto`, `PortfolioItem` de `src/types/registration.ts`
- Produces:
  - `registrationService.updatePortfolioItem(id: string, data: Partial<Omit<PortfolioItem, 'id' | 'professional_id' | 'created_at'>>): Promise<PortfolioItem>`
  - `registrationService.toggleFeatured(proId: string, itemId: string, featuredPhotoUrl: string): Promise<void>`
  - `registrationService.getPortfolio(proId: string): Promise<PortfolioItem[]>` — ya existe, no cambiar firma

- [ ] **Step 1: Agregar `updatePortfolioItem` al servicio**

En `src/services/registrationService.ts`, agregar dentro del objeto `registrationService` (después de `deletePortfolioItem`):

```typescript
async updatePortfolioItem(
  id: string,
  data: Partial<Omit<PortfolioItem, 'id' | 'professional_id' | 'created_at'>>
): Promise<PortfolioItem> {
  const { data: updated, error } = await supabase
    .from('work_portfolio')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return updated as PortfolioItem
},
```

- [ ] **Step 2: Agregar `toggleFeatured` al servicio**

Agregar después de `updatePortfolioItem`:

```typescript
async toggleFeatured(proId: string, itemId: string, featuredPhotoUrl: string): Promise<void> {
  // 1. Limpiar is_featured de todos los trabajos del pro
  await supabase
    .from('work_portfolio')
    .update({ is_featured: false })
    .eq('professional_id', proId)

  // 2. Marcar el trabajo elegido como destacado
  await supabase
    .from('work_portfolio')
    .update({ is_featured: true })
    .eq('id', itemId)

  // 3. Actualizar featured_photo_url en professionals
  await supabase
    .from('professionals')
    .update({ featured_photo_url: featuredPhotoUrl })
    .eq('id', proId)
},
```

- [ ] **Step 3: Verificar build**

```bash
npm run build
```

Expected: 0 errores.

- [ ] **Step 4: Commit**

```bash
git add src/services/registrationService.ts
git commit -m "feat: registrationService — updatePortfolioItem y toggleFeatured"
```

---

## Task 3: PortfolioItemCard + PortfolioItemForm

**Files:**
- Create: `src/components/pro/portfolio/PortfolioItemCard.tsx`
- Create: `src/components/pro/portfolio/PortfolioItemForm.tsx`

**Interfaces:**
- Consumes: `PortfolioItem`, `WorkPhoto`, `PhotoType` de `src/types/registration.ts`; `registrationService.uploadFile`, `updatePortfolioItem`, `toggleFeatured`; `ALL_TRADES` de `src/lib/categories.ts`; `useAuthStore`
- Produces:
  - `<PortfolioItemCard item={PortfolioItem} onEdit={() => void} onDelete={() => void} />` 
  - `<PortfolioItemForm item={PortfolioItem | null} proId={string} onSave={(item: PortfolioItem) => void} onClose={() => void} prefill?: { category, description, request_id } />`

- [ ] **Step 1: Crear directorio**

```bash
mkdir -p src/components/pro/portfolio
```

- [ ] **Step 2: Crear `src/components/pro/portfolio/PortfolioItemCard.tsx`**

```tsx
import { Star } from 'lucide-react'
import { getCategoryMeta } from '../../../lib/categories'
import type { PortfolioItem, WorkPhoto } from '../../../types/registration'

function getPrimaryPhoto(photos: WorkPhoto[]): string | null {
  return (
    photos.find((p) => p.type === 'after')?.url ??
    photos.find((p) => p.type === 'general')?.url ??
    photos[0]?.url ??
    null
  )
}

interface Props {
  item: PortfolioItem
  onEdit: () => void
  onDelete: () => void
}

export function PortfolioItemCard({ item, onEdit, onDelete }: Props) {
  const { emoji, label } = getCategoryMeta(item.category ?? '')
  const photo = getPrimaryPhoto(item.photos)

  return (
    <div
      className="rounded-2xl overflow-hidden relative"
      style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}
    >
      {/* Foto */}
      <div className="relative" style={{ aspectRatio: '4/3', background: '#F5F0E8' }}>
        {photo ? (
          <img src={photo} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">📷</div>
        )}
        {item.is_featured && (
          <div
            className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold"
            style={{ background: '#E8683A', color: '#fff' }}
          >
            <Star size={9} fill="currentColor" /> Destacado
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="font-bold text-sm truncate" style={{ color: '#111111' }}>{item.title}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[11px]" style={{ color: '#888' }}>
            {emoji} {label}
            {item.work_date && ` · ${new Date(item.work_date).toLocaleDateString('es', { month: 'short', year: 'numeric' })}`}
          </span>
          <span className="text-[10px]" style={{ color: '#AAA' }}>
            {item.photos.length} foto{item.photos.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={onEdit}
            className="flex-1 py-1.5 rounded-xl text-xs font-bold"
            style={{ background: '#FEF0EA', color: '#E8683A', border: '1px solid #FDDCC8' }}
          >
            ✏️ Editar
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex-1 py-1.5 rounded-xl text-xs font-bold"
            style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}
          >
            🗑️ Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Crear `src/components/pro/portfolio/PortfolioItemForm.tsx`**

```tsx
import { useState } from 'react'
import { registrationService } from '../../../services/registrationService'
import { ALL_TRADES } from '../../../lib/categories'
import type { PortfolioItem, WorkPhoto, PhotoType } from '../../../types/registration'
import { X } from 'lucide-react'

interface Props {
  item: PortfolioItem | null
  proId: string
  onSave: (item: PortfolioItem) => void
  onClose: () => void
  prefill?: { category?: string | null; description?: string | null; request_id?: string | null }
}

export function PortfolioItemForm({ item, proId, onSave, onClose, prefill }: Props) {
  const [title, setTitle]       = useState(item?.title ?? '')
  const [category, setCategory] = useState(item?.category ?? prefill?.category ?? '')
  const [description, setDesc]  = useState(item?.description ?? prefill?.description ?? '')
  const [workDate, setWorkDate] = useState(item?.work_date ?? '')
  const [location, setLocation] = useState(item?.location ?? '')
  const [featured, setFeatured] = useState(item?.is_featured ?? false)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  // Fotos nuevas a subir por tipo
  const [newPhotos, setNewPhotos] = useState<Record<PhotoType, File[]>>({
    general: [], before: [], after: [],
  })

  // Fotos ya guardadas (para edición)
  const [existingPhotos] = useState<WorkPhoto[]>(item?.photos ?? [])

  async function handleSave() {
    if (!title.trim()) { setError('El título es obligatorio'); return }
    if (!category) { setError('Seleccioná una categoría'); return }
    const totalPhotos = existingPhotos.length + Object.values(newPhotos).flat().length
    if (totalPhotos === 0) { setError('Subí al menos una foto'); return }

    setSaving(true)
    setError('')
    try {
      // Subir fotos nuevas
      const uploadedPhotos: WorkPhoto[] = [...existingPhotos]
      for (const type of ['general', 'before', 'after'] as PhotoType[]) {
        for (const file of newPhotos[type]) {
          const url = await registrationService.uploadFile('pro-portfolio', proId, file)
          uploadedPhotos.push({ url, type })
        }
      }

      const data = {
        title,
        category,
        description: description || null,
        work_date: workDate || null,
        location: location || null,
        photos: uploadedPhotos,
        photo_urls: uploadedPhotos.map((p) => p.url), // legacy
        request_id: item?.request_id ?? prefill?.request_id ?? null,
        is_featured: featured,
      }

      let saved: PortfolioItem
      if (item) {
        saved = await registrationService.updatePortfolioItem(item.id, data)
      } else {
        saved = await registrationService.addPortfolioItem(proId, data as Parameters<typeof registrationService.addPortfolioItem>[1])
      }

      // Si se marcó como destacado, actualizar featured_photo_url
      if (featured) {
        const firstPhoto = uploadedPhotos[0]?.url ?? null
        if (firstPhoto) await registrationService.toggleFeatured(proId, saved.id, firstPhoto)
      }

      onSave(saved)
    } catch (e) {
      setError('Error al guardar el trabajo')
    } finally {
      setSaving(false)
    }
  }

  const PHOTO_TYPES: { type: PhotoType; label: string }[] = [
    { type: 'general', label: 'Fotos generales *' },
    { type: 'before',  label: 'Fotos antes (opcional)' },
    { type: 'after',   label: 'Fotos después (opcional)' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div
        className="rounded-t-3xl flex flex-col overflow-y-auto"
        style={{ background: '#F5F0E8', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3" style={{ borderBottom: '1px solid #E8E0D4' }}>
          <h2 className="font-black text-lg" style={{ color: '#111' }}>
            {item ? 'Editar trabajo' : 'Nuevo trabajo'}
          </h2>
          <button type="button" onClick={onClose}><X size={20} style={{ color: '#888' }} /></button>
        </div>

        <div className="flex flex-col gap-4 px-5 py-4 pb-10">
          {/* Título */}
          <div>
            <label className="block text-xs font-bold mb-1" style={{ color: '#555' }}>Título *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Instalación eléctrica completa"
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
              style={{ border: '1.5px solid #E8E0D4', background: '#fff' }}
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-xs font-bold mb-1" style={{ color: '#555' }}>Categoría *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
              style={{ border: '1.5px solid #E8E0D4', background: '#fff' }}
            >
              <option value="">Seleccioná...</option>
              {ALL_TRADES.map(({ value, label, emoji }) => (
                <option key={value} value={value}>{emoji} {label}</option>
              ))}
            </select>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-bold mb-1" style={{ color: '#555' }}>
              Descripción <span style={{ color: '#AAA' }}>({description.length}/300)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDesc(e.target.value.slice(0, 300))}
              rows={3}
              placeholder="Describí brevemente el trabajo realizado..."
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none"
              style={{ border: '1.5px solid #E8E0D4', background: '#fff' }}
            />
          </div>

          {/* Fecha y Ubicación */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-bold mb-1" style={{ color: '#555' }}>Fecha aprox.</label>
              <input
                type="date"
                value={workDate}
                onChange={(e) => setWorkDate(e.target.value)}
                className="w-full px-3 py-3 rounded-xl border text-sm outline-none"
                style={{ border: '1.5px solid #E8E0D4', background: '#fff' }}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold mb-1" style={{ color: '#555' }}>Ubicación</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ej: Pocitos"
                className="w-full px-3 py-3 rounded-xl border text-sm outline-none"
                style={{ border: '1.5px solid #E8E0D4', background: '#fff' }}
              />
            </div>
          </div>

          {/* Fotos por tipo */}
          {PHOTO_TYPES.map(({ type, label }) => (
            <div key={type}>
              <label className="block text-xs font-bold mb-1" style={{ color: '#555' }}>{label}</label>
              {existingPhotos.filter((p) => p.type === type).length > 0 && (
                <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
                  {existingPhotos.filter((p) => p.type === type).map((p, i) => (
                    <img key={i} src={p.url} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                  ))}
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setNewPhotos((prev) => ({ ...prev, [type]: Array.from(e.target.files ?? []) }))}
                className="w-full text-sm"
              />
              {newPhotos[type].length > 0 && (
                <p className="text-[11px] mt-1" style={{ color: '#888' }}>{newPhotos[type].length} foto(s) nueva(s)</p>
              )}
            </div>
          ))}

          {/* Destacado */}
          <label
            className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer"
            style={{ background: '#fff', border: featured ? '2px solid #E8683A' : '1.5px solid #E8E0D4' }}
          >
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-5 h-5 accent-orange-500"
            />
            <div>
              <p className="font-bold text-sm" style={{ color: '#111' }}>📌 Marcar como trabajo destacado</p>
              <p className="text-xs" style={{ color: '#888' }}>Aparecerá en tu perfil público y en los resultados de búsqueda</p>
            </div>
          </label>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 rounded-2xl font-black text-white"
            style={{ background: saving ? '#ccc' : '#E8683A' }}
          >
            {saving ? 'Guardando...' : item ? 'Guardar cambios' : 'Agregar trabajo'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verificar build**

```bash
npm run build
```

Expected: 0 errores.

- [ ] **Step 5: Commit**

```bash
git add src/components/pro/portfolio/
git commit -m "feat: PortfolioItemCard y PortfolioItemForm con fotos tipadas"
```

---

## Task 4: ProPortfolio + tab en ProProfile

**Files:**
- Create: `src/components/pro/portfolio/ProPortfolio.tsx`
- Modify: `src/pages/pro/ProProfile.tsx`

**Interfaces:**
- Consumes: `PortfolioItemCard`, `PortfolioItemForm`, `registrationService.getPortfolio`, `deletePortfolioItem`; `useAuthStore`
- Produces: `<ProPortfolio />` sin props — tab "Mis Trabajos" en ProProfile

- [ ] **Step 1: Crear `src/components/pro/portfolio/ProPortfolio.tsx`**

```tsx
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
```

- [ ] **Step 2: Agregar tabs en `src/pages/pro/ProProfile.tsx`**

Leer el archivo actual. Localizar el JSX principal (después del header/hero) y envolver el contenido existente en una tab "Mis Datos", agregando una segunda tab "Mis Trabajos" que renderiza `<ProPortfolio />`.

Agregar al inicio del archivo:
```tsx
import { ProPortfolio } from '../../components/pro/portfolio/ProPortfolio'
```

Dentro del componente `ProProfile`, agregar estado de tab:
```tsx
const [activeTab, setActiveTab] = useState<'datos' | 'trabajos'>('datos')
```

Agregar el selector de tabs después del header (antes del contenido existente):
```tsx
{/* Tabs */}
<div className="flex border-b" style={{ borderColor: '#E8E0D4', background: '#fff' }}>
  {(['datos', 'trabajos'] as const).map((tab) => (
    <button
      key={tab}
      type="button"
      onClick={() => setActiveTab(tab)}
      className="flex-1 py-3 text-sm font-bold capitalize transition-colors"
      style={{
        color: activeTab === tab ? '#E8683A' : '#AAAAAA',
        borderBottom: activeTab === tab ? '2px solid #E8683A' : '2px solid transparent',
      }}
    >
      {tab === 'datos' ? 'Mis Datos' : 'Mis Trabajos'}
    </button>
  ))}
</div>

{/* Contenido de tab */}
{activeTab === 'datos' ? (
  <div>{/* contenido existente de ProProfile */}</div>
) : (
  <ProPortfolio />
)}
```

- [ ] **Step 3: Verificar en browser**

```bash
npm run dev
```

Navegar a `/pro/perfil` como profesional. Verificar:
1. Tabs "Mis Datos" / "Mis Trabajos" visibles
2. Tab "Mis Trabajos" muestra grid vacío con botón "Agregar"
3. Al presionar "Agregar" abre el formulario
4. Se puede guardar un trabajo con fotos

- [ ] **Step 4: Verificar build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/components/pro/portfolio/ProPortfolio.tsx src/pages/pro/ProProfile.tsx
git commit -m "feat: ProPortfolio con gestión completa + tabs en ProProfile"
```

---

## Task 5: PortfolioWorkModal + sección galería en perfil público

**Files:**
- Create: `src/components/pro/portfolio/PortfolioWorkModal.tsx`
- Modify: `src/components/professionals/ProfessionalProfile.tsx`
- Modify: `src/pages/ProfessionalDetail.tsx`

**Interfaces:**
- Consumes: `PortfolioItem`, `WorkPhoto` de `src/types/registration.ts`; `registrationService.getPortfolio`; `ProfessionalWithProfile` de `src/hooks/useProfessionals.ts`
- Produces: galería pública en `/profesional/:id` con foto destacada en hero

- [ ] **Step 1: Crear `src/components/pro/portfolio/PortfolioWorkModal.tsx`**

```tsx
import { useState } from 'react'
import { X } from 'lucide-react'
import { getCategoryMeta } from '../../../lib/categories'
import type { PortfolioItem, WorkPhoto, PhotoType } from '../../../types/registration'

interface Props {
  item: PortfolioItem
  onClose: () => void
}

const TAB_LABELS: Record<PhotoType, string> = {
  general: 'General',
  before:  'Antes',
  after:   'Después',
}

export function PortfolioWorkModal({ item, onClose }: Props) {
  const { emoji, label } = getCategoryMeta(item.category ?? '')
  const types = (['general', 'before', 'after'] as PhotoType[]).filter(
    (t) => item.photos.some((p) => p.type === t)
  )
  const [activeType, setActiveType] = useState<PhotoType>(types[0] ?? 'general')
  const [activeIdx, setActiveIdx] = useState(0)

  const visiblePhotos = item.photos.filter((p) => p.type === activeType)

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div
        className="rounded-t-3xl overflow-y-auto"
        style={{ background: '#F5F0E8', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3">
          <div className="flex-1">
            <p className="font-black text-lg" style={{ color: '#111' }}>{item.title}</p>
            <p className="text-xs mt-0.5" style={{ color: '#888' }}>
              {emoji} {label}
              {item.work_date && ` · ${new Date(item.work_date).toLocaleDateString('es', { month: 'long', year: 'numeric' })}`}
              {item.location && ` · ${item.location}`}
            </p>
          </div>
          <button type="button" onClick={onClose} className="ml-3 mt-0.5">
            <X size={20} style={{ color: '#888' }} />
          </button>
        </div>

        {/* Descripción */}
        {item.description && (
          <p className="px-5 pb-3 text-sm leading-relaxed" style={{ color: '#555' }}>{item.description}</p>
        )}

        {/* Tabs de tipo */}
        {types.length > 1 && (
          <div className="flex px-5 gap-2 mb-3">
            {types.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setActiveType(t); setActiveIdx(0) }}
                className="px-3 py-1.5 rounded-full text-xs font-bold"
                style={{
                  background: activeType === t ? '#E8683A' : '#fff',
                  color: activeType === t ? '#fff' : '#555',
                  border: activeType === t ? 'none' : '1.5px solid #E8E0D4',
                }}
              >
                {TAB_LABELS[t]}
              </button>
            ))}
          </div>
        )}

        {/* Foto principal */}
        {visiblePhotos.length > 0 && (
          <div className="px-5">
            <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: '4/3', background: '#EDE8DE' }}>
              <img
                src={visiblePhotos[activeIdx]?.url}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Thumbnails */}
        {visiblePhotos.length > 1 && (
          <div className="flex gap-2 px-5 mt-3 overflow-x-auto pb-1">
            {visiblePhotos.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIdx(i)}
                className="flex-shrink-0 rounded-xl overflow-hidden"
                style={{
                  width: 56, height: 56,
                  border: activeIdx === i ? '2px solid #E8683A' : '2px solid transparent',
                }}
              >
                <img src={p.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="h-8" />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Agregar hook `usePortfolio` en `src/hooks/useProfessionals.ts`**

Al final del archivo existente, agregar:

```typescript
import { registrationService } from '../services/registrationService'
import type { PortfolioItem } from '../types/registration'

export function useProfessionalPortfolio(professionalId: string) {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!professionalId) return
    setLoading(true)
    registrationService.getPortfolio(professionalId)
      .then(setPortfolio)
      .catch(() => setPortfolio([]))
      .finally(() => setLoading(false))
  }, [professionalId])

  return { portfolio, loading }
}
```

- [ ] **Step 3: Actualizar `src/pages/ProfessionalDetail.tsx`**

Reemplazar el contenido completo con:

```tsx
import { useParams } from 'react-router-dom'
import { ProfessionalProfile } from '../components/professionals/ProfessionalProfile'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { useProfessionalById, useProfessionalPhotos, useProfessionalPortfolio } from '../hooks/useProfessionals'

export default function ProfessionalDetail() {
  const { id } = useParams<{ id: string }>()
  const { professional, loading, error } = useProfessionalById(id ?? '')
  const { photos } = useProfessionalPhotos(id ?? '')
  const { portfolio } = useProfessionalPortfolio(id ?? '')

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#F5F0E8]">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !professional) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F0E8] gap-3 px-6 text-center">
        <div className="text-4xl">😕</div>
        <p className="font-bold text-[#111111]">Profesional no encontrado</p>
        <p className="text-sm text-[#555]">{error ?? 'No pudimos cargar este perfil'}</p>
      </div>
    )
  }

  return <ProfessionalProfile professional={professional} photos={photos} portfolio={portfolio} />
}
```

- [ ] **Step 4: Actualizar `src/components/professionals/ProfessionalProfile.tsx`**

**A)** Agregar import y prop al componente:

```tsx
import { useState } from 'react'  // ya existe
import { PortfolioWorkModal } from '../pro/portfolio/PortfolioWorkModal'
import type { PortfolioItem } from '../../types/registration'
```

**B)** Agregar `portfolio` a los props del componente:

```tsx
// Cambiar la firma de ProfessionalProfile de:
function ProfessionalProfile({ professional, photos }: { professional: ProfessionalWithProfile; photos: WorkPhoto[] })
// a:
function ProfessionalProfile({ professional, photos, portfolio = [] }: { professional: ProfessionalWithProfile; photos: WorkPhoto[]; portfolio: PortfolioItem[] })
```

**C)** Agregar estado para modal:

```tsx
const [selectedWork, setSelectedWork] = useState<PortfolioItem | null>(null)
```

**D)** Agregar foto destacada en el hero. Localizar el bloque del hero (gradiente de fondo) y agregar ANTES del gradiente actual:

```tsx
{/* Hero con foto destacada si existe */}
{professional.featured_photo_url ? (
  <div className="relative w-full" style={{ height: 200 }}>
    <img
      src={professional.featured_photo_url}
      alt="Trabajo destacado"
      className="w-full h-full object-cover"
    />
    <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6))' }} />
  </div>
) : (
  /* gradiente existente — sin cambios */
)}
```

**E)** Agregar sección "Trabajos realizados" ANTES de la sección de reseñas. Buscar la sección de reseñas y agregar antes:

```tsx
{/* Trabajos realizados */}
{portfolio.length > 0 && (
  <div className="flex flex-col gap-3">
    <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#555' }}>
      Trabajos realizados
    </h3>
    <div className="grid grid-cols-2 gap-2">
      {portfolio.slice(0, 6).map((item) => {
        const mainPhoto = item.photos.find((p) => p.type === 'after')?.url
          ?? item.photos.find((p) => p.type === 'general')?.url
          ?? item.photos[0]?.url
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelectedWork(item)}
            className="rounded-xl overflow-hidden"
            style={{ aspectRatio: '1', background: '#EDE8DE' }}
          >
            {mainPhoto ? (
              <img src={mainPhoto} alt={item.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">📷</div>
            )}
          </button>
        )
      })}
    </div>
    {portfolio.length > 6 && (
      <p className="text-xs text-center font-bold" style={{ color: '#E8683A' }}>
        +{portfolio.length - 6} trabajos más
      </p>
    )}
  </div>
)}

{/* Modal galería */}
{selectedWork && (
  <PortfolioWorkModal
    item={selectedWork}
    onClose={() => setSelectedWork(null)}
  />
)}
```

- [ ] **Step 5: Verificar en browser**

```bash
npm run dev
```

Navegar a `/profesional/:id`. Verificar:
1. Si el pro tiene `featured_photo_url`: aparece foto de fondo en hero
2. Sección "Trabajos realizados" muestra grid de fotos
3. Al tocar una foto: abre modal con tabs Antes/Después/General
4. Sin trabajos: sección no aparece (condicional)

- [ ] **Step 6: Verificar build**

```bash
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add src/components/pro/portfolio/PortfolioWorkModal.tsx src/hooks/useProfessionals.ts src/pages/ProfessionalDetail.tsx src/components/professionals/ProfessionalProfile.tsx
git commit -m "feat: galería de trabajos en perfil público con hero foto destacada"
```

---

## Task 6: Botón "Agregar a portfolio" en solicitudes completadas

**Files:**
- Modify: `src/pages/SolicitudDetail.tsx`

**Interfaces:**
- Consumes: `PortfolioItemForm` de `src/components/pro/portfolio/PortfolioItemForm.tsx`; `useAuthStore`; `ServiceRequest` de `src/store/requestStore.ts`
- Produces: botón "Agregar a mi portfolio" visible en solicitudes completadas para el profesional

- [ ] **Step 1: Leer `src/pages/SolicitudDetail.tsx`**

Leer el archivo completo para entender la estructura actual.

- [ ] **Step 2: Agregar import y estado**

Agregar imports al inicio:

```tsx
import { useState } from 'react'   // probablemente ya existe
import { PortfolioItemForm } from '../components/pro/portfolio/PortfolioItemForm'
import { useAuthStore } from '../store/authStore'
```

Agregar estado dentro del componente:

```tsx
const user = useAuthStore((s) => s.user)
const [showPortfolioForm, setShowPortfolioForm] = useState(false)
const [portfolioAdded, setPortfolioAdded] = useState(false)
```

- [ ] **Step 3: Agregar botón en el JSX**

Dentro del JSX de `SolicitudDetail`, localizar donde se muestra el estado "completado" y agregar DEBAJO:

```tsx
{solicitud?.status === 'completed' && user?.role === 'professional' && !portfolioAdded && (
  <button
    type="button"
    onClick={() => setShowPortfolioForm(true)}
    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold"
    style={{ background: '#FEF0EA', color: '#E8683A', border: '1.5px solid #FDDCC8' }}
  >
    📸 Agregar a mi portfolio
  </button>
)}

{portfolioAdded && (
  <div
    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold"
    style={{ background: '#F0FDF4', color: '#0F6E56', border: '1.5px solid #86EFAC' }}
  >
    ✓ Trabajo agregado al portfolio
  </div>
)}

{showPortfolioForm && user?.id && (
  <PortfolioItemForm
    item={null}
    proId={user.id}
    prefill={{
      category: solicitud?.category ?? null,
      description: solicitud?.description ?? null,
      request_id: solicitud?.id ?? null,
    }}
    onSave={() => { setPortfolioAdded(true); setShowPortfolioForm(false) }}
    onClose={() => setShowPortfolioForm(false)}
  />
)}
```

- [ ] **Step 4: Verificar en browser**

```bash
npm run dev
```

Navegar a una solicitud completada como profesional. Verificar:
1. Botón "📸 Agregar a mi portfolio" visible
2. Al presionar: abre formulario pre-rellenado con categoría y descripción
3. Al guardar: botón se reemplaza por "✓ Trabajo agregado al portfolio"

- [ ] **Step 5: Verificar build**

```bash
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add src/pages/SolicitudDetail.tsx
git commit -m "feat: botón Agregar a portfolio en solicitudes completadas"
```
