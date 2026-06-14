# Home UX Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refinar la Home de OficioYa para mejorar densidad visual, jerarquía y experiencia premium: header compacto, FAB de urgencias flotante, CategoryGrid 3×2, BottomNav con menú "Más", y nueva página de perfil de cliente.

**Architecture:** Cambios quirúrgicos en archivos existentes + 3 archivos nuevos (UrgenciasFAB, MoreMenu, ClientProfile). MoreMenu vive dentro de BottomNav con estado local. El FAB de urgencias es fixed sobre el contenido.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, React Router v7, Zustand, Lucide React. Estilos inline + CSS custom properties (var(--text-*), var(--ease-spring), etc.)

---

## Task 1: UrgenciasFAB — nuevo componente

**Files:**
- Create: `src/components/home/UrgenciasFAB.tsx`
- Delete: `src/components/home/UrgenciasBanner.tsx`

- [ ] **Step 1: Crear UrgenciasFAB.tsx**

Crear `src/components/home/UrgenciasFAB.tsx` con el siguiente contenido exacto:

```tsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUrgentProfessionals } from '../../hooks/useProfessionals'

export function UrgenciasFAB() {
  const navigate = useNavigate()
  const { professionals } = useUrgentProfessionals()
  const count = professionals.length
  const [expanded, setExpanded] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleTap = () => {
    if (expanded) {
      navigate('/urgencias')
      return
    }
    setExpanded(true)
    timerRef.current = setTimeout(() => setExpanded(false), 4000)
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  return (
    <button
      type="button"
      onClick={handleTap}
      aria-label="Emergencias 24hs"
      className="fixed z-40 flex items-center overflow-hidden active:opacity-80 transition-opacity"
      style={{
        bottom: 'calc(72px + var(--safe-bottom))',
        right: 16,
        height: 48,
        width: expanded ? 210 : 48,
        borderRadius: expanded ? 24 : '50%',
        background: '#EF4444',
        boxShadow: '0 4px 16px rgba(239,68,68,.45)',
        transition: 'width 280ms var(--ease-spring), border-radius 280ms var(--ease-spring)',
        flexDirection: 'row-reverse',
        paddingRight: expanded ? 4 : 0,
        paddingLeft: expanded ? 12 : 0,
        animation: expanded ? 'none' : 'urgency-pulse 2s ease-in-out infinite',
      }}
    >
      <span style={{ fontSize: 22, flexShrink: 0, width: 40, textAlign: 'center' }}>🚨</span>
      {expanded && (
        <div className="flex-1 text-left min-w-0">
          <div className="font-bold text-white truncate" style={{ fontSize: 'var(--text-sm)' }}>
            Emergencias 24hs
          </div>
          <div className="text-white truncate" style={{ fontSize: 'var(--text-xs)', opacity: 0.85 }}>
            {count > 0 ? `${count} disponibles ahora` : 'Disponibles ahora'}
          </div>
        </div>
      )}
    </button>
  )
}

export default UrgenciasFAB
```

- [ ] **Step 2: TypeScript check**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa && node_modules/.bin/tsc --noEmit --project tsconfig.app.json
```
Expected: sin errores.

- [ ] **Step 3: Eliminar UrgenciasBanner.tsx**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa && rm src/components/home/UrgenciasBanner.tsx
```

- [ ] **Step 4: Commit**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa
git add src/components/home/UrgenciasFAB.tsx
git rm src/components/home/UrgenciasBanner.tsx
git commit -m "feat(home): UrgenciasFAB flotante con pill expansion"
```

---

## Task 2: Home.tsx — header compacto + spacing + UrgenciasFAB

**Files:**
- Modify: `src/pages/Home.tsx`

- [ ] **Step 1: Reemplazar Home.tsx completo**

Reemplazar el contenido completo de `src/pages/Home.tsx`:

```tsx
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { CategoryGrid } from '../components/home/CategoryGrid'
import { FeaturedProfessionals } from '../components/home/FeaturedProfessionals'
import { UrgenciasFAB } from '../components/home/UrgenciasFAB'
import { StatsBar } from '../components/home/StatsBar'

function useReveal() {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.disconnect() } },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}

