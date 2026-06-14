# Rediseño Home Visual Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar el Home de OficioYa con estilo Rappi/PedidosYa — chips horizontales, íconos circulares con gradientes por categoría, buscador solo en el header, y BottomNav de 3 tabs.

**Architecture:** Se crean 2 componentes nuevos (`CategoryIcons`, `CategoryChips`), se actualiza `categories.ts` con gradientes y la categoría pintor, se rediseña `ProfessionalCard` con avatar de iniciales en color, y se simplifica el BottomNav a 3 tabs eliminando el tab Buscar redundante.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, CSS custom properties (`var(--text-*)`, `var(--space-*)`), React Router v7.

---

## Task 1: Actualizar categories.ts — agregar pintor + gradientes

**Files:**
- Modify: `src/lib/categories.ts`

- [ ] **Step 1: Reemplazar el contenido completo de `src/lib/categories.ts`**

```ts
export type CategoryKey =
  | 'electricista'
  | 'plomero'
  | 'albanil'
  | 'cerrajero'
  | 'aire_acondicionado'
  | 'pintor'

export const CATEGORY_LABELS: Record<string, string> = {
  electricista:       'Electricista',
  plomero:            'Sanitario',
  albanil:            'Albañil',
  cerrajero:          'Cerrajero',
  aire_acondicionado: 'Aire Ac.',
  pintor:             'Pintor',
}

export const CATEGORY_EMOJI: Record<string, string> = {
  electricista:       '⚡',
  plomero:            '🚿',
  albanil:            '🧱',
  cerrajero:          '🔑',
  aire_acondicionado: '❄️',
  pintor:             '🎨',
}

export const CATEGORY_COVER: Record<string, string> = {
  electricista:       'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  plomero:            'https://images.unsplash.com/photo-1621905251189-08b45249a5c5?w=800&q=80',
  albanil:            'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
  cerrajero:          'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80',
  aire_acondicionado: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80',
  pintor:             'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&q=80',
}

export const CATEGORY_COVER_THUMB: Record<string, string> = {
  electricista:       'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=75',
  plomero:            'https://images.unsplash.com/photo-1621905251189-08b45249a5c5?w=400&q=75',
  albanil:            'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=75',
  cerrajero:          'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&q=75',
  aire_acondicionado: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&q=75',
  pintor:             'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&q=75',
}

export const CATEGORY_ACCENT: Record<string, string> = {
  electricista:       '#e8683a',
  plomero:            '#3b82f6',
  albanil:            '#f59e0b',
  cerrajero:          '#8b5cf6',
  aire_acondicionado: '#14b8a6',
  pintor:             '#ef4444',
}

// Gradientes para íconos circulares (estilo Rappi)
export const CATEGORY_GRADIENT: Record<string, string> = {
  electricista:       'linear-gradient(135deg, #FFF3C4, #FDE68A)',
  plomero:            'linear-gradient(135deg, #DBEAFE, #BFDBFE)',
  albanil:            'linear-gradient(135deg, #FEF3C7, #FDE68A)',
  cerrajero:          'linear-gradient(135deg, #F3E8FF, #E9D5FF)',
  aire_acondicionado: 'linear-gradient(135deg, #CCFBF1, #99F6E4)',
  pintor:             'linear-gradient(135deg, #FEE2E2, #FECACA)',
}

// Gradientes para avatares de profesionales
export const CATEGORY_AVATAR_GRADIENT: Record<string, string> = {
  electricista:       'linear-gradient(135deg, #FEF0EA, #FDDCC8)',
  plomero:            'linear-gradient(135deg, #DBEAFE, #BFDBFE)',
  albanil:            'linear-gradient(135deg, #FEF9C3, #FDE68A)',
  cerrajero:          'linear-gradient(135deg, #F3E8FF, #E9D5FF)',
  aire_acondicionado: 'linear-gradient(135deg, #CCFBF1, #99F6E4)',
  pintor:             'linear-gradient(135deg, #FEE2E2, #FECACA)',
}

const FALLBACK_COVER = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80'
const FALLBACK_COVER_THUMB = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=75'

export function getCategoryMeta(cat: string) {
  return {
    label:          CATEGORY_LABELS[cat]          ?? cat,
    emoji:          CATEGORY_EMOJI[cat]           ?? '🛠️',
    cover:          CATEGORY_COVER[cat]           ?? FALLBACK_COVER,
    coverThumb:     CATEGORY_COVER_THUMB[cat]     ?? FALLBACK_COVER_THUMB,
    accent:         CATEGORY_ACCENT[cat]          ?? '#e8683a',
    gradient:       CATEGORY_GRADIENT[cat]        ?? 'linear-gradient(135deg, #F5F0E8, #EDE8DE)',
    avatarGradient: CATEGORY_AVATAR_GRADIENT[cat] ?? 'linear-gradient(135deg, #FEF0EA, #FDDCC8)',
  }
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa && node_modules/.bin/tsc --noEmit --project tsconfig.app.json
```
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa
git add src/lib/categories.ts
git commit -m "feat(categories): agregar pintor + gradientes para íconos y avatares"
```

---

## Task 2: CategoryIcons — íconos circulares con gradientes

**Files:**
- Create: `src/components/home/CategoryIcons.tsx`

- [ ] **Step 1: Crear `src/components/home/CategoryIcons.tsx`**

```tsx
import { useNavigate } from 'react-router-dom'
import { CATEGORY_GRADIENT, CATEGORY_EMOJI, CATEGORY_LABELS } from '../../lib/categories'

