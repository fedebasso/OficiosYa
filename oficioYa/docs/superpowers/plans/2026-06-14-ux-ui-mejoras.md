# UX/UI Mejoras Prioritarias — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Simplificar la experiencia visual de OficioYa eliminando ruido, mejorando confianza en los profesionales y reemplazando el flujo de solicitud por un wizard de 7 pasos.

**Architecture:** 4 fases independientes ordenadas por impacto: (1) limpiar Home eliminando CategoryIcons, (2) reemplazar RequestForm por un wizard multi-paso, (3) quitar badges Online/Top de ProfessionalCard y reemplazar por indicadores reales, (4) rediseñar la cabecera del perfil a layout simple con galería separada.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v3, React Hook Form + Zod, Zustand, React Router v7.

---

## Files touched

| Acción | Archivo |
|--------|---------|
| Modify | `src/pages/Home.tsx` |
| Delete ref | `src/components/home/CategoryIcons.tsx` (se deja el archivo, se deja de importar) |
| Modify | `src/components/professionals/ProfessionalCard.tsx` |
| Modify | `src/components/professionals/ProfessionalProfile.tsx` |
| Create | `src/components/requests/RequestWizard.tsx` |
| Modify | `src/pages/RequestService.tsx` |
| Modify | `src/store/requestStore.ts` (ampliar `ServiceRequest` con campos nuevos) |

---

## Task 1: Fase 1 — Eliminar CategoryIcons del Home

**Files:**
- Modify: `src/pages/Home.tsx`

El Home tiene dos secciones de categorías: `CategoryChips` (píldoras en el header, se mantiene) y `CategoryIcons` (tarjetas con gradientes en el body, se elimina). Se elimina el `<section>` de Categorías del body y el import de `CategoryIcons`.

- [ ] **Step 1: Editar Home.tsx**

Reemplazar el contenido del `return` de `Home` para quitar la sección de íconos y dejar el orden correcto: search → banner futuro → chips (ya están en header) → profesionales destacados.

```tsx
// src/pages/Home.tsx
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
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

      {/* Fila 2: search bar */}
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
        <section>
          <FeaturedProfessionals />
        </section>
      </div>
      <UrgenciasFAB />
    </PageShell>
  )
}
```

- [ ] **Step 2: Verificar que compila**

```bash
npm run build
```
Expected: sin errores de TypeScript ni imports faltantes.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Home.tsx
git commit -m "feat: remove duplicate category icons from Home, keep only chips"
```

---

## Task 2: Fase 3 — Quitar badges Online/Top de ProfessionalCard

**Files:**
- Modify: `src/components/professionals/ProfessionalCard.tsx`

Eliminar los componentes `AvailableBadge` y `TopBadge`. Reemplazar por indicadores de confianza: calificación (ya existe), cantidad de trabajos (ya existe en texto), verificado (ya existe como ✓), zona (ya existe). Solo se reorganiza el layout para que queden más claros.

- [ ] **Step 1: Editar ProfessionalCard.tsx**

```tsx
// src/components/professionals/ProfessionalCard.tsx
import { Heart } from 'lucide-react'
import type { ProfessionalWithProfile } from '../../hooks/useProfessionals'
import { getCategoryMeta } from '../../lib/categories'
import { getInitials } from '../../lib/utils'
import { useFavoritesStore } from '../../store/favoritesStore'

interface Props {
  professional: ProfessionalWithProfile
  onClick: () => void
}

