# Servicios Técnicos Oficiales — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar un módulo de Servicios Técnicos Oficiales a Ofix — listado, filtros, disponibilidad mock y flujo de confirmación que redirige al sitio del service oficial.

**Architecture:** Feature independiente: tipos propios → mock data → store Zustand → componentes → páginas → entrada desde Home. El store tiene firma fija para que en fase 2 se conecten APIs reales sin tocar UI. No se modifica nada del flujo de profesionales existente excepto `Home.tsx` y `App.tsx`.

**Tech Stack:** React 19 + TypeScript + Vite, Zustand, Tailwind CSS v3, React Router v7, Framer Motion. Sin dependencias nuevas.

## Global Constraints

- Colores del design system: primary `#0F6E56`, accent `#9FE1CB`, orange `#E8683A`, background `#f4f4f2`, card border `#EDE8DE`
- Tipografía: usar variables CSS `--text-xs / --text-sm / --text-base / --text-lg`
- Spacing: usar variables CSS `--px-container`, `--space-3`
- Animaciones: usar `framer-motion` con `whileTap={{ scale: 0.98 }}` en cards, igual que `ProfessionalCard`
- No instalar dependencias nuevas
- No modificar `DateStrip.tsx`, `TimeSlotGrid.tsx`, ni `TimeSlotPill.tsx` originales
- Todos los archivos nuevos en TypeScript estricto (no `any`)
- Rutas públicas (sin `ProtectedRoute`) excepto el botón "Confirmar turno" que requiere user
- Commits frecuentes al final de cada tarea

---

## Mapa de archivos

**Crear:**
- `src/types/officialServices.ts` — tipos compartidos
- `src/data/officialServicesMock.ts` — 5 servicios + generador de slots
- `src/store/officialServiceStore.ts` — estado, fetchServices, fetchSlots, confirmBooking
- `src/components/officialServices/OfficialServiceCard.tsx` — card compacta del listado
- `src/components/availability/DateStripGeneric.tsx` — DateStrip prop-driven sin acoplamiento a availabilityStore
- `src/pages/OfficialServicesPage.tsx` — listado con filtros
- `src/pages/OfficialServiceDetail.tsx` — detalle con calendario y confirmación

**Modificar:**
- `src/App.tsx` — 2 rutas lazy nuevas
- `src/pages/Home.tsx` — banner de entrada al módulo

---

## Task 1: Tipos y mock data

**Files:**
- Create: `src/types/officialServices.ts`
- Create: `src/data/officialServicesMock.ts`

**Interfaces:**
- Produce: tipos `OfficialService`, `ServiceSlot`, `PendingBooking`, `ServicePlan`, `IntegrationType` — usados por todas las tareas siguientes
- Produce: `MOCK_SERVICES: OfficialService[]` y `generateMockSlots(serviceId, dates): ServiceSlot[]`

- [ ] **Step 1: Crear los tipos**

Crear `src/types/officialServices.ts`:

```ts
export type IntegrationType = 'mock' | 'google_calendar' | 'api' | 'booking_url'
export type ServicePlan = 'presencia' | 'agenda' | 'destacado'

export interface OfficialService {
  id: string
  company_name: string
  logo_url?: string
  brands: string[]
  categories: string[]
  city: string
  zones: string[]
  website?: string
  booking_url?: string
  integration_type: IntegrationType
  plan: ServicePlan
  active: boolean
}

export interface ServiceSlot {
  date: string   // 'YYYY-MM-DD'
  time: string   // 'HH:MM'
  available: boolean
}

export interface PendingBooking {
  serviceId: string
  date: string
  time: string
  createdAt: string
}
```

- [ ] **Step 2: Crear mock data**

Crear `src/data/officialServicesMock.ts`:

