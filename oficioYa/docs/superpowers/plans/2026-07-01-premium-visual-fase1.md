# Premium Visual — Fase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar un look premium (íconos lucide monocromáticos, sombras cálidas, mejor jerarquía) a la card de profesional y a la Home, manteniendo la base crema.

**Architecture:** Se agrega un mapa `CATEGORY_ICON` (categoría → componente lucide) en `categories.ts`. Se rediseña `ProfessionalCard`, se migra `CategoryIcons` a lucide y se inserta en la Home junto a un buscador con ícono lucide, y se refinan los encabezados de sección.

**Tech Stack:** React + TypeScript + lucide-react (ya instalado) + framer-motion

## Global Constraints

- No agregar dependencias — `lucide-react` ya instalado
- Base crema se mantiene: `#F5F0E8` fondo, `#FFFFFF` cards, `#E8683A`/`#D4571F` naranja
- Sombra premium: `0 2px 6px rgba(60,40,20,.04), 0 12px 28px -12px rgba(60,40,20,.14)`
- No cambiar ancho del contenedor (480px) ni el layout general
- Mantener `CATEGORY_EMOJI` intacto (otros consumidores lo usan)
- Preservar navegación, toggle de favoritos y accesibilidad existentes
- Correr `npm run lint` y `npm run build` antes de cada push

---

### Task 1: Mapa CATEGORY_ICON + getCategoryIcon

**Files:**
- Modify: `src/lib/categories.ts`

**Interfaces:**
- Produces:
  ```ts
  import type { LucideIcon } from 'lucide-react'
  export const CATEGORY_ICON: Record<string, LucideIcon>
  export function getCategoryIcon(cat: string): LucideIcon  // fallback: Wrench
  ```

- [ ] **Step 1: Agregar el import de lucide y el mapa al inicio de categories.ts**

Al principio de `src/lib/categories.ts` (después de la línea `export type CategoryKey`), agregar:

```ts
import type { LucideIcon } from 'lucide-react'
import {
  Zap, Droplets, Snowflake, KeyRound, Paintbrush, Hammer,
  Sprout, Wrench, Sparkles, Package,
} from 'lucide-react'

export const CATEGORY_ICON: Record<string, LucideIcon> = {
  electricista:       Zap,
  plomero:            Droplets,
  aire_acondicionado: Snowflake,
  cerrajero:          KeyRound,
  pintor:             Paintbrush,
  albanil:            Hammer,
  carpintero:         Hammer,
  jardinero:          Sprout,
  herrero:            Wrench,
  limpieza:           Sparkles,
  mudanzas:           Package,
  manitas:            Wrench,
  otros:              Wrench,
}

export function getCategoryIcon(cat: string): LucideIcon {
  return CATEGORY_ICON[cat] ?? Wrench
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/lib/categories.ts
git commit -m "feat: add CATEGORY_ICON lucide map and getCategoryIcon helper"
```

---

### Task 2: Rediseño de ProfessionalCard

**Files:**
- Modify: `src/components/professionals/ProfessionalCard.tsx`

**Interfaces:**
- Consumes: `getCategoryIcon` de Task 1

- [ ] **Step 1: Reemplazar el contenido completo de ProfessionalCard.tsx**

