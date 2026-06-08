# Premium Redesign + Urgencias 24H Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar OficioYa con un Home premium mobile-first (hero verde + categorías + profesionales destacados + urgencias 24H) y añadir la página /urgencias con cards de profesionales disponibles ahora.

**Architecture:** Nuevos componentes desacoplados para cada sección del home (FeaturedProfessionals, UrgenciasBanner) y para la feature de urgencias (UrgentProfessionalCard, página Urgencias). El modelo de datos mock se extiende con `featured`, `jobs_count` y `response_time_min` en el hook existente.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 3, React Router 7, Zustand, Lucide React, Vite

---

## File Map

**Modificar:**
- `tailwind.config.js` — añadir tokens `danger`, `danger-dark`, `whatsapp`
- `src/hooks/useProfessionals.ts` — extender tipos + mock data + hook urgencias
- `src/components/home/CategoryGrid.tsx` — 5 categorías, grid 3+2
- `src/components/home/SearchBar.tsx` — fondo blanco, icono verde
- `src/components/professionals/ProfessionalCard.tsx` — añadir jobs_count, mejor layout
- `src/pages/Home.tsx` — rediseño completo
- `src/pages/Search.tsx` — CATEGORY_LABELS nuevas categorías
- `src/App.tsx` — añadir ruta /urgencias

**Crear:**
- `src/components/home/FeaturedProfessionals.tsx`
- `src/components/home/UrgenciasBanner.tsx`
- `src/components/professionals/UrgentProfessionalCard.tsx`
- `src/pages/Urgencias.tsx`

---

## Task 1: Tailwind tokens + extender tipos y mock data

**Files:**
- Modify: `tailwind.config.js`
- Modify: `src/hooks/useProfessionals.ts`

- [ ] **Step 1: Añadir colores al config de Tailwind**