const CATEGORIES = [
  'electricista',
  'plomero',
  'aire_acondicionado',
  'cerrajero',
  'pintor',
  'albanil',
] as const

export function CategoryIcons() {
  const navigate = useNavigate()

  return (
    <div
      className="flex gap-4 overflow-x-auto"
      style={{ paddingBottom: 4, scrollbarWidth: 'none' }}
    >
      {CATEGORIES.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => navigate(`/buscar/${id}`)}
          className="flex-shrink-0 flex flex-col items-center gap-1.5 active:opacity-70 transition-opacity"
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              background: CATEGORY_GRADIENT[id] ?? 'linear-gradient(135deg, #F5F0E8, #EDE8DE)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              boxShadow: '0 2px 10px rgba(0,0,0,.08)',
            }}
          >
            {CATEGORY_EMOJI[id]}
          </div>
          <span
            className="font-bold text-center"
            style={{
              fontSize: 'var(--text-xs)',
              color: '#555555',
              maxWidth: 56,
              lineHeight: 1.2,
            }}
          >
            {CATEGORY_LABELS[id]}
          </span>
        </button>
      ))}
    </div>
  )
}

export default CategoryIcons
```

- [ ] **Step 2: TypeScript check**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa && node_modules/.bin/tsc --noEmit --project tsconfig.app.json
```
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa
git add src/components/home/CategoryIcons.tsx
git commit -m "feat(home): CategoryIcons — íconos circulares con gradientes estilo Rappi"
```

---

## Task 3: CategoryChips — filtros horizontales

**Files:**
- Create: `src/components/home/CategoryChips.tsx`

- [ ] **Step 1: Crear `src/components/home/CategoryChips.tsx`**

```tsx
import { useNavigate } from 'react-router-dom'
import { CATEGORY_EMOJI, CATEGORY_LABELS } from '../../lib/categories'

const CHIPS = [
  { id: 'todos',             label: 'Todos',     emoji: '' },
  { id: 'electricista',      label: 'Electr.',   emoji: '⚡' },
  { id: 'plomero',           label: 'Sanit.',    emoji: '🚿' },
  { id: 'aire_acondicionado',label: 'Aire',      emoji: '❄️' },
  { id: 'cerrajero',         label: 'Cerraj.',   emoji: '🔑' },
  { id: 'pintor',            label: 'Pintor',    emoji: '🎨' },
  { id: 'albanil',           label: 'Albañil',   emoji: '🧱' },
]

