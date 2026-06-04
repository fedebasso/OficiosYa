# Professionals Listing and Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the professionals flow: filtered listing by category and detailed professional profile pages.

**Architecture:** A custom hook `useProfessionals` centralizes data fetching with mock fallback; shared UI components (`RatingStars`, `WorkPhotoGallery`, `ProfessionalCard`, `ProfessionalProfile`) are composed into two pages (`Search` and `ProfessionalDetail`). The hook detects placeholder Supabase config and returns filtered mock data so the UI works without a live backend.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v3, React Router v7, @supabase/supabase-js, lucide-react

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/hooks/useProfessionals.ts` | Create | Data fetching + mock fallback, filtered by category |
| `src/components/professionals/RatingStars.tsx` | Create | Visual star display for avg_rating |
| `src/components/professionals/WorkPhotoGallery.tsx` | Create | 2-col photo grid with captions |
| `src/components/professionals/ProfessionalCard.tsx` | Create | Clickable list item card |
| `src/components/professionals/ProfessionalProfile.tsx` | Create | Full profile view with actions |
| `src/pages/Search.tsx` | Modify (replace stub) | Category-filtered listing page |
| `src/pages/ProfessionalDetail.tsx` | Modify (replace stub) | Full profile page |

---

### Task 1: `useProfessionals` hook

**Files:**
- Create: `src/hooks/useProfessionals.ts`

- [ ] **Step 1: Create the hook file**

```typescript
// src/hooks/useProfessionals.ts
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface Profile {
  id: string
  role: 'client' | 'professional'
  full_name: string
  phone: string | null
  avatar_url: string | null
  city: string
  created_at: string
}

export interface Professional {
  id: string
  bio: string
  categories: string[]
  avg_rating: number | null
  verified: boolean
  whatsapp: string
  zone: string
}

export interface WorkPhoto {
  id: string
  professional_id: string
  url: string
  caption: string
  uploaded_at: string
}

export interface ProfessionalWithProfile extends Professional {
  profiles: Profile
}

const MOCK_PROFESSIONALS: ProfessionalWithProfile[] = [
  {
    id: '1',
    bio: 'Electricista matriculado con 10 años de experiencia. Instalaciones residenciales y comerciales.',
    categories: ['electricista'],
    avg_rating: 4.8,
    verified: true,
    whatsapp: '598912345678',
    zone: 'Pocitos',
    profiles: {
      id: '1',
      role: 'professional',
      full_name: 'Carlos Méndez',
      phone: '598912345678',
      avatar_url: null,
      city: 'Montevideo',
      created_at: '',
    },
  },
  {
    id: '2',
    bio: 'Sanitarista con experiencia en destapes, pérdidas y remodelaciones de baños.',
    categories: ['plomero'],
    avg_rating: 4.5,
    verified: true,
    whatsapp: '598923456789',
    zone: 'Malvín',
    profiles: {
      id: '2',
      role: 'professional',
      full_name: 'Roberto Silva',
      phone: '598923456789',
      avatar_url: null,
      city: 'Montevideo',
      created_at: '',
    },
  },
  {
    id: '3',
    bio: 'Técnico en aire acondicionado, instalación y mantenimiento de equipos split.',
    categories: ['aire_acondicionado'],
    avg_rating: 4.2,
    verified: false,
    whatsapp: '598934567890',
    zone: 'Centro',
    profiles: {
      id: '3',
      role: 'professional',
      full_name: 'Diego Fernández',
      phone: '598934567890',
      avatar_url: null,
      city: 'Montevideo',
      created_at: '',
    },
  },
]

function isMockMode(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL ?? ''
  return url === '' || url.includes('placeholder')
}