export default function Home() {
  const navigate = useNavigate()

  const catsRef  = useReveal()
  const statsRef = useReveal()
  const featRef  = useReveal()
  const ctaRef   = useReveal()

  const homeHeader = (
    <header
      className="px-4 pt-3 pb-2 sticky top-0 z-50"
      style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E8E0D4',
        boxShadow: '0 1px 0 #E8E0D4, 0 2px 8px rgba(0,0,0,.04)',
      }}
    >
      <h1 className="text-[22px] font-black leading-none" style={{ color: '#111111', letterSpacing: '-0.5px' }}>
        Oficio<span style={{ color: '#E8683A' }}>Ya</span>
      </h1>
    </header>
  )

  return (
    <PageShell header={homeHeader} showBottomNav>
      <div className="flex flex-col gap-3 pt-3 pb-4">

        {/* Categorías */}
        <section ref={catsRef as React.RefObject<HTMLElement>} className="reveal">
          <h2 className="text-[11px] font-bold uppercase tracking-[.7px] mb-2.5" style={{ color: '#999999' }}>
            ¿Qué necesitás?
          </h2>
          <CategoryGrid />
        </section>

        {/* Stats */}
        <section ref={statsRef as React.RefObject<HTMLElement>} className="reveal">
          <StatsBar />
        </section>

        {/* Más recomendados */}
        <section ref={featRef as React.RefObject<HTMLElement>} className="reveal">
          <FeaturedProfessionals />
        </section>

        {/* CTA profesional */}
        <section
          ref={ctaRef as React.RefObject<HTMLElement>}
          className="reveal rounded-2xl px-4 py-3.5 flex items-center justify-between gap-3"
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #E8E0D4',
            boxShadow: '0 1px 3px rgba(0,0,0,.06)',
          }}
        >
          <div>
            <h2 className="text-[14px] font-bold" style={{ color: '#111111' }}>¿Sos profesional?</h2>
            <p className="text-xs mt-0.5" style={{ color: '#999999' }}>
              Conseguí clientes en tu zona
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/pro/registro')}
            className="rounded-xl px-4 py-2.5 text-sm font-bold text-white active:opacity-80 transition-opacity flex-shrink-0"
            style={{ background: '#E8683A', boxShadow: '0 2px 8px rgba(232,104,58,.3)' }}
          >
            Registrarme →
          </button>
        </section>

      </div>

      {/* FAB de urgencias — flotante sobre el contenido */}
      <UrgenciasFAB />
    </PageShell>
  )
}
```

Nota: Se eliminaron `useState`, `useAuthStore`, `SearchBar` y `UrgenciasBanner` que ya no se usan. El `UrgenciasFAB` se renderiza fuera del div de contenido para que su `position: fixed` funcione correctamente.

- [ ] **Step 2: TypeScript check**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa && node_modules/.bin/tsc --noEmit --project tsconfig.app.json
```
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa
git add src/pages/Home.tsx
git commit -m "feat(home): header compacto, sin SearchBar duplicada, spacing reducido"
```

---

## Task 3: CategoryGrid — agregar Pintor

**Files:**
- Modify: `src/components/home/CategoryGrid.tsx`

- [ ] **Step 1: Agregar categoría Pintor**

En `src/components/home/CategoryGrid.tsx`, agregar el objeto al final del array `CATEGORIES` (antes del cierre `]`):

```tsx
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
  {
    id: 'pintor',
    label: 'Pintor',
    emoji: '🎨',
    photo: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&q=80',
  },
]
```

- [ ] **Step 2: TypeScript check**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa && node_modules/.bin/tsc --noEmit --project tsconfig.app.json
```
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa
git add src/components/home/CategoryGrid.tsx
git commit -m "feat(home): agregar categoría Pintor — grid 3×2 perfecto"
```

---

## Task 4: MoreMenu — bottom sheet

**Files:**
- Create: `src/components/layout/MoreMenu.tsx`

- [ ] **Step 1: Crear MoreMenu.tsx**

Crear `src/components/layout/MoreMenu.tsx`:

```tsx
import { useNavigate } from 'react-router-dom'
import { Heart, User, Wrench, LogOut, ChevronRight } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

interface MoreMenuProps {
  open: boolean
  onClose: () => void
}