Reemplazar el bloque `colors` en `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0F6E56',
        accent: '#9FE1CB',
        background: '#f4f4f2',
        'text-main': '#1a1a1a',
        danger: '#dc2626',
        'danger-dark': '#991b1b',
        whatsapp: '#25D366',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 2: Extender la interfaz Professional y actualizar mock data**

En `src/hooks/useProfessionals.ts`, reemplazar la interfaz `Professional` y el array `MOCK_PROFESSIONALS` completo:

```typescript
export interface Professional {
  id: string
  bio: string
  categories: string[]
  avg_rating: number | null
  verified: boolean
  whatsapp: string
  zone: string
  featured: boolean
  jobs_count: number
  response_time_min: number
  available_now: boolean
}
```

Reemplazar `MOCK_PROFESSIONALS`:

```typescript
const MOCK_PROFESSIONALS: ProfessionalWithProfile[] = [
  {
    id: '1',
    bio: 'Electricista matriculado con 10 años de experiencia. Instalaciones residenciales y comerciales.',
    categories: ['electricista'],
    avg_rating: 4.8,
    verified: true,
    whatsapp: '598912345678',
    zone: 'Pocitos',
    featured: true,
    jobs_count: 127,
    response_time_min: 15,
    available_now: true,
    profiles: { id: '1', role: 'professional', full_name: 'Carlos Méndez', phone: '598912345678', avatar_url: null, city: 'Montevideo', created_at: '' },
  },
  {
    id: '2',
    bio: 'Sanitarista con experiencia en destapes, pérdidas y remodelaciones de baños.',
    categories: ['plomero'],
    avg_rating: 4.5,
    verified: true,
    whatsapp: '598923456789',
    zone: 'Malvín',
    featured: true,
    jobs_count: 83,
    response_time_min: 20,
    available_now: true,
    profiles: { id: '2', role: 'professional', full_name: 'Roberto Silva', phone: '598923456789', avatar_url: null, city: 'Montevideo', created_at: '' },
  },
  {
    id: '3',
    bio: 'Técnico en aire acondicionado, instalación y mantenimiento de equipos split.',
    categories: ['aire_acondicionado'],
    avg_rating: 4.2,
    verified: false,
    whatsapp: '598934567890',
    zone: 'Centro',
    featured: false,
    jobs_count: 41,
    response_time_min: 45,
    available_now: false,
    profiles: { id: '3', role: 'professional', full_name: 'Diego Fernández', phone: '598934567890', avatar_url: null, city: 'Montevideo', created_at: '' },
  },
  {
    id: '4',
    bio: 'Cerrajera con disponibilidad 24 horas. Apertura de puertas, cambio de cerraduras, duplicado de llaves.',
    categories: ['cerrajero'],
    avg_rating: 4.9,
    verified: true,
    whatsapp: '598945678901',
    zone: 'Centro',
    featured: true,
    jobs_count: 89,
    response_time_min: 10,
    available_now: true,
    profiles: { id: '4', role: 'professional', full_name: 'Ana Rodríguez', phone: '598945678901', avatar_url: null, city: 'Montevideo', created_at: '' },
  },
  {
    id: '5',
    bio: 'Albañil con más de 15 años en obras civiles, reparaciones y remodelaciones.',
    categories: ['albanil'],
    avg_rating: 4.6,
    verified: true,
    whatsapp: '598956789012',
    zone: 'Punta Carretas',
    featured: false,
    jobs_count: 64,
    response_time_min: 30,
    available_now: false,
    profiles: { id: '5', role: 'professional', full_name: 'Pablo Torres', phone: '598956789012', avatar_url: null, city: 'Montevideo', created_at: '' },
  },
]
```

- [ ] **Step 3: Añadir hook `useUrgentProfessionals` al final del archivo**

Añadir después de `useProfessionalById`:

```typescript
export function useUrgentProfessionals() {
  const [professionals, setProfessionals] = useState<ProfessionalWithProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        if (isPlaceholderConfig()) {
          const urgent = MOCK_PROFESSIONALS.filter((p) => p.available_now)
          setProfessionals(urgent)
        } else {
          const { data, error } = await supabase
            .from('professionals')
            .select('*, profiles(*)')
            .eq('available_now', true)
          if (error) throw error
          setProfessionals((data as ProfessionalWithProfile[]) ?? [])
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return { professionals, loading }
}
```

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.js src/hooks/useProfessionals.ts
git commit -m "feat: extend Professional type with featured/jobs_count/available_now + add cerrajero/albanil mock data"
```

---

## Task 2: Actualizar CategoryGrid (5 categorías, grid 3+2)

**Files:**
- Modify: `src/components/home/CategoryGrid.tsx`

- [ ] **Step 1: Reemplazar CategoryGrid completo**

```tsx
import { useNavigate } from 'react-router-dom'

interface Category {
  id: string
  label: string
  emoji: string
}

const CATEGORIES: Category[] = [
  { id: 'electricista', label: 'Electricista', emoji: '⚡' },
  { id: 'plomero', label: 'Sanitario', emoji: '🚿' },
  { id: 'aire_acondicionado', label: 'Aire Ac.', emoji: '❄️' },
  { id: 'cerrajero', label: 'Cerrajero', emoji: '🔑' },
  { id: 'albanil', label: 'Albañil', emoji: '🧱' },
]

const ROW_ONE = CATEGORIES.slice(0, 3)
const ROW_TWO = CATEGORIES.slice(3)

function CategoryButton({ cat, onClick }: { cat: Category; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex flex-col items-center justify-center gap-1.5 hover:shadow-md hover:border-accent active:scale-95 transition-all duration-150"
    >
      <span style={{ fontSize: 26, lineHeight: 1 }}>{cat.emoji}</span>
      <span className="text-[10px] uppercase font-bold text-text-main tracking-wide leading-tight text-center">
        {cat.label}
      </span>
    </button>
  )
}

export function CategoryGrid() {
  const navigate = useNavigate()
  const go = (id: string) => navigate(`/buscar/${id}`)

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-2">
        {ROW_ONE.map((cat) => (
          <CategoryButton key={cat.id} cat={cat} onClick={() => go(cat.id)} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {ROW_TWO.map((cat) => (
          <CategoryButton key={cat.id} cat={cat} onClick={() => go(cat.id)} />
        ))}
      </div>
    </div>
  )
}

export default CategoryGrid
```

- [ ] **Step 2: Commit**

```bash
git add src/components/home/CategoryGrid.tsx
git commit -m "feat: 5 categorías en grid 3+2 (agrega cerrajero y albañil)"
```

---

## Task 3: Mejorar ProfessionalCard (mostrar jobs_count + rating prominente)

**Files:**
- Modify: `src/components/professionals/ProfessionalCard.tsx`

- [ ] **Step 1: Reemplazar ProfessionalCard**

```tsx
import { ChevronRight } from 'lucide-react'
import { Avatar } from '../ui/Avatar'
import type { ProfessionalWithProfile } from '../../hooks/useProfessionals'

interface Props {
  professional: ProfessionalWithProfile
  onClick: () => void
}

export function ProfessionalCard({ professional, onClick }: Props) {
  const { profiles, verified, avg_rating, zone, jobs_count } = professional
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl shadow-sm p-3.5 flex items-center gap-3 text-left hover:shadow-md transition-shadow duration-150 active:scale-[.99]"
    >
      <Avatar src={profiles.avatar_url} name={profiles.full_name} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="font-semibold text-text-main text-sm truncate">{profiles.full_name}</span>
          {verified && (
            <span className="inline-flex items-center bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
              ✓
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 leading-tight">
          {avg_rating != null && <span>⭐ {avg_rating} · </span>}
          {zone}
          {jobs_count > 0 && <span> · {jobs_count} trabajos</span>}
        </p>
      </div>
      <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
    </button>
  )
}

export default ProfessionalCard
```

- [ ] **Step 2: Commit**

```bash
git add src/components/professionals/ProfessionalCard.tsx
git commit -m "feat: ProfessionalCard muestra jobs_count y badge verificado mejorado"
```

---

## Task 4: SearchBar — fondo blanco con icono verde

**Files:**
- Modify: `src/components/home/SearchBar.tsx`

- [ ] **Step 1: Reemplazar SearchBar**

```tsx
import { Search } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (v: string) => void
  onSearch: () => void
}

export function SearchBar({ value, onChange, onSearch }: SearchBarProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') onSearch()
  }

  return (
    <button
      type="button"
      onClick={onSearch}
      className="w-full flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-lg text-left"
      aria-label="Abrir búsqueda"
    >
      <Search size={17} className="text-primary flex-shrink-0" />
      {value ? (
        <span className="flex-1 text-sm text-text-main">{value}</span>
      ) : (
        <span className="flex-1 text-sm text-gray-400">Electricista, plomero, cerrajero...</span>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="sr-only"
        aria-hidden
        tabIndex={-1}
      />
    </button>
  )
}

export default SearchBar
```

> Nota: la SearchBar en Home actúa como botón que navega al buscador. El input oculto mantiene la compatibilidad con el prop `value`/`onChange` para que no haya que cambiar Home en este task.

- [ ] **Step 2: Commit**

```bash
git add src/components/home/SearchBar.tsx
git commit -m "feat: SearchBar con fondo blanco y sombra para contraste sobre header verde"
```

---

## Task 5: Crear FeaturedProfessionals

**Files:**
- Create: `src/components/home/FeaturedProfessionals.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
import { useNavigate } from 'react-router-dom'
import { ProfessionalCard } from '../professionals/ProfessionalCard'
import { useProfessionals } from '../../hooks/useProfessionals'

export function FeaturedProfessionals() {
  const navigate = useNavigate()
  const { professionals, loading } = useProfessionals()

  const featured = professionals.filter((p) => p.featured)

  if (loading || featured.length === 0) return null

  return (
    <section>
      <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-[.6px] mb-2.5">
        Profesionales destacados
      </h2>
      <div className="flex flex-col gap-2">
        {featured.map((pro) => (
          <ProfessionalCard
            key={pro.id}
            professional={pro}
            onClick={() => navigate(`/profesional/${pro.id}`)}
          />
        ))}
      </div>
    </section>
  )
}

export default FeaturedProfessionals
```

- [ ] **Step 2: Commit**

```bash
git add src/components/home/FeaturedProfessionals.tsx
git commit -m "feat: FeaturedProfessionals — sección de profesionales que pagan leads"
```

---

## Task 6: Crear UrgenciasBanner

**Files:**
- Create: `src/components/home/UrgenciasBanner.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
import { useNavigate } from 'react-router-dom'
import { useUrgentProfessionals } from '../../hooks/useProfessionals'

export function UrgenciasBanner() {
  const navigate = useNavigate()
  const { professionals } = useUrgentProfessionals()
  const count = professionals.length

  return (
    <button
      type="button"
      onClick={() => navigate('/urgencias')}
      className="w-full text-left rounded-2xl p-4 shadow-lg active:scale-[.99] transition-transform duration-150"
      style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', boxShadow: '0 6px 20px rgba(220,38,38,.3)' }}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-white/85 text-[10px] font-bold tracking-[.6px] uppercase">
          {count > 0 ? `${count} disponibles ahora` : 'Servicio activo'}
        </span>
      </div>
      <div className="text-white text-lg font-black mb-1">🚨 Urgencias 24H</div>
      <div className="text-white/75 text-xs mb-3 leading-snug">
        Profesionales verificados que responden en menos de 30 minutos
      </div>
      <div className="bg-white rounded-xl py-2.5 text-center text-[13px] font-extrabold text-danger">
        Ver profesionales disponibles →
      </div>
    </button>
  )
}

export default UrgenciasBanner
```

- [ ] **Step 2: Commit**

```bash
git add src/components/home/UrgenciasBanner.tsx
git commit -m "feat: UrgenciasBanner con dot animado y count dinámico"
```

---

## Task 7: Crear UrgentProfessionalCard

**Files:**
- Create: `src/components/professionals/UrgentProfessionalCard.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
import { useNavigate } from 'react-router-dom'
import { Avatar } from '../ui/Avatar'
import type { ProfessionalWithProfile } from '../../hooks/useProfessionals'

interface Props {
  professional: ProfessionalWithProfile
}

const CATEGORY_LABELS: Record<string, string> = {
  electricista: 'Electricista',
  plomero: 'Sanitario',
  aire_acondicionado: 'Aire Acondicionado',
  cerrajero: 'Cerrajero/a',
  albanil: 'Albañil',
}

export function UrgentProfessionalCard({ professional }: Props) {
  const navigate = useNavigate()
  const { profiles, verified, avg_rating, zone, jobs_count, response_time_min, whatsapp, categories } = professional
  const specialty = CATEGORY_LABELS[categories[0]] ?? categories[0]

  function handleCall(e: React.MouseEvent) {
    e.stopPropagation()
    if (profiles.phone) window.location.href = `tel:${profiles.phone}`
  }

  function handleWhatsApp(e: React.MouseEvent) {
    e.stopPropagation()
    window.open(`https://wa.me/${whatsapp}`, '_blank')
  }

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-md active:scale-[.99] transition-transform duration-150"
      onClick={() => navigate(`/profesional/${professional.id}`)}
    >
      {/* Header rojo */}
      <div
        className="flex items-center gap-2 px-3 py-1.5"
        style={{ background: 'linear-gradient(90deg, #dc2626, #b91c1c)' }}
      >
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
        <span className="text-white text-[9px] font-bold tracking-[.5px] uppercase">
          Disponible ahora · 24H
        </span>
      </div>

      {/* Body */}
      <div className="p-3">
        {/* Perfil */}
        <div className="flex items-center gap-2.5 mb-2.5">
          <Avatar src={profiles.avatar_url} name={profiles.full_name} size="md" />
          <div className="min-w-0">
            <div className="text-[13px] font-extrabold text-text-main leading-tight">
              {profiles.full_name}
            </div>
            <div className="text-[11px] text-primary font-semibold mt-0.5">
              {specialty}{verified && ' · ✓ Verificado/a'}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-3 text-[11px] text-gray-500 mb-2">
          {avg_rating != null && <span>⭐ {avg_rating}</span>}
          <span>📍 {zone}</span>
          <span>🔧 {jobs_count} trabajos</span>
        </div>

        {/* Tiempo respuesta */}
        <div className="bg-red-50 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-danger mb-3">
          ⏱ Responde en ~{response_time_min} minutos
        </div>

        {/* Botones */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleCall}
            className="bg-primary text-white rounded-xl py-2.5 text-[12px] font-bold flex items-center justify-center gap-1.5 active:opacity-80 transition-opacity"
          >
            📞 Llamar
          </button>
          <button
            type="button"
            onClick={handleWhatsApp}
            className="bg-whatsapp text-white rounded-xl py-2.5 text-[12px] font-bold flex items-center justify-center gap-1.5 active:opacity-80 transition-opacity"
          >
            💬 WhatsApp
          </button>
        </div>
      </div>
    </div>
  )
}