```ts
import type { OfficialService, ServiceSlot } from '../types/officialServices'

export const MOCK_SERVICES: OfficialService[] = [
  {
    id: 'samsung-uy',
    company_name: 'Samsung Service Center',
    brands: ['Samsung'],
    categories: ['aire_acondicionado', 'tv', 'heladera'],
    city: 'Montevideo',
    zones: ['Pocitos', 'Punta Carretas', 'Centro'],
    website: 'https://www.samsung.com/uy/support/',
    booking_url: 'https://www.samsung.com/uy/support/service-center/',
    integration_type: 'mock',
    plan: 'destacado',
    active: true,
  },
  {
    id: 'lg-uy',
    company_name: 'LG Service Oficial',
    brands: ['LG'],
    categories: ['aire_acondicionado', 'lavarropas'],
    city: 'Montevideo',
    zones: ['Carrasco', 'Malvín', 'Pocitos'],
    website: 'https://www.lg.com/uy/support',
    booking_url: 'https://www.lg.com/uy/support/service',
    integration_type: 'mock',
    plan: 'agenda',
    active: true,
  },
  {
    id: 'whirlpool-uy',
    company_name: 'Whirlpool Uruguay',
    brands: ['Whirlpool', 'Consul'],
    categories: ['lavarropas', 'horno'],
    city: 'Montevideo',
    zones: ['Centro', 'Cordón', 'Tres Cruces'],
    website: 'https://www.whirlpool.com.uy/',
    booking_url: 'https://www.whirlpool.com.uy/servicio-tecnico',
    integration_type: 'mock',
    plan: 'agenda',
    active: true,
  },
  {
    id: 'midea-uy',
    company_name: 'Midea Técnica',
    brands: ['Midea', 'BGH'],
    categories: ['aire_acondicionado'],
    city: 'Montevideo',
    zones: ['La Blanqueada', 'Parque Batlle', 'Buceo'],
    website: 'https://www.midea.com/uy',
    integration_type: 'mock',
    plan: 'presencia',
    active: true,
  },
  {
    id: 'james-uy',
    company_name: 'James Service',
    brands: ['James'],
    categories: ['lavarropas', 'heladera'],
    city: 'Montevideo',
    zones: ['Punta Carretas', 'Pocitos', 'Cordón'],
    website: 'https://www.james.com.uy/',
    integration_type: 'mock',
    plan: 'presencia',
    active: true,
  },
]

const SLOT_TIMES = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
// Deterministic availability: seed based on serviceId + date + time
function isAvailable(serviceId: string, date: string, time: string): boolean {
  const hash = (serviceId + date + time).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return hash % 10 < 6  // ~60% available
}

export function generateMockSlots(serviceId: string, dates: string[]): ServiceSlot[] {
  const slots: ServiceSlot[] = []
  for (const date of dates) {
    const d = new Date(date + 'T12:00:00')
    const dow = d.getDay()
    if (dow === 0 || dow === 6) continue  // no weekends
    for (const time of SLOT_TIMES) {
      slots.push({ date, time, available: isAvailable(serviceId, date, time) })
    }
  }
  return slots
}
```

- [ ] **Step 3: Verificar que TypeScript no reporta errores**

```bash
cd oficioYa && npx tsc --noEmit 2>&1 | head -20
```

Esperado: sin errores en los archivos nuevos.

- [ ] **Step 4: Commit**

```bash
git add src/types/officialServices.ts src/data/officialServicesMock.ts
git commit -m "feat: tipos y mock data para servicios oficiales"
```

---

## Task 2: Store Zustand

**Files:**
- Create: `src/store/officialServiceStore.ts`

**Interfaces:**
- Consumes: `OfficialService`, `ServiceSlot`, `PendingBooking` de `src/types/officialServices.ts`
- Consumes: `MOCK_SERVICES`, `generateMockSlots` de `src/data/officialServicesMock.ts`
- Produce: hook `useOfficialServiceStore` con estado y acciones descritas abajo

- [ ] **Step 1: Crear el store**

Crear `src/store/officialServiceStore.ts`:

