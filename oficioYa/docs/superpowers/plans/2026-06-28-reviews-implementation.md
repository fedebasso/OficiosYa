# Reviews Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar las reseñas mock por reseñas reales en Supabase, con foto del trabajo, y mostrarlas en perfil del profesional, cards de búsqueda y home.

**Architecture:** Se crea la tabla `reviews` en Supabase con RLS, un `reviewService` para las operaciones, un `ReviewSheet` que se muestra automáticamente al completar un trabajo, y se actualiza la UI en tres lugares: perfil del profesional, cards y home.

**Tech Stack:** React + TypeScript + Supabase JS SDK + framer-motion

## Global Constraints

- Solo clientes con trabajo en estado `completed` pueden dejar reseña
- Una reseña por trabajo (`UNIQUE(request_id)`)
- Foto máx 5MB, formatos jpg/png/webp — bucket `review-photos` (público)
- RLS: solo el `client_id` puede insertar su propia reseña; lectura pública
- `avg_rating` se redondea a 1 decimal en la UI
- No agregar dependencias nuevas de producción
- Marcar en `localStorage` la key `reviewed_<requestId>` al enviar o cerrar el sheet

---

### Task 1: Crear tabla reviews en Supabase y reviewService

**Files:**
- Create: `src/services/reviewService.ts`

**Interfaces:**
- Produces:
  ```ts
  export interface Review {
    id: string
    created_at: string
    request_id: string
    client_id: string
    professional_id: string
    rating: number
    comment: string | null
    photo_url: string | null
    profiles?: { full_name: string; avatar_url: string | null }
  }

  export const reviewService = {
    async submit(params: {
      requestId: string
      clientId: string
      professionalId: string
      rating: number
      comment: string
      photoFile: File | null
    }): Promise<void>

    async fetchByProfessional(professionalId: string): Promise<Review[]>

    async refreshProfessionalRating(professionalId: string): Promise<void>
  }
  ```

- [ ] **Step 1: Crear la tabla en Supabase**

Ejecutar este SQL en el SQL Editor de Supabase (Dashboard → SQL Editor):

```sql
-- Tabla reviews
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  request_id uuid not null references public.requests(id) on delete cascade,
  client_id uuid not null references public.profiles(id) on delete cascade,
  professional_id uuid not null references public.profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  photo_url text,
  constraint reviews_request_id_key unique (request_id)
);

-- RLS
alter table public.reviews enable row level security;

create policy "Lectura pública de reseñas"
  on public.reviews for select
  using (true);

create policy "Cliente inserta su propia reseña"
  on public.reviews for insert
  with check (auth.uid() = client_id);

-- Índice para queries por profesional
create index if not exists reviews_professional_id_idx on public.reviews(professional_id);

-- Función RPC para recalcular rating del profesional
create or replace function refresh_professional_rating(pro_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.professionals
  set
    avg_rating = (select round(avg(rating)::numeric, 1) from public.reviews where professional_id = pro_id),
    jobs_count = (select count(*) from public.reviews where professional_id = pro_id)
  where id = pro_id;
end;
$$;
```

- [ ] **Step 2: Crear bucket en Supabase Storage**

En Dashboard → Storage → New bucket:
- Nombre: `review-photos`
- Public: ✓

- [ ] **Step 3: Crear `src/services/reviewService.ts`**

