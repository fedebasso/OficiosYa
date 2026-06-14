# Responsive System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar un sistema responsive premium con CSS custom properties fluidas + Tailwind breakpoints mobile-first, app shell centrada en 480px, safe areas iOS, y touch targets correctos en todos los componentes.

**Architecture:** Tokens CSS en `src/index.css` (tipografía y spacing fluidos con `clamp()`), breakpoints custom en `tailwind.config.js`, y un wrapper `AppContainer` en `PageShell` que centra la app a max 480px. Los componentes reemplazan valores hardcodeados por variables CSS.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v3, Vite, estilos inline existentes se mantienen pero con valores via `var(--token)`.

---

## Task 1: Tokens CSS + viewport-fit + Tailwind breakpoints

**Files:**
- Modify: `index.html`
- Modify: `tailwind.config.js`
- Modify: `src/index.css`

- [ ] **Step 1: Agregar `viewport-fit=cover` en index.html**

En `index.html`, reemplazar la línea del viewport:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```
Por:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

- [ ] **Step 2: Reemplazar breakpoints en tailwind.config.js**

Reemplazar el contenido de `tailwind.config.js` con:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      xs:  '320px',
      sm:  '375px',
      md:  '430px',
      lg:  '768px',
      xl:  '1024px',
    },
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

Nota: se usa `screens` (no `extend.screens`) para reemplazar completamente los breakpoints por defecto de Tailwind.

- [ ] **Step 3: Agregar tokens CSS en src/index.css**

En `src/index.css`, dentro del bloque `:root` existente (que ya tiene las easing vars), agregar los tokens responsive. El bloque `:root` debe quedar así:
```css
:root {
  /* ── EASING TOKENS (Emil Kowalski) ─────────────── */
  --ease-out:       cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out:    cubic-bezier(0.77, 0, 0.175, 1);
  --ease-spring:    cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-ios:       cubic-bezier(0.32, 0.72, 0, 1);

  /* ── TIPOGRAFÍA FLUIDA ──────────────────────────── */
  --text-xs:   clamp(11px, 2.8vw, 13px);
  --text-sm:   clamp(12px, 3.2vw, 14px);
  --text-base: clamp(14px, 3.7vw, 16px);
  --text-lg:   clamp(16px, 4.2vw, 18px);
  --text-xl:   clamp(18px, 4.8vw, 22px);
  --text-2xl:  clamp(22px, 5.5vw, 28px);

  /* ── SPACING FLUIDO ─────────────────────────────── */
  --space-1:  clamp(4px,  1vw,   6px);
  --space-2:  clamp(8px,  2vw,   10px);
  --space-3:  clamp(12px, 3vw,   14px);
  --space-4:  clamp(14px, 3.7vw, 16px);
  --space-5:  clamp(18px, 4.5vw, 20px);
  --space-6:  clamp(22px, 5.5vw, 24px);

  /* ── PADDING DE CONTENEDOR ──────────────────────── */
  --px-container: clamp(16px, 4.5vw, 24px);

  /* ── SAFE AREAS ─────────────────────────────────── */
  --safe-top:    env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
}
```

- [ ] **Step 4: TypeScript check**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa && node_modules/.bin/tsc --noEmit --project tsconfig.app.json
```
Expected: sin errores (este task no toca .tsx).

- [ ] **Step 5: Commit**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa
git add index.html tailwind.config.js src/index.css
git commit -m "feat(responsive): tokens CSS fluidos, breakpoints mobile-first, viewport-fit=cover"
```

---

## Task 2: PageShell — AppContainer centrado

**Files:**
- Modify: `src/components/layout/PageShell.tsx`

- [ ] **Step 1: Agregar AppContainer wrapper**

Reemplazar el contenido completo de `src/components/layout/PageShell.tsx`:
```tsx
import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'

interface PageShellProps {
  children: ReactNode
  header?: ReactNode
  showBottomNav?: boolean
}