export default UrgentProfessionalCard
```

- [ ] **Step 2: Commit**

```bash
git add src/components/professionals/UrgentProfessionalCard.tsx
git commit -m "feat: UrgentProfessionalCard con header rojo, dot animado, botones llamar/WhatsApp"
```

---

## Task 8: Crear página Urgencias

**Files:**
- Create: `src/pages/Urgencias.tsx`

- [ ] **Step 1: Crear la página**

```tsx
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PageShell } from '../components/layout/PageShell'
import { UrgentProfessionalCard } from '../components/professionals/UrgentProfessionalCard'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { useUrgentProfessionals } from '../hooks/useProfessionals'

export default function Urgencias() {
  const navigate = useNavigate()
  const { professionals, loading } = useUrgentProfessionals()

  const header = (
    <div
      className="px-4 pt-10 pb-5 sticky top-0 z-50"
      style={{ background: 'linear-gradient(160deg, #dc2626 0%, #991b1b 100%)' }}
    >
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-white/80 text-sm mb-4 active:opacity-60 transition-opacity"
      >
        <ArrowLeft size={16} />
        Volver
      </button>
      <h1 className="text-2xl font-black text-white mb-1">🚨 Urgencias 24H</h1>
      <p className="text-white/75 text-sm mb-3">Profesionales disponibles ahora mismo</p>
      {!loading && (
        <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-3 py-1.5">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-white text-[11px] font-bold">
            {professionals.length} disponibles ahora
          </span>
        </div>
      )}
    </div>
  )

  return (
    <PageShell header={header} showBottomNav={false}>
      <div className="p-4 flex flex-col gap-3">
        {loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        )}
        {!loading && professionals.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">😴</div>
            <p className="text-gray-500 font-medium">No hay profesionales disponibles ahora</p>
            <p className="text-gray-400 text-sm mt-1">Intentá de nuevo en unos minutos</p>
          </div>
        )}
        {professionals.map((pro) => (
          <UrgentProfessionalCard key={pro.id} professional={pro} />
        ))}
      </div>
    </PageShell>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/Urgencias.tsx