export function ProfessionalCard({ professional, onClick }: Props) {
  const { profiles, verified, avg_rating, zone, jobs_count, categories, id } = professional
  const { label, emoji, accent, avatarGradient } = getCategoryMeta(categories[0] ?? '')
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
      <div className="flex items-start gap-3 flex-1 min-w-0" style={{ padding: 'var(--space-3)' }}>

        {/* Avatar */}
        <div
          className="rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center font-black"
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
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="font-bold truncate" style={{ color: '#111111', fontSize: 'var(--text-base)' }}>
              {profiles.full_name}
            </span>
            {verified && (
              <span
                className="font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 text-[10px]"
                style={{ background: '#EFF6FF', color: '#3B82F6', border: '1px solid rgba(59,130,246,.2)' }}
              >
                ✓ Verificado
              </span>
            )}
          </div>
          <div className="font-semibold mb-1.5 truncate" style={{ color: accent, fontSize: 'var(--text-sm)' }}>
            {emoji} {label}
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-medium" style={{ color: '#555555', fontSize: 'var(--text-xs)' }}>
              📍 {zone}
            </span>
            <span style={{ color: '#CCCCCC', fontSize: 'var(--text-xs)' }}>·</span>
            <span style={{ color: '#777777', fontSize: 'var(--text-xs)' }}>
              🔨 {jobs_count} trabajos
            </span>
          </div>
        </div>

        {/* Rating + favorito */}
        <div className="flex flex-col items-end justify-between flex-shrink-0 py-0.5" style={{ minHeight: 56 }}>
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
            <Heart size={13} style={{ color: favorite ? '#EF4444' : '#CCCCCC' }} fill={favorite ? '#EF4444' : 'none'} />
          </button>
          {avg_rating != null && (
            <div className="flex items-center gap-1 mt-auto">
              <span style={{ color: '#F59E0B', fontSize: 'var(--text-base)' }}>★</span>
              <span className="font-black" style={{ color: '#111111', fontSize: 'var(--text-lg)', lineHeight: 1 }}>
                {avg_rating}
              </span>
            </div>
          )}
        </div>

      </div>
    </button>
  )
}

