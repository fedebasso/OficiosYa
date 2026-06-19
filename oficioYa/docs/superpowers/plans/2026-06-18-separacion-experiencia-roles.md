# Separación de Experiencia por Roles — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Separar completamente la experiencia de Cliente y Profesional con layouts independientes, BottomNavs propios, ProDashboard nuevo y lazy loading por rol.

**Architecture:** Un único BrowserRouter con dos layouts (`ClientLayout` / `ProLayout`). `App.tsx` detecta `user.role` y envuelve las rutas en el layout correspondiente. Todas las páginas se importan con `lazy()` para code splitting por rol. `ProDashboard` es la nueva home del profesional, consume `proRequestsStore` sin queries extra.

**Tech Stack:** React 19 + TypeScript + Vite, React Router v7, Zustand, Tailwind CSS v3, Framer Motion, Lucide React.

## Global Constraints

- Colores: fondo `#F5F0E8`, acento `#E8683A`, nav activo `#E8683A`, nav inactivo `#AAAAAA`, badge rojo `#EF4444`
- Textos en español rioplatense (vos, no tú)
- `PageShell` existente recibe `showBottomNav={false}` cuando el layout inyecta su propio nav
- `proRequestsStore` ya existe en `src/store/proRequestsStore.ts` — no recrear
- `useIncomingRequests(professionalId)` ya existe en `src/hooks/useRequests.ts` — no recrear
- `useChatStore` ya existe en `src/store/chatStore.ts` — no recrear
- `ServiceRequest` importar de `src/store/requestStore.ts`
- Lazy loading con `React.lazy()` + `<Suspense>` — no librerías externas
- `npm run build` debe pasar sin errores TypeScript en cada task

---

## File Map

| Acción | Archivo |
|---|---|
| Crear | `src/layouts/ClientLayout.tsx` |
| Crear | `src/layouts/ProLayout.tsx` |
| Crear | `src/components/layout/ClientBottomNav.tsx` |
| Crear | `src/components/layout/ProBottomNav.tsx` |
| Crear | `src/components/layout/PageSkeleton.tsx` |
| Crear | `src/pages/Mensajes.tsx` |
| Crear | `src/pages/pro/ProDashboard.tsx` |
| Modificar | `src/App.tsx` |
| Modificar | `src/components/layout/BottomNav.tsx` |

---

## Task 1: PageSkeleton + ClientBottomNav + ProBottomNav

**Files:**
- Create: `src/components/layout/PageSkeleton.tsx`
- Create: `src/components/layout/ClientBottomNav.tsx`
- Create: `src/components/layout/ProBottomNav.tsx`

**Interfaces:**
- Consumes: `useLocation` (react-router-dom), `useAuthStore` (src/store/authStore.ts), `useProRequestsStore` (src/store/proRequestsStore.ts), Lucide icons
- Produces:
  - `<PageSkeleton />` — fallback de Suspense sin props
  - `<ClientBottomNav />` — sin props
  - `<ProBottomNav />` — sin props

- [ ] **Step 1: Crear `src/components/layout/PageSkeleton.tsx`**

```tsx
export function PageSkeleton() {
  return (
    <div
      className="flex flex-col gap-4 p-5 pt-14"
      style={{ minHeight: '100dvh', background: '#F5F0E8' }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-2xl"
          style={{
            height: i === 0 ? 180 : 80,
            background: 'linear-gradient(90deg,#EDE8DE 25%,#F5F0E8 50%,#EDE8DE 75%)',
            backgroundSize: '200% 100%',
            animation: `shimmer 1.4s ease-in-out ${i * 0.15}s infinite`,
            border: '1.5px solid #E8E0D4',
          }}
        />
      ))}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}
```

- [ ] **Step 2: Crear `src/components/layout/ClientBottomNav.tsx`**

