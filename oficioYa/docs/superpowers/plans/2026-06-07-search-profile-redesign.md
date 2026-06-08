# Search + ProfessionalProfile Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar Search.tsx con cards expandidas que muestran stats sin abrir el perfil, y ProfessionalProfile.tsx con hero verde, avatar flotante, stats en 3 cards y CTA grid.

**Architecture:** Search.tsx reemplazado con cards inline expandidas (sin usar ProfessionalCard). ProfessionalProfile.tsx pasa a ser un componente full-page con su propio header verde, por lo que ProfessionalDetail.tsx se simplifica eliminando su PageShell header. Ambos cambios son independientes.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 3, React Router 7, lucide-react, componentes existentes (Avatar, WorkPhotoGallery, LoadingSpinner)

---

## File Map

**Modificar:**
- `src/pages/Search.tsx` — rediseño completo, cards expandidas
- `src/components/professionals/ProfessionalProfile.tsx` — rediseño completo full-page
- `src/pages/ProfessionalDetail.tsx` — simplificar: quitar Header propio, dejar que ProfessionalProfile maneje su layout

---

## Task 1: Search.tsx — cards expandidas

**Files:**
- Modify: `src/pages/Search.tsx`

- [ ] **Step 1: Reemplazar Search.tsx completo**

```tsx
import { useParams, useNavigate } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { Avatar } from '../components/ui/Avatar'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { useProfessionals } from '../hooks/useProfessionals'
import type { ProfessionalWithProfile } from '../hooks/useProfessionals'

const CATEGORY_LABELS: Record<string, string> = {
  electricista: 'Electricistas',
  plomero: 'Sanitarios',
  aire_acondicionado: 'Aire Acondicionado',
  cerrajero: 'Cerrajeros',
  albanil: 'Albañiles',
}

interface CardProps {
  professional: ProfessionalWithProfile
  onClick: () => void
}

function ExpandedProCard({ professional, onClick }: CardProps) {
  const { profiles, verified, avg_rating, zone, jobs_count, response_time_min, available_now } = professional
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl shadow-sm px-3.5 py-3 active:scale-[.99] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <div className="flex items-center gap-2.5 mb-2.5">
        <Avatar src={profiles.avatar_url} name={profiles.full_name} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-sm text-text-main truncate">{profiles.full_name}</span>
            {verified && (
              <span className="bg-primary text-white text-[8px] font-bold px-1.5 py-0.5 rounded flex-shrink-0">✓</span>
            )}
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">📍 {zone}</div>
        </div>
        {avg_rating != null && (
          <span className="text-sm font-bold text-text-main flex-shrink-0">⭐ {avg_rating}</span>
        )}
      </div>
      <div className="flex gap-1.5 flex-wrap border-t border-gray-50 pt-2.5">
        {jobs_count > 0 && (
          <span className="bg-gray-50 rounded-lg px-2 py-1 text-[10px] font-semibold text-gray-500">
            🔧 {jobs_count} trabajos
          </span>
        )}
        {available_now && (
          <>
            <span className="bg-red-50 rounded-lg px-2 py-1 text-[10px] font-semibold text-danger">
              ⚡ Urgencias
            </span>
            {response_time_min > 0 && (
              <span className="bg-green-50 rounded-lg px-2 py-1 text-[10px] font-semibold text-primary">
                ⏱ ~{response_time_min} min
              </span>
            )}
          </>
        )}
      </div>
    </button>
  )
}

export default function Search() {
  const { categoria } = useParams<{ categoria: string }>()
  const navigate = useNavigate()
  const { professionals, loading, error } = useProfessionals(categoria)

  const label = categoria ? CATEGORY_LABELS[categoria] ?? categoria : 'Profesionales'

  const header = (
    <div className="bg-background border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
      <div className="flex items-center gap-2 mb-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Volver"
          className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-text-main text-sm flex-shrink-0 active:opacity-70 transition-opacity"
        >
          ←
        </button>
        <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-sm">
          <span className="text-primary text-sm">🔍</span>
          <span className="text-sm text-gray-400 truncate">{label}...</span>
        </div>
        <button
          type="button"
          className="bg-primary text-white text-[11px] font-bold px-3 py-2 rounded-xl flex-shrink-0"
          aria-label="Ordenar por rating"
        >
          ↕ Rating
        </button>
      </div>
      {!loading && !error && (
        <p className="text-[11px] text-gray-400">
          <strong className="text-text-main">{professionals.length}</strong> profesionales en Montevideo
        </p>
      )}
    </div>
  )

  return (
    <PageShell header={header}>
      <div className="p-4 flex flex-col gap-3">
        {loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        )}
        {error && (
          <p className="text-center text-red-500 py-8 text-sm">{error}</p>
        )}
        {!loading && !error && professionals.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="text-4xl">🔍</div>
            <p className="font-bold text-text-main">No encontramos profesionales</p>
            <p className="text-sm text-gray-400">Intentá con otra categoría</p>
          </div>
        )}
        {professionals.map((pro) => (
          <ExpandedProCard
            key={pro.id}
            professional={pro}
            onClick={() => navigate(`/profesional/${pro.id}`)}
          />
        ))}
      </div>
    </PageShell>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd C:\Users\fede8\Documents\OficiosYa\oficioYa
npx tsc --noEmit
```

Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Search.tsx
git commit -m "feat: Search rediseñado — cards expandidas con stats, empty state mejorado"
```

---

## Task 2: ProfessionalProfile.tsx + ProfessionalDetail.tsx

**Files:**
- Modify: `src/components/professionals/ProfessionalProfile.tsx`
- Modify: `src/pages/ProfessionalDetail.tsx`

- [ ] **Step 1: Reemplazar ProfessionalProfile.tsx completo**

```tsx
import { useNavigate } from 'react-router-dom'
import { Avatar } from '../ui/Avatar'
import { WorkPhotoGallery } from './WorkPhotoGallery'
import type { ProfessionalWithProfile, WorkPhoto } from '../../hooks/useProfessionals'