export function MoreMenu({ open, onClose }: MoreMenuProps) {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)

  const go = (path: string) => {
    onClose()
    navigate(path)
  }

  const handleSignOut = async () => {
    onClose()
    await signOut()
    navigate('/login')
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-45 transition-opacity duration-200"
        style={{
          background: 'rgba(0,0,0,.4)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="fixed left-0 right-0 z-45 rounded-t-3xl"
        style={{
          bottom: 'calc(60px + var(--safe-bottom))',
          background: '#FFFFFF',
          padding: '12px 16px 16px',
          boxShadow: '0 -4px 24px rgba(0,0,0,.10)',
          transform: open ? 'translateY(0)' : 'translateY(110%)',
          transition: 'transform 300ms var(--ease-ios)',
          maxWidth: 480,
          margin: '0 auto',
        }}
      >
        {/* Handle */}
        <div
          className="mx-auto mb-4 rounded-full"
          style={{ width: 36, height: 4, background: '#E8E0D4' }}
        />

        <div className="flex flex-col gap-2">
          {/* Favoritos */}
          <button
            type="button"
            onClick={() => go('/favoritos')}
            className="w-full flex items-center gap-3 rounded-2xl active:opacity-60 transition-opacity"
            style={{ background: '#F5F0E8', padding: 'var(--space-4)' }}
          >
            <Heart size={20} style={{ color: '#E8683A', flexShrink: 0 }} />
            <span className="font-bold flex-1 text-left" style={{ fontSize: 'var(--text-base)', color: '#111111' }}>
              Mis favoritos
            </span>
            <ChevronRight size={18} style={{ color: '#CCCCCC' }} />
          </button>

          {/* Perfil */}
          <button
            type="button"
            onClick={() => go('/perfil')}
            className="w-full flex items-center gap-3 rounded-2xl active:opacity-60 transition-opacity"
            style={{ background: '#F5F0E8', padding: 'var(--space-4)' }}
          >
            <User size={20} style={{ color: '#E8683A', flexShrink: 0 }} />
            <span className="font-bold flex-1 text-left" style={{ fontSize: 'var(--text-base)', color: '#111111' }}>
              Mi perfil
            </span>
            <ChevronRight size={18} style={{ color: '#CCCCCC' }} />
          </button>

          {/* Separador */}
          <div style={{ height: 1, background: '#E8E0D4', margin: '4px 0' }} />

          {/* Ser profesional — solo si es cliente */}
          {user?.role === 'client' && (
            <button
              type="button"
              onClick={() => go('/pro/registro')}
              className="w-full flex items-center gap-3 rounded-2xl active:opacity-60 transition-opacity"
              style={{ background: '#FEF0EA', padding: 'var(--space-4)' }}
            >
              <Wrench size={20} style={{ color: '#E8683A', flexShrink: 0 }} />
              <span className="font-bold flex-1 text-left" style={{ fontSize: 'var(--text-base)', color: '#E8683A' }}>
                Quiero ser profesional
              </span>
              <ChevronRight size={18} style={{ color: '#E8683A', opacity: 0.5 }} />
            </button>
          )}

          {/* Cerrar sesión */}
          {user && (
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 rounded-2xl active:opacity-60 transition-opacity"
              style={{ background: '#FEF2F2', padding: 'var(--space-4)' }}
            >
              <LogOut size={20} style={{ color: '#EF4444', flexShrink: 0 }} />
              <span className="font-bold flex-1 text-left" style={{ fontSize: 'var(--text-base)', color: '#EF4444' }}>
                Cerrar sesión
              </span>
            </button>
          )}
        </div>
      </div>
    </>
  )
}

export default MoreMenu
```

- [ ] **Step 2: TypeScript check**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa && node_modules/.bin/tsc --noEmit --project tsconfig.app.json
```
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa
git add src/components/layout/MoreMenu.tsx
git commit -m "feat(nav): MoreMenu bottom sheet con Favoritos, Perfil, Ser profesional, Cerrar sesión"
```

---

## Task 5: BottomNav — 4 tabs con "Más" + MoreMenu integrado

**Files:**
- Modify: `src/components/layout/BottomNav.tsx`

- [ ] **Step 1: Reemplazar BottomNav.tsx completo**

Reemplazar el contenido completo de `src/components/layout/BottomNav.tsx`:

```tsx
import { useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { House, Search, FileText, Briefcase, UserCircle, Menu } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { MoreMenu } from './MoreMenu'

interface NavTab {
  label: string
  to: string
  icon: ReactNode
  badge?: number | null
  onPress?: () => void
}

export function BottomNav() {
  const { pathname } = useLocation()
  const user = useAuthStore((s) => s.user)
  const [moreOpen, setMoreOpen] = useState(false)

  const clientTabs: NavTab[] = [
    { label: 'Inicio',      to: '/',               icon: <House size={22} /> },
    { label: 'Buscar',      to: '/buscar',          icon: <Search size={22} /> },
    { label: 'Solicitudes', to: '/mis-solicitudes', icon: <FileText size={22} /> },
    { label: 'Más',         to: '',                 icon: <Menu size={22} />, onPress: () => setMoreOpen(v => !v) },
  ]

  const proTabs: NavTab[] = [
    { label: 'Inicio',      to: '/',                icon: <House size={22} /> },
    { label: 'Solicitudes', to: '/pro/solicitudes', icon: <FileText size={22} /> },
    { label: 'Trabajos',    to: '/pro/trabajos',    icon: <Briefcase size={22} /> },
    { label: 'Perfil',      to: '/pro/perfil',      icon: <UserCircle size={22} /> },
  ]

  const tabs = user?.role === 'professional' ? proTabs : clientTabs

  function isActive(to: string): boolean {
    if (to === '') return moreOpen
    if (to === '/') return pathname === '/'
    return pathname.startsWith(to)
  }

  return (
    <>
      <MoreMenu open={moreOpen} onClose={() => setMoreOpen(false)} />

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
          const content = (
            <>
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
            </>
          )

          if (tab.onPress) {
            return (
              <button
                key={tab.label}
                type="button"
                onClick={tab.onPress}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-opacity active:opacity-60"
                style={{
                  color: active ? '#E8683A' : '#AAAAAA',
                  paddingTop: 10,
                  paddingBottom: 10,
                }}
              >
                {content}
              </button>
            )
          }

          return (
            <Link
              key={tab.to}
              to={tab.to}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-opacity active:opacity-60"
              style={{
                color: active ? '#E8683A' : '#AAAAAA',
                paddingTop: 10,
                paddingBottom: 10,
              }}
              aria-current={active ? 'page' : undefined}
            >
              {content}
            </Link>
          )
        })}
      </nav>
    </>
  )
}