```tsx
import { Link, useLocation } from 'react-router-dom'
import { House, FileText, MessageCircle, UserCircle } from 'lucide-react'

const TABS = [
  { label: 'Inicio',      to: '/',                icon: House },
  { label: 'Solicitudes', to: '/mis-solicitudes',  icon: FileText },
  { label: 'Mensajes',    to: '/mensajes',          icon: MessageCircle },
  { label: 'Perfil',      to: '/perfil',            icon: UserCircle },
]

export function ClientBottomNav() {
  const { pathname } = useLocation()

  function isActive(to: string) {
    return to === '/' ? pathname === '/' : pathname.startsWith(to)
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
        paddingBottom: 'var(--safe-bottom)',
        minHeight: 'calc(60px + var(--safe-bottom))',
      }}
    >
      {TABS.map(({ label, to, icon: Icon }) => {
        const active = isActive(to)
        return (
          <Link
            key={to}
            to={to}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-opacity active:opacity-60"
            style={{ color: active ? '#E8683A' : '#AAAAAA', paddingTop: 10, paddingBottom: 10 }}
            aria-current={active ? 'page' : undefined}
          >
            <Icon size={22} />
            <span style={{ fontWeight: 700, fontSize: 'var(--text-xs, 10px)' }}>{label}</span>
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
```

- [ ] **Step 3: Crear `src/components/layout/ProBottomNav.tsx`**

```tsx
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, UserCircle } from 'lucide-react'
import { useProRequestsStore } from '../../store/proRequestsStore'
import { useAuthStore } from '../../store/authStore'
import { useEffect } from 'react'

export function ProBottomNav() {
  const { pathname } = useLocation()
  const user = useAuthStore((s) => s.user)
  const load = useProRequestsStore((s) => s.load)
  const requests = useProRequestsStore((s) => s.requests)
  const pendingCount = requests.filter((r) => r.status === 'pending').length

  useEffect(() => {
    if (user?.id) load(user.id)
  }, [user?.id, load])

  const TABS = [
    { label: 'Dashboard',   to: '/pro/dashboard',   icon: LayoutDashboard, badge: pendingCount > 0 ? pendingCount : null },
    { label: 'Solicitudes', to: '/pro/solicitudes',  icon: FileText, badge: null },
    { label: 'Perfil',      to: '/pro/perfil',       icon: UserCircle, badge: null },
  ]

  function isActive(to: string) {
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
        paddingBottom: 'var(--safe-bottom)',
        minHeight: 'calc(60px + var(--safe-bottom))',
      }}
    >
      {TABS.map(({ label, to, icon: Icon, badge }) => {
        const active = isActive(to)
        return (
          <Link
            key={to}
            to={to}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-opacity active:opacity-60"
            style={{ color: active ? '#E8683A' : '#AAAAAA', paddingTop: 10, paddingBottom: 10 }}
            aria-current={active ? 'page' : undefined}
          >
            <div className="relative">
              <Icon size={22} />
              {badge !== null && (
                <span
                  className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center font-black text-white"
                  style={{ background: '#EF4444', fontSize: 9 }}
                >
                  {badge}
                </span>
              )}
            </div>
            <span style={{ fontWeight: 700, fontSize: 'var(--text-xs, 10px)' }}>{label}</span>
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
```

- [ ] **Step 4: Verificar build**

```bash
npm run build
```