export default ProfessionalCard
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/professionals/ProfessionalCard.tsx
git commit -m "feat: replace Online/Top badges with trust indicators on ProfessionalCard"
```

---

## Task 3: Fase 4 — Rediseño de cabecera del perfil profesional

**Files:**
- Modify: `src/components/professionals/ProfessionalProfile.tsx`

Reemplazar el hero con imagen de fondo + avatar superpuesto por layout simple: foto grande centrada, nombre, rubro, calificación, indicadores de confianza. La galería de trabajos se mueve a una sección separada más abajo (ya existe, solo se reordena).

- [ ] **Step 1: Editar ProfessionalProfile.tsx — sección HERO**

Reemplazar el bloque `{/* ── HERO ── */}` (líneas 114–194) por:

```tsx
      {/* ── HERO ── */}
      <div
        className="flex flex-col items-center pt-14 pb-6 px-4"
        style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E0D4' }}
      >
        {/* Nav */}
        <div className="absolute top-10 left-4 right-4 flex justify-between items-center z-20">
          <button
            type="button"
            onClick={goBack}
            aria-label="Volver"
            className="w-10 h-10 rounded-full flex items-center justify-center active:opacity-70 transition-opacity"
            style={{ background: '#F5F0E8', border: '1px solid #E8E0D4' }}
          >
            <ChevronLeft size={24} color="#111111" />
          </button>
          <div className="w-10 h-10" />
        </div>

        {/* Foto grande */}
        <div
          className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center mb-4 flex-shrink-0"
          style={{ border: '3px solid #E8683A', boxShadow: '0 0 0 6px rgba(232,104,58,.08)' }}
        >
          {profiles.avatar_url ? (
            <img src={profiles.avatar_url} alt={profiles.full_name} className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white text-2xl font-black"
              style={{ background: 'linear-gradient(135deg,#E8683A,#c44d1f)' }}
            >
              {initials}
            </div>
          )}
        </div>

        {/* Nombre y rubro */}
        <h1 className="text-2xl font-black text-center leading-tight" style={{ color: '#111111', letterSpacing: '-0.5px' }}>
          {profiles.full_name}
        </h1>
        <p className="text-sm font-medium mt-1 mb-4" style={{ color: '#777777' }}>
          {specialty} · {zone}
        </p>

        {/* Indicadores de confianza */}
        <div className="flex items-center gap-4 flex-wrap justify-center">
          {avg_rating != null && (
            <div className="flex items-center gap-1">
              <span style={{ color: '#F59E0B', fontSize: 18 }}>★</span>
              <span className="font-black text-base" style={{ color: '#111111' }}>{avg_rating}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <span style={{ fontSize: 14 }}>🔨</span>
            <span className="font-semibold text-sm" style={{ color: '#555555' }}>{jobs_count} trabajos</span>
          </div>
          {verified && (
            <div className="flex items-center gap-1">
              <span style={{ fontSize: 14 }}>✅</span>
              <span className="font-semibold text-sm" style={{ color: '#3B82F6' }}>Verificado</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <span style={{ fontSize: 14 }}>📍</span>
            <span className="font-semibold text-sm" style={{ color: '#555555' }}>{zone}</span>
          </div>
        </div>
      </div>
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/professionals/ProfessionalProfile.tsx
git commit -m "feat: redesign professional profile header to simple layout with trust indicators"
```

---

## Task 4: Fase 2 — Ampliar ServiceRequest con campos del wizard

**Files:**
- Modify: `src/store/requestStore.ts`

El wizard nuevo captura más datos. Hay que extender el tipo `ServiceRequest` para incluir `work_type`, `photos`, `urgency_level` y `request_type`.

- [ ] **Step 1: Editar requestStore.ts**

```ts
// src/store/requestStore.ts
import { create } from 'zustand'
import { requestService } from '../services/requestService'

export type WorkType = 'reparacion' | 'instalacion' | 'mantenimiento' | 'otro'
export type UrgencyLevel = 'ahora' | 'hoy' | 'esta_semana' | 'sin_apuro'
export type RequestType = 'presupuesto' | 'visita'

export interface ServiceRequest {
  id: string
  client_id: string | null
  professional_id: string
  category: string
  description: string
  urgency: boolean
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  created_at: string
  contact_phone?: string
  work_type?: WorkType
  urgency_level?: UrgencyLevel
  request_type?: RequestType
  location?: string
}

interface RequestStore {
  requests: ServiceRequest[]
  loading: boolean
  error: string | null
  addRequest: (req: Omit<ServiceRequest, 'id' | 'client_id' | 'created_at' | 'status'>) => Promise<ServiceRequest>
  loadRequests: () => Promise<void>
  updateStatus: (id: string, status: ServiceRequest['status']) => Promise<void>
  submitReview: (requestId: string, rating: number, comment: string) => Promise<void>
}

export const useRequestStore = create<RequestStore>((set) => ({
  requests: [],
  loading: false,
  error: null,

  addRequest: async (req) => {
    const newReq = await requestService.create(req)
    set((s) => ({ requests: [newReq, ...s.requests] }))
    return newReq
  },

  loadRequests: async () => {
    set({ loading: true, error: null })
    try {
      set({ requests: await requestService.getAll(), loading: false })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Error', loading: false })
    }
  },

  updateStatus: async (id, status) => {
    await requestService.updateStatus(id, status)
    set((s) => ({ requests: s.requests.map((r) => r.id === id ? { ...r, status } : r) }))
  },

  submitReview: async (requestId, rating, comment) => {
    await requestService.submitReview(requestId, rating, comment)
  },
}))
```

- [ ] **Step 2: Commit**

```bash
git add src/store/requestStore.ts
git commit -m "feat: extend ServiceRequest with wizard fields (work_type, urgency_level, request_type, location)"
```

---

## Task 5: Fase 2 — Crear RequestWizard (wizard de 7 pasos)

**Files:**
- Create: `src/components/requests/RequestWizard.tsx`

Wizard con estado local (no toca Supabase hasta el paso 7). Pasos: (1) tipo de trabajo, (2) descripción, (3) fotos (preview local, sin upload real aún), (4) ubicación, (5) urgencia, (6) tipo de solicitud, (7) confirmación + envío.

- [ ] **Step 1: Crear RequestWizard.tsx**

```tsx
// src/components/requests/RequestWizard.tsx
import { useState } from 'react'
import { ChevronLeft, MapPin, Camera } from 'lucide-react'
import type { WorkType, UrgencyLevel, RequestType } from '../../store/requestStore'

interface WizardData {
  work_type: WorkType | null
  description: string
  photos: File[]
  location: string
  urgency_level: UrgencyLevel | null
  request_type: RequestType | null
  contact_phone: string
}

interface Props {
  onSubmit: (data: WizardData) => Promise<void>
  loading?: boolean
}

const WORK_TYPES: { value: WorkType; label: string; emoji: string }[] = [
  { value: 'reparacion', label: 'Reparación', emoji: '🔧' },
  { value: 'instalacion', label: 'Instalación', emoji: '⚙️' },
  { value: 'mantenimiento', label: 'Mantenimiento', emoji: '🛠️' },
  { value: 'otro', label: 'Otro', emoji: '📋' },
]

const URGENCY_LEVELS: { value: UrgencyLevel; label: string; emoji: string }[] = [
  { value: 'ahora', label: 'Ahora', emoji: '🔴' },
  { value: 'hoy', label: 'Hoy', emoji: '🟡' },
  { value: 'esta_semana', label: 'Esta semana', emoji: '🟢' },
  { value: 'sin_apuro', label: 'Sin apuro', emoji: '⚪' },
]

const REQUEST_TYPES: { value: RequestType; label: string; desc: string; emoji: string }[] = [
  { value: 'presupuesto', label: 'Quiero un presupuesto', desc: 'Te envío el costo estimado', emoji: '💰' },
  { value: 'visita', label: 'Necesito que vengan', desc: 'El profesional va a tu domicilio', emoji: '🏠' },
]

const TOTAL_STEPS = 7

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex gap-1 px-4 py-3">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className="h-1 flex-1 rounded-full transition-all duration-300"
          style={{ background: i < step ? '#E8683A' : '#E8E0D4' }}
        />
      ))}
    </div>
  )
}

