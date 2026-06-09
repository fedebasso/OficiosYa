# Dark Premium Theme — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar completamente el tema verde por Dark Premium: fondo negro `#0f0f0f`, acento naranja `#e8683a`, tipografía DM Sans + DM Serif Display.

**Architecture:** Cambio de tokens en Tailwind config + CSS global, luego actualización pantalla por pantalla. Sin cambios de lógica ni rutas.

**Tech Stack:** React + TypeScript + Tailwind CSS v3 + Vite

---

### Task 1: Tokens de color y tipografía globales

**Files:**
- Modify: `tailwind.config.js`
- Modify: `index.html`
- Modify: `src/index.css`

- [ ] **Actualizar `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:    '#e8683a',
        accent:     '#f5b99a',
        background: '#0f0f0f',
        'bg-card':  '#141414',
        'bg-elevated': '#1a1a1a',
        'border-dark': '#1e1e1e',
        'text-main': '#f5f0e8',
        'text-secondary': '#888888',
        'text-muted': '#555555',
        danger:     '#dc2626',
        'danger-dark': '#991b1b',
        whatsapp:   '#25D366',
        star:       '#f59e0b',
      },
      fontFamily: {
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['DM Serif Display', 'serif'],
      },
    },
  },
  plugins: [],
}
```

- [ ] **Agregar fuentes en `index.html`** (dentro de `<head>`)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet">
```

- [ ] **Actualizar `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    background-color: #0f0f0f;
    color: #f5f0e8;
    font-family: 'DM Sans', system-ui, sans-serif;
  }
}
```

- [ ] **Verificar que el servidor de dev compila sin errores**

```bash
# El servidor ya está corriendo en http://localhost:5173
# Revisar consola del navegador — no debe haber errores de Tailwind
```

- [ ] **Commit**

```bash
cd /c/Users/fede8/Documents/OficiosYa/oficioYa
git add tailwind.config.js index.html src/index.css
git commit -m "feat: dark theme — tokens, paleta naranja y tipografía DM Sans/Serif"
```

---

### Task 2: Layout global — Header, BottomNav, PageShell

**Files:**
- Modify: `src/components/layout/Header.tsx`
- Modify: `src/components/layout/BottomNav.tsx`
- Modify: `src/components/layout/PageShell.tsx`

- [ ] **Actualizar `src/components/layout/Header.tsx`**

```tsx
import { ChevronLeft } from 'lucide-react'

interface HeaderProps {
  title?: string
  showBack?: boolean
  onBack?: () => void
}

export function Header({ title, showBack = false, onBack }: HeaderProps) {
  return (
    <header className="bg-background border-b border-border-dark px-4 py-3 flex items-center gap-3 sticky top-0 z-50">
      {showBack && (
        <button
          onClick={onBack}
          aria-label="Volver"
          className="p-1 -ml-1 rounded-full hover:bg-bg-elevated active:bg-bg-elevated transition-colors"
        >
          <ChevronLeft size={24} className="text-text-main" />
        </button>
      )}

      {!showBack && (
        <span className="text-xl font-display text-text-main tracking-tight">
          Oficio<span className="text-primary">Ya</span>
        </span>
      )}

      {title && showBack && (
        <span className="text-lg font-semibold text-text-main truncate">{title}</span>
      )}

      {!showBack && title && (
        <span className="ml-auto text-lg font-semibold text-text-main truncate">{title}</span>
      )}
    </header>
  )
}

export default Header
```

- [ ] **Actualizar `src/components/layout/BottomNav.tsx`**

```tsx
import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { House, Search, FileText } from 'lucide-react'

interface NavTab {
  label: string
  to: string
  icon: ReactNode
}

const tabs: NavTab[] = [
  { label: 'Inicio',      to: '/',               icon: <House size={22} /> },
  { label: 'Buscar',      to: '/buscar',          icon: <Search size={22} /> },
  { label: 'Solicitudes', to: '/mis-solicitudes', icon: <FileText size={22} /> },
]