export default BottomNav
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
git commit -m "feat(nav): BottomNav 4 tabs con Más + MoreMenu integrado"
```

---

## Task 6: ClientProfile — nueva página /perfil

**Files:**
- Create: `src/pages/ClientProfile.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Crear ClientProfile.tsx**

Crear `src/pages/ClientProfile.tsx`:

```tsx
import { Navigate, useNavigate } from 'react-router-dom'
import { Heart, FileText, Wrench, LogOut, ChevronRight } from 'lucide-react'
import { PageShell } from '../components/layout/PageShell'
import { Header } from '../components/layout/Header'
import { useAuthStore } from '../store/authStore'
import { getInitials } from '../lib/utils'

function ProfileRow({
  icon,
  label,
  onClick,
  accent = false,
  danger = false,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  accent?: boolean
  danger?: boolean
}) {
  const color = danger ? '#EF4444' : accent ? '#E8683A' : '#111111'
  const bg = danger ? '#FEF2F2' : accent ? '#FEF0EA' : '#F5F0E8'

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 rounded-2xl active:opacity-60 transition-opacity"
      style={{ background: bg, padding: 'var(--space-4)' }}
    >
      <span style={{ color, flexShrink: 0 }}>{icon}</span>
      <span className="font-bold flex-1 text-left" style={{ fontSize: 'var(--text-base)', color }}>
        {label}
      </span>
      {!danger && <ChevronRight size={18} style={{ color: '#CCCCCC' }} />}
    </button>
  )
}

export default function ClientProfile() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)

  if (!user) return <Navigate to="/login" replace />

  const initials = getInitials(user.full_name)
  const roleLabel = user.role === 'professional' ? 'Profesional' : 'Cliente'

  const header = (
    <Header
      title="Mi perfil"
      showBack
      onBack={() => navigate(-1)}
    />
  )

  return (
    <PageShell header={header} showBottomNav>
      <div className="flex flex-col gap-4 pt-4 pb-6">

        {/* Avatar + nombre + rol */}
        <div className="flex flex-col items-center gap-2 py-4">
          <div
            className="rounded-full flex items-center justify-center font-black text-white"
            style={{
              width: 72,
              height: 72,
              background: 'linear-gradient(135deg, #f5b99a, #E8683A)',
              fontSize: 'var(--text-2xl)',
            }}
          >
            {initials}
          </div>
          <h1 className="font-bold" style={{ fontSize: 'var(--text-xl)', color: '#111111' }}>
            {user.full_name}
          </h1>
          <span
            className="px-3 py-1 rounded-full font-bold"
            style={{ fontSize: 'var(--text-xs)', background: '#F5F0E8', color: '#555555' }}
          >
            {roleLabel}
          </span>
        </div>

        {/* Mi actividad */}
        <div className="flex flex-col gap-2">
          <h2
            className="font-bold uppercase tracking-wide"
            style={{ fontSize: 'var(--text-xs)', color: '#999999' }}
          >
            Mi actividad
          </h2>
          <ProfileRow
            icon={<Heart size={20} />}
            label="Mis favoritos"
            onClick={() => navigate('/favoritos')}
          />
          <ProfileRow
            icon={<FileText size={20} />}
            label="Mis solicitudes"
            onClick={() => navigate('/mis-solicitudes')}
          />
        </div>

        {/* Ajustes */}
        <div className="flex flex-col gap-2">
          <h2
            className="font-bold uppercase tracking-wide"
            style={{ fontSize: 'var(--text-xs)', color: '#999999' }}
          >
            Ajustes
          </h2>
          {user.role === 'client' && (
            <ProfileRow
              icon={<Wrench size={20} />}
              label="Quiero ser profesional"
              onClick={() => navigate('/pro/registro')}
              accent
            />
          )}
          <ProfileRow
            icon={<LogOut size={20} />}
            label="Cerrar sesión"
            onClick={async () => {
              await signOut()
              navigate('/login')
            }}
            danger
          />
        </div>

      </div>
    </PageShell>
  )
}
```