export function useProfessionals(categoria?: string) {
  const [professionals, setProfessionals] = useState<ProfessionalWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfessionals = useCallback(async () => {
    setLoading(true)
    setError(null)

    if (isMockMode()) {
      const filtered = categoria
        ? MOCK_PROFESSIONALS.filter((p) => p.categories.includes(categoria))
        : MOCK_PROFESSIONALS
      setProfessionals(filtered)
      setLoading(false)
      return
    }

    try {
      let query = supabase
        .from('professionals')
        .select('*, profiles(*)')

      if (categoria) {
        query = query.contains('categories', [categoria])
      }

      const { data, error: supabaseError } = await query

      if (supabaseError) throw supabaseError

      setProfessionals((data as ProfessionalWithProfile[]) ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar profesionales')
    } finally {
      setLoading(false)
    }
  }, [categoria])

  useEffect(() => {
    fetchProfessionals()
  }, [fetchProfessionals])

  return { professionals, loading, error, refresh: fetchProfessionals }
}

export function useProfessionalById(id: string | undefined) {
  const [professional, setProfessional] = useState<ProfessionalWithProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    if (isMockMode()) {
      const found = MOCK_PROFESSIONALS.find((p) => p.id === id) ?? null
      setProfessional(found)
      setLoading(false)
      return
    }

    async function fetch() {
      setLoading(true)
      setError(null)
      try {
        const { data, error: supabaseError } = await supabase
          .from('professionals')
          .select('*, profiles(*)')
          .eq('id', id)
          .single()

        if (supabaseError) throw supabaseError
        setProfessional(data as ProfessionalWithProfile)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el profesional')
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [id])

  return { professional, loading, error }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd C:\Users\fede8\Documents\OficiosYa\oficioYa && npx tsc --noEmit`
Expected: no errors (or only pre-existing errors unrelated to this file)

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useProfessionals.ts
git commit -m "feat: add useProfessionals and useProfessionalById hooks with mock fallback"
```

---

### Task 2: `RatingStars` component

**Files:**
- Create: `src/components/professionals/RatingStars.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/professionals/RatingStars.tsx
import { Star } from 'lucide-react'

interface RatingStarsProps {
  rating: number | null
  size?: 'sm' | 'md'
}

export function RatingStars({ rating, size = 'md' }: RatingStarsProps) {
  if (rating === null) {
    return (
      <span className="text-xs text-gray-400 italic">Sin calificación</span>
    )
  }

  const starSize = size === 'sm' ? 14 : 18
  const textClass = size === 'sm' ? 'text-xs' : 'text-sm'

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={starSize}
          className={star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}
          fill="currentColor"
        />
      ))}
      <span className={`${textClass} text-gray-600 ml-1`}>{rating.toFixed(1)}</span>
    </div>
  )
}

export default RatingStars
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd C:\Users\fede8\Documents\OficiosYa\oficioYa && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/professionals/RatingStars.tsx
git commit -m "feat: add RatingStars component"
```

---

### Task 3: `WorkPhotoGallery` component

**Files:**
- Create: `src/components/professionals/WorkPhotoGallery.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/professionals/WorkPhotoGallery.tsx
import type { WorkPhoto } from '../../hooks/useProfessionals'

interface WorkPhotoGalleryProps {
  photos: WorkPhoto[]
  professionalId: string
}

export function WorkPhotoGallery({ photos }: WorkPhotoGalleryProps) {
  if (photos.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic py-2">Sin fotos aún</p>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {photos.map((photo) => (
        <div key={photo.id} className="flex flex-col gap-1">
          <img
            src={photo.url}
            alt={photo.caption}
            className="w-full aspect-square object-cover rounded-lg"
          />
          {photo.caption && (
            <p className="text-xs text-gray-500 leading-tight">{photo.caption}</p>
          )}
        </div>
      ))}
    </div>
  )
}

export default WorkPhotoGallery
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd C:\Users\fede8\Documents\OficiosYa\oficioYa && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/professionals/WorkPhotoGallery.tsx
git commit -m "feat: add WorkPhotoGallery component"
```

---

### Task 4: `ProfessionalCard` component

**Files:**
- Create: `src/components/professionals/ProfessionalCard.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/professionals/ProfessionalCard.tsx
import { ChevronRight } from 'lucide-react'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { RatingStars } from './RatingStars'
import type { ProfessionalWithProfile } from '../../hooks/useProfessionals'

interface ProfessionalCardProps {
  professional: ProfessionalWithProfile
  onClick: () => void
}

export function ProfessionalCard({ professional, onClick }: ProfessionalCardProps) {
  const { profiles, verified, zone, avg_rating, categories } = professional

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-white rounded-xl shadow-sm p-4 flex items-center gap-3 text-left hover:shadow-md active:scale-[0.98] transition-all"
    >
      <Avatar
        src={profiles.avatar_url}
        name={profiles.full_name}
        size="md"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-text-main text-sm truncate">
            {profiles.full_name}
          </span>
          {verified && (
            <Badge variant="verified">Verificado</Badge>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-0.5">{zone} · {profiles.city}</p>

        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
          <RatingStars rating={avg_rating} size="sm" />
          {categories.length > 0 && (
            <span className="text-xs text-gray-400">
              {categories.length} {categories.length === 1 ? 'categoría' : 'categorías'}
            </span>
          )}
        </div>
      </div>

      <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
    </button>
  )
}

export default ProfessionalCard
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd C:\Users\fede8\Documents\OficiosYa\oficioYa && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/professionals/ProfessionalCard.tsx
git commit -m "feat: add ProfessionalCard component"
```

---

### Task 5: `ProfessionalProfile` component

**Files:**
- Create: `src/components/professionals/ProfessionalProfile.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/professionals/ProfessionalProfile.tsx
import { useNavigate } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { RatingStars } from './RatingStars'
import { WorkPhotoGallery } from './WorkPhotoGallery'
import type { ProfessionalWithProfile, WorkPhoto } from '../../hooks/useProfessionals'

interface ProfessionalProfileProps {
  professional: ProfessionalWithProfile
  photos: WorkPhoto[]
}

const CATEGORY_LABELS: Record<string, string> = {
  electricista: 'Electricista',
  plomero: 'Sanitario',
  aire_acondicionado: 'Aire Acond.',
}

export function ProfessionalProfile({ professional, photos }: ProfessionalProfileProps) {
  const navigate = useNavigate()
  const { profiles, verified, zone, avg_rating, bio, categories, whatsapp, id } = professional

  function handleWhatsApp() {
    window.open(`https://wa.me/${whatsapp}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="px-4 py-5 space-y-5">
      {/* Header section */}
      <div className="flex flex-col items-center gap-3 text-center">
        <Avatar
          src={profiles.avatar_url}
          name={profiles.full_name}
          size="lg"
        />
        <div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-text-main">{profiles.full_name}</h1>
            {verified && <Badge variant="verified">Verificado</Badge>}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{zone} · {profiles.city}</p>
        </div>
        <RatingStars rating={avg_rating} size="md" />
      </div>

      {/* Bio */}
      <section>
        <h2 className="text-sm font-semibold text-text-main mb-1">Sobre mí</h2>
        <p className="text-sm text-gray-600 leading-relaxed">{bio}</p>
      </section>

      {/* Categories */}
      <section>
        <h2 className="text-sm font-semibold text-text-main mb-2">Especialidades</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <span
              key={cat}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent text-primary"
            >
              {CATEGORY_LABELS[cat] ?? cat}
            </span>
          ))}
        </div>
      </section>

      {/* Work photos */}
      <section>
        <h2 className="text-sm font-semibold text-text-main mb-2">Fotos de trabajos</h2>
        <WorkPhotoGallery photos={photos} professionalId={id} />
      </section>

      {/* Actions */}
      <div className="space-y-3 pt-2">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => navigate(`/solicitar/${id}`)}
        >
          Solicitar servicio
        </Button>
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={handleWhatsApp}
        >
          <MessageCircle size={18} className="mr-2" />
          Contactar por WhatsApp
        </Button>
      </div>
    </div>
  )
}