git commit -m "feat: página /urgencias con header rojo, lista de profesionales disponibles 24H"
```

---

## Task 9: Rediseñar Home

**Files:**
- Modify: `src/pages/Home.tsx`

- [ ] **Step 1: Reemplazar Home completo**

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { Button } from '../components/ui/Button'
import { SearchBar } from '../components/home/SearchBar'
import { CategoryGrid } from '../components/home/CategoryGrid'
import { FeaturedProfessionals } from '../components/home/FeaturedProfessionals'
import { UrgenciasBanner } from '../components/home/UrgenciasBanner'

export default function Home() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function handleSearch() {
    const trimmed = query.trim()
    navigate(trimmed ? `/buscar/${encodeURIComponent(trimmed)}` : '/buscar')
  }

  const homeHeader = (
    <header className="bg-primary px-4 pt-10 pb-5 sticky top-0 z-50">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-[22px] font-black text-white leading-none">
            Oficio<span className="text-accent">Ya</span>
          </h1>
          <p className="text-white/60 text-[11px] mt-0.5">📍 Montevideo</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-lg"
          style={{ background: 'rgba(255,255,255,.15)', border: '1.5px solid rgba(255,255,255,.3)' }}
          aria-label="Mi cuenta"
        >
          👤
        </button>
      </div>
      <SearchBar value={query} onChange={setQuery} onSearch={handleSearch} />
    </header>
  )

  return (
    <PageShell header={homeHeader} showBottomNav>
      <div className="px-4 py-5 flex flex-col gap-6">

        {/* Categorías */}
        <section>
          <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-[.6px] mb-2.5">
            ¿Qué necesitás?
          </h2>
          <CategoryGrid />
        </section>

        {/* Profesionales destacados */}
        <FeaturedProfessionals />

        {/* Urgencias 24H */}
        <section>
          <UrgenciasBanner />
        </section>

        {/* CTA profesional */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
          <div>
            <h2 className="text-[13px] font-bold text-text-main">¿Sos profesional?</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Unite a OficiosYa y conseguí clientes en tu zona.
            </p>
          </div>
          <Button variant="secondary" size="md" fullWidth onClick={() => navigate('/pro/registro')}>
            Registrarme como profesional
          </Button>
        </section>

      </div>
    </PageShell>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/Home.tsx
git commit -m "feat: Home rediseñado — hero verde, categorías, destacados, urgencias, CTA pro"
```