Expected: 0 errores TypeScript, build exitoso.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/PageSkeleton.tsx src/components/layout/ClientBottomNav.tsx src/components/layout/ProBottomNav.tsx
git commit -m "feat: PageSkeleton + ClientBottomNav + ProBottomNav separados por rol"
```

---

## Task 2: ClientLayout + ProLayout

**Files:**
- Create: `src/layouts/ClientLayout.tsx`
- Create: `src/layouts/ProLayout.tsx`

**Interfaces:**
- Consumes: `ClientBottomNav` (Task 1), `ProBottomNav` (Task 1)
- Produces:
  - `<ClientLayout />` — envuelve rutas de cliente con ClientBottomNav
  - `<ProLayout />` — envuelve rutas de profesional con ProBottomNav

**Nota:** Los layouts NO usan `PageShell` — cada página ya lo usa internamente. Los layouts solo inyectan el BottomNav en un portal fijo. La razón: `PageShell` ya tiene `showBottomNav` que renderiza el `BottomNav` viejo; mientras migramos, los layouts simplemente renderizan `{children}` + el nuevo nav fijo. Las páginas que usan `PageShell` con `showBottomNav={true}` (default) verán dos navs hasta que `PageShell` sea actualizado en Task 4. Por eso en Task 4 se actualiza `PageShell`.

- [ ] **Step 1: Crear `src/layouts/ClientLayout.tsx`**

```tsx
import type { ReactNode } from 'react'
import { ClientBottomNav } from '../components/layout/ClientBottomNav'

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ClientBottomNav />
    </>
  )
}
```

- [ ] **Step 2: Crear `src/layouts/ProLayout.tsx`**

```tsx
import type { ReactNode } from 'react'
import { ProBottomNav } from '../components/layout/ProBottomNav'

export function ProLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ProBottomNav />
    </>
  )
}
```

- [ ] **Step 3: Verificar build**

```bash
npm run build
```

Expected: 0 errores.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/ClientLayout.tsx src/layouts/ProLayout.tsx
git commit -m "feat: ClientLayout y ProLayout con navegación separada por rol"
```

---

## Task 3: Página Mensajes (cliente)

**Files:**
- Create: `src/pages/Mensajes.tsx`

**Interfaces:**
- Consumes: `useChatStore` de `src/store/chatStore.ts` (getMessages, messagesByRequest), `useRequestStore` de `src/store/requestStore.ts` (requests), `useAuthStore`
- Produces: página `/mensajes` con lista de conversaciones activas

- [ ] **Step 1: Crear `src/pages/Mensajes.tsx`**

```tsx
import { useNavigate } from 'react-router-dom'
import { useChatStore } from '../store/chatStore'
import { useRequestStore } from '../store/requestStore'
import { useAuthStore } from '../store/authStore'
import { PageShell } from '../components/layout/PageShell'
import { MessageCircle } from 'lucide-react'

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Ahora'
  if (m < 60) return `hace ${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `hace ${h}h`
  return `hace ${Math.floor(h / 24)}d`
}

export default function Mensajes() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const requests = useRequestStore((s) => s.requests)
  const messagesByRequest = useChatStore((s) => s.messagesByRequest)

  // Solo solicitudes con chat activo (confirmed o in_progress) del cliente actual
  const activeRequests = requests.filter(
    (r) =>
      (r.status === 'confirmed' || r.status === 'in_progress' || r.status === 'completed') &&
      r.client_id === (user?.id ?? null) &&
      messagesByRequest[r.id]
  )

  const header = (
    <div
      className="px-5 pt-12 pb-4 sticky top-0 z-50"
      style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E0D4' }}
    >
      <h1 className="text-2xl font-black" style={{ color: '#111111', letterSpacing: '-0.5px' }}>
        Mensajes
      </h1>
    </div>
  )

  return (
    <PageShell header={header} showBottomNav={false}>
      <div className="flex flex-col gap-2 py-4">
        {activeRequests.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}
            >
              <MessageCircle size={24} style={{ color: '#CCCCCC' }} />
            </div>
            <div>
              <p className="font-black text-sm" style={{ color: '#111111' }}>
                Aún no tenés conversaciones
              </p>
              <p className="text-xs mt-1" style={{ color: '#AAAAAA' }}>
                Los chats aparecen cuando un profesional acepta tu solicitud
              </p>
            </div>
          </div>
        ) : (
          activeRequests.map((req) => {
            const messages = messagesByRequest[req.id] ?? []
            const last = messages[messages.length - 1]
            return (
              <button
                key={req.id}
                type="button"
                onClick={() => navigate(`/solicitud/${req.id}/chat`)}
                className="flex items-center gap-3 px-4 py-3 text-left transition-opacity active:opacity-60"
                style={{ background: '#FFFFFF', borderBottom: '1px solid #F5F0E8' }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: '#FEF0EA', border: '2px solid #FDDCC8' }}
                >
                  🔧
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-bold truncate" style={{ color: '#111111' }}>
                      {req.category?.replace('_', ' ') ?? 'Servicio'}
                    </p>
                    {last && (
                      <span className="text-[10px] flex-shrink-0 ml-2" style={{ color: '#AAAAAA' }}>
                        {timeAgo(last.createdAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs truncate" style={{ color: '#888888' }}>
                    {last
                      ? last.type === 'text'
                        ? last.content
                        : last.type === 'image'
                        ? '📷 Foto'
                        : '🎙️ Audio'
                      : 'Sin mensajes aún'}
                  </p>
                </div>
              </button>
            )
          })
        )}
      </div>
    </PageShell>
  )
}
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