```ts
import { supabase } from '../lib/supabase'

export interface Review {
  id: string
  created_at: string
  request_id: string
  client_id: string
  professional_id: string
  rating: number
  comment: string | null
  photo_url: string | null
  profiles?: { full_name: string; avatar_url: string | null }
}

export const reviewService = {
  async submit({
    requestId,
    clientId,
    professionalId,
    rating,
    comment,
    photoFile,
  }: {
    requestId: string
    clientId: string
    professionalId: string
    rating: number
    comment: string
    photoFile: File | null
  }): Promise<void> {
    let photo_url: string | null = null

    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const path = `${professionalId}/${requestId}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('review-photos')
        .upload(path, photoFile, { upsert: true })
      if (!uploadError) {
        const { data } = supabase.storage.from('review-photos').getPublicUrl(path)
        photo_url = data.publicUrl
      }
    }

    const { error } = await supabase.from('reviews').insert({
      request_id: requestId,
      client_id: clientId,
      professional_id: professionalId,
      rating,
      comment: comment.trim() || null,
      photo_url,
    })
    if (error) throw error

    await reviewService.refreshProfessionalRating(professionalId)
  },

  async fetchByProfessional(professionalId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles(full_name, avatar_url)')
      .eq('professional_id', professionalId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []) as Review[]
  },

  async refreshProfessionalRating(professionalId: string): Promise<void> {
    await supabase.rpc('refresh_professional_rating', { pro_id: professionalId })
  },
}
```

- [ ] **Step 4: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Expected: sin errores.

- [ ] **Step 5: Commit**

```bash
git add src/services/reviewService.ts
git commit -m "feat: add reviewService with Supabase integration"
```

---

### Task 2: Crear ReviewSheet (bottom sheet con foto upload)

**Files:**
- Create: `src/components/requests/ReviewSheet.tsx`

**Interfaces:**
- Consumes: `reviewService.submit()` de Task 1
- Produces:
  ```ts
  interface ReviewSheetProps {
    requestId: string
    clientId: string
    professionalId: string
    professionalName: string
    onClose: () => void
  }
  export function ReviewSheet(props: ReviewSheetProps): JSX.Element
  ```

- [ ] **Step 1: Crear `src/components/requests/ReviewSheet.tsx`**

```tsx
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Camera } from 'lucide-react'
import { reviewService } from '../../services/reviewService'

interface Props {
  requestId: string
  clientId: string
  professionalId: string
  professionalName: string
  onClose: () => void
}

const LABELS = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', '¡Excelente!']

export function ReviewSheet({ requestId, clientId, professionalId, professionalName, onClose }: Props) {
  const [rating, setRating]   = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [photo, setPhoto]     = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert('La foto no puede superar 5MB'); return }
    setPhoto(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (rating === 0) return
    setLoading(true)
    try {
      await reviewService.submit({ requestId, clientId, professionalId, rating, comment, photoFile: photo })
      localStorage.setItem(`reviewed_${requestId}`, '1')
      setDone(true)
    } catch {
      alert('Error al enviar la reseña. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    localStorage.setItem(`reviewed_${requestId}`, '1')
    onClose()
  }

  if (done) return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <div className="text-5xl">⭐</div>
      <p className="font-black text-lg" style={{ color: '#111' }}>¡Gracias por tu reseña!</p>
      <p className="text-sm" style={{ color: '#999' }}>Tu opinión ayuda a otros clientes a elegir mejor</p>
      <button type="button" onClick={onClose}
        className="mt-2 px-6 py-2.5 rounded-xl font-bold text-white text-sm"
        style={{ background: '#E8683A' }}>
        Cerrar
      </button>
    </div>
  )

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: '#E8683A' }}>
            Calificar servicio
          </p>
          <h3 className="text-base font-black" style={{ color: '#111' }}>
            ¿Cómo fue el trabajo de {professionalName}?
          </h3>
        </div>
        <button type="button" onClick={handleClose}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: '#F5F0E8', border: '1.5px solid #E8E0D4' }}>
          <X size={14} style={{ color: '#555' }} />
        </button>
      </div>

      {/* Estrellas */}
      <div className="flex justify-center gap-3">
        {[1,2,3,4,5].map((i) => {
          const active = i <= (hovered || rating)
          return (
            <button key={i} type="button"
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(i)}
              style={{ transform: active ? 'scale(1.2)' : 'scale(1)', transition: 'transform .15s ease' }}>
              <span className="text-3xl" style={{ color: active ? '#E8683A' : '#E8E0D4', transition: 'color .12s' }}>★</span>
            </button>
          )
        })}
      </div>

      {rating > 0 && (
        <p className="text-center text-xs font-bold" style={{ color: '#E8683A' }}>{LABELS[rating]}</p>
      )}

      {/* Comentario */}
      <textarea value={comment} onChange={(e) => setComment(e.target.value)}
        rows={3} placeholder="Contá tu experiencia (opcional)..."
        className="w-full rounded-xl px-3.5 py-3 text-sm resize-none focus:outline-none"
        style={{ background: '#F5F0E8', border: '1.5px solid #E8E0D4', color: '#111', caretColor: '#E8683A' }}
      />

      {/* Foto del trabajo */}
      <div>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp"
          className="hidden" onChange={handlePhoto} />
        {preview ? (
          <div className="relative rounded-xl overflow-hidden" style={{ height: 140 }}>
            <img src={preview} alt="foto del trabajo" className="w-full h-full object-cover" />
            <button type="button" onClick={() => { setPhoto(null); setPreview(null) }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.6)' }}>
              <X size={13} color="#fff" />
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => inputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold"
            style={{ background: '#F5F0E8', border: '1.5px dashed #E8E0D4', color: '#999' }}>
            <Camera size={16} /> Agregar foto del trabajo (opcional)
          </button>
        )}
      </div>

      {/* Acciones */}
      <div className="flex gap-2.5">
        <button type="button" onClick={handleClose}
          className="flex-1 rounded-xl py-3 text-sm font-bold"
          style={{ background: '#EDE8DE', color: '#555', border: '1.5px solid #E8E0D4' }}>
          Ahora no
        </button>
        <button type="button" onClick={handleSubmit}
          disabled={rating === 0 || loading}
          className="flex-1 rounded-xl py-3 text-sm font-bold text-white disabled:opacity-40"
          style={{ background: rating > 0 ? '#E8683A' : '#E8E0D4', boxShadow: rating > 0 ? '0 4px 14px rgba(232,104,58,.25)' : 'none' }}>
          {loading ? 'Enviando...' : 'Enviar reseña'}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/requests/ReviewSheet.tsx