- [ ] **Step 2: Agregar ruta /perfil en App.tsx**

En `src/App.tsx`, agregar el import y la ruta. Después de la línea `import Favoritos from './pages/Favoritos'`, agregar:

```tsx
import ClientProfile from './pages/ClientProfile'
```

Dentro de `<Routes>`, agregar antes del `<Route path="*" ...>`:

```tsx
<Route path="/perfil" element={<ClientProfile />} />
```

- [ ] **Step 3: TypeScript check**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa && node_modules/.bin/tsc --noEmit --project tsconfig.app.json
```
Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa
git add src/pages/ClientProfile.tsx src/App.tsx
git commit -m "feat(profile): página /perfil de cliente con actividad, ajustes y cerrar sesión"
```

---

## Task 7: Audit visual — verificar flujos completos

- [ ] **Step 1: Levantar dev server**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa && npx vite --port 5173
```

- [ ] **Step 2: Verificar Home (390px)**

Abrir http://localhost:5173 en viewport 390px:
- Header solo muestra "OficioYa" logo, sin searchbar ni botón cuenta ✅
- CategoryGrid muestra 6 categorías (incluyendo Pintor) en 3×2 ✅
- FAB rojo 🚨 flotante visible en bottom-right sobre el BottomNav ✅
- BottomNav muestra 4 tabs: Inicio, Buscar, Solicitudes, Más ✅

- [ ] **Step 3: Verificar FAB urgencias**

- Tocar el FAB 🚨 → se expande a pill con "Emergencias 24hs" ✅
- Esperar 4 segundos → colapsa automáticamente ✅
- Expandir de nuevo y tocar la pill → navega a `/urgencias` ✅

- [ ] **Step 4: Verificar MoreMenu**

- Tocar tab "Más" → sube el bottom sheet con: Favoritos, Mi perfil, Quiero ser profesional (si es cliente), Cerrar sesión ✅
- Tocar overlay → cierra el sheet ✅
- Tocar "Mi perfil" → navega a `/perfil` y cierra el sheet ✅

- [ ] **Step 5: Verificar ClientProfile**

Navegar a http://localhost:5173/perfil:
- Muestra avatar con iniciales en naranja ✅
- Nombre completo y rol ✅
- Filas: Favoritos, Solicitudes, Ser profesional, Cerrar sesión ✅
- Sin sesión: redirige a /login ✅

- [ ] **Step 6: Commit final**

```bash
cd C:/Users/fede8/Documents/OficioYa/oficioYa
git add docs/
git commit -m "docs: plan home UX refinement implementado"
```