Expected: 0 errores.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Mensajes.tsx
git commit -m "feat: página Mensajes para clientes — lista de conversaciones activas"
```

---

## Task 4: ProDashboard

**Files:**
- Create: `src/pages/pro/ProDashboard.tsx`

**Interfaces:**
- Consumes: `useProRequestsStore` de `src/store/proRequestsStore.ts` (requests, loading, load, updateStatus), `useAuthStore`, `useNavigate` (react-router-dom)
- Produces: página `/pro/dashboard` con stats + feed de pendientes

- [ ] **Step 1: Crear `src/pages/pro/ProDashboard.tsx`**

```tsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useProRequestsStore } from '../../store/proRequestsStore'
import { PageShell } from '../../components/layout/PageShell'
import { CheckCircle, XCircle, Clock, ChevronRight } from 'lucide-react'

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Ahora mismo'
  if (m < 60) return `hace ${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `hace ${h}h`
  return `hace ${Math.floor(h / 24)}d`
}

export default function ProDashboard() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const requests = useProRequestsStore((s) => s.requests)
  const loading = useProRequestsStore((s) => s.loading)
  const load = useProRequestsStore((s) => s.load)
  const updateStatus = useProRequestsStore((s) => s.updateStatus)

  useEffect(() => {
    if (user?.id) load(user.id)
  }, [user?.id, load])

  const firstName = user?.full_name?.split(' ')[0] ?? 'profesional'
  const pending = requests.filter((r) => r.status === 'pending')
  const active = requests.filter((r) => r.status === 'confirmed' || r.status === 'in_progress')
  const completed = requests.filter((r) => r.status === 'completed')

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'

  const STATS = [
    { label: 'Pendientes', count: pending.length, color: '#F59E0B', bg: 'rgba(245,158,11,.1)' },
    { label: 'En curso',   count: active.length,  color: '#8B5CF6', bg: 'rgba(139,92,246,.1)' },
    { label: 'Rating',     count: '4.7',           color: '#F59E0B', bg: 'rgba(245,158,11,.1)' },
  ]

  const header = (
    <div
      className="px-5 pt-12 pb-4"
      style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E0D4' }}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#E8683A' }}>
        Panel profesional
      </p>
      <h1 className="text-2xl font-black" style={{ color: '#111111', letterSpacing: '-0.5px' }}>
        {greeting}, {firstName}
      </h1>
    </div>
  )

  return (
    <PageShell header={header} showBottomNav={false}>
      <div className="flex flex-col gap-5 py-5">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl p-3 text-center"
              style={{ background: s.bg, border: `1px solid ${s.color}30` }}
            >
              <div className="text-xl font-black leading-none" style={{ color: s.color }}>
                {s.count}
              </div>
              <div className="text-[9px] font-bold mt-1" style={{ color: s.color }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Feed de pendientes */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#AAAAAA' }}>
              Solicitudes pendientes · {pending.length}
            </p>
            {pending.length > 0 && (
              <button
                type="button"
                onClick={() => navigate('/pro/solicitudes')}
                className="flex items-center gap-1 text-[10px] font-bold"
                style={{ color: '#E8683A' }}
              >
                Ver todas <ChevronRight size={12} />
              </button>
            )}
          </div>

          {loading && (
            <div className="flex flex-col gap-3">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="h-28 rounded-2xl"
                  style={{
                    background: 'linear-gradient(90deg,#EDE8DE 25%,#F5F0E8 50%,#EDE8DE 75%)',
                    backgroundSize: '200% 100%',
                    animation: `shimmer 1.4s ease-in-out ${i * 0.15}s infinite`,
                    border: '1.5px solid #E8E0D4',
                  }}
                />
              ))}
              <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
            </div>
          )}

          {!loading && pending.length === 0 && (
            <div
              className="flex flex-col items-center gap-3 py-10 text-center rounded-2xl"
              style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}
            >
              <span className="text-3xl">✓</span>
              <div>
                <p className="font-black text-sm" style={{ color: '#111' }}>Todo al día</p>
                <p className="text-xs mt-1" style={{ color: '#AAA' }}>No tenés solicitudes pendientes</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/pro/perfil')}
                className="px-4 py-2 rounded-xl text-sm font-bold"
                style={{ background: 'rgba(232,104,58,.12)', color: '#E8683A' }}
              >
                Completar perfil
              </button>
            </div>
          )}

          {!loading && pending.slice(0, 5).map((req) => (
            <div
              key={req.id}
              className="rounded-2xl overflow-hidden"
              style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}
            >
              <div
                className="flex items-center justify-between px-4 py-2"
                style={{ background: '#FEF0EA', borderBottom: '1px solid #FDDCC8' }}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#E8683A' }}>
                  Nueva solicitud
                </span>
                <span className="flex items-center gap-1 text-[10px]" style={{ color: '#AAA' }}>
                  <Clock size={9} /> {timeAgo(req.created_at)}
                </span>
              </div>
              <div className="px-4 pt-3 pb-4 flex flex-col gap-3">
                <p className="text-sm leading-relaxed" style={{ color: '#333' }}>
                  {req.description}
                </p>
                {req.category && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full self-start"
                    style={{ background: '#F5F0E8', color: '#666' }}
                  >
                    {req.category.replace('_', ' ')}
                  </span>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => updateStatus(req.id, 'confirmed')}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold"
                    style={{ background: '#DCFCE7', color: '#16A34A', border: '1px solid #BBF7D0' }}
                  >
                    <CheckCircle size={14} /> Aceptar
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStatus(req.id, 'cancelled')}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold"
                    style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}
                  >
                    <XCircle size={14} /> Rechazar
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!loading && pending.length > 5 && (
            <button
              type="button"
              onClick={() => navigate('/pro/solicitudes')}
              className="w-full py-3 rounded-2xl text-sm font-bold"
              style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4', color: '#E8683A' }}
            >
              Ver {pending.length - 5} solicitudes más →
            </button>
          )}
        </div>

        {/* Resumen de completados */}
        {completed.length > 0 && (
          <div
            className="rounded-2xl p-4 flex items-center justify-between"
            style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}
          >
            <div>
              <p className="text-sm font-black" style={{ color: '#111' }}>
                {completed.length} trabajo{completed.length !== 1 ? 's' : ''} completado{completed.length !== 1 ? 's' : ''}
              </p>
              <p className="text-xs" style={{ color: '#AAA' }}>Historial completo en Solicitudes</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/pro/solicitudes')}
              className="flex items-center gap-1 text-sm font-bold"
              style={{ color: '#E8683A' }}
            >
              Ver <ChevronRight size={14} />
            </button>
          </div>
        )}

      </div>
    </PageShell>
  )
}
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

Expected: 0 errores.

- [ ] **Step 3: Commit**

```bash
git add src/pages/pro/ProDashboard.tsx
git commit -m "feat: ProDashboard — home del profesional con stats y feed de solicitudes pendientes"
```

---

## Task 5: App.tsx — lazy loading + layouts + redirecciones

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/layout/PageShell.tsx`
- Modify: `src/components/layout/BottomNav.tsx`