```tsx
import { Heart, MapPin, Star, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import type { ProfessionalWithProfile } from '../../hooks/useProfessionals'
import { getCategoryMeta, getCategoryIcon } from '../../lib/categories'
import { getInitials } from '../../lib/utils'
import { useFavoritesStore } from '../../store/favoritesStore'

interface Props {
  professional: ProfessionalWithProfile
  onClick: () => void
}

const CARD_SHADOW = '0 2px 6px rgba(60,40,20,.04), 0 12px 28px -12px rgba(60,40,20,.14)'

export function ProfessionalCard({ professional, onClick }: Props) {
  const { profiles, avg_rating, zone, jobs_count, categories, id, verified } = professional
  const { label, avatarGradient, accent } = getCategoryMeta(categories[0] ?? '')
  const CatIcon = getCategoryIcon(categories[0] ?? '')
  const initials = getInitials(profiles.full_name)
  const { toggle, isFavorite } = useFavoritesStore()
  const favorite = isFavorite(id)

  return (
    <motion.div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className="w-full text-left cursor-pointer"
      whileTap={{ scale: 0.98, y: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={{
        background: '#FFFFFF',
        border: '1px solid #ECE6DC',
        borderRadius: 20,
        boxShadow: CARD_SHADOW,
        padding: 16,
      }}
    >
      {/* Fila superior */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className="relative flex-shrink-0 rounded-2xl overflow-hidden flex items-center justify-center font-black"
          style={{
            width: 58,
            height: 58,
            borderRadius: 18,
            background: profiles.avatar_url ? undefined : avatarGradient,
            boxShadow: 'inset 0 0 0 1px rgba(212,87,31,.12)',
            fontSize: 19,
          }}
        >
          {profiles.avatar_url
            ? <img src={profiles.avatar_url} alt={profiles.full_name} className="w-full h-full object-cover" />
            : <span style={{ color: accent }}>{initials}</span>
          }
          {verified && (
            <span
              className="absolute flex items-center justify-center"
              style={{ bottom: -3, right: -3, width: 20, height: 20, borderRadius: '50%', background: '#22A559', border: '2.5px solid #fff' }}
            >
              <Check size={11} color="#fff" strokeWidth={3} />
            </span>
          )}
        </div>

        {/* Nombre + categoría */}
        <div className="flex-1 min-w-0">
          <div className="font-extrabold truncate" style={{ color: '#1A1712', fontSize: 17, letterSpacing: '-0.3px', lineHeight: 1.1 }}>
            {profiles.full_name}
          </div>
          <div className="flex items-center gap-1.5" style={{ marginTop: 5, color: '#7A6E5E', fontSize: 12.5, fontWeight: 700 }}>
            <CatIcon size={14} style={{ color: '#D4571F' }} />
            {label}
          </div>
        </div>

        {/* Favorito */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); toggle(id) }}
          aria-label={favorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          className="flex items-center justify-center active:scale-90 transition-transform flex-shrink-0"
          style={{ width: 34, height: 34, borderRadius: 12, background: '#FAF6F0' }}
        >
          <Heart size={17} style={{ color: favorite ? '#EF4444' : '#C9BFB0' }} fill={favorite ? '#EF4444' : 'none'} />
        </button>
      </div>

      {/* Divisor */}
      <div style={{ height: 1, background: '#F0EAE0', margin: '13px 0 11px' }} />

      {/* Fila inferior */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <span className="flex items-center gap-1" style={{ color: '#8A7F6E', fontSize: 13, fontWeight: 600 }}>
            <MapPin size={14} style={{ color: '#B3A794' }} />
            {zone}
          </span>
          <span style={{ color: '#B3A794', fontSize: 13 }}>
            <b style={{ color: '#5A5142' }}>{jobs_count}</b> trabajos
          </span>
        </div>

        {avg_rating != null ? (
          <span className="flex items-center gap-1" style={{ background: '#FFF7ED', padding: '5px 10px', borderRadius: 10 }}>
            <Star size={14} fill="#F5A623" color="#F5A623" />
            <span style={{ fontWeight: 800, color: '#1A1712', fontSize: 14 }}>{avg_rating.toFixed(1)}</span>
            <span style={{ color: '#B3A794', fontSize: 11, fontWeight: 600 }}>({jobs_count})</span>
          </span>
        ) : (
          <span style={{ fontSize: 11, color: '#C9BFB0', fontWeight: 600 }}>Sin reseñas</span>
        )}
      </div>
    </motion.div>
  )
}

export default ProfessionalCard
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Expected: sin errores. (Nota: `verified` ya existe en el tipo `Professional`.)

- [ ] **Step 3: Verificar en browser**

Abrir `http://localhost:5173/buscar`. Las cards deben verse con el nuevo estilo: ícono lucide en el chip, badge verde de verificado en avatares verificados, rating en pastilla, sombra suave.

- [ ] **Step 4: Commit**

```bash
git add src/components/professionals/ProfessionalCard.tsx
git commit -m "feat: premium redesign of ProfessionalCard with lucide icons"
```

---

### Task 3: CategoryIcons a lucide + buscador premium + insertar en Home

**Files:**
- Modify: `src/components/home/CategoryIcons.tsx`
- Modify: `src/pages/Home.tsx`

**Interfaces:**
- Consumes: `getCategoryIcon` de Task 1

- [ ] **Step 1: Reemplazar el contenido de CategoryIcons.tsx**