```ts
import { create } from 'zustand'
import type { OfficialService, ServiceSlot, PendingBooking, ServicePlan } from '../types/officialServices'
import { MOCK_SERVICES, generateMockSlots } from '../data/officialServicesMock'

interface Filters {
  category?: string
  brand?: string
  zone?: string
}

interface OfficialServiceState {
  services: OfficialService[]
  slots: Record<string, ServiceSlot[]>   // key: `${serviceId}_${date}`
  pendingBooking: PendingBooking | null
  loading: boolean
  error: string | null
  // acciones
  fetchServices: (filters?: Filters) => Promise<void>
  fetchSlots: (serviceId: string, dates: string[]) => Promise<void>
  getSlotsForDate: (serviceId: string, date: string) => ServiceSlot[]
  isDateAvailable: (serviceId: string, date: string) => boolean
  getNextSlots: (serviceId: string, count?: number) => ServiceSlot[]
  confirmBooking: (serviceId: string, date: string, time: string) => void
  clearPendingBooking: () => void
}

const PLAN_ORDER: Record<ServicePlan, number> = { destacado: 0, agenda: 1, presencia: 2 }

function sortServices(services: OfficialService[]): OfficialService[] {
  return [...services].sort((a, b) => {
    const planDiff = PLAN_ORDER[a.plan] - PLAN_ORDER[b.plan]
    if (planDiff !== 0) return planDiff
    return a.company_name.localeCompare(b.company_name)
  })
}

function getNext14Dates(): string[] {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d.toISOString().split('T')[0]
  })
}

export const useOfficialServiceStore = create<OfficialServiceState>((set, get) => ({
  services: [],
  slots: {},
  pendingBooking: null,
  loading: false,
  error: null,

  fetchServices: async (filters) => {
    set({ loading: true, error: null })
    // MVP: mock data — reemplazar cuerpo aquí para integración real
    await new Promise((r) => setTimeout(r, 200))  // simula latencia
    let results = MOCK_SERVICES.filter((s) => s.active)
    if (filters?.category) results = results.filter((s) => s.categories.includes(filters.category!))
    if (filters?.brand) results = results.filter((s) => s.brands.some((b) => b.toLowerCase().includes(filters.brand!.toLowerCase())))
    if (filters?.zone) results = results.filter((s) => s.zones.includes(filters.zone!))
    set({ services: sortServices(results), loading: false })
  },

  fetchSlots: async (serviceId, dates) => {
    // MVP: mock data — reemplazar cuerpo aquí según integration_type para integración real
    const service = MOCK_SERVICES.find((s) => s.id === serviceId)
    if (!service || service.plan === 'presencia') return
    const newSlots = generateMockSlots(serviceId, dates)
    const slotMap: Record<string, ServiceSlot[]> = {}
    for (const slot of newSlots) {
      const key = `${serviceId}_${slot.date}`
      if (!slotMap[key]) slotMap[key] = []
      slotMap[key].push(slot)
    }
    set((state) => ({ slots: { ...state.slots, ...slotMap } }))
  },

  getSlotsForDate: (serviceId, date) => {
    return get().slots[`${serviceId}_${date}`] ?? []
  },

  isDateAvailable: (serviceId, date) => {
    const slots = get().slots[`${serviceId}_${date}`] ?? []
    return slots.some((s) => s.available)
  },

  getNextSlots: (serviceId, count = 2) => {
    const dates = getNext14Dates()
    const all: ServiceSlot[] = []
    for (const date of dates) {
      const daySlots = get().slots[`${serviceId}_${date}`] ?? []
      all.push(...daySlots.filter((s) => s.available))
      if (all.length >= count) break
    }
    return all.slice(0, count)
  },

  confirmBooking: (serviceId, date, time) => {
    const booking: PendingBooking = { serviceId, date, time, createdAt: new Date().toISOString() }
    // Persiste para fase 2 (oficial_bookings en Supabase)
    try { localStorage.setItem('ofix_pending_booking', JSON.stringify(booking)) } catch {}
    set({ pendingBooking: booking })
  },

  clearPendingBooking: () => {
    try { localStorage.removeItem('ofix_pending_booking') } catch {}
    set({ pendingBooking: null })
  },
}))
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Esperado: sin errores nuevos.

- [ ] **Step 3: Commit**

```bash
git add src/store/officialServiceStore.ts
git commit -m "feat: officialServiceStore con mock data y firma lista para integración real"
```

---

## Task 3: DateStripGeneric

**Files:**
- Create: `src/components/availability/DateStripGeneric.tsx`

**Interfaces:**
- Consumes: nada del store — 100% prop-driven
- Produce: `<DateStripGeneric selected onSelect isDateAvailable />` — usado en `OfficialServiceDetail`

- [ ] **Step 1: Crear el componente**

Crear `src/components/availability/DateStripGeneric.tsx`:

```tsx
import { useRef, useEffect, useMemo } from 'react'

interface Props {
  selected: string | null   // 'YYYY-MM-DD'
  onSelect: (date: string) => void
  isDateAvailable: (date: string) => boolean
}

const DAY_LETTER = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

function getNext14Days(): string[] {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d.toISOString().split('T')[0]
  })
}

function formatDay(dateStr: string): { letter: string; num: number } {
  const d = new Date(dateStr + 'T12:00:00')
  return { letter: DAY_LETTER[d.getDay()], num: d.getDate() }
}