export function PageShell({ children, header, showBottomNav = true }: PageShellProps) {
  return (
    <div style={{ background: '#F5F0E8', minHeight: '100dvh' }}>
      <div
        className="flex flex-col"
        style={{
          maxWidth: 480,
          margin: '0 auto',
          minHeight: '100dvh',
          background: '#F5F0E8',
          position: 'relative',
        }}
      >
        {header}
        <main
          className="flex-1"
          style={{
            paddingBottom: showBottomNav ? 'calc(64px + var(--safe-bottom))' : 0,
            paddingLeft: 'var(--px-container)',
            paddingRight: 'var(--px-container)',
          }}
        >
          {children}
        </main>
        {showBottomNav && <BottomNav />}
      </div>
    </div>
  )
}

export default PageShell
```

Nota: el `div` exterior fija el fondo cream en toda la pantalla (incluso fuera del max-width en tablet/desktop). El `div` interior es el app container centrado.

- [ ] **Step 2: TypeScript check**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa && node_modules/.bin/tsc --noEmit --project tsconfig.app.json
```
Expected: sin errores.

- [ ] **Step 3: Verificar visualmente**

Con el dev server corriendo (`npx vite --port 5173`), abrir http://localhost:5173 en el browser y verificar:
- En viewport 390px: la app ocupa 100% del ancho normalmente
- En viewport > 480px (agrandar ventana del browser): la app queda centrada con fondo cream en los costados

- [ ] **Step 4: Commit**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa
git add src/components/layout/PageShell.tsx
git commit -m "feat(responsive): AppContainer centrado max-width 480px en PageShell"
```

---

## Task 3: Header — safe-top + padding container

**Files:**
- Modify: `src/components/layout/Header.tsx`

- [ ] **Step 1: Aplicar safe-top y quitar px-4 hardcodeado**

Reemplazar el contenido completo de `src/components/layout/Header.tsx`:
```tsx
import { ChevronLeft } from 'lucide-react'

interface HeaderProps {
  title?: string
  showBack?: boolean
  onBack?: () => void
}

export function Header({ title, showBack = false, onBack }: HeaderProps) {
  return (
    <header
      className="flex items-center gap-3 sticky top-0 z-50"
      style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E8E0D4',
        boxShadow: '0 1px 0 #E8E0D4, 0 2px 8px rgba(0,0,0,.04)',
        paddingTop: 'calc(12px + var(--safe-top))',
        paddingBottom: '12px',
        paddingLeft: 'var(--px-container)',
        paddingRight: 'var(--px-container)',
        minHeight: 'calc(56px + var(--safe-top))',
      }}
    >
      {showBack && (
        <button
          onClick={onBack}
          aria-label="Volver"
          className="p-1 -ml-1 rounded-full active:opacity-60 transition-opacity"
        >
          <ChevronLeft size={24} style={{ color: '#111111' }} />
        </button>
      )}

      {!showBack && (
        <span
          className="font-black tracking-tight"
          style={{ color: '#111111', fontSize: 'var(--text-xl)' }}
        >
          Oficio<span style={{ color: '#E8683A' }}>Ya</span>
        </span>
      )}

      {title && showBack && (
        <span
          className="font-bold truncate"
          style={{ color: '#111111', fontSize: 'var(--text-base)' }}
        >
          {title}
        </span>
      )}

      {!showBack && title && (
        <span
          className="ml-auto font-bold truncate"
          style={{ color: '#111111', fontSize: 'var(--text-base)' }}
        >
          {title}
        </span>
      )}
    </header>
  )
}

export default Header
```

- [ ] **Step 2: TypeScript check**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa && node_modules/.bin/tsc --noEmit --project tsconfig.app.json
```
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa
git add src/components/layout/Header.tsx
git commit -m "feat(responsive): Header con safe-top y tipografía fluida"
```

---

## Task 4: BottomNav — safe-bottom + centrado dentro del AppContainer

**Files:**
- Modify: `src/components/layout/BottomNav.tsx`

- [ ] **Step 1: Aplicar safe-bottom y centrar dentro del container**

El `BottomNav` usa `fixed bottom-0 left-0 right-0` — esto lo ancla al viewport completo, no al container de 480px. Hay que acotarlo al container. Reemplazar el contenido completo de `src/components/layout/BottomNav.tsx`:
```tsx
import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { House, Search, FileText, Briefcase, UserCircle, Heart } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useFavoritesStore } from '../../store/favoritesStore'