```tsx
import { useNavigate } from 'react-router-dom'
import { CATEGORY_LABELS, getCategoryIcon } from '../../lib/categories'

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
    <div className="flex gap-3.5 overflow-x-auto" style={{ paddingBottom: 4, scrollbarWidth: 'none' }}>
      {CATEGORIES.map((id) => {
        const Icon = getCategoryIcon(id)
        return (
          <button
            key={id}
            type="button"
            onClick={() => navigate(`/buscar/${id}`)}
            className="flex-shrink-0 flex flex-col items-center gap-2 active:opacity-70 transition-opacity"
            style={{ width: 60 }}
          >
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 19,
                background: '#FFFFFF',
                border: '1px solid #ECE4D8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px -2px rgba(60,40,20,.10)',
                color: '#4A4034',
              }}
            >
              <Icon size={24} strokeWidth={1.9} />
            </div>
            <span className="font-bold text-center" style={{ fontSize: 11.5, color: '#6B6152', maxWidth: 60, lineHeight: 1.15 }}>
              {CATEGORY_LABELS[id]}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default CategoryIcons
```

- [ ] **Step 2: Actualizar el buscador y agregar CategoryIcons en Home.tsx**

En `src/pages/Home.tsx`:

Agregar imports:
```tsx
import { Search } from 'lucide-react'
import { CategoryIcons } from '../components/home/CategoryIcons'
```

Reemplazar el bloque del buscador dentro de `homeHeader` (el `<button>` con el emoji 🔍) por:
```tsx
        <button
          type="button"
          onClick={() => navigate('/buscar')}
          className="w-full flex items-center gap-2.5 active:opacity-80 transition-opacity"
          style={{
            height: 48,
            background: '#F6F1EA',
            border: '1.5px solid #ECE4D8',
            borderRadius: 15,
            padding: '0 14px',
          }}
        >
          <Search size={19} strokeWidth={2.3} style={{ color: '#C2B8A6' }} />
          <span style={{ fontSize: 15, color: '#B0A594', fontWeight: 500 }}>
            ¿Qué servicio necesitás?
          </span>
        </button>
```

Insertar `<CategoryIcons />` en el body, como primer hijo del `<div className="flex flex-col gap-4 pt-4 pb-4">`, antes de `<HowItWorks />`:
```tsx
      <div className="flex flex-col gap-4 pt-4 pb-4">
        <CategoryIcons />
        <HowItWorks />
        <TopRated />
```

- [ ] **Step 3: Verificar en browser**

Abrir `http://localhost:5173`. El buscador debe tener el ícono lucide, y debajo del header debe aparecer la fila de categorías con íconos monocromáticos.

- [ ] **Step 4: Commit**

```bash
git add src/components/home/CategoryIcons.tsx src/pages/Home.tsx
git commit -m "feat: lucide category row and premium search bar in Home"
```

---

### Task 4: Encabezado de sección refinado en TopRated

**Files:**
- Modify: `src/components/home/TopRated.tsx`

- [ ] **Step 1: Actualizar el encabezado y quitar el emoji de zona en TopRated.tsx**

Reemplazar el `<h2>` del encabezado:
```tsx
      <h2 className="font-black text-base" style={{ color: '#111', letterSpacing: '-0.3px' }}>
        ⭐ Mejor calificados
      </h2>
```
Por:
```tsx
      <div className="flex items-baseline justify-between">
        <h2 className="font-extrabold" style={{ color: '#1A1712', fontSize: 18, letterSpacing: '-0.4px' }}>
          Mejor calificados
        </h2>
        <button
          type="button"
          onClick={() => navigate('/buscar')}
          style={{ fontSize: 13, fontWeight: 700, color: '#D4571F' }}
        >
          Ver todos
        </button>
      </div>
```

Y reemplazar la línea del emoji + zona:
```tsx
              <span className="text-[10px]" style={{ color: '#999' }}>{emoji} {pro.zone}</span>
```
Por (sin el emoji de categoría, solo la zona):
```tsx
              <span className="text-[10px]" style={{ color: '#9C917E' }}>{pro.zone}</span>
```

Como `emoji` ya no se usa, actualizar el destructuring:
```tsx
          const { avatarGradient, accent } = getCategoryMeta(pro.categories[0] ?? '')
```

- [ ] **Step 2: Verificar TypeScript y browser**

```bash
npx tsc --noEmit
```
Expected: sin errores (sin variable `emoji` sin usar).

- [ ] **Step 3: Commit**

```bash
git add src/components/home/TopRated.tsx
git commit -m "feat: refine TopRated section header, drop emoji from zone"
```

---

### Task 5: Lint, build, deploy

- [ ] **Step 1: Lint**

```bash
npm run lint
```
Expected: sin errores.

- [ ] **Step 2: Build**

```bash
npm run build
```
Expected: `✓ built in X.XXs` sin errores.

- [ ] **Step 3: Push y deploy**

```bash
git push origin main
vercel --prod
```
Expected: `▲ Aliased https://oficios-ya-8112.vercel.app`