export function DateStripGeneric({ selected, onSelect, isDateAvailable }: Props) {
  const days = useMemo(() => getNext14Days(), [])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!selected || !scrollRef.current) return
    const idx = days.indexOf(selected)
    if (idx < 0) return
    const child = scrollRef.current.children[idx] as HTMLElement
    child?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [selected, days])

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto pb-1"
      style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
    >
      {days.map((date) => {
        const available = isDateAvailable(date)
        const isSelected = selected === date
        const { letter, num } = formatDay(date)

        return (
          <button
            key={date}
            type="button"
            onClick={() => available ? onSelect(date) : undefined}
            disabled={!available}
            className="flex flex-col items-center gap-0.5 flex-shrink-0 transition-all duration-150 active:scale-95"
            style={{
              width: 44,
              padding: '8px 4px',
              borderRadius: 12,
              background: isSelected
                ? '#E8683A'
                : available
                  ? '#FFFFFF'
                  : '#F5F0E8',
              border: isSelected
                ? '1.5px solid #E8683A'
                : '1.5px solid #EDE8DE',
              boxShadow: isSelected ? '0 2px 8px rgba(232,104,58,.3)' : undefined,
              opacity: available ? 1 : 0.4,
              cursor: available ? 'pointer' : 'not-allowed',
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: isSelected ? '#FFFFFF' : '#888888',
                letterSpacing: 0.5,
              }}
            >
              {letter}
            </span>
            <span
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: isSelected ? '#FFFFFF' : available ? '#111111' : '#AAAAAA',
              }}
            >
              {num}
            </span>
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Esperado: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/availability/DateStripGeneric.tsx
git commit -m "feat: DateStripGeneric — versión prop-driven de DateStrip para servicios oficiales"
```

---

## Task 4: OfficialServiceCard

**Files:**
- Create: `src/components/officialServices/OfficialServiceCard.tsx`

**Interfaces:**
- Consumes: `OfficialService`, `ServiceSlot` de `src/types/officialServices.ts`
- Produce: `<OfficialServiceCard service nextSlots onClick />` — usado en `OfficialServicesPage`

- [ ] **Step 1: Crear el componente**

Crear `src/components/officialServices/OfficialServiceCard.tsx`:

```tsx
import { motion } from 'framer-motion'
import type { OfficialService, ServiceSlot } from '../../types/officialServices'

interface Props {
  service: OfficialService
  nextSlots: ServiceSlot[]
  onClick: () => void
}

const DAY_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function formatSlotShort(slot: ServiceSlot): string {
  const d = new Date(slot.date + 'T12:00:00')
  return `${DAY_SHORT[d.getDay()]} ${slot.time}`
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

export function OfficialServiceCard({ service, nextSlots, onClick }: Props) {
  const hasSlots = nextSlots.length > 0
  const isDestacado = service.plan === 'destacado'

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
        border: `1.5px solid ${isDestacado ? '#F5D78E' : '#EDE8DE'}`,
        borderRadius: 16,
        boxShadow: isDestacado
          ? '0 2px 8px rgba(245,215,142,.35)'
          : '0 1px 3px rgba(0,0,0,.06)',
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {/* Logo / Iniciales */}
      <div
        className="flex-shrink-0 flex items-center justify-center font-black rounded-xl overflow-hidden"
        style={{
          width: 44,
          height: 44,
          background: service.logo_url ? undefined : 'linear-gradient(135deg, #0F6E56, #0a5241)',
          fontSize: 14,
          color: '#FFFFFF',
        }}
      >
        {service.logo_url
          ? <img src={service.logo_url} alt={service.company_name} className="w-full h-full object-cover" />
          : getInitials(service.company_name)
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {/* Nombre + badges */}
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-bold truncate" style={{ fontSize: 'var(--text-base)', color: '#111111' }}>
            {service.company_name}
          </span>
          {isDestacado && (
            <span style={{ fontSize: 12 }}>⭐</span>
          )}
          <span
            className="ml-auto flex-shrink-0 font-bold"
            style={{
              fontSize: 10,
              padding: '2px 7px',
              borderRadius: 6,
              background: hasSlots ? 'rgba(15,110,86,.12)' : '#F0F0F0',
              color: hasSlots ? '#0F6E56' : '#999999',
            }}
          >
            {hasSlots ? '● Disponible' : 'Sin turnos'}
          </span>
        </div>

        {/* Categorías */}
        <div className="truncate mb-0.5" style={{ fontSize: 'var(--text-xs)', color: '#777777' }}>
          {service.categories.map((c) => c.replace(/_/g, ' ')).join(' · ')}
        </div>

        {/* Zonas */}
        <div className="truncate mb-1" style={{ fontSize: 'var(--text-xs)', color: '#AAAAAA' }}>
          {service.zones.join(', ')}
        </div>

        {/* Próximos slots */}
        {hasSlots && (
          <div style={{ fontSize: 'var(--text-xs)', color: '#E8683A', fontWeight: 700 }}>
            Próx: {nextSlots.map(formatSlotShort).join(' · ')}
          </div>
        )}
      </div>
    </motion.div>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Esperado: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/officialServices/OfficialServiceCard.tsx
git commit -m "feat: OfficialServiceCard — card compacta con próximos slots disponibles"
```

---

## Task 5: OfficialServicesPage (listado)

**Files:**
- Create: `src/pages/OfficialServicesPage.tsx`

**Interfaces:**
- Consumes: `useOfficialServiceStore` de `src/store/officialServiceStore.ts`
- Consumes: `OfficialServiceCard` de `src/components/officialServices/OfficialServiceCard.tsx`
- Produce: página en `/servicios-oficiales` navegable desde Home

- [ ] **Step 1: Crear la página**

Crear `src/pages/OfficialServicesPage.tsx`:

```tsx
import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronLeft, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageShell } from '../components/layout/PageShell'
import { OfficialServiceCard } from '../components/officialServices/OfficialServiceCard'
import { useOfficialServiceStore } from '../store/officialServiceStore'
import { fadeUp, staggerFast } from '../lib/motion'

const CATEGORIES: { id: string; emoji: string; label: string }[] = [
  { id: '',                   emoji: '🔧', label: 'Todos' },
  { id: 'aire_acondicionado', emoji: '❄️', label: 'Aire AC' },
  { id: 'heladera',           emoji: '🧊', label: 'Heladeras' },
  { id: 'lavarropas',         emoji: '🫧', label: 'Lavarropas' },
  { id: 'tv',                 emoji: '📺', label: 'TV' },
  { id: 'horno',              emoji: '🍳', label: 'Hornos' },
]

const ZONES = [
  'Todas', 'Pocitos', 'Malvín', 'Centro', 'Carrasco', 'Punta Carretas',
  'Cordón', 'Tres Cruces', 'La Blanqueada', 'Buceo', 'Parque Batlle',
]

export default function OfficialServicesPage() {
  const navigate = useNavigate()
  const { services, loading, fetchServices, fetchSlots, getNextSlots } = useOfficialServiceStore()
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('')
  const [activeZone, setActiveZone] = useState('Todas')

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  // Pre-cargar slots de todos los services con agenda/destacado
  useEffect(() => {
    const dates = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() + i)
      return d.toISOString().split('T')[0]
    })
    for (const s of services) {
      if (s.plan !== 'presencia') fetchSlots(s.id, dates)
    }
  }, [services, fetchSlots])

  const filtered = useMemo(() => {
    return services.filter((s) => {
      const q = query.toLowerCase()
      const matchQuery = !q
        || s.company_name.toLowerCase().includes(q)
        || s.brands.some((b) => b.toLowerCase().includes(q))
      const matchCat = !activeCategory || s.categories.includes(activeCategory)
      const matchZone = activeZone === 'Todas' || s.zones.includes(activeZone)
      return matchQuery && matchCat && matchZone
    })
  }, [services, query, activeCategory, activeZone])

  const header = (
    <header
      className="sticky top-0 z-50"
      style={{ background: '#FFFFFF', boxShadow: '0 1px 0 #EDE8DE' }}
    >
      <div
        className="flex items-center gap-3"
        style={{ padding: 'calc(14px + var(--safe-top)) var(--px-container) 10px' }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center justify-center active:opacity-60 transition-opacity"
          style={{ width: 36, height: 36, borderRadius: 10, background: '#F5F0E8', border: '1.5px solid #EDE8DE' }}
        >
          <ChevronLeft size={18} color="#333" />
        </button>
        <h1 className="font-black" style={{ fontSize: 20, color: '#111111', flex: 1 }}>
          Servicios Oficiales
        </h1>
      </div>

      {/* Search bar */}
      <div style={{ padding: '0 var(--px-container) 10px' }}>
        <div
          className="flex items-center gap-2"
          style={{ background: '#F5F0E8', border: '1.5px solid #EDE8DE', borderRadius: 12, padding: '0 12px', height: 42 }}
        >
          <Search size={16} color="#AAAAAA" />
          <input
            type="search"
            placeholder="Buscar marca o empresa..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: 'var(--text-sm)', color: '#111111' }}
          />
          {query && (
            <button type="button" onClick={() => setQuery('')}>
              <X size={14} color="#AAAAAA" />
            </button>
          )}
        </div>
      </div>

      {/* Chips de categoría */}
      <div
        className="flex gap-2 overflow-x-auto"
        style={{ padding: '0 var(--px-container) 10px', scrollbarWidth: 'none' }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className="flex-shrink-0 font-bold transition-all"
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 'var(--text-sm)',
              background: activeCategory === cat.id ? '#0F6E56' : '#F5F0E8',
              color: activeCategory === cat.id ? '#FFFFFF' : '#555555',
              border: '1.5px solid',
              borderColor: activeCategory === cat.id ? '#0F6E56' : '#EDE8DE',
            }}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Chips de zona */}
      <div
        className="flex gap-2 overflow-x-auto"
        style={{ padding: '0 var(--px-container) 12px', scrollbarWidth: 'none' }}
      >
        {ZONES.map((zone) => (
          <button
            key={zone}
            type="button"
            onClick={() => setActiveZone(zone)}
            className="flex-shrink-0 font-bold transition-all"
            style={{
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: 'var(--text-xs)',
              background: activeZone === zone ? '#E8683A' : '#F5F0E8',
              color: activeZone === zone ? '#FFFFFF' : '#777777',
              border: '1.5px solid',
              borderColor: activeZone === zone ? '#E8683A' : '#EDE8DE',
            }}
          >
            {zone}
          </button>
        ))}
      </div>
    </header>
  )

  return (
    <PageShell header={header} showBottomNav={false}>
      <div style={{ padding: '16px var(--px-container)', paddingBottom: 32 }}>
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl" style={{ height: 88, background: '#F5F0E8' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span style={{ fontSize: 40 }}>🔍</span>
            <p className="font-bold" style={{ color: '#333333' }}>Sin resultados</p>
            <p style={{ fontSize: 'var(--text-sm)', color: '#AAAAAA' }}>
              Probá con otra categoría o zona
            </p>
          </div>
        ) : (
          <motion.div
            className="flex flex-col gap-3"
            variants={staggerFast}
            initial="hidden"
            animate="show"
          >
            <AnimatePresence>
              {filtered.map((service) => (
                <motion.div key={service.id} variants={fadeUp}>
                  <OfficialServiceCard
                    service={service}
                    nextSlots={getNextSlots(service.id, 2)}
                    onClick={() => navigate(`/servicios-oficiales/${service.id}`)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </PageShell>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Esperado: sin errores. Si `fadeUp` o `staggerFast` no están en `src/lib/motion.ts`, verificar cuáles están disponibles con `grep -n "export" src/lib/motion.ts` y usar los correctos.

- [ ] **Step 3: Commit**

```bash
git add src/pages/OfficialServicesPage.tsx
git commit -m "feat: OfficialServicesPage — listado con filtros por categoría, marca y zona"
```

---

## Task 6: OfficialServiceDetail (detalle + booking)

**Files:**
- Create: `src/pages/OfficialServiceDetail.tsx`

**Interfaces:**
- Consumes: `useOfficialServiceStore` de `src/store/officialServiceStore.ts`
- Consumes: `DateStripGeneric` de `src/components/availability/DateStripGeneric.tsx`
- Consumes: `TimeSlotGrid` de `src/components/availability/TimeSlotGrid.tsx`
- Consumes: `TimeSlot` type de `src/store/availabilityStore.ts` (para adaptar `ServiceSlot` a lo que espera `TimeSlotGrid`)

- [ ] **Step 1: Crear la página**

Crear `src/pages/OfficialServiceDetail.tsx`:

```tsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageShell } from '../components/layout/PageShell'
import { DateStripGeneric } from '../components/availability/DateStripGeneric'
import { TimeSlotGrid } from '../components/availability/TimeSlotGrid'
import { useOfficialServiceStore } from '../store/officialServiceStore'
import { useAuthStore } from '../store/authStore'
import type { TimeSlot } from '../store/availabilityStore'

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

function getNext14Dates(): string[] {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i)
    return d.toISOString().split('T')[0]
  })
}

export default function OfficialServiceDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { services, fetchSlots, getSlotsForDate, isDateAvailable, confirmBooking } = useOfficialServiceStore()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [toastVisible, setToastVisible] = useState(false)

  const service = services.find((s) => s.id === id)

  useEffect(() => {
    if (!service || service.plan === 'presencia') return
    fetchSlots(service.id, getNext14Dates())
  }, [service, fetchSlots])

  if (!service) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p style={{ color: '#AAAAAA' }}>Servicio no encontrado</p>
      </div>
    )
  }

  // Adaptar ServiceSlot[] a TimeSlot[] que espera TimeSlotGrid
  const daySlots: TimeSlot[] = getSlotsForDate(service.id, selectedDate ?? '').map((s) => ({
    time: s.time,
    status: s.available ? 'available' : 'booked',
  }))

  function handleConfirm() {
    if (!selectedDate || !selectedTime) return
    if (!user) { navigate('/login'); return }
    confirmBooking(service!.id, selectedDate, selectedTime)
    // Redirige al sitio del service con fecha y hora como query params
    const url = service!.booking_url
      ? `${service!.booking_url}?date=${selectedDate}&time=${selectedTime}`
      : service!.website ?? '#'
    window.open(url, '_blank', 'noopener,noreferrer')
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 4000)
  }

  const header = (
    <header
      className="sticky top-0 z-50"
      style={{ background: '#FFFFFF', boxShadow: '0 1px 0 #EDE8DE' }}
    >
      <div
        className="flex items-center gap-3"
        style={{ padding: 'calc(14px + var(--safe-top)) var(--px-container) 14px' }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center justify-center active:opacity-60"
          style={{ width: 36, height: 36, borderRadius: 10, background: '#F5F0E8', border: '1.5px solid #EDE8DE' }}
        >
          <ChevronLeft size={18} color="#333" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-black truncate" style={{ fontSize: 18, color: '#111111' }}>
            {service.company_name}
          </h1>
          <p style={{ fontSize: 'var(--text-xs)', color: '#AAAAAA' }}>
            {service.zones.join(' · ')}
          </p>
        </div>
        {/* Logo */}
        <div
          className="flex-shrink-0 flex items-center justify-center font-black rounded-xl"
          style={{
            width: 44, height: 44,
            background: service.logo_url ? undefined : 'linear-gradient(135deg, #0F6E56, #0a5241)',
            color: '#FFFFFF', fontSize: 14,
          }}
        >
          {service.logo_url
            ? <img src={service.logo_url} alt={service.company_name} className="w-full h-full object-cover rounded-xl" />
            : getInitials(service.company_name)
          }
        </div>
      </div>
    </header>
  )

  return (
    <PageShell header={header} showBottomNav={false}>
      <div style={{ padding: '16px var(--px-container)', paddingBottom: 100 }}>

        {/* Chips de marca */}
        <div className="flex flex-wrap gap-2 mb-4">
          {service.brands.map((brand) => (
            <span
              key={brand}
              className="font-bold"
              style={{
                fontSize: 'var(--text-xs)', padding: '4px 10px', borderRadius: 8,
                background: 'rgba(15,110,86,.10)', color: '#0F6E56',
              }}
            >
              {brand}
            </span>
          ))}
          {service.plan === 'destacado' && (
            <span
              className="font-bold"
              style={{
                fontSize: 'var(--text-xs)', padding: '4px 10px', borderRadius: 8,
                background: 'rgba(245,215,142,.3)', color: '#A07800',
              }}
            >
              ⭐ Destacado
            </span>
          )}
        </div>

        {/* Chips de categoría */}
        <div className="flex flex-wrap gap-2 mb-6">
          {service.categories.map((cat) => (
            <span
              key={cat}
              style={{
                fontSize: 'var(--text-xs)', padding: '3px 9px', borderRadius: 8,
                background: '#F5F0E8', color: '#777777', border: '1px solid #EDE8DE',
              }}
            >
              {cat.replace(/_/g, ' ')}
            </span>
          ))}
        </div>

        {/* Plan presencia: sin agenda online */}
        {service.plan === 'presencia' ? (
          <div
            className="flex flex-col items-center gap-4 py-10 text-center"
            style={{ background: '#F5F0E8', borderRadius: 16, padding: 24 }}
          >
            <span style={{ fontSize: 36 }}>📋</span>
            <div>
              <p className="font-bold mb-1" style={{ color: '#333333' }}>Reservas online no disponibles</p>
              <p style={{ fontSize: 'var(--text-sm)', color: '#AAAAAA' }}>
                Comunicate directamente con este service para agendar
              </p>
            </div>
            {service.website && (
              <a
                href={service.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 font-bold"
                style={{
                  padding: '10px 20px', borderRadius: 12,
                  background: '#0F6E56', color: '#FFFFFF', fontSize: 'var(--text-sm)',
                }}
              >
                Ver sitio web <ExternalLink size={14} />
              </a>
            )}
          </div>
        ) : (
          /* Plan agenda / destacado: calendario completo */
          <>
            <h2 className="font-bold mb-3" style={{ fontSize: 'var(--text-base)', color: '#111111' }}>
              Elegí una fecha
            </h2>
            <div className="mb-6">
              <DateStripGeneric
                selected={selectedDate}
                onSelect={(date) => { setSelectedDate(date); setSelectedTime(null) }}
                isDateAvailable={(date) => isDateAvailable(service.id, date)}
              />
            </div>

            {selectedDate && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              >
                <h2 className="font-bold mb-3" style={{ fontSize: 'var(--text-base)', color: '#111111' }}>
                  Horarios disponibles
                </h2>
                <div className="mb-6">
                  <TimeSlotGrid
                    slots={daySlots}
                    selected={selectedTime}
                    onSelect={setSelectedTime}
                  />
                </div>
              </motion.div>
            )}

            {/* Botón confirmar */}
            <div
              className="fixed bottom-0 left-0 right-0 z-40"
              style={{ background: '#FFFFFF', borderTop: '1px solid #EDE8DE', padding: '12px var(--px-container)', paddingBottom: 'calc(12px + var(--safe-bottom))' }}
            >
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!selectedDate || !selectedTime}
                className="w-full font-black transition-all active:scale-95"
                style={{
                  height: 52, borderRadius: 16, fontSize: 'var(--text-base)',
                  background: selectedDate && selectedTime ? '#E8683A' : '#F0F0F0',
                  color: selectedDate && selectedTime ? '#FFFFFF' : '#AAAAAA',
                  border: 'none', cursor: selectedDate && selectedTime ? 'pointer' : 'not-allowed',
                }}
              >
                {selectedDate && selectedTime ? 'Confirmar turno →' : 'Seleccioná fecha y hora'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Toast de confirmación */}
      {toastVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 z-50 font-bold text-center"
          style={{
            background: '#0F6E56', color: '#FFFFFF', borderRadius: 14,
            padding: '14px 20px', fontSize: 'var(--text-sm)',
            boxShadow: '0 4px 20px rgba(15,110,86,.35)',
          }}
        >
          Turno solicitado — completá la reserva en el sitio del service
        </motion.div>
      )}
    </PageShell>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Esperado: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/pages/OfficialServiceDetail.tsx
git commit -m "feat: OfficialServiceDetail — calendario, selección de horario y confirmación con redirect"
```

---

## Task 7: Rutas en App.tsx + banner en Home

**Files:**
- Modify: `src/App.tsx` — 2 imports lazy + 2 rutas
- Modify: `src/pages/Home.tsx` — banner de entrada al módulo

**Interfaces:**
- Consumes: `OfficialServicesPage` y `OfficialServiceDetail` creados en tareas anteriores

- [ ] **Step 1: Agregar lazy imports y rutas en App.tsx**

En `src/App.tsx`, agregar después de la línea de `BuscarOtroProfesional`:

```tsx
const OfficialServicesPage  = lazy(() => import('./pages/OfficialServicesPage'))
const OfficialServiceDetail = lazy(() => import('./pages/OfficialServiceDetail'))
```

En el bloque de rutas compartidas (antes del bloque `/pro/*`), agregar:

```tsx
<Route path="/servicios-oficiales"     element={<OfficialServicesPage />} />
<Route path="/servicios-oficiales/:id" element={<OfficialServiceDetail />} />
```

- [ ] **Step 2: Agregar banner en Home.tsx**

En `src/pages/Home.tsx`, importar `useNavigate` ya está. Agregar el banner dentro del `<div className="flex flex-col gap-4 ...">`, después de `<TicketEntryCard />` y antes de `<FeaturedProfessionals />`:

```tsx
{/* Banner Servicios Oficiales */}
<motion.button
  type="button"
  onClick={() => navigate('/servicios-oficiales')}
  whileTap={{ scale: 0.98 }}
  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
  className="w-full text-left"
  style={{
    background: 'linear-gradient(135deg, #0F6E56 0%, #1a9b78 100%)',
    borderRadius: 20,
    padding: '16px 20px',
    border: 'none',
    cursor: 'pointer',
  }}
>
  <div className="flex items-center justify-between">
    <div>
      <p className="font-black mb-1" style={{ fontSize: 'var(--text-base)', color: '#FFFFFF' }}>
        🔧 Servicios Técnicos Oficiales
      </p>
      <p style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.75)' }}>
        Samsung · LG · Whirlpool · y más
      </p>
      <p className="font-bold mt-2" style={{ fontSize: 'var(--text-xs)', color: '#9FE1CB' }}>
        Agendá directo con el service →
      </p>
    </div>
    <span style={{ fontSize: 36 }}>🏷️</span>
  </div>
</motion.button>
```

Agregar el import de `motion` si no está: ya existe en `Home.tsx` si se usa en otro componente. Si no: `import { motion } from 'framer-motion'`.

- [ ] **Step 3: Verificar TypeScript y build**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Esperado: sin errores.

- [ ] **Step 4: Levantar dev server y verificar el flujo completo**

```bash
npm run dev
```

Verificar manualmente:
1. Home muestra el banner verde de Servicios Oficiales
2. Tap en banner navega a `/servicios-oficiales`
3. Listado muestra 5 services ordenados: Samsung (destacado ⭐), LG, Whirlpool, Midea, James
4. Chips de categoría filtran correctamente
5. Chips de zona filtran correctamente
6. Buscador filtra por nombre o marca
7. Tap en Samsung → `/servicios-oficiales/samsung-uy` muestra DateStrip con días habilitados
8. Seleccionar fecha → aparece TimeSlotGrid con horarios
9. Seleccionar horario → botón "Confirmar turno" se activa (naranja)
10. Tap confirmar → abre pestaña nueva + muestra toast verde
11. Tap en Midea (plan presencia) → pantalla sin calendario, botón "Ver sitio web"

- [ ] **Step 5: Commit final**

```bash
git add src/App.tsx src/pages/Home.tsx
git commit -m "feat: rutas servicios oficiales + banner en Home — módulo completo"
```

---

## Self-Review

**Spec coverage:**
- ✅ Banner en Home → `/servicios-oficiales` (Task 7)
- ✅ Filtros por categoría, marca, zona (Task 5)
- ✅ `OfficialServiceCard` compacta con próximos 2 slots (Task 4)
- ✅ `DateStripGeneric` prop-driven (Task 3)
- ✅ `TimeSlotGrid` reutilizado sin cambios (Task 6)
- ✅ Confirmación redirige a `booking_url?date=...&time=...` (Task 6)
- ✅ `PendingBooking` guardado en store + localStorage para fase 2 (Task 2)
- ✅ Plan `presencia` → "Sin turnos online" + "Ver sitio web" (Task 6)
- ✅ Plan `destacado` → badge ⭐ + posición prioritaria (Tasks 2, 4)
- ✅ Tipos en `src/types/officialServices.ts` separados (Task 1)
- ✅ Mock data con 5 services y slots determinísticos (Task 1)
- ✅ `fetchServices` y `fetchSlots` con firma fija para integración real (Task 2)

**Placeholder scan:** sin TBD, sin TODO, sin "similar a Task N". Toda referencia de tipo entre tareas es consistente.

**Type consistency:**
- `OfficialService`, `ServiceSlot`, `PendingBooking` definidos en Task 1, usados con los mismos nombres en Tasks 2-6 ✅
- `useOfficialServiceStore` exportado en Task 2, importado en Tasks 5 y 6 ✅
- `DateStripGeneric` exportado en Task 3, importado en Task 6 ✅
- `OfficialServiceCard` exportado en Task 4, importado en Task 5 ✅
- `TimeSlot` (de `availabilityStore`) adaptado en Task 6 desde `ServiceSlot` ✅