export function CategoryChips() {
  const navigate = useNavigate()

  const handleChip = (id: string) => {
    if (id === 'todos') navigate('/buscar')
    else navigate(`/buscar/${id}`)
  }

  return (
    <div
      className="flex gap-2 overflow-x-auto"
      style={{
        padding: '10px 16px',
        background: '#FFFFFF',
        borderBottom: '1px solid #EDE8DE',
        scrollbarWidth: 'none',
      }}
    >
      {CHIPS.map((chip) => (
        <button
          key={chip.id}
          type="button"
          onClick={() => handleChip(chip.id)}
          className="flex-shrink-0 flex items-center gap-1.5 active:opacity-70 transition-opacity"
          style={{
            height: 28,
            padding: '0 10px',
            borderRadius: 20,
            background: '#F5F0E8',
            border: '1.5px solid #EDE8DE',
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            color: '#888888',
            whiteSpace: 'nowrap',
          }}
        >
          {chip.emoji && <span>{chip.emoji}</span>}
          {chip.label}
        </button>
      ))}
    </div>
  )
}

export default CategoryChips
```

- [ ] **Step 2: TypeScript check**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa && node_modules/.bin/tsc --noEmit --project tsconfig.app.json
```
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa
git add src/components/home/CategoryChips.tsx
git commit -m "feat(home): CategoryChips — filtros horizontales de categoría"
```

---

## Task 4: Home.tsx — nueva estructura

**Files:**
- Modify: `src/pages/Home.tsx`
- Delete: `src/components/home/CategoryGrid.tsx`

- [ ] **Step 1: Reemplazar el contenido completo de `src/pages/Home.tsx`**

```tsx
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { CategoryIcons } from '../components/home/CategoryIcons'
import { CategoryChips } from '../components/home/CategoryChips'
import { FeaturedProfessionals } from '../components/home/FeaturedProfessionals'
import { UrgenciasFAB } from '../components/home/UrgenciasFAB'

export default function Home() {
  const navigate = useNavigate()

  const homeHeader = (
    <header
      className="sticky top-0 z-50"
      style={{
        background: '#FFFFFF',
        boxShadow: '0 1px 0 #EDE8DE, 0 2px 8px rgba(0,0,0,.04)',
      }}
    >
      {/* Fila 1: logo + ubicación */}
      <div
        className="flex items-center justify-between"
        style={{ padding: 'calc(12px + var(--safe-top)) var(--px-container) 8px' }}
      >
        <div>
          <h1
            className="font-black leading-none"
            style={{ fontSize: 'var(--text-xl)', color: '#111111', letterSpacing: '-0.5px' }}
          >
            Oficio<span style={{ color: '#E8683A' }}>Ya</span>
          </h1>
          <p style={{ fontSize: 'var(--text-xs)', color: '#AAAAAA', marginTop: 2 }}>
            📍 Montevideo
          </p>
        </div>
      </div>

      {/* Fila 2: search bar (navega a /buscar al tocar) */}
      <div style={{ padding: '0 var(--px-container) 12px' }}>
        <button
          type="button"
          onClick={() => navigate('/buscar')}
          className="w-full flex items-center gap-3 active:opacity-80 transition-opacity"
          style={{
            height: 44,
            background: '#F5F0E8',
            border: '1.5px solid #EDE8DE',
            borderRadius: 14,
            padding: '0 14px',
          }}
        >
          <span style={{ fontSize: 15 }}>🔍</span>
          <span style={{ fontSize: 'var(--text-sm)', color: '#BBBBBB' }}>
            ¿Qué servicio necesitás?
          </span>
        </button>
      </div>

      {/* Fila 3: chips de categoría */}
      <CategoryChips />
    </header>
  )

  return (
    <PageShell header={homeHeader} showBottomNav>
      <div className="flex flex-col gap-5 pt-4 pb-4">

        {/* Íconos de categorías */}
        <section>
          <h2
            className="font-bold uppercase tracking-wide mb-3"
            style={{ fontSize: 'var(--text-xs)', color: '#AAAAAA' }}
          >
            Categorías
          </h2>
          <CategoryIcons />
        </section>

        {/* Profesionales destacados */}
        <section>
          <FeaturedProfessionals />
        </section>

      </div>

      <UrgenciasFAB />
    </PageShell>
  )
}
```

- [ ] **Step 2: Eliminar CategoryGrid.tsx**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa && rm src/components/home/CategoryGrid.tsx
```