**Interfaces:**
- Consumes: `ClientLayout` (Task 2), `ProLayout` (Task 2), `PageSkeleton` (Task 1), todos los componentes de página existentes + `Mensajes` (Task 3) + `ProDashboard` (Task 4)
- Produces: app completa con routing por rol, lazy loading, redirecciones

- [ ] **Step 1: Actualizar `src/App.tsx`**

Reemplazar el contenido completo del archivo con:

```tsx
import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { ClientLayout } from './layouts/ClientLayout'
import { ProLayout } from './layouts/ProLayout'
import { PageSkeleton } from './components/layout/PageSkeleton'

// ── Páginas compartidas (estáticas — pequeñas, las usan ambos roles)
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'

// ── Páginas lazy — se dividen en chunks por rol
const Home               = lazy(() => import('./pages/Home'))
const Search             = lazy(() => import('./pages/Search'))
const ProfessionalDetail = lazy(() => import('./pages/ProfessionalDetail'))
const RequestService     = lazy(() => import('./pages/RequestService'))
const TicketFlow         = lazy(() => import('./pages/TicketFlow'))
const TicketConfirm      = lazy(() => import('./pages/TicketConfirm'))
const Urgencias          = lazy(() => import('./pages/Urgencias'))
const Favoritos          = lazy(() => import('./pages/Favoritos'))

// ── Cliente
const MisSolicitudes = lazy(() => import('./pages/MisSolicitudes'))
const SolicitudDetail = lazy(() => import('./pages/SolicitudDetail'))
const Chat           = lazy(() => import('./pages/Chat'))
const ClientProfile  = lazy(() => import('./pages/ClientProfile'))
const Mensajes       = lazy(() => import('./pages/Mensajes'))

// ── Profesional
const ProDashboard   = lazy(() => import('./pages/pro/ProDashboard'))
const ProRequests    = lazy(() => import('./pages/pro/ProRequests'))
const ProProfile     = lazy(() => import('./pages/pro/ProProfile'))
const ProWorkHistory = lazy(() => import('./pages/pro/ProWorkHistory'))
const ProRegistration = lazy(() => import('./pages/pro/ProRegistration'))

// ── Admin
const AdminVerificaciones = lazy(() => import('./pages/admin/AdminVerificaciones'))

function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: ReactNode
  requiredRole?: 'client' | 'professional'
}) {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" replace />
  return <>{children}</>
}

function RoleRedirect() {
  const user = useAuthStore((s) => s.user)
  if (user?.role === 'professional') return <Navigate to="/pro/dashboard" replace />
  return null // renderiza Home normalmente
}

function App() {
  const user = useAuthStore((s) => s.user)
  const isPro = user?.role === 'professional'

  return (
    <BrowserRouter>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          {/* ── Rutas compartidas sin layout */}
          <Route path="/login"    element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/profesional/:id" element={<ProfessionalDetail />} />
          <Route path="/urgencias"       element={<Urgencias />} />
          <Route path="/ticket"          element={<TicketFlow />} />
          <Route path="/ticket/confirmar" element={<TicketConfirm />} />
          <Route path="/solicitar/:id"   element={<RequestService />} />
          <Route path="/admin/verificaciones" element={<ProtectedRoute><AdminVerificaciones /></ProtectedRoute>} />
          <Route path="/pro/registro" element={<ProtectedRoute requiredRole="professional"><ProRegistration /></ProtectedRoute>} />

          {/* ── Rutas profesional */}
          <Route
            path="/pro/*"
            element={
              <ProtectedRoute requiredRole="professional">
                <ProLayout>
                  <Routes>
                    <Route path="dashboard"   element={<ProDashboard />} />
                    <Route path="solicitudes" element={<ProRequests />} />
                    <Route path="perfil"      element={<ProProfile />} />
                    <Route path="trabajos"    element={<ProWorkHistory />} />
                    <Route path="*"           element={<Navigate to="/pro/dashboard" replace />} />
                  </Routes>
                </ProLayout>
              </ProtectedRoute>
            }
          />

          {/* ── Rutas cliente */}
          <Route
            path="/*"
            element={
              isPro
                ? <Navigate to="/pro/dashboard" replace />
                : (
                  <ClientLayout>
                    <Routes>
                      <Route path="/"                   element={<><RoleRedirect /><Home /></>} />
                      <Route path="/buscar"             element={<Search />} />
                      <Route path="/buscar/:categoria"  element={<Search />} />
                      <Route path="/favoritos"          element={<Favoritos />} />
                      <Route path="/mensajes"           element={<ProtectedRoute requiredRole="client"><Mensajes /></ProtectedRoute>} />
                      <Route path="/mis-solicitudes"    element={<ProtectedRoute requiredRole="client"><MisSolicitudes /></ProtectedRoute>} />
                      <Route path="/solicitud/:id"      element={<ProtectedRoute requiredRole="client"><SolicitudDetail /></ProtectedRoute>} />
                      <Route path="/solicitud/:id/chat" element={<ProtectedRoute requiredRole="client"><Chat /></ProtectedRoute>} />
                      <Route path="/perfil"             element={<ProtectedRoute requiredRole="client"><ClientProfile /></ProtectedRoute>} />
                      <Route path="*"                   element={<NotFound />} />
                    </Routes>
                  </ClientLayout>
                )
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
```