interface Props {
  professional: ProfessionalWithProfile
  photos: WorkPhoto[]
}

const CATEGORY_LABELS: Record<string, string> = {
  electricista: 'Electricista',
  plomero: 'Sanitario',
  aire_acondicionado: 'Aire Acondicionado',
  cerrajero: 'Cerrajero/a',
  albanil: 'Albañil',
}

export function ProfessionalProfile({ professional, photos }: Props) {
  const navigate = useNavigate()
  const {
    profiles, bio, avg_rating, verified, zone, categories,
    whatsapp, id, jobs_count, response_time_min, available_now,
  } = professional

  const specialty = CATEGORY_LABELS[categories[0]] ?? categories[0]

  return (
    <div className="flex flex-col min-h-screen bg-background">

      {/* Header verde */}
      <div className="bg-primary px-4 pt-10 pb-14 relative">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Volver"
          className="flex items-center gap-1.5 text-white/70 text-sm mb-2 active:opacity-60 transition-opacity focus:outline-none"
        >
          ← Volver
        </button>
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-background rounded-t-[32px]" />
      </div>

      {/* Avatar flotante */}
      <div className="flex justify-center mt-[-40px] mb-3 relative z-10">
        <div className="rounded-full border-4 border-white shadow-lg overflow-hidden w-20 h-20 flex-shrink-0">
          <Avatar src={profiles.avatar_url} name={profiles.full_name} size="lg" />
        </div>
      </div>

      {/* Nombre + especialidad + zona */}
      <div className="text-center px-6 mb-3">
        <h1 className="text-xl font-black text-text-main">{profiles.full_name}</h1>
        <p className="text-sm text-gray-400 mt-0.5">{specialty}</p>
        <p className="text-xs text-gray-400">📍 {zone}</p>
      </div>

      {/* Badges */}
      <div className="flex justify-center gap-2 mb-4 px-4 flex-wrap">
        {verified && (
          <span className="bg-green-50 text-primary border border-green-200 rounded-full text-[10px] font-bold px-3 py-1">
            ✓ Verificado
          </span>
        )}
        {available_now && (
          <span className="bg-red-50 text-danger border border-red-200 rounded-full text-[10px] font-bold px-3 py-1">
            ⚡ Urgencias 24H
          </span>
        )}
      </div>

      {/* Stats en 3 cards */}
      <div className="grid grid-cols-3 gap-3 px-4 mb-4">
        <div className="bg-white rounded-2xl shadow-sm p-3 text-center">
          <div className="text-lg font-black text-text-main">
            {avg_rating != null ? avg_rating : '–'}
          </div>
          <div className="text-[9px] text-gray-400 uppercase tracking-wide mt-0.5">Rating</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-3 text-center">
          <div className="text-lg font-black text-text-main">{jobs_count}</div>
          <div className="text-[9px] text-gray-400 uppercase tracking-wide mt-0.5">Trabajos</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-3 text-center">
          <div className="text-lg font-black text-text-main">
            {available_now ? `~${response_time_min}m` : '–'}
          </div>
          <div className="text-[9px] text-gray-400 uppercase tracking-wide mt-0.5">Respuesta</div>
        </div>
      </div>

      {/* CTAs en grid — ARRIBA del bio */}
      <div className="grid grid-cols-2 gap-3 px-4 mb-4">
        <button
          type="button"
          onClick={() => navigate(`/solicitar/${id}`)}
          className="w-full bg-primary text-white rounded-2xl py-3 text-sm font-bold active:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          style={{ boxShadow: '0 4px 12px rgba(15,110,86,.25)' }}
        >
          📋 Solicitar
        </button>
        <button
          type="button"
          onClick={() => window.open(`https://wa.me/${whatsapp}`, '_blank', 'noopener,noreferrer')}
          className="w-full bg-whatsapp text-white rounded-2xl py-3 text-sm font-bold active:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp focus-visible:ring-offset-2"
        >
          💬 WhatsApp
        </button>
      </div>

      {/* Sobre mí */}
      <div className="bg-white rounded-2xl shadow-sm mx-4 mb-3 p-4">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Sobre mí</h3>
        <p className="text-sm text-text-main leading-relaxed">{bio}</p>
      </div>

      {/* Servicios */}
      <div className="bg-white rounded-2xl shadow-sm mx-4 mb-3 p-4">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Servicios</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <span
              key={cat}
              className="bg-green-50 text-primary border border-green-200 text-xs font-semibold px-3 py-1 rounded-full"
            >
              {CATEGORY_LABELS[cat] ?? cat}
            </span>
          ))}
        </div>
      </div>

      {/* Fotos de trabajos */}
      {photos.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm mx-4 mb-6 p-4">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Trabajos anteriores</h3>
          <WorkPhotoGallery photos={photos} />
        </div>
      )}

    </div>
  )
}
```

- [ ] **Step 2: Actualizar ProfessionalDetail.tsx para quitar el header duplicado**

Reemplazar `src/pages/ProfessionalDetail.tsx` completo:

```tsx
import { useParams } from 'react-router-dom'
import { ProfessionalProfile } from '../components/professionals/ProfessionalProfile'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { useProfessionalById } from '../hooks/useProfessionals'