- [ ] **Step 3: TypeScript check**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa && node_modules/.bin/tsc --noEmit --project tsconfig.app.json
```
Expected: sin errores. Si hay algún error por CategoryGrid importado en otro lugar, eliminarlo de ese archivo.

- [ ] **Step 4: Commit**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa
git add src/pages/Home.tsx
git rm src/components/home/CategoryGrid.tsx
git commit -m "feat(home): nueva estructura — search header, chips, CategoryIcons, sin StatsBar"
```

---

## Task 5: ProfessionalCard — avatar con gradiente por categoría

**Files:**
- Modify: `src/components/professionals/ProfessionalCard.tsx`

- [ ] **Step 1: Reemplazar el contenido completo de `src/components/professionals/ProfessionalCard.tsx`**

```tsx
import { Heart } from 'lucide-react'
import type { ProfessionalWithProfile } from '../../hooks/useProfessionals'
import { getCategoryMeta } from '../../lib/categories'
import { getInitials } from '../../lib/utils'
import { useFavoritesStore } from '../../store/favoritesStore'

interface Props {
  professional: ProfessionalWithProfile
  onClick: () => void
}

function AvailableBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full flex-shrink-0"
      style={{ background: '#DCFCE7', color: '#16A34A', fontSize: 'var(--text-xs)' }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: '#16A34A' }}
      />
      Online
    </span>
  )
}

function TopBadge() {
  return (
    <span
      className="inline-flex items-center font-black px-2 py-0.5 rounded-full flex-shrink-0"
      style={{ background: '#FEF9C3', color: '#D97706', fontSize: 'var(--text-xs)' }}
    >
      ★ Top
    </span>
  )
}

export function ProfessionalCard({ professional, onClick }: Props) {
  const { profiles, verified, avg_rating, zone, jobs_count, available_now, categories, id } = professional
  const { label, emoji, accent, avatarGradient } = getCategoryMeta(categories[0] ?? '')
  const isTopPro = jobs_count >= 50 && avg_rating != null && avg_rating >= 4.8
  const initials = getInitials(profiles.full_name)
  const { toggle, isFavorite } = useFavoritesStore()
  const favorite = isFavorite(id)

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl overflow-hidden flex items-stretch active:scale-[0.985] transition-transform duration-150"
      style={{
        background: '#FFFFFF',
        border: '1.5px solid #EDE8DE',
        boxShadow: '0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)',
      }}
    >
      {/* Contenido */}
      <div className="flex items-start gap-3 flex-1 min-w-0" style={{ padding: 'var(--space-3)' }}>

        {/* Avatar — foto si tiene, initials con gradiente si no */}
        <div
          className="rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center font-black text-white"
          style={{
            width: 56,
            height: 56,
            background: profiles.avatar_url ? undefined : avatarGradient,
            fontSize: 'var(--text-lg)',
          }}
        >
          {profiles.avatar_url ? (
            <img src={profiles.avatar_url} alt={profiles.full_name} className="w-full h-full object-cover" />
          ) : (
            <span style={{ color: accent }}>{initials}</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 py-0.5">
          {/* Nombre + verificado */}
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="font-bold truncate" style={{ color: '#111111', fontSize: 'var(--text-base)' }}>
              {profiles.full_name}
            </span>
            {verified && (
              <span
                className="font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                style={{ background: '#FEF0EA', color: '#E8683A', fontSize: 'var(--text-xs)' }}
              >✓</span>
            )}
          </div>

          {/* Categoría */}
          <div className="font-semibold mb-1 truncate" style={{ color: accent, fontSize: 'var(--text-sm)' }}>
            {emoji} {label}
          </div>

          {/* Zona + trabajos */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-medium truncate" style={{ color: '#555555', fontSize: 'var(--text-sm)' }}>
              📍 {zone}
            </span>
            <span className="flex-shrink-0" style={{ color: '#AAAAAA', fontSize: 'var(--text-xs)' }}>
              {jobs_count} trabajos
            </span>
          </div>
        </div>

        {/* Derecha: rating + favorito + badges */}
        <div className="flex flex-col items-end justify-between flex-shrink-0 py-0.5" style={{ minHeight: 56 }}>
          <div className="flex items-center gap-2">
            {avg_rating != null && (
              <div className="flex items-center gap-1">
                <span style={{ color: '#F59E0B', fontSize: 'var(--text-base)' }}>★</span>
                <span className="font-black" style={{ color: '#111111', fontSize: 'var(--text-lg)', lineHeight: 1 }}>
                  {avg_rating}
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); toggle(id) }}
              aria-label={favorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
              className="w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform"
              style={{
                background: favorite ? '#FEF2F2' : '#F5F0E8',
                border: `1px solid ${favorite ? '#FECACA' : '#EDE8DE'}`,
              }}
            >
              <Heart
                size={13}
                style={{ color: favorite ? '#EF4444' : '#CCCCCC' }}
                fill={favorite ? '#EF4444' : 'none'}
              />
            </button>
          </div>
          <div className="flex flex-col items-end gap-1 mt-1">
            {isTopPro && <TopBadge />}
            {available_now && <AvailableBadge />}
          </div>
        </div>

      </div>
    </button>
  )
}

export default ProfessionalCard
```