- [ ] **Step 2: Actualizar `src/components/layout/PageShell.tsx` — desacoplar BottomNav viejo**

`PageShell` actualmente siempre renderiza `<BottomNav />`. Ahora que los layouts inyectan sus propios navs, cambiar el default de `showBottomNav` a `false` para no duplicar:

```tsx
import type { ReactNode } from 'react'

interface PageShellProps {
  children: ReactNode
  header?: ReactNode
  showBottomNav?: boolean
}

export function PageShell({ children, header, showBottomNav = false }: PageShellProps) {
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
            paddingBottom: showBottomNav ? 'calc(64px + var(--safe-bottom))' : 'calc(64px + var(--safe-bottom))',
            paddingLeft: 'var(--px-container)',
            paddingRight: 'var(--px-container)',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

export default PageShell
```

**Nota:** `paddingBottom` siempre aplica `calc(64px + var(--safe-bottom))` porque el BottomNav del layout sigue siendo fijo. El prop `showBottomNav` queda en la interfaz por compatibilidad pero ya no renderiza el nav viejo.

- [ ] **Step 3: Simplificar `src/components/layout/BottomNav.tsx`**

El `BottomNav` viejo ahora delega a los nuevos navs. Actualizar para que no se rompa código que lo importe directamente (PageShell ya no lo usa, pero puede haber otros):