interface NavTab { label: string; to: string; icon: ReactNode; badge?: number | null }

export function BottomNav() {
  const { pathname } = useLocation()
  const user = useAuthStore((s) => s.user)
  const favCount = useFavoritesStore((s) => s.ids.length)

  const clientTabs: NavTab[] = [
    { label: 'Inicio',      to: '/',               icon: <House size={22} /> },
    { label: 'Buscar',      to: '/buscar',          icon: <Search size={22} /> },
    { label: 'Favoritos',   to: '/favoritos',       icon: <Heart size={22} />, badge: favCount > 0 ? favCount : null },
    { label: 'Solicitudes', to: '/mis-solicitudes', icon: <FileText size={22} /> },
  ]

  const proTabs: NavTab[] = [
    { label: 'Inicio',      to: '/',                icon: <House size={22} /> },
    { label: 'Solicitudes', to: '/pro/solicitudes', icon: <FileText size={22} /> },
    { label: 'Trabajos',    to: '/pro/trabajos',    icon: <Briefcase size={22} /> },
    { label: 'Perfil',      to: '/pro/perfil',      icon: <UserCircle size={22} /> },
  ]

  const tabs = user?.role === 'professional' ? proTabs : clientTabs

  function isActive(to: string): boolean {
    if (to === '/') return pathname === '/'
    return pathname.startsWith(to)
  }

  return (
    <nav
      className="fixed bottom-0 z-50 flex"
      style={{
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 480,
        background: '#FFFFFF',
        borderTop: '1px solid #E8E0D4',
        boxShadow: '0 -1px 0 #E8E0D4',
        paddingBottom: 'var(--safe-bottom)',
        minHeight: 'calc(60px + var(--safe-bottom))',
      }}
    >
      {tabs.map((tab) => {
        const active = isActive(tab.to)
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-opacity active:opacity-60"
            style={{
              color: active ? '#E8683A' : '#AAAAAA',
              paddingTop: 10,
              paddingBottom: 10,
              fontSize: 'var(--text-xs)',
            }}
            aria-current={active ? 'page' : undefined}
          >
            <div className="relative">
              {tab.icon}
              {'badge' in tab && tab.badge && (
                <span
                  className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center font-black text-white"
                  style={{ background: '#EF4444', fontSize: 9 }}
                >
                  {tab.badge}
                </span>
              )}
            </div>
            <span style={{ fontWeight: 700, fontSize: 'var(--text-xs)' }}>{tab.label}</span>
            {active && (
              <span
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full"
                style={{ background: '#E8683A' }}
              />
            )}
          </Link>
        )
      })}
    </nav>
  )
}

export default BottomNav
```

Nota: `left: '50%'` + `transform: 'translateX(-50%)'` + `maxWidth: 480` hace que el nav se alinee exactamente con el AppContainer en pantallas grandes.

- [ ] **Step 2: TypeScript check**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa && node_modules/.bin/tsc --noEmit --project tsconfig.app.json
```
Expected: sin errores.

- [ ] **Step 3: Verificar safe area (solo si tenés iPhone físico o simulador)**

En iPhone con home indicator (Face ID), el BottomNav debe tener espacio extra abajo del último tab. En el browser desktop no se ve — es correcto.

- [ ] **Step 4: Commit**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa
git add src/components/layout/BottomNav.tsx
git commit -m "feat(responsive): BottomNav safe-bottom + centrado en AppContainer"
```

---

## Task 5: CategoryGrid — 2 cols en xs, 3 cols en sm+

**Files:**
- Modify: `src/components/home/CategoryGrid.tsx`

- [ ] **Step 1: Unificar grid y hacer responsive**

El grid actual tiene lógica dividida en ROW_ONE (3 items) y ROW_TWO (2 items). Reemplazar por un grid único que cambia de 2 a 3 columnas según viewport. Reemplazar el contenido completo de `src/components/home/CategoryGrid.tsx`:
```tsx
import { useNavigate } from 'react-router-dom'