export function BottomNav() {
  const { pathname } = useLocation()

  function isActive(to: string): boolean {
    if (to === '/') return pathname === '/'
    return pathname.startsWith(to)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border-dark flex">
      {tabs.map((tab) => {
        const active = isActive(tab.to)
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={[
              'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors',
              active ? 'text-primary' : 'text-text-muted',
            ].join(' ')}
            aria-current={active ? 'page' : undefined}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export default BottomNav
```

- [ ] **Verificar en http://localhost:5173 que el nav inferior y header se ven oscuros**

- [ ] **Commit**

```bash
git add src/components/layout/Header.tsx src/components/layout/BottomNav.tsx
git commit -m "feat: dark theme — Header y BottomNav oscuros"
```

---

### Task 3: Home — hero, categorías y sección recomendados

**Files:**
- Modify: `src/pages/Home.tsx`
- Modify: `src/components/home/SearchBar.tsx`
- Modify: `src/components/home/FeaturedProfessionals.tsx`

- [ ] **Leer `src/components/home/SearchBar.tsx` para entender su estructura actual antes de editar**

- [ ] **Actualizar `src/pages/Home.tsx`**

```tsx
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { SearchBar } from '../components/home/SearchBar'
import { CategoryGrid } from '../components/home/CategoryGrid'
import { FeaturedProfessionals } from '../components/home/FeaturedProfessionals'

export default function Home() {
  const navigate = useNavigate()

  const homeHeader = (
    <header className="bg-background border-b border-border-dark px-4 pt-10 pb-5 sticky top-0 z-50">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-[22px] font-display text-text-main leading-none">
            Oficio<span className="text-primary">Ya</span>
          </h1>
          <p className="text-text-muted text-[11px] mt-0.5">📍 Montevideo</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="w-9 h-9 rounded-full flex items-center justify-center text-text-main text-lg focus:outline-none"
          style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)' }}
          aria-label="Mi cuenta"
        >
          👤
        </button>
      </div>
      <SearchBar onSearch={() => navigate('/buscar')} />
    </header>
  )

  return (
    <PageShell header={homeHeader} showBottomNav>
      <div className="px-4 py-5 flex flex-col gap-6">

        {/* Hero */}
        <section
          className="rounded-2xl overflow-hidden px-5 py-6 relative"
          style={{
            background: 'linear-gradient(135deg, #1a1008 0%, #2d1f0e 50%, #1a1008 100%)',
            border: '1px solid #2a1f10',
          }}
        >
          <div
            className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(232,104,58,.12) 0%, transparent 70%)' }}
          />
          <div
            className="inline-block text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
            style={{
              background: 'rgba(232,104,58,.15)',
              border: '1px solid rgba(232,104,58,.3)',
              color: '#e8683a',
            }}
          >
            Disponible ahora
          </div>
          <h2 className="font-display text-2xl text-text-main leading-tight mb-2">
            Tu <span className="text-primary">oficio</span>,<br />cuando lo necesitás
          </h2>
          <p className="text-text-secondary text-xs leading-relaxed">
            Electricistas, plomeros, albañiles y más — verificados y disponibles en tu zona.
          </p>
        </section>

        {/* Categorías */}
        <section>
          <h2 className="text-[11px] font-bold text-text-secondary uppercase tracking-[.6px] mb-2.5">
            ¿Qué necesitás?
          </h2>
          <CategoryGrid />
        </section>

        {/* Más recomendados */}
        <FeaturedProfessionals />

        {/* CTA profesional */}
        <section
          className="rounded-2xl p-4 flex flex-col gap-3"
          style={{ background: '#141414', border: '1px solid #1e1e1e' }}
        >
          <div>
            <h2 className="text-[13px] font-bold text-text-main">¿Sos profesional?</h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Unite a OficiosYa y conseguí clientes en tu zona.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/pro/registro')}
            className="w-full rounded-xl py-3 text-sm font-bold text-text-main transition-opacity active:opacity-70"
            style={{ background: '#1e1e1e', border: '1px solid #2a2a2a' }}
          >
            Registrarme como profesional
          </button>
        </section>

      </div>
    </PageShell>
  )
}
```

- [ ] **Actualizar `src/components/home/FeaturedProfessionals.tsx`** — cambiar título a "Más recomendados" y adaptar colores:

Leer el archivo actual primero, luego reemplazar el título de la sección de "Destacados" / "Disponibles ahora" por "Más recomendados" y cambiar colores de cards a dark.

```tsx
// Buscar la línea con el título de la sección y reemplazar:
// ANTES: cualquier texto como "Destacados", "Disponibles ahora", "Profesionales destacados"
// DESPUÉS:
<h2 className="text-[11px] font-bold text-text-secondary uppercase tracking-[.6px] mb-2.5">
  Más recomendados
</h2>
// Y las cards de fondo blanco cambiar a bg-bg-card con border-border-dark
```

- [ ] **Verificar Home en http://localhost:5173**

- [ ] **Commit**

```bash
git add src/pages/Home.tsx src/components/home/FeaturedProfessionals.tsx
git commit -m "feat: dark theme — Home hero oscuro y sección Más recomendados"
```

---

### Task 4: ProfessionalCard — dark horizontal

**Files:**
- Modify: `src/components/professionals/ProfessionalCard.tsx`

- [ ] **Reemplazar `src/components/professionals/ProfessionalCard.tsx` completo**

```tsx
import type { ProfessionalWithProfile } from '../../hooks/useProfessionals'

interface Props {
  professional: ProfessionalWithProfile
  onClick: () => void
}

const CATEGORY_COVER: Record<string, string> = {
  electricista:     'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=75',
  plomero:          'https://images.unsplash.com/photo-1621905251189-08b45249a5c5?w=400&q=75',
  albanil:          'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=75',
  cerrajero:        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&q=75',
  aire_acondicionado: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&q=75',
}

const CATEGORY_EMOJI: Record<string, string> = {
  electricista:     '⚡',
  plomero:          '🔧',
  albanil:          '🏗️',
  cerrajero:        '🔑',
  aire_acondicionado: '❄️',
}

const CATEGORY_LABELS: Record<string, string> = {
  electricista:     'Electricista',
  plomero:          'Plomero',
  albanil:          'Albañil',
  cerrajero:        'Cerrajero',
  aire_acondicionado: 'Aire Acondicionado',
}

// Color accent lateral por categoría
const CATEGORY_ACCENT: Record<string, string> = {
  electricista:     '#e8683a',
  plomero:          '#3b82f6',
  albanil:          '#f59e0b',
  cerrajero:        '#8b5cf6',
  aire_acondicionado: '#14b8a6',
}

function getInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')
}

export function ProfessionalCard({ professional, onClick }: Props) {
  const { profiles, verified, avg_rating, zone, jobs_count, available_now, categories } = professional
  const cat = categories[0] ?? ''
  const cover  = CATEGORY_COVER[cat]  ?? 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=75'
  const emoji  = CATEGORY_EMOJI[cat]  ?? '🛠️'
  const label  = CATEGORY_LABELS[cat] ?? cat
  const accent = CATEGORY_ACCENT[cat] ?? '#e8683a'
  const initials = getInitials(profiles.full_name)

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl overflow-hidden active:scale-[.99] transition-all duration-150 flex items-stretch"
      style={{ background: '#141414', border: '1px solid #1e1e1e' }}
    >
      {/* Barra de color lateral por categoría */}
      <div className="w-1 flex-shrink-0" style={{ background: accent }} />

      {/* Foto cuadrada */}
      <div className="w-[72px] h-[72px] flex-shrink-0 overflow-hidden rounded-xl m-3 bg-bg-elevated">
        {profiles.avatar_url ? (
          <img src={profiles.avatar_url} alt={profiles.full_name} className="w-full h-full object-cover" />
        ) : (
          <img src={cover} alt={label} className="w-full h-full object-cover" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 py-3 pr-2 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="font-semibold text-text-main text-sm truncate">{profiles.full_name}</span>
          {verified && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{ background: 'rgba(232,104,58,.15)', color: '#e8683a' }}>✓</span>
          )}
        </div>
        <div className="text-[11px] font-medium mb-1.5" style={{ color: accent }}>
          {emoji} {label}
        </div>
        <div className="flex gap-3">
          {jobs_count > 0 && (
            <span className="text-[10px] text-text-muted">
              <span className="text-text-secondary font-semibold">{jobs_count}</span> trabajos
            </span>
          )}
          <span className="text-[10px] text-text-muted">{zone}</span>
        </div>
      </div>

      {/* Rating + badge */}
      <div className="flex flex-col items-end justify-between py-3 pr-3 flex-shrink-0">
        {available_now ? (
          <span className="text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wide"
            style={{ background: 'rgba(232,104,58,.12)', color: '#e8683a', border: '1px solid rgba(232,104,58,.2)' }}>
            ● Online
          </span>
        ) : (
          <span className="text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wide"
            style={{ background: 'rgba(255,255,255,.04)', color: '#555', border: '1px solid #222' }}>
            Ocupado
          </span>
        )}
        {avg_rating != null && (
          <span className="text-sm font-bold text-text-main">
            <span className="text-star">★</span> {avg_rating}
          </span>
        )}
      </div>
    </button>
  )
}
```

- [ ] **Verificar cards en http://localhost:5173/buscar/electricista**

- [ ] **Commit**

```bash
git add src/components/professionals/ProfessionalCard.tsx
git commit -m "feat: dark theme — ProfessionalCard horizontal con barra de color"
```

---

### Task 5: ProfessionalProfile — dark hero

**Files:**
- Modify: `src/components/professionals/ProfessionalProfile.tsx`

- [ ] **Reemplazar `src/components/professionals/ProfessionalProfile.tsx` completo**

```tsx
import { useNavigate } from 'react-router-dom'
import { WorkPhotoGallery } from './WorkPhotoGallery'
import type { ProfessionalWithProfile, WorkPhoto } from '../../hooks/useProfessionals'

interface Props {
  professional: ProfessionalWithProfile
  photos: WorkPhoto[]
}

const CATEGORY_LABELS: Record<string, string> = {
  electricista:     'Electricista',
  plomero:          'Plomero',
  aire_acondicionado: 'Aire Acondicionado',
  cerrajero:        'Cerrajero/a',
  albanil:          'Albañil',
}

const CATEGORY_EMOJI: Record<string, string> = {
  electricista:     '⚡',
  plomero:          '🔧',
  albanil:          '🏗️',
  cerrajero:        '🔑',
  aire_acondicionado: '❄️',
}

const CATEGORY_COVER: Record<string, string> = {
  electricista:     'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  plomero:          'https://images.unsplash.com/photo-1621905251189-08b45249a5c5?w=800&q=80',
  albanil:          'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
  cerrajero:        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80',
  aire_acondicionado: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80',
}

function getInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')
}