function OptionButton({
  selected, onClick, children,
}: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-2xl p-4 flex items-center gap-3 active:opacity-80 transition-all"
      style={{
        background: selected ? '#FEF0EA' : '#FFFFFF',
        border: `1.5px solid ${selected ? '#E8683A' : '#E8E0D4'}`,
        boxShadow: selected ? '0 2px 8px rgba(232,104,58,.12)' : '0 1px 3px rgba(0,0,0,.04)',
      }}
    >
      {children}
    </button>
  )
}

const INPUT_STYLE = {
  background: '#FFFFFF',
  border: '1.5px solid #E8E0D4',
  color: '#111111',
  borderRadius: 14,
  padding: '14px 16px',
  fontSize: 16,
  width: '100%',
  outline: 'none',
  resize: 'none' as const,
  caretColor: '#E8683A',
}

export function RequestWizard({ onSubmit, loading }: Props) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<WizardData>({
    work_type: null,
    description: '',
    photos: [],
    location: 'Montevideo',
    urgency_level: null,
    request_type: null,
    contact_phone: '',
  })
  const [descError, setDescError] = useState('')
  const [phoneError, setPhoneError] = useState('')

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS))
  const back = () => setStep((s) => Math.max(s - 1, 1))

  const canNext = (): boolean => {
    if (step === 1) return data.work_type !== null
    if (step === 2) return data.description.length >= 20
    if (step === 5) return data.urgency_level !== null
    if (step === 6) return data.request_type !== null
    return true
  }

  const handleNext = () => {
    if (step === 2 && data.description.length < 20) {
      setDescError('Describí el trabajo (mín. 20 caracteres)')
      return
    }
    setDescError('')
    next()
  }

  const handleSubmit = async () => {
    if (data.contact_phone.length < 8) {
      setPhoneError('Ingresá tu teléfono de contacto')
      return
    }
    setPhoneError('')
    await onSubmit(data)
  }

  const stepTitle = [
    '¿Qué necesitás?',
    'Descripción del trabajo',
    'Fotos del trabajo',
    'Ubicación',
    'Nivel de urgencia',
    'Tipo de solicitud',
    'Confirmar solicitud',
  ][step - 1]

  return (
    <div className="flex flex-col gap-4">
      <ProgressBar step={step} />

      {/* Step title */}
      <div className="px-1">
        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#AAAAAA' }}>
          Paso {step} de {TOTAL_STEPS}
        </p>
        <h2 className="text-xl font-black" style={{ color: '#111111', letterSpacing: '-0.3px' }}>
          {stepTitle}
        </h2>
      </div>

      {/* Step 1: Tipo de trabajo */}
      {step === 1 && (
        <div className="flex flex-col gap-3">
          {WORK_TYPES.map((w) => (
            <OptionButton
              key={w.value}
              selected={data.work_type === w.value}
              onClick={() => setData((d) => ({ ...d, work_type: w.value }))}
            >
              <span className="text-2xl">{w.emoji}</span>
              <span className="text-base font-bold" style={{ color: '#111111' }}>{w.label}</span>
              {data.work_type === w.value && (
                <span className="ml-auto font-black text-lg" style={{ color: '#E8683A' }}>✓</span>
              )}
            </OptionButton>
          ))}
        </div>
      )}

      {/* Step 2: Descripción */}
      {step === 2 && (
        <div className="flex flex-col gap-2">
          <textarea
            value={data.description}
            onChange={(e) => { setData((d) => ({ ...d, description: e.target.value })); setDescError('') }}
            rows={5}
            placeholder="Ej: Se me rompió el caño bajo el lavatorio, hay agua en el piso..."
            style={{ ...INPUT_STYLE, paddingTop: 14, paddingBottom: 14 }}
            autoFocus
          />
          <div className="flex justify-between items-center">
            {descError ? (
              <p className="text-xs" style={{ color: '#ef4444' }}>{descError}</p>
            ) : (
              <span />
            )}
            <p className="text-xs" style={{ color: data.description.length >= 20 ? '#16A34A' : '#AAAAAA' }}>
              {data.description.length}/20 mín.
            </p>
          </div>
        </div>
      )}

      {/* Step 3: Fotos */}
      {step === 3 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm" style={{ color: '#777777' }}>
            Las fotos ayudan al profesional a entender mejor el trabajo. Es opcional.
          </p>
          <label
            className="flex flex-col items-center justify-center gap-2 rounded-2xl cursor-pointer active:opacity-80 transition-opacity"
            style={{
              height: 120,
              border: '2px dashed #E8E0D4',
              background: '#F5F0E8',
            }}
          >
            <Camera size={28} style={{ color: '#AAAAAA' }} />
            <span className="text-sm font-semibold" style={{ color: '#999999' }}>Agregar fotos</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? [])
                setData((d) => ({ ...d, photos: [...d.photos, ...files].slice(0, 5) }))
              }}
            />
          </label>
          {data.photos.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {data.photos.map((f, i) => (
                <div key={i} className="relative">
                  <img
                    src={URL.createObjectURL(f)}
                    className="w-20 h-20 object-cover rounded-xl"
                    alt={`foto ${i + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => setData((d) => ({ ...d, photos: d.photos.filter((_, j) => j !== i) }))}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-black"
                    style={{ background: '#EF4444' }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 4: Ubicación */}
      {step === 4 && (
        <div className="flex flex-col gap-3">
          <div
            className="flex items-center gap-3 rounded-2xl p-4"
            style={{ background: '#EFF6FF', border: '1.5px solid rgba(59,130,246,.2)' }}
          >
            <MapPin size={18} style={{ color: '#3B82F6', flexShrink: 0 }} />
            <p className="text-sm font-semibold" style={{ color: '#1D4ED8' }}>
              Ubicación detectada: Montevideo
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider" style={{ color: '#999999' }}>
              Dirección exacta (opcional)
            </label>
            <input
              type="text"
              value={data.location}
              onChange={(e) => setData((d) => ({ ...d, location: e.target.value }))}
              placeholder="Ej: Av. 18 de Julio 1234, apto 3"
              style={INPUT_STYLE}
            />
          </div>
        </div>
      )}

      {/* Step 5: Urgencia */}
      {step === 5 && (
        <div className="flex flex-col gap-3">
          {URGENCY_LEVELS.map((u) => (
            <OptionButton
              key={u.value}
              selected={data.urgency_level === u.value}
              onClick={() => setData((d) => ({ ...d, urgency_level: u.value }))}
            >
              <span className="text-xl">{u.emoji}</span>
              <span className="text-base font-bold" style={{ color: '#111111' }}>{u.label}</span>
              {data.urgency_level === u.value && (
                <span className="ml-auto font-black text-lg" style={{ color: '#E8683A' }}>✓</span>
              )}
            </OptionButton>
          ))}
        </div>
      )}

      {/* Step 6: Tipo de solicitud */}
      {step === 6 && (
        <div className="flex flex-col gap-3">
          {REQUEST_TYPES.map((r) => (
            <OptionButton
              key={r.value}
              selected={data.request_type === r.value}
              onClick={() => setData((d) => ({ ...d, request_type: r.value }))}
            >
              <span className="text-2xl">{r.emoji}</span>
              <div className="flex flex-col flex-1">
                <span className="text-base font-bold" style={{ color: '#111111' }}>{r.label}</span>
                <span className="text-xs mt-0.5" style={{ color: '#999999' }}>{r.desc}</span>
              </div>
              {data.request_type === r.value && (
                <span className="font-black text-lg" style={{ color: '#E8683A' }}>✓</span>
              )}
            </OptionButton>
          ))}
        </div>
      )}

      {/* Step 7: Confirmación */}
      {step === 7 && (
        <div className="flex flex-col gap-4">
          {/* Resumen */}
          <div className="rounded-2xl overflow-hidden" style={{ border: '1.5px solid #E8E0D4' }}>
            {[
              { label: 'Tipo', value: WORK_TYPES.find((w) => w.value === data.work_type)?.label ?? '' },
              { label: 'Descripción', value: data.description },
              { label: 'Ubicación', value: data.location },
              { label: 'Urgencia', value: URGENCY_LEVELS.find((u) => u.value === data.urgency_level)?.label ?? '' },
              { label: 'Solicitud', value: REQUEST_TYPES.find((r) => r.value === data.request_type)?.label ?? '' },
            ].map((item, i, arr) => (
              <div
                key={item.label}
                className="flex gap-3 px-4 py-3"
                style={{ borderBottom: i < arr.length - 1 ? '1px solid #E8E0D4' : undefined, background: '#FFFFFF' }}
              >
                <span className="text-xs font-bold uppercase tracking-wider flex-shrink-0 pt-0.5 w-20" style={{ color: '#AAAAAA' }}>
                  {item.label}
                </span>
                <span className="text-sm font-semibold flex-1" style={{ color: '#111111' }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {/* Teléfono */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider" style={{ color: '#999999' }}>
              Teléfono de contacto
            </label>
            <input
              type="tel"
              value={data.contact_phone}
              onChange={(e) => { setData((d) => ({ ...d, contact_phone: e.target.value })); setPhoneError('') }}
              placeholder="Ej: 099 123 456"
              style={INPUT_STYLE}
            />
            {phoneError && <p className="text-xs" style={{ color: '#ef4444' }}>{phoneError}</p>}
          </div>
        </div>
      )}

      {/* Nav buttons */}
      <div className="flex gap-3 pt-2">
        {step > 1 && (
          <button
            type="button"
            onClick={back}
            className="flex items-center justify-center gap-1 rounded-2xl py-3.5 px-5 text-sm font-bold active:opacity-70 transition-opacity"
            style={{ background: '#EDE8DE', color: '#555555', border: '1.5px solid #E8E0D4' }}
          >
            <ChevronLeft size={16} />
            Atrás
          </button>
        )}
        {step < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={!canNext()}
            className="flex-1 rounded-2xl py-3.5 text-base font-bold text-white active:opacity-80 disabled:opacity-40 transition-opacity"
            style={{ background: '#E8683A', boxShadow: '0 4px 14px rgba(232,104,58,.3)' }}
          >
            Continuar
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 rounded-2xl py-3.5 text-base font-bold text-white active:opacity-80 disabled:opacity-50 transition-opacity"
            style={{ background: '#E8683A', boxShadow: '0 4px 14px rgba(232,104,58,.3)' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Enviando...
              </span>
            ) : 'Enviar solicitud'}
          </button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/requests/RequestWizard.tsx
git commit -m "feat: add RequestWizard 7-step component"
```

---

## Task 6: Fase 2 — Conectar RequestWizard en RequestService page

**Files:**
- Modify: `src/pages/RequestService.tsx`

Reemplazar `<RequestForm>` por `<RequestWizard>`. Adaptar `handleSubmit` para mapear los campos nuevos del wizard al `addRequest` del store, manteniendo `urgency: boolean` como `urgency_level === 'ahora' || urgency_level === 'hoy'` para compatibilidad con el backend existente.

- [ ] **Step 1: Editar RequestService.tsx**

```tsx
// src/pages/RequestService.tsx
import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { useBack } from '../hooks/useBack'
import { PageShell } from '../components/layout/PageShell'
import { RequestWizard } from '../components/requests/RequestWizard'
import { useProfessionalById } from '../hooks/useProfessionals'
import { useRequestStore } from '../store/requestStore'
import type { WorkType, UrgencyLevel, RequestType } from '../store/requestStore'
import { getCategoryMeta } from '../lib/categories'
import { getInitials } from '../lib/utils'

interface WizardData {
  work_type: WorkType | null
  description: string
  photos: File[]
  location: string
  urgency_level: UrgencyLevel | null
  request_type: RequestType | null
  contact_phone: string
}

export default function RequestService() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const goBack = useBack('/profesional/' + (id ?? ''))
  const { professional } = useProfessionalById(id ?? '')
  const addRequest = useRequestStore((s) => s.addRequest)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [whatsappUrl, setWhatsappUrl] = useState('')

  const handleSubmit = async (data: WizardData) => {
    if (!professional) return
    setLoading(true)
    try {
      await addRequest({
        professional_id: professional.id,
        category: professional.categories[0] ?? '',
        description: data.description,
        urgency: data.urgency_level === 'ahora' || data.urgency_level === 'hoy',
        contact_phone: data.contact_phone,
        work_type: data.work_type ?? undefined,
        urgency_level: data.urgency_level ?? undefined,
        request_type: data.request_type ?? undefined,
        location: data.location,
      })
      const urgencyText = data.urgency_level === 'ahora' ? ' Es urgente.' : data.urgency_level === 'hoy' ? ' Lo necesito hoy.' : ''
      const typeText = data.request_type === 'presupuesto' ? ' Me gustaría un presupuesto.' : ' Necesito que vengas a verlo.'
      const message = encodeURIComponent(
        `Hola! Vi tu perfil en OficioYa y necesito ayuda.\n\n${data.description}${urgencyText}${typeText}\n\nMi teléfono: ${data.contact_phone}`
      )
      setWhatsappUrl(`https://wa.me/${professional.whatsapp}?text=${message}`)
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  const { emoji, label } = getCategoryMeta(professional?.categories[0] ?? '')

  const header = (
    <div className="px-4 pt-10 pb-4 sticky top-0 z-50" style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E0D4', boxShadow: '0 1px 0 #E8E0D4, 0 2px 8px rgba(0,0,0,.04)' }}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={goBack}
          aria-label="Volver"
          className="p-1 -ml-1 rounded-full flex-shrink-0 active:opacity-60 transition-opacity"
        >
          <ChevronLeft size={24} style={{ color: '#111111' }} />
        </button>
        <div>
          <h1 className="text-base font-black leading-tight" style={{ color: '#111111' }}>Solicitar servicio</h1>
          {professional && (
            <p className="text-xs mt-0.5" style={{ color: '#555555' }}>
              {emoji} {label} · {professional.profiles.full_name}
            </p>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <PageShell showBottomNav={false} header={header}>
      <div className="p-4 flex flex-col gap-4" style={{ minHeight: '100%' }}>

        {!sent ? (
          <>
            {/* Mini card del profesional */}
            {professional && (
              <div
                className="flex items-center gap-3 rounded-2xl p-3.5"
                style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}
              >
                {professional.profiles.avatar_url ? (
                  <img
                    src={professional.profiles.avatar_url}
                    alt={professional.profiles.full_name}
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#E8683A,#c44d1f)' }}
                  >
                    {getInitials(professional.profiles.full_name)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate" style={{ color: '#111111' }}>
                    {professional.profiles.full_name}
                  </div>
                  <div className="text-xs font-medium mt-0.5" style={{ color: '#e8683a' }}>
                    {emoji} {label} · {professional.zone}
                  </div>
                </div>
                {professional.avg_rating != null && (
                  <div className="text-sm font-black flex-shrink-0" style={{ color: '#111111' }}>
                    <span style={{ color: '#f59e0b' }}>★</span> {professional.avg_rating}
                  </div>
                )}
              </div>
            )}

            <RequestWizard onSubmit={handleSubmit} loading={loading} />
          </>
        ) : (
          <div className="flex flex-col items-center gap-5 py-10 text-center">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
              style={{ background: 'rgba(232,104,58,.12)', border: '1px solid rgba(232,104,58,.25)' }}
            >
              ✅
            </div>
            <div>
              <h2 className="text-xl font-black mb-2" style={{ color: '#111111' }}>¡Solicitud enviada!</h2>
              <p className="text-sm leading-relaxed" style={{ color: '#555555' }}>
                El profesional recibirá tu solicitud. También podés contactarlo directamente por WhatsApp.
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.open(whatsappUrl, '_blank')}
              className="w-full rounded-2xl py-4 text-base font-bold text-white active:opacity-80"
              style={{ background: '#25D366', boxShadow: '0 4px 14px rgba(37,211,102,.2)' }}
            >
              💬 Contactar por WhatsApp
            </button>
            <button
              type="button"
              onClick={() => navigate('/mis-solicitudes')}
              className="w-full rounded-2xl py-3.5 text-sm font-bold active:opacity-70 transition-opacity"
              style={{ background: '#EDE8DE', color: '#111111', border: '1.5px solid #E8E0D4' }}
            >
              Ver mis solicitudes
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-sm font-bold active:opacity-70"
              style={{ color: '#999999' }}
            >
              Volver al inicio
            </button>
          </div>
        )}

      </div>
    </PageShell>
  )
}
```

- [ ] **Step 2: Verificar build final**

```bash
npm run build
```
Expected: sin errores de TypeScript.

- [ ] **Step 3: Commit final**

```bash
git add src/pages/RequestService.tsx
git commit -m "feat: replace RequestForm with RequestWizard in RequestService page"
```

---

## Self-Review

**Spec coverage:**
- ✅ Fase 1: eliminar CategoryIcons, mantener chips, orden correcto → Task 1
- ✅ Fase 2: wizard 7 pasos (tipo, descripción, fotos, ubicación, urgencia, tipo solicitud, confirmación) → Tasks 4–6
- ✅ Fase 3: quitar Online/Top, mostrar calificación, trabajos, verificado, zona → Task 2
- ✅ Fase 4 (opción preferida): cabecera simple con foto grande, nombre, rubro, calificación, indicadores → Task 3

**Placeholder scan:** ninguno encontrado.

**Type consistency:** `WizardData` definido en `RequestWizard.tsx` y redeclarado como interface local compatible en `RequestService.tsx` — los campos coinciden. `WorkType`, `UrgencyLevel`, `RequestType` exportados desde `requestStore.ts` e importados en ambos archivos.