interface Category {
  id: string
  label: string
  emoji: string
  photo: string
}

const CATEGORIES: Category[] = [
  {
    id: 'electricista',
    label: 'Electricista',
    emoji: '⚡',
    photo: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&q=80',
  },
  {
    id: 'plomero',
    label: 'Sanitario',
    emoji: '🚿',
    photo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  },
  {
    id: 'aire_acondicionado',
    label: 'Aire Ac.',
    emoji: '❄️',
    photo: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&q=80',
  },
  {
    id: 'cerrajero',
    label: 'Cerrajero',
    emoji: '🔑',
    photo: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&q=80',
  },
  {
    id: 'albanil',
    label: 'Albañil',
    emoji: '🧱',
    photo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80',
  },
]

function CategoryButton({ cat, onClick }: { cat: Category; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative rounded-2xl overflow-hidden active:scale-[.97] transition-transform duration-150 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E8683A]"
      style={{ aspectRatio: '4/3', boxShadow: '0 2px 8px rgba(0,0,0,.08)' }}
    >
      <img
        src={cat.photo}
        alt={cat.label}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute inset-0 -z-10 flex items-center justify-center" style={{ background: 'rgba(232,104,58,.15)' }}>
        <span style={{ fontSize: 28 }}>{cat.emoji}</span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-2">
        <span
          className="text-white font-black leading-tight block truncate"
          style={{ fontSize: 'var(--text-sm)', textShadow: '0 1px 3px rgba(0,0,0,.6)' }}
        >
          {cat.label}
        </span>
      </div>
    </button>
  )
}

export function CategoryGrid() {
  const navigate = useNavigate()
  const go = (id: string) => navigate(`/buscar/${id}`)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {CATEGORIES.map((cat) => (
        <CategoryButton key={cat.id} cat={cat} onClick={() => go(cat.id)} />
      ))}
    </div>
  )
}

export default CategoryGrid
```

- [ ] **Step 2: TypeScript check**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa && node_modules/.bin/tsc --noEmit --project tsconfig.app.json
```
Expected: sin errores.

- [ ] **Step 3: Verificar visualmente**

En el browser, cambiar el viewport a 320px (Chrome DevTools → iPhone SE): debe verse 2 columnas. En 375px+: 3 columnas.