export default ProfessionalProfile
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd C:\Users\fede8\Documents\OficiosYa\oficioYa && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/professionals/ProfessionalProfile.tsx
git commit -m "feat: add ProfessionalProfile component"
```

---

### Task 6: `Search` page (replace stub)

**Files:**
- Modify: `src/pages/Search.tsx`

- [ ] **Step 1: Replace the stub**

```tsx
// src/pages/Search.tsx
import { useNavigate, useParams } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { Header } from '../components/layout/Header'
import { ProfessionalCard } from '../components/professionals/ProfessionalCard'
import { useProfessionals } from '../hooks/useProfessionals'

const CATEGORY_LABELS: Record<string, string> = {
  electricista: 'Electricistas',
  plomero: 'Sanitarios',
  aire_acondicionado: 'Aire Acondicionado',
}

export default function Search() {
  const { categoria } = useParams<{ categoria: string }>()
  const navigate = useNavigate()
  const { professionals, loading, error } = useProfessionals(categoria)

  const pageTitle = categoria
    ? (CATEGORY_LABELS[categoria] ?? categoria)
    : 'Profesionales'

  const searchHeader = (
    <Header
      title={pageTitle}
      showBack
      onBack={() => navigate(-1)}
    />
  )

  return (
    <PageShell header={searchHeader} showBottomNav>
      <div className="px-4 py-4 space-y-3">
        {loading && (
          <div className="flex justify-center py-12">
            <span className="text-sm text-gray-400">Cargando profesionales...</span>
          </div>
        )}

        {!loading && error && (
          <div className="flex justify-center py-12">
            <span className="text-sm text-red-500">{error}</span>
          </div>
        )}

        {!loading && !error && professionals.length === 0 && (
          <div className="flex flex-col items-center py-12 gap-2">
            <span className="text-2xl">🔍</span>
            <span className="text-sm text-gray-500">No hay profesionales en esta categoría</span>
          </div>
        )}

        {!loading && !error && professionals.map((professional) => (
          <ProfessionalCard
            key={professional.id}
            professional={professional}
            onClick={() => navigate(`/profesional/${professional.id}`)}
          />
        ))}
      </div>
    </PageShell>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd C:\Users\fede8\Documents\OficiosYa\oficioYa && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/pages/Search.tsx
git commit -m "feat: implement Search page with category filtering"
```

---

### Task 7: `ProfessionalDetail` page (replace stub)

**Files:**
- Modify: `src/pages/ProfessionalDetail.tsx`

- [ ] **Step 1: Replace the stub**

```tsx
// src/pages/ProfessionalDetail.tsx
import { useNavigate, useParams } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { Header } from '../components/layout/Header'
import { ProfessionalProfile } from '../components/professionals/ProfessionalProfile'
import { useProfessionalById } from '../hooks/useProfessionals'
import type { WorkPhoto } from '../hooks/useProfessionals'

const MOCK_PHOTOS: WorkPhoto[] = []

export default function ProfessionalDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { professional, loading, error } = useProfessionalById(id)

  const detailHeader = (
    <Header
      title={professional?.profiles.full_name ?? 'Perfil'}
      showBack
      onBack={() => navigate(-1)}
    />
  )

  return (
    <PageShell header={detailHeader} showBottomNav={false}>
      {loading && (
        <div className="flex justify-center py-12">
          <span className="text-sm text-gray-400">Cargando perfil...</span>
        </div>
      )}

      {!loading && error && (
        <div className="flex justify-center py-12">
          <span className="text-sm text-red-500">{error}</span>
        </div>
      )}

      {!loading && !error && !professional && (
        <div className="flex justify-center py-12">
          <span className="text-sm text-gray-500">Profesional no encontrado</span>
        </div>
      )}

      {!loading && !error && professional && (
        <ProfessionalProfile
          professional={professional}
          photos={MOCK_PHOTOS}
        />
      )}
    </PageShell>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd C:\Users\fede8\Documents\OficiosYa\oficioYa && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/pages/ProfessionalDetail.tsx
git commit -m "feat: implement ProfessionalDetail page"
```

---

### Task 8: Full build verification

**Files:** none (verification only)

- [ ] **Step 1: Run the production build**

Run: `cd C:\Users\fede8\Documents\OficiosYa\oficioYa && npm run build`
Expected: `✓ built in Xs` with no TypeScript or Vite errors

- [ ] **Step 2: Mark task #4 complete**

Update task #4 "Fase 1c" to `completed` status.

---

## Self-Review

### Spec Coverage

| Spec requirement | Task |
|---|---|
| `useProfessionals` hook with JOIN, loading/error/professionals/refresh, mock fallback | Task 1 |
| `useProfessionalById` for ProfessionalDetail page | Task 1 |
| `RatingStars` component with null handling | Task 2 |
| `WorkPhotoGallery` with 2-col grid and empty state | Task 3 |
| `ProfessionalCard` with avatar, name, zone, verified badge, rating, chevron | Task 4 |
| `ProfessionalProfile` with all sections + two action buttons | Task 5 |
| `Search` page: params, loading/error/empty states, list of cards | Task 6 |
| `ProfessionalDetail` page: id param, loading states, ProfessionalProfile | Task 7 |
| `npm run build` passes | Task 8 |

### Placeholder Scan

No TBD, TODO, or vague steps found. All steps contain complete code.

### Type Consistency

- `ProfessionalWithProfile`, `WorkPhoto`, `Profile` defined once in `useProfessionals.ts` and imported everywhere.
- `useProfessionals(categoria?)` returns `{ professionals, loading, error, refresh }` — used correctly in Task 6.
- `useProfessionalById(id)` returns `{ professional, loading, error }` — used correctly in Task 7.
- `Avatar` takes `src?: string | null`, `name: string`, `size?` — matched in Tasks 4 and 5.
- `Badge` takes `variant: BadgeVariant` — `'verified'` is a valid variant per existing Badge component.
- `Button` takes `variant`, `size`, `fullWidth`, `onClick` — all used correctly in Task 5.
- `Header` takes `title?`, `showBack?`, `onBack?` — used correctly in Tasks 6 and 7.
- `PageShell` takes `header?`, `showBottomNav?` — used correctly in Tasks 6 and 7.