---

## Task 10: Actualizar rutas y Search

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/pages/Search.tsx`

- [ ] **Step 1: Añadir import y ruta en App.tsx**

En `src/App.tsx`, añadir el import después de los existentes:

```tsx
import Urgencias from './pages/Urgencias'
```

Y añadir la ruta dentro de `<Routes>`, después de la ruta `/buscar`:

```tsx
<Route path="/urgencias" element={<Urgencias />} />
```

- [ ] **Step 2: Añadir nuevas categorías en Search.tsx**

En `src/pages/Search.tsx`, reemplazar `CATEGORY_LABELS`:

```tsx
const CATEGORY_LABELS: Record<string, string> = {
  electricista: 'Electricistas',
  plomero: 'Sanitarios',
  aire_acondicionado: 'Aire Acondicionado',
  cerrajero: 'Cerrajeros',
  albanil: 'Albañiles',
}
```

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx src/pages/Search.tsx
git commit -m "feat: ruta /urgencias registrada + Search soporta cerrajero y albanil"
```

---

## Task 11: Verificación visual final

- [ ] **Step 1: Arrancar el servidor de desarrollo**

```bash
npm run dev
```

Abrir `http://localhost:5173` (o el puerto que indique Vite).

- [ ] **Step 2: Checklist visual**