- [ ] **Step 4: Commit**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa
git add src/components/home/CategoryGrid.tsx
git commit -m "feat(responsive): CategoryGrid 2 cols xs → 3 cols sm+, texto fluido"
```

---

## Task 6: ProfessionalCard — overflow fix + spacing fluido

**Files:**
- Modify: `src/components/professionals/ProfessionalCard.tsx`

- [ ] **Step 1: Aplicar min-width:0 y tokens de tipografía**

Reemplazar el bloque `{/* Info */}` y los estilos de texto con vars CSS. El cambio clave es `min-width: 0` en todos los flex children que tienen `flex-1`, y `overflow: hidden` en el card. Reemplazar el contenido completo de `src/components/professionals/ProfessionalCard.tsx`:
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
      className="inline-flex items-center gap-1.5 font-bold px-2 py-1 rounded-full flex-shrink-0"
      style={{ background: '#DCFCE7', color: '#16A34A', fontSize: 'var(--text-xs)' }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: '#16A34A', animation: 'pulse-green 2s ease-in-out infinite' }}
      />
      Online
    </span>
  )
}

function TopBadge() {
  return (
    <span
      className="inline-flex items-center font-black px-2 py-1 rounded-full flex-shrink-0"
      style={{ background: '#FEF9C3', color: '#D97706', fontSize: 'var(--text-xs)' }}
    >
      ★ Top
    </span>
  )
}

export function ProfessionalCard({ professional, onClick }: Props) {
  const { profiles, verified, avg_rating, zone, jobs_count, available_now, categories, id } = professional
  const { label, emoji, accent } = getCategoryMeta(categories[0] ?? '')
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
        border: '1.5px solid #E8E0D4',
        boxShadow: '0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)',
      }}
    >
      {/* Barra de color por categoría */}
      <div className="w-1 flex-shrink-0" style={{ background: accent }} />

      {/* Contenido */}
      <div className="flex items-start gap-3 flex-1 min-w-0" style={{ padding: 'var(--space-3)' }}>
        {/* Avatar */}
        <div
          className="rounded-xl overflow-hidden flex-shrink-0"
          style={{ width: 64, height: 64, background: '#F5F0E8' }}
        >
          {profiles.avatar_url ? (
            <img src={profiles.avatar_url} alt={profiles.full_name} className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white font-black"
              style={{ background: `linear-gradient(135deg, ${accent}cc, ${accent})`, fontSize: 'var(--text-lg)' }}
            >
              {initials}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 py-0.5">
          {/* Nombre + verificado */}
          <div className="flex items-center gap-1.5 mb-0.5">
            <span
              className="font-bold truncate"
              style={{ color: '#111111', fontSize: 'var(--text-base)' }}
            >
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
          <div className="font-semibold mb-1.5 truncate" style={{ color: accent, fontSize: 'var(--text-sm)' }}>
            {emoji} {label}
          </div>

          {/* Zona + trabajos */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-medium truncate" style={{ color: '#555555', fontSize: 'var(--text-sm)' }}>
              📍 {zone}
            </span>
            <span className="flex-shrink-0" style={{ color: '#999999', fontSize: 'var(--text-xs)' }}>
              {jobs_count} trabajos
            </span>
          </div>
        </div>

        {/* Derecha: rating + corazón + badges */}
        <div className="flex flex-col items-end justify-between flex-shrink-0 py-0.5" style={{ minHeight: 64 }}>
          <div className="flex items-center gap-2">
            {/* Rating */}
            {avg_rating != null && (
              <div className="flex items-center gap-1">
                <span style={{ color: '#F59E0B', fontSize: 'var(--text-base)' }}>★</span>
                <span className="font-black" style={{ color: '#111111', fontSize: 'var(--text-lg)', lineHeight: 1 }}>
                  {avg_rating}
                </span>
              </div>
            )}
            {/* Favorito */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); toggle(id) }}
              aria-label={favorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
              className="w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform"
              style={{
                background: favorite ? '#FEF2F2' : '#F5F0E8',
                border: `1px solid ${favorite ? '#FECACA' : '#E8E0D4'}`,
              }}
            >
              <Heart
                size={13}
                style={{ color: favorite ? '#EF4444' : '#CCCCCC' }}
                fill={favorite ? '#EF4444' : 'none'}
              />
            </button>
          </div>

          {/* Badges — max 2 */}
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
git commit -m "feat(responsive): ProfessionalCard min-width:0, overflow fix, tokens fluidos"
```

---

## Task 7: SearchBar — font-size 16px (anti-zoom iOS)

**Files:**
- Modify: `src/components/home/SearchBar.tsx`

- [ ] **Step 1: Fijar font-size en el input**

El input actual usa `text-sm` (clase Tailwind). En iOS Safari, cualquier input con font-size < 16px dispara zoom automático. Reemplazar el contenido completo de `src/components/home/SearchBar.tsx`:
```tsx
import { useState, useRef } from 'react'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  onSearch: (query: string) => void
  initialValue?: string
}

export function SearchBar({ onSearch, initialValue = '' }: SearchBarProps) {
  const [value, setValue] = useState(initialValue)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(value.trim())
    inputRef.current?.blur()
  }

  const clear = () => {
    setValue('')
    onSearch('')
    inputRef.current?.focus()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-3 rounded-2xl"
      style={{
        background: '#FFFFFF',
        border: '1.5px solid #E8E0D4',
        height: 48,
        paddingLeft: 'var(--px-container)',
        paddingRight: 'var(--px-container)',
        boxShadow: '0 2px 8px rgba(0,0,0,.04)',
      }}
    >
      <Search size={16} style={{ color: '#E8683A', flexShrink: 0 }} />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Electricista, plomero, cerrajero..."
        className="flex-1 bg-transparent focus:outline-none min-w-0"
        style={{ color: '#111111', caretColor: '#E8683A', fontSize: 16 }}
      />
      {value && (
        <button type="button" onClick={clear} className="flex-shrink-0 active:opacity-60">
          <X size={15} style={{ color: '#AAAAAA' }} />
        </button>
      )}
    </form>
  )
}

export default SearchBar
```