export function ProfessionalProfile({ professional, photos }: Props) {
  const navigate = useNavigate()
  const {
    profiles, bio, avg_rating, verified, zone, categories,
    whatsapp, id, jobs_count, response_time_min, available_now,
  } = professional

  const cat     = categories[0] ?? ''
  const specialty = `${CATEGORY_EMOJI[cat] ?? '🛠️'} ${CATEGORY_LABELS[cat] ?? cat}`
  const cover   = CATEGORY_COVER[cat] ?? 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80'
  const initials = getInitials(profiles.full_name)

  return (
    <div className="flex flex-col min-h-screen bg-background">

      {/* ── HERO ── */}
      <div className="relative h-72 overflow-hidden flex-shrink-0" style={{ background: '#111' }}>
        <img src={cover} alt={specialty} className="w-full h-full object-cover opacity-40" />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(15,15,15,.3) 0%, rgba(15,15,15,.85) 100%)' }}
        />

        {/* Nav */}
        <div className="absolute top-10 left-4 right-4 flex justify-between items-center z-10">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Volver"
            className="w-9 h-9 rounded-full flex items-center justify-center text-text-main text-base"
            style={{ background: 'rgba(255,255,255,.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,.12)' }}
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Guardar"
            className="w-9 h-9 rounded-full flex items-center justify-center text-text-main text-base"
            style={{ background: 'rgba(255,255,255,.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,.12)' }}
          >
            ♡
          </button>
        </div>

        {/* Contenido centrado */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-5 z-10">
          {/* Avatar circular con borde naranja */}
          <div
            className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center mb-3 flex-shrink-0"
            style={{
              border: '3px solid rgba(232,104,58,.7)',
              boxShadow: '0 0 0 6px rgba(232,104,58,.08)',
            }}
          >
            {profiles.avatar_url ? (
              <img src={profiles.avatar_url} alt={profiles.full_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary/20 flex items-center justify-center text-text-main text-2xl font-black">
                {initials}
              </div>
            )}
          </div>

          {available_now && (
            <div
              className="flex items-center gap-1.5 text-text-main text-[10px] font-bold px-3 py-1.5 rounded-full mb-2"
              style={{ background: 'rgba(232,104,58,.15)', border: '1px solid rgba(232,104,58,.25)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Disponible ahora
            </div>
          )}

          <h1
            className="font-display text-2xl text-text-main text-center leading-tight px-4"
            style={{ letterSpacing: '-0.5px' }}
          >
            {profiles.full_name}
          </h1>
          <p className="text-text-secondary text-sm font-medium mt-1">{specialty} · {zone}</p>

          {/* Stats pill */}
          <div
            className="flex mt-4 rounded-2xl overflow-hidden"
            style={{ background: 'rgba(0,0,0,.35)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,.08)' }}
          >
            <div className="px-5 py-2.5 text-center border-r" style={{ borderColor: 'rgba(255,255,255,.08)' }}>
              <div className="text-sm font-black text-text-main">
                {avg_rating != null ? <><span className="text-star">★</span> {avg_rating}</> : '–'}
              </div>
              <div className="text-[9px] text-text-muted mt-0.5 uppercase tracking-wider">Rating</div>
            </div>
            <div className="px-5 py-2.5 text-center border-r" style={{ borderColor: 'rgba(255,255,255,.08)' }}>
              <div className="text-sm font-black text-text-main">{jobs_count}</div>
              <div className="text-[9px] text-text-muted mt-0.5 uppercase tracking-wider">Trabajos</div>
            </div>
            <div className="px-5 py-2.5 text-center">
              <div className="text-sm font-black text-text-main">
                {available_now ? `~${response_time_min}m` : '–'}
              </div>
              <div className="text-[9px] text-text-muted mt-0.5 uppercase tracking-wider">Respuesta</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="flex flex-col gap-3 px-4 pt-4 pb-28">

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {verified && (
            <span className="rounded-full text-[11px] font-semibold px-3 py-1"
              style={{ background: 'rgba(59,130,246,.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,.2)' }}>
              ✓ Verificado
            </span>
          )}
          {available_now && (
            <span className="rounded-full text-[11px] font-semibold px-3 py-1"
              style={{ background: 'rgba(232,104,58,.1)', color: '#e8683a', border: '1px solid rgba(232,104,58,.2)' }}>
              ● Disponible
            </span>
          )}
          <span className="rounded-full text-[11px] font-semibold px-3 py-1"
            style={{ background: '#1a1a1a', color: '#888', border: '1px solid #2a2a2a' }}>
            📍 {zone}
          </span>
        </div>

        {/* Sobre mí */}
        {bio && (
          <div className="rounded-2xl p-4" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Sobre mí</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{bio}</p>
          </div>
        )}

        {/* Servicios */}
        <div className="rounded-2xl p-4" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Servicios</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <span
                key={c}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl"
                style={{ background: 'rgba(232,104,58,.1)', color: '#e8683a', border: '1px solid rgba(232,104,58,.2)' }}
              >
                {CATEGORY_EMOJI[c] ?? '🛠️'} {CATEGORY_LABELS[c] ?? c}
              </span>
            ))}
          </div>
        </div>

        {/* Fotos */}
        {photos.length > 0 && (
          <div className="rounded-2xl p-4" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Trabajos realizados</h3>
            <WorkPhotoGallery photos={photos} />
          </div>
        )}
      </div>

      {/* ── CTA FIJO ── */}
      <div
        className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 grid gap-3"
        style={{
          gridTemplateColumns: '1fr 2fr',
          background: 'linear-gradient(to top, #0f0f0f 70%, transparent)',
        }}
      >
        <button
          type="button"
          onClick={() => window.open(`https://wa.me/${whatsapp}`, '_blank', 'noopener,noreferrer')}
          className="rounded-2xl py-3.5 text-sm font-bold text-text-secondary flex items-center justify-center gap-1.5 active:opacity-70 transition-opacity"
          style={{ border: '1px solid #2a2a2a', background: '#141414' }}
        >
          💬 Chat
        </button>
        <button
          type="button"
          onClick={() => navigate(`/solicitar/${id}`)}
          className="bg-primary text-white rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-1.5 active:opacity-80 transition-opacity"
          style={{ boxShadow: '0 4px 16px rgba(232,104,58,.3)' }}
        >
          Solicitar trabajo
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Verificar perfil en http://localhost:5173/profesional/1**

- [ ] **Commit**

```bash
git add src/components/professionals/ProfessionalProfile.tsx
git commit -m "feat: dark theme — ProfessionalProfile hero oscuro con avatar naranja"
```

---

### Task 6: Login y Register — dark

**Files:**
- Modify: `src/pages/Login.tsx`
- Modify: `src/pages/Register.tsx`

- [ ] **En `Login.tsx` reemplazar el hero verde por dark**

Buscar el bloque del hero (div con `bg-primary`) y reemplazarlo:

```tsx
{/* Hero oscuro */}
<div
  className="px-6 pt-16 pb-14 flex flex-col items-center gap-2 relative"
  style={{ background: 'linear-gradient(160deg, #1a1008 0%, #2d1f0e 100%)' }}
>
  <h1 className="font-display text-4xl text-text-main tracking-tight leading-none">
    Oficio<span className="text-primary">Ya</span>
  </h1>
  <p className="text-text-muted text-sm">Profesionales de confianza en Montevideo</p>
  <div className="absolute bottom-0 left-0 right-0 h-8 bg-background rounded-t-[32px]" />
</div>
```

Reemplazar el fondo del form (si usa `bg-background` en blanco, ya queda oscuro con el nuevo token).

Reemplazar inputs `bg-white border-gray-200` → `bg-bg-elevated border-border-dark text-text-main`:
```tsx
// Clase para inputs:
className="w-full bg-bg-elevated border border-border-dark rounded-2xl px-4 py-3 text-sm text-text-main placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
```

Reemplazar botón submit verde → naranja (ya queda con `bg-primary` por el nuevo token).

- [ ] **Aplicar los mismos cambios en `Register.tsx`** — mismo hero oscuro, mismos inputs.

- [ ] **Verificar Login en http://localhost:5173/login y Register en http://localhost:5173/registro**

- [ ] **Commit**

```bash
git add src/pages/Login.tsx src/pages/Register.tsx
git commit -m "feat: dark theme — Login y Register oscuros"
```

---

### Task 7: Search page — dark

**Files:**
- Modify: `src/pages/Search.tsx`

- [ ] **Actualizar header de búsqueda en `Search.tsx`** — cambiar colores del header bar:

```tsx
// El header ya usa bg-background — con el nuevo token queda oscuro automáticamente
// Solo actualizar el botón de Rating y el input:

// Botón Rating: bg-primary text-white (ya queda naranja con el nuevo token)

// Input de búsqueda:
<div className="flex-1 flex items-center gap-2 rounded-xl px-3 py-2"
  style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
  <span className="text-primary text-sm">🔍</span>
  <span className="text-sm text-text-muted truncate">{label}...</span>
</div>

// Texto contador:
<p className="text-[11px] text-text-muted">
  <strong className="text-text-main">{professionals.length}</strong> profesionales en Montevideo
</p>
```

- [ ] **Verificar en http://localhost:5173/buscar/plomero**

- [ ] **Commit**

```bash
git add src/pages/Search.tsx
git commit -m "feat: dark theme — Search page oscura"
```

---

### Task 8: Componentes UI menores — Button, LoadingSpinner, Avatar

**Files:**
- Modify: `src/components/ui/Button.tsx` (si existe)
- Modify: `src/components/ui/LoadingSpinner.tsx` (si existe)

- [ ] **Leer `src/components/ui/Button.tsx`** y adaptar variantes:
  - `variant="primary"` → `bg-primary text-white` (ya funciona con nuevo token)
  - `variant="secondary"` → `bg-bg-elevated border-border-dark text-text-main`
  - `variant="ghost"` → `text-primary hover:bg-bg-elevated`

- [ ] **Leer `src/components/ui/LoadingSpinner.tsx`** y cambiar color a `text-primary` (naranja).

- [ ] **Verificar que no queden clases hardcodeadas con verde** (`green-`, `#0F6E56`, `#16a34a`, `#22c55e`):

```bash
grep -r "green-\|#0F6E56\|#16a34a\|#22c55e\|#86efac\|#bbf7d0\|#dcfce7" src/ --include="*.tsx" --include="*.ts" -l
```

- [ ] **Corregir los archivos que aún tengan verde hardcodeado**

- [ ] **Commit**

```bash
git add src/components/ui/
git commit -m "feat: dark theme — componentes UI adaptados, verde eliminado"
```

---

### Task 9: Verificación final

- [ ] **Recorrer todas las rutas principales en http://localhost:5173**:
  - `/` — Home
  - `/buscar/electricista` — Search
  - `/profesional/1` — Profile
  - `/login` — Login
  - `/registro` — Register

- [ ] **Buscar cualquier remanente verde**:

```bash
grep -r "bg-green\|text-green\|border-green\|#16a34a\|#22c55e\|bg-primary.*old\|text-primary.*old" src/ --include="*.tsx" -l
```

- [ ] **TypeScript sin errores**:

```bash
cd /c/Users/fede8/Documents/OficiosYa/oficioYa && npx tsc --noEmit
```

- [ ] **Commit final**

```bash
git add -A
git commit -m "feat: dark premium theme completo — verde reemplazado por negro + naranja"
```