Verificar en ventana de ~375px de ancho (DevTools → dispositivo iPhone 12/13):

**Home:**
- [ ] Header verde sticky con logo + subtítulo Montevideo + avatar button
- [ ] SearchBar fondo blanco con icono verde
- [ ] Categorías: 3 en fila 1 (⚡🚿❄️), 2 en fila 2 (🔑🧱)
- [ ] Sección "Profesionales destacados" con cards de Carlos, Roberto y Ana (los 3 con `featured: true`)
- [ ] Banner Urgencias 24H rojo con dot verde pulsando
- [ ] CTA "¿Sos profesional?"
- [ ] BottomNav con Inicio activo

**Navegación:**
- [ ] Tap en categoría → `/buscar/:id` con label correcto
- [ ] Tap en banner urgencias → `/urgencias`
- [ ] Tap en profesional destacado → `/profesional/:id`

**Urgencias:**
- [ ] Header rojo gradient con botón volver
- [ ] Badge "X disponibles ahora" con dot animado
- [ ] 3 cards con header rojo, stats y botones Llamar/WhatsApp
- [ ] Tap en card → `/profesional/:id`
- [ ] Tap WhatsApp → abre `wa.me/...` en nueva pestaña

**Sin overflow:**
- [ ] No hay scroll horizontal en ninguna pantalla
- [ ] No hay texto cortado
- [ ] Botones tienen tamaño táctil cómodo (mínimo 44px de alto)

- [ ] **Step 3: Commit final si todo está bien**

```bash
git add -A
git commit -m "feat: premium redesign completo — verificación visual OK"
```