- [ ] **Step 2: TypeScript check**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa && node_modules/.bin/tsc --noEmit --project tsconfig.app.json
```
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa
git add src/components/professionals/ProfessionalCard.tsx
git commit -m "feat(card): avatar con gradiente por categoría, sin barra lateral"
```

---

## Task 6: BottomNav — 3 tabs (eliminar Buscar)

**Files:**
- Modify: `src/components/layout/BottomNav.tsx`

- [ ] **Step 1: Cambiar clientTabs a 3 tabs**

En `src/components/layout/BottomNav.tsx`, reemplazar el array `clientTabs`:

```tsx
const clientTabs: NavTab[] = [
  { label: 'Inicio',      to: '/',               icon: <House size={22} /> },
  { label: 'Solicitudes', to: '/mis-solicitudes', icon: <FileText size={22} /> },
  { label: 'Más',         to: '',                 icon: <Menu size={22} />, onPress: () => setMoreOpen(v => !v) },
]
```

También eliminar el import de `Search` de lucide-react ya que ya no se usa en clientTabs:

```tsx
import { House, FileText, Briefcase, UserCircle, Menu } from 'lucide-react'
```

- [ ] **Step 2: TypeScript check**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa && node_modules/.bin/tsc --noEmit --project tsconfig.app.json
```
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa
git add src/components/layout/BottomNav.tsx
git commit -m "feat(nav): BottomNav 3 tabs — eliminar Buscar (search vive en header del Home)"
```

---

## Task 7: Audit visual — verificar el nuevo Home

- [ ] **Step 1: Levantar dev server**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa && npx vite --port 5173
```

- [ ] **Step 2: Verificar Home en 390px**

En http://localhost:5173 con viewport 390px:
- Header: logo + "📍 Montevideo" + search bar ✅
- Chips horizontales scrolleables: Todos, ⚡, 🚿, ❄️, 🔑, 🎨, 🧱 ✅
- Sección "Categorías" con íconos circulares con gradientes de color ✅
- Cards de profesionales con avatar de iniciales en color (sin barra lateral) ✅
- BottomNav con 3 tabs: Inicio · Solicitudes · Más ✅
- FAB 🚨 visible ✅

- [ ] **Step 3: Verificar navegación desde Home**

- Tocar search bar → navega a `/buscar` ✅
- Tocar un chip (ej: ⚡) → navega a `/buscar/electricista` ✅
- Tocar un ícono de categoría → navega a `/buscar/${id}` ✅
- Tocar tab "Solicitudes" → navega a `/mis-solicitudes` ✅
- Tocar tab "Más" → abre MoreMenu ✅

- [ ] **Step 4: Verificar en 320px (iPhone SE)**

Viewport 320px: íconos scrolleables sin overflow, chips scrolleables, cards sin overflow ✅

- [ ] **Step 5: Push a GitHub + Vercel**

```bash
cd C:/Users/fede8/Documents/OficioYa
git push origin main
```

Vercel redeploya automáticamente en ~1 minuto.