git commit -m "feat: add ReviewSheet bottom sheet with photo upload"
```

---

### Task 3: Disparar ReviewSheet desde SolicitudDetail

**Files:**
- Modify: `src/pages/SolicitudDetail.tsx`

**Interfaces:**
- Consumes: `ReviewSheet` de Task 2

- [ ] **Step 1: Agregar import de ReviewSheet**

En `src/pages/SolicitudDetail.tsx`, agregar:

```tsx
import { ReviewSheet } from '../components/requests/ReviewSheet'
```

- [ ] **Step 2: Agregar lógica de auto-show**

Dentro del componente `SolicitudDetail`, después de obtener `req`, agregar:

```tsx
const alreadyReviewed = !!localStorage.getItem(`reviewed_${req?.id}`)
const [showReviewSheet, setShowReviewSheet] = useState(
  req?.status === 'completed' && !alreadyReviewed && user?.role === 'client'
)
```

- [ ] **Step 3: Agregar el bottom sheet al JSX**

Al final del return, antes del último `</PageShell>`, agregar el overlay del ReviewSheet:

```tsx
{/* ReviewSheet overlay */}
<AnimatePresence>
  {showReviewSheet && req && user && (
    <motion.div
      key="review-sheet"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={() => setShowReviewSheet(false)}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
        className="w-full rounded-t-3xl p-6"
        style={{ background: '#FFFFFF', maxWidth: 480 }}
        onClick={(e) => e.stopPropagation()}
      >
        <ReviewSheet
          requestId={req.id}
          clientId={user.id}
          professionalId={req.professional_id ?? ''}
          professionalName="el profesional"
          onClose={() => setShowReviewSheet(false)}
        />
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

- [ ] **Step 4: Agregar botón manual "Dejar reseña" cuando status = completed**

En la sección de acciones de la solicitud completada, agregar botón:

```tsx
{req.status === 'completed' && user?.role === 'client' && !alreadyReviewed && (
  <button
    type="button"
    onClick={() => setShowReviewSheet(true)}
    className="w-full rounded-2xl py-3.5 text-sm font-bold text-white"
    style={{ background: '#E8683A', boxShadow: '0 4px 14px rgba(232,104,58,.25)' }}
  >
    ⭐ Dejar reseña
  </button>
)}
```

- [ ] **Step 5: Verificar en browser**

Abrir `http://localhost:5173`, navegar a una solicitud con status `completed`. Debe aparecer el ReviewSheet automáticamente.

- [ ] **Step 6: Commit**

```bash
git add src/pages/SolicitudDetail.tsx
git commit -m "feat: auto-show ReviewSheet on completed requests"
```

---

### Task 4: ReviewCard y reseñas reales en ProfessionalProfile

**Files:**
- Create: `src/components/professionals/ReviewCard.tsx`
- Modify: `src/components/professionals/ProfessionalProfile.tsx`

**Interfaces:**
- Consumes: `reviewService.fetchByProfessional()` de Task 1, `Review` type de Task 1

- [ ] **Step 1: Crear `src/components/professionals/ReviewCard.tsx`**

```tsx
import { getInitials } from '../../lib/utils'
import type { Review } from '../../services/reviewService'

interface Props { review: Review }

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'hoy'
  if (days === 1) return 'ayer'
  if (days < 7) return `hace ${days} días`
  if (days < 30) return `hace ${Math.floor(days / 7)} sem.`
  if (days < 365) return `hace ${Math.floor(days / 30)} meses`
  return `hace ${Math.floor(days / 365)} año${Math.floor(days / 365) > 1 ? 's' : ''}`
}

export function ReviewCard({ review }: Props) {
  const name = review.profiles?.full_name ?? 'Cliente'
  const initials = getInitials(name)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        {/* Avatar */}
        <div
          className="rounded-full flex items-center justify-center font-black text-white flex-shrink-0"
          style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #f5b99a, #E8683A)', fontSize: 13 }}
        >
          {review.profiles?.avatar_url
            ? <img src={review.profiles.avatar_url} alt={name} className="w-full h-full object-cover rounded-full" />
            : initials
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate" style={{ color: '#111' }}>{name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span style={{ fontSize: 11 }}>
              {[1,2,3,4,5].map(i => (
                <span key={i} style={{ color: i <= review.rating ? '#f59e0b' : '#ddd' }}>★</span>
              ))}
            </span>
            <span className="text-[10px]" style={{ color: '#999' }}>{timeAgo(review.created_at)}</span>
          </div>
        </div>
      </div>

      {review.comment && (
        <p className="text-sm leading-relaxed" style={{ color: '#555', paddingLeft: 44 }}>
          {review.comment}
        </p>
      )}

      {review.photo_url && (
        <div style={{ paddingLeft: 44 }}>
          <img
            src={review.photo_url}
            alt="foto del trabajo"
            className="rounded-xl object-cover"
            style={{ width: '100%', maxHeight: 200 }}
          />
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Reemplazar ReviewsSection en ProfessionalProfile.tsx**

En `src/components/professionals/ProfessionalProfile.tsx`:

1. Eliminar el bloque `MOCK_REVIEWS` y la función `ReviewsSection` existentes.

2. Agregar imports al inicio:

```tsx
import { useEffect, useState } from 'react'
import { reviewService, type Review } from '../../services/reviewService'
import { ReviewCard } from './ReviewCard'
```

3. Crear nueva función `ReviewsSection`:

```tsx
function ReviewsSection({ rating, professionalId }: { rating: number | null; professionalId: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    reviewService.fetchByProfessional(professionalId)
      .then(setReviews)
      .finally(() => setLoading(false))
  }, [professionalId])

  if (!rating && reviews.length === 0) return null

  const fullStars = Math.round(rating ?? 0)
  const bars = [5,4,3,2,1]
  const total = reviews.length
  const countByRating = (r: number) => reviews.filter(rv => rv.rating === r).length

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-black text-base" style={{ color: '#111', letterSpacing: '-0.3px' }}>
        Reseñas
      </h3>

      {rating && total > 0 && (
        <div className="flex gap-4 items-center p-4 rounded-2xl" style={{ background: '#FFFFFF', border: '1.5px solid #EDE8DE' }}>
          <div className="text-center flex-shrink-0">
            <div className="text-4xl font-black leading-none" style={{ color: '#111', letterSpacing: '-2px' }}>
              {rating.toFixed(1)}
            </div>
            <div className="mt-1.5">
              {[1,2,3,4,5].map(i => (
                <span key={i} style={{ color: i <= fullStars ? '#f59e0b' : '#ddd', fontSize: 12 }}>★</span>
              ))}
            </div>
            <div className="text-[9px] mt-1" style={{ color: '#999' }}>{total} reseña{total !== 1 ? 's' : ''}</div>
          </div>
          <div className="flex-1 flex flex-col gap-1">
            {bars.map((star) => {
              const count = countByRating(star)
              const pct = total > 0 ? (count / total) * 100 : 0
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-[10px] font-bold w-3" style={{ color: '#999' }}>{star}</span>
                  <div className="flex-1 rounded-full overflow-hidden" style={{ height: 5, background: '#EDE8DE' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#F59E0B' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {loading && <p className="text-sm text-center" style={{ color: '#999' }}>Cargando reseñas...</p>}

      {!loading && reviews.length === 0 && (
        <p className="text-sm text-center py-4" style={{ color: '#999' }}>Aún no tiene reseñas</p>
      )}

      <div className="flex flex-col gap-4">
        {reviews.map((r, i) => (
          <div key={r.id}>
            <ReviewCard review={r} />
            {i < reviews.length - 1 && <div style={{ height: 1, background: '#EDE8DE', marginTop: 16 }} />}
          </div>
        ))}
      </div>
    </div>
  )
}
```

4. Actualizar la llamada en el JSX (ya existente):

```tsx
<ReviewsSection rating={avg_rating} professionalId={id} />
```

- [ ] **Step 3: Verificar en browser**

Abrir un perfil de profesional en `http://localhost:5173/profesional/:id`. La sección de reseñas debe cargar desde Supabase (vacía si no hay datos aún).

- [ ] **Step 4: Commit**

```bash
git add src/components/professionals/ReviewCard.tsx src/components/professionals/ProfessionalProfile.tsx
git commit -m "feat: show real reviews in professional profile with photo support"
```

---

### Task 5: Rating + cantidad en ProfessionalCard

**Files:**
- Modify: `src/components/professionals/ProfessionalCard.tsx`

La card ya muestra `avg_rating` cuando no es null. Solo falta agregar la cantidad de reseñas.

- [ ] **Step 1: Actualizar el bloque de Rating en ProfessionalCard.tsx**

Reemplazar el bloque `{/* Rating */}`:

```tsx
{/* Rating */}
{avg_rating != null ? (
  <div className="flex items-center gap-0.5">
    <span style={{ color: '#F59E0B', fontSize: 'var(--text-base)' }}>★</span>
    <span className="font-black" style={{ color: '#111', fontSize: 'var(--text-base)', lineHeight: 1 }}>
      {avg_rating.toFixed(1)}
    </span>
    <span style={{ color: '#999', fontSize: 10, fontWeight: 600 }}>({jobs_count})</span>
  </div>
) : (
  <span style={{ fontSize: 10, color: '#CCC', fontWeight: 600 }}>Sin reseñas</span>
)}
```

- [ ] **Step 2: Verificar en browser**

Abrir `http://localhost:5173/buscar`. Las cards deben mostrar `★ 4.8 (12)` o `Sin reseñas`.

- [ ] **Step 3: Commit**

```bash
git add src/components/professionals/ProfessionalCard.tsx
git commit -m "feat: show rating count in ProfessionalCard"
```

---

### Task 6: Sección "Mejor calificados" en Home

**Files:**
- Create: `src/components/home/TopRated.tsx`
- Modify: `src/pages/Home.tsx`

**Interfaces:**
- Produces: `<TopRated />` — sección horizontal scrolleable con los 4 profesionales mejor calificados

- [ ] **Step 1: Crear `src/components/home/TopRated.tsx`**

```tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { getCategoryMeta } from '../../lib/categories'
import { getInitials } from '../../lib/utils'

interface TopPro {
  id: string
  avg_rating: number
  jobs_count: number
  categories: string[]
  zone: string
  profiles: { full_name: string; avatar_url: string | null }
}

export function TopRated() {
  const [pros, setPros] = useState<TopPro[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    supabase
      .from('professionals')
      .select('id, avg_rating, jobs_count, categories, zone, profiles(full_name, avatar_url)')
      .gte('avg_rating', 4.5)
      .gte('jobs_count', 3)
      .order('avg_rating', { ascending: false })
      .limit(4)
      .then(({ data }) => { if (data) setPros(data as unknown as TopPro[]) })
  }, [])

  if (pros.length === 0) return null

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-black text-base" style={{ color: '#111', letterSpacing: '-0.3px' }}>
        ⭐ Mejor calificados
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {pros.map((pro) => {
          const { emoji, avatarGradient, accent } = getCategoryMeta(pro.categories[0] ?? '')
          const initials = getInitials(pro.profiles.full_name)
          return (
            <button
              key={pro.id}
              type="button"
              onClick={() => navigate(`/profesional/${pro.id}`)}
              className="flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-2xl active:opacity-80 transition-opacity"
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #EDE8DE',
                width: 110,
                boxShadow: '0 1px 4px rgba(0,0,0,.06)',
              }}
            >
              <div
                className="rounded-2xl flex items-center justify-center font-black overflow-hidden"
                style={{ width: 52, height: 52, background: pro.profiles.avatar_url ? undefined : avatarGradient }}
              >
                {pro.profiles.avatar_url
                  ? <img src={pro.profiles.avatar_url} alt={pro.profiles.full_name} className="w-full h-full object-cover" />
                  : <span style={{ color: accent, fontSize: 18 }}>{initials}</span>
                }
              </div>
              <p className="text-xs font-bold text-center leading-tight truncate w-full" style={{ color: '#111' }}>
                {pro.profiles.full_name.split(' ')[0]}
              </p>
              <div className="flex items-center gap-0.5">
                <span style={{ color: '#F59E0B', fontSize: 11 }}>★</span>
                <span className="text-xs font-black" style={{ color: '#111' }}>{pro.avg_rating.toFixed(1)}</span>
              </div>
              <span className="text-[10px]" style={{ color: '#999' }}>{emoji} {pro.zone}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Agregar TopRated en Home.tsx**

Agregar el import:

```tsx
import { TopRated } from '../components/home/TopRated'
```

Y agregar `<TopRated />` dentro del `<div className="flex flex-col gap-4 ...">`, después de `<HowItWorks />` y antes de `<TicketEntryCard />`:

```tsx
<HowItWorks />
<TopRated />
<TicketEntryCard />
```

- [ ] **Step 3: Verificar en browser**

Abrir `http://localhost:5173`. Si hay profesionales con `avg_rating >= 4.5` y `jobs_count >= 3`, aparece la sección horizontal.

- [ ] **Step 4: Commit**

```bash
git add src/components/home/TopRated.tsx src/pages/Home.tsx
git commit -m "feat: add TopRated section in Home with best-rated professionals"
```

---

### Task 7: Build final, push y deploy

- [ ] **Step 1: Build de producción**

```bash
npm run build
```

Expected: `✓ built in X.XXs` sin errores.

- [ ] **Step 2: Push**

```bash
git push origin main
```

- [ ] **Step 3: Deploy a producción**

```bash
vercel --prod
```

Expected: `▲ Aliased https://oficios-ya-8112.vercel.app`