export default function ProfessionalDetail() {
  const { id } = useParams<{ id: string }>()
  const { professional, loading, error } = useProfessionalById(id ?? '')

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
        <p className="font-bold text-text-main">Profesional no encontrado</p>
        <p className="text-sm text-gray-400">{error ?? 'No pudimos cargar este perfil'}</p>
      </div>
    )
  }

  return <ProfessionalProfile professional={professional} photos={[]} />
}
```

- [ ] **Step 3: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
git add src/components/professionals/ProfessionalProfile.tsx src/pages/ProfessionalDetail.tsx
git commit -m "feat: ProfessionalProfile rediseñado — hero verde, stats cards, CTA grid"
```

---

## Task 3: Verificación visual + push

- [ ] **Step 1: Abrir dev server**

```bash
npm run dev
```

Navegar a `http://localhost:5173`

- [ ] **Step 2: Checklist Search (DevTools 390px)**

- [ ] Header bg-background con back button circular, input decorativo, botón "↕ Rating"
- [ ] Counter "X profesionales en Montevideo"
- [ ] Cards expandidas: nombre + badge ✓ + rating + zona + pills stats
- [ ] Pill "⚡ Urgencias" roja para professionals con available_now=true
- [ ] Pill "⏱ ~Xm" verde para tiempo de respuesta
- [ ] Empty state con emoji 🔍 al buscar categoría sin resultados
- [ ] Tap en card → navega a /profesional/:id
- [ ] Sin overflow horizontal

- [ ] **Step 3: Checklist ProfessionalProfile (DevTools 390px)**

- [ ] Header verde con "← Volver" funcional
- [ ] Avatar flotante con borde blanco y sombra
- [ ] Nombre + especialidad + zona centrados
- [ ] Badge "✓ Verificado" verde para Carlos, Roberto, Ana
- [ ] Badge "⚡ Urgencias 24H" rojo para los available_now
- [ ] 3 stats cards: Rating / Trabajos / Respuesta (~Xm o –)
- [ ] Botones Solicitar + WhatsApp en grid lado a lado (ARRIBA del bio)
- [ ] Sección "Sobre mí" con bio
- [ ] Sección "Servicios" con labels legibles (no IDs crudos)
- [ ] Sin header duplicado (no aparece "Perfil" del antiguo Header)

- [ ] **Step 4: Push a GitHub**

```bash
git push origin main
```