- [ ] **Step 2: TypeScript check**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa && node_modules/.bin/tsc --noEmit --project tsconfig.app.json
```
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa
git add src/components/home/SearchBar.tsx
git commit -m "feat(responsive): SearchBar font-size 16px evita zoom iOS"
```

---

## Task 8: Button — min-height 44px (touch target iOS)

**Files:**
- Modify: `src/components/ui/Button.tsx`

- [ ] **Step 1: Aplicar min-height y font-size fluido**

iOS Human Interface Guidelines exige touch targets de al menos 44×44px. Reemplazar el contenido completo de `src/components/ui/Button.tsx`:
```tsx
import type { ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  onClick?: () => void
  children: ReactNode
  type?: 'button' | 'submit' | 'reset'
  className?: string
  fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary:   { background: '#E8683A', color: '#FFFFFF', boxShadow: '0 2px 8px rgba(232,104,58,.25)' },
  secondary: { background: '#F5F0E8', color: '#111111', border: '1.5px solid #E8E0D4' },
  ghost:     { background: 'transparent', color: '#E8683A' },
}

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { padding: '8px 12px',  fontSize: 'var(--text-sm)',  borderRadius: 12, minHeight: 44 },
  md: { padding: '10px 16px', fontSize: 'var(--text-base)', borderRadius: 12, minHeight: 44 },
  lg: { padding: '12px 24px', fontSize: 'var(--text-lg)',  borderRadius: 16, minHeight: 48 },
}

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  children,
  type = 'button',
  className = '',
  fullWidth = false,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center font-bold transition-[transform,opacity] duration-150 active:scale-[0.97] active:opacity-80 focus:outline-none',
        fullWidth ? 'w-full' : '',
        disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
        className,
      ].filter(Boolean).join(' ')}
      style={{ ...variantStyles[variant], ...sizeStyles[size] }}
    >
      {children}
    </button>
  )
}

export default Button
```

- [ ] **Step 2: TypeScript check**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa && node_modules/.bin/tsc --noEmit --project tsconfig.app.json
```
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa
git add src/components/ui/Button.tsx
git commit -m "feat(responsive): Button min-height 44px touch target, tamaños via CSS vars"
```

---

## Task 9: StatsBar — tipografía fluida

**Files:**
- Modify: `src/components/home/StatsBar.tsx`

- [ ] **Step 1: Reemplazar clases de texto hardcodeadas por vars**

Reemplazar solo las líneas con tamaños de texto en `src/components/home/StatsBar.tsx`. El cambio está en el componente `StatCount`:
```tsx
import { useEffect, useRef, useState } from 'react'

interface StatItem {
  value: number
  suffix: string
  label: string
  icon: string
}

const STATS: StatItem[] = [
  { value: 1200, suffix: '+', label: 'Trabajos', icon: '🔧' },
  { value: 98,   suffix: '%', label: 'Satisfacción', icon: '⭐' },
  { value: 30,   suffix: 'min', label: 'Respuesta', icon: '⚡' },
]

function useCountUp(target: number, duration = 1200, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    const startTime = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration, start])
  return count
}

function StatCount({ item, active }: { item: StatItem; active: boolean }) {
  const count = useCountUp(item.value, 1400, active)
  return (
    <div className="flex-1 text-center px-2">
      <div className="mb-1" style={{ color: '#AAAAAA', fontSize: 'var(--text-sm)' }}>{item.icon}</div>
      <div className="font-black leading-none" style={{ color: '#111111', fontSize: 'var(--text-xl)' }}>
        {count.toLocaleString()}<span style={{ color: '#E8683A' }}>{item.suffix}</span>
      </div>
      <div className="font-semibold uppercase tracking-wide mt-1" style={{ color: '#999999', fontSize: 'var(--text-xs)' }}>
        {item.label}
      </div>
    </div>
  )
}

export function StatsBar() {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setActive(true); obs.disconnect() } },
      { threshold: 0.5 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="rounded-2xl flex items-stretch overflow-hidden"
      style={{
        background: '#FFFFFF',
        border: '1.5px solid #E8E0D4',
        boxShadow: '0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)',
      }}
    >
      {STATS.map((stat, i) => (
        <div key={stat.label} className="flex-1 flex items-center" style={i > 0 ? { borderLeft: '1px solid #E8E0D4' } : {}}>
          <StatCount item={stat} active={active} />
        </div>
      ))}
    </div>
  )
}

export default StatsBar
```