```tsx
import { useAuthStore } from '../../store/authStore'
import { ClientBottomNav } from './ClientBottomNav'
import { ProBottomNav } from './ProBottomNav'

export function BottomNav() {
  const user = useAuthStore((s) => s.user)
  return user?.role === 'professional' ? <ProBottomNav /> : <ClientBottomNav />
}

export default BottomNav
```

- [ ] **Step 4: Verificar build**

```bash
npm run build
```

Expected: 0 errores TypeScript. Verificar que el output de Vite muestra múltiples chunks (evidencia de code splitting).

- [ ] **Step 5: Verificar en browser**

```bash
npm run dev
```

Verificar:
1. Sin sesión → `/` muestra Home con `ClientBottomNav` (4 tabs: Inicio, Solicitudes, Mensajes, Perfil)
2. Login como cliente → Home, tabs de cliente visibles
3. Login como profesional → redirige a `/pro/dashboard`, `ProBottomNav` (3 tabs: Dashboard, Solicitudes, Perfil)
4. Profesional navega a `/` → redirige a `/pro/dashboard`
5. ProDashboard muestra stats + feed de solicitudes pendientes
6. Tab Mensajes (cliente) → lista vacía o conversaciones

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/components/layout/PageShell.tsx src/components/layout/BottomNav.tsx
git commit -m "feat: separación de experiencia por rol — lazy loading, layouts y redirecciones"
```