- [ ] **Step 2: TypeScript check**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa && node_modules/.bin/tsc --noEmit --project tsconfig.app.json
```
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa
git add src/components/home/StatsBar.tsx
git commit -m "feat(responsive): StatsBar tipografía fluida via CSS vars"
```

---

## Task 10: Inputs de formularios — font-size 16px (anti-zoom iOS)

**Files:**
- Modify: `src/pages/Login.tsx`
- Modify: `src/pages/Register.tsx`
- Modify: `src/components/requests/RequestForm.tsx`

- [ ] **Step 1: Fix inputs en Login.tsx**

Buscar todos los `<input` en `src/pages/Login.tsx` y agregar `fontSize: 16` en su `style`. Si el input ya tiene un `style` prop, agregar `fontSize: 16` dentro. Si no tiene, agregar `style={{ fontSize: 16 }}`.

Ejemplo: si hay un input así:
```tsx
<input
  type="email"
  className="w-full bg-transparent focus:outline-none"
  style={{ color: '#111111' }}
/>
```
Debe quedar:
```tsx
<input
  type="email"
  className="w-full bg-transparent focus:outline-none"
  style={{ color: '#111111', fontSize: 16 }}
/>
```

Aplicar a TODOS los `<input` y `<textarea` del archivo.

- [ ] **Step 2: Fix inputs en Register.tsx**

Mismo proceso: agregar `fontSize: 16` en el `style` de todos los `<input` y `<textarea` del archivo `src/pages/Register.tsx`.

- [ ] **Step 3: Fix inputs en RequestForm.tsx**

Mismo proceso: agregar `fontSize: 16` en el `style` de todos los `<input`, `<select` y `<textarea` del archivo `src/components/requests/RequestForm.tsx`.

- [ ] **Step 4: TypeScript check**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa && node_modules/.bin/tsc --noEmit --project tsconfig.app.json
```
Expected: sin errores.

- [ ] **Step 5: Commit**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa
git add src/pages/Login.tsx src/pages/Register.tsx src/components/requests/RequestForm.tsx
git commit -m "feat(responsive): inputs font-size 16px evita zoom automático en iOS Safari"
```

---

## Task 11: Audit visual — verificar en múltiples viewports

- [ ] **Step 1: Levantar dev server**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa && npx vite --port 5173
```

- [ ] **Step 2: Verificar en iPhone SE (320px)**

En Chrome DevTools → Device toolbar → iPhone SE (320px):
- Home: CategoryGrid muestra 2 columnas ✅
- Cards no tienen overflow ✅
- BottomNav tabs no se comprimen ✅
- Header logo visible y no cortado ✅

- [ ] **Step 3: Verificar en iPhone 12 (390px)**

En Chrome DevTools → iPhone 12 Pro (390px):
- Home: CategoryGrid muestra 3 columnas ✅
- Spacing se siente proporcional ✅
- SearchBar no hace zoom en tap (font-size 16px) ✅

- [ ] **Step 4: Verificar en tablet (768px)**

En Chrome DevTools → iPad Mini (768px):
- App centrada dentro de max-width 480px ✅
- Fondo cream visible en los costados ✅
- BottomNav centrado y no span todo el ancho ✅

- [ ] **Step 5: Verificar en desktop (1200px)**

Agrandar ventana del browser a 1200px:
- App centrada, max 480px ✅
- Fondo cream en costados ✅
- No hay elementos que se estiren al ancho completo ✅

- [ ] **Step 6: Commit final**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa
git add docs/
git commit -m "docs: plan responsive system implementado"
```
