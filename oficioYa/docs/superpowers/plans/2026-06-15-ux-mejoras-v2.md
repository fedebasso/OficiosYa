# UX Mejoras V2 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Simplificar el wizard de solicitud a 4 pasos, eliminar las píldoras de categoría del home, y rediseñar la card de profesionales (sin Verificado, favorito más prolijo, nueva tipografía/disposición).

**Architecture:** Tres cambios independientes en archivos separados: (1) reescritura de `RequestWizard.tsx` de 7 a 4 pasos con nuevo step de urgencia tipo toggle, (2) eliminar `CategoryChips` de `Home.tsx`, (3) rediseño de `ProfessionalCard.tsx`. `RequestService.tsx` se actualiza levemente para omitir campos eliminados del wizard.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v3, Zustand, React Router v7. Proyecto en `C:\Users\fede8\Documents\OficiosYa\oficioYa`.

---

## Files touched

| Acción | Archivo |
|--------|---------|
| Modify | `src/components/requests/RequestWizard.tsx` |
| Modify | `src/pages/RequestService.tsx` |
| Modify | `src/pages/Home.tsx` |
| Modify | `src/components/professionals/ProfessionalCard.tsx` |

---

## Task 1: Reescribir RequestWizard — 4 pasos

**Files:**
- Modify: `src/components/requests/RequestWizard.tsx`

El wizard actual tiene 7 pasos. Se reemplaza por uno de 4 pasos:
- Paso 1: Tipo de trabajo (con subtítulos descriptivos)
- Paso 2: Descripción libre (mín 20 chars)
- Paso 3: Toggle de urgencia 🚨
- Paso 4: Confirmación con teléfono + resumen

Se eliminan los pasos de fotos, ubicación y tipo de solicitud.

La `WizardData` exportada cambia: se eliminan `photos`, `location` y `request_type`. `urgency_level` pasa a ser `boolean` (el toggle es on/off, no múltiple opción).

- [ ] **Step 1: Reemplazar el contenido completo de RequestWizard.tsx**

```tsx
// src/components/requests/RequestWizard.tsx
import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import type { WorkType } from '../../store/requestStore'

export interface WizardData {
  work_type: WorkType | null
  description: string
  urgent: boolean
  contact_phone: string
}

interface Props {
  onSubmit: (data: WizardData) => Promise<void>
  loading?: boolean
}

const WORK_TYPES: { value: WorkType; label: string; subtitle: string; emoji: string }[] = [
  { value: 'reparacion',    label: 'Reparación',    subtitle: 'Arreglar algo que se rompió',  emoji: '🔧' },
  { value: 'instalacion',   label: 'Instalación',   subtitle: 'Instalar algo nuevo',           emoji: '⚙️' },
  { value: 'mantenimiento', label: 'Mantenimiento', subtitle: 'Revisión o mantenimiento',      emoji: '🛠️' },
  { value: 'otro',          label: 'Otro',          subtitle: 'Cualquier otro trabajo',        emoji: '📋' },
]

const TOTAL_STEPS = 4

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

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex gap-1.5 py-3">
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

export function RequestWizard({ onSubmit, loading }: Props) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<WizardData>({
    work_type: null,
    description: '',
    urgent: false,
    contact_phone: '',
  })
  const [descError, setDescError] = useState('')
  const [phoneError, setPhoneError] = useState('')

  const back = () => setStep((s) => Math.max(s - 1, 1))

  const handleNext = () => {
    if (step === 2 && data.description.length < 20) {
      setDescError('Describí el trabajo (mín. 20 caracteres)')
      return
    }
    setDescError('')
    setStep((s) => Math.min(s + 1, TOTAL_STEPS))
  }

  const canNext = (): boolean => {
    if (step === 1) return data.work_type !== null
    if (step === 2) return data.description.length >= 20
    return true
  }

  const handleSubmit = async () => {
    if (data.contact_phone.length < 8) {
      setPhoneError('Ingresá tu teléfono de contacto')
      return
    }
    setPhoneError('')
    await onSubmit(data)
  }

  const stepTitles = [
    '¿Qué tipo de trabajo?',
    'Contanos qué necesitás',
    '¿Es urgente?',
    'Confirmá tu solicitud',
  ]

  return (
    <div className="flex flex-col gap-4">
      <ProgressBar step={step} />

      <div className="px-1">
        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#AAAAAA' }}>
          Paso {step} de {TOTAL_STEPS}
        </p>
        <h2 className="text-xl font-black" style={{ color: '#111111', letterSpacing: '-0.3px' }}>
          {stepTitles[step - 1]}
        </h2>
      </div>

      {/* Paso 1: Tipo de trabajo */}
      {step === 1 && (
        <div className="flex flex-col gap-3">
          {WORK_TYPES.map((w) => {
            const selected = data.work_type === w.value
            return (
              <button
                key={w.value}
                type="button"
                onClick={() => setData((d) => ({ ...d, work_type: w.value }))}
                className="w-full text-left rounded-2xl p-4 flex items-center gap-3 active:opacity-80 transition-all"
                style={{
                  background: selected ? '#FEF0EA' : '#FFFFFF',
                  border: `1.5px solid ${selected ? '#E8683A' : '#E8E0D4'}`,
                  boxShadow: selected ? '0 2px 8px rgba(232,104,58,.12)' : '0 1px 3px rgba(0,0,0,.04)',
                }}
              >
                <span className="text-2xl flex-shrink-0">{w.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-bold" style={{ color: '#111111' }}>{w.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#999999' }}>{w.subtitle}</div>
                </div>
                {selected && (
                  <span className="font-black text-lg flex-shrink-0" style={{ color: '#E8683A' }}>✓</span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Paso 2: Descripción */}
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
            {descError
              ? <p className="text-xs" style={{ color: '#ef4444' }}>{descError}</p>
              : <span />
            }
            <p className="text-xs" style={{ color: data.description.length >= 20 ? '#16A34A' : '#AAAAAA' }}>
              {data.description.length}/20 mín.
            </p>
          </div>
        </div>
      )}

      {/* Paso 3: Urgencia — toggle */}
      {step === 3 && (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setData((d) => ({ ...d, urgent: !d.urgent }))}
            className="w-full text-left rounded-2xl p-4 flex items-center gap-3 active:opacity-80 transition-all"
            style={{
              background: data.urgent ? '#FFF5F5' : '#FFFFFF',
              border: `2px solid ${data.urgent ? '#EF4444' : '#E8E0D4'}`,
              boxShadow: data.urgent ? '0 2px 12px rgba(239,68,68,.1)' : '0 1px 3px rgba(0,0,0,.04)',
            }}
          >
            <span className="text-3xl flex-shrink-0">🚨</span>
            <div className="flex-1 min-w-0">
              <div className="text-base font-bold" style={{ color: data.urgent ? '#DC2626' : '#111111' }}>
                Es urgente
              </div>
              <div className="text-xs mt-0.5" style={{ color: data.urgent ? '#EF4444' : '#999999' }}>
                Necesito ayuda lo antes posible
              </div>
            </div>
            {/* Toggle switch */}
            <div
              className="flex-shrink-0 transition-all duration-200"
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                background: data.urgent ? '#EF4444' : '#E8E0D4',
                position: 'relative',
              }}
            >
              <div
                className="absolute top-1 transition-all duration-200"
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  left: data.urgent ? 24 : 4,
                  boxShadow: '0 1px 3px rgba(0,0,0,.2)',
                }}
              />
            </div>
          </button>
          <p className="text-xs text-center" style={{ color: '#BBBBBB' }}>
            Si no lo activás, se envía como pedido normal
          </p>
        </div>
      )}

      {/* Paso 4: Confirmación */}
      {step === 4 && (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl overflow-hidden" style={{ border: '1.5px solid #E8E0D4' }}>
            {[
              { label: 'Tipo',       value: WORK_TYPES.find((w) => w.value === data.work_type)?.label ?? '' },
              { label: 'Descripción', value: data.description },
              { label: 'Urgencia',   value: data.urgent ? '🚨 Urgente' : 'Pedido normal' },
            ].map((item, i, arr) => (
              <div
                key={item.label}
                className="flex gap-3 px-4 py-3"
                style={{
                  borderBottom: i < arr.length - 1 ? '1px solid #E8E0D4' : undefined,
                  background: '#FFFFFF',
                }}
              >
                <span
                  className="text-xs font-bold uppercase tracking-wider flex-shrink-0 pt-0.5"
                  style={{ color: '#AAAAAA', width: 80 }}
                >
                  {item.label}
                </span>
                <span className="text-sm font-semibold flex-1" style={{ color: '#111111' }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>

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

      {/* Botones de navegación */}
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
Expected: errores de TypeScript porque `RequestService.tsx` todavía usa la `WizardData` vieja. Se corrige en Task 2.

- [ ] **Step 3: Commit**

```bash
git add src/components/requests/RequestWizard.tsx
git commit -m "feat: simplify RequestWizard from 7 to 4 steps, new urgency toggle"
```

---

## Task 2: Adaptar RequestService al nuevo WizardData

**Files:**
- Modify: `src/pages/RequestService.tsx`

La `WizardData` de `RequestWizard` ahora tiene `urgent: boolean` en lugar de `urgency_level`, y ya no tiene `photos`, `location` ni `request_type`. Se actualiza el `handleSubmit` y se limpia el import.

- [ ] **Step 1: Editar RequestService.tsx**

Reemplazar el archivo completo:

```tsx
// src/pages/RequestService.tsx
import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { useBack } from '../hooks/useBack'
import { PageShell } from '../components/layout/PageShell'
import { RequestWizard, type WizardData } from '../components/requests/RequestWizard'
import { useProfessionalById } from '../hooks/useProfessionals'
import { useRequestStore } from '../store/requestStore'
import { getCategoryMeta } from '../lib/categories'
import { getInitials } from '../lib/utils'

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
        urgency: data.urgent,
        contact_phone: data.contact_phone,
        work_type: data.work_type || undefined,
      })
      const urgencyText = data.urgent ? ' Es urgente.' : ''
      const message = encodeURIComponent(
        `Hola! Vi tu perfil en OficioYa y necesito ayuda.\n\n${data.description}${urgencyText}\n\nMi teléfono: ${data.contact_phone}`
      )
      setWhatsappUrl(`https://wa.me/${professional.whatsapp}?text=${message}`)
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  const { emoji, label } = getCategoryMeta(professional?.categories[0] ?? '')

  const header = (
    <div
      className="px-4 pt-10 pb-4 sticky top-0 z-50"
      style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E0D4', boxShadow: '0 1px 0 #E8E0D4, 0 2px 8px rgba(0,0,0,.04)' }}
    >
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

- [ ] **Step 2: Verificar build**

```bash
npm run build
```
Expected: sin errores de TypeScript.

- [ ] **Step 3: Commit**

```bash
git add src/pages/RequestService.tsx
git commit -m "feat: update RequestService to use new 4-step WizardData"
```

---

## Task 3: Eliminar CategoryChips del Home

**Files:**
- Modify: `src/pages/Home.tsx`

Quitar la línea `<CategoryChips />` del header y su import. El header queda con dos filas: logo y barra de búsqueda.

- [ ] **Step 1: Editar Home.tsx**

Reemplazar el contenido completo:

```tsx
// src/pages/Home.tsx
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
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

- [ ] **Step 2: Verificar build**

```bash
npm run build
```
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Home.tsx
git commit -m "feat: remove CategoryChips from Home header"
```

---

## Task 4: Rediseñar ProfessionalCard

**Files:**
- Modify: `src/components/professionals/ProfessionalCard.tsx`

Tres cambios simultáneos:
1. Eliminar badge "✓ Verificado"
2. Botón favorito: cuadrado redondeado 32×32 con mejor feedback visual
3. Nueva disposición: profesión como chip naranja, zona y trabajos en fila con número destacado

- [ ] **Step 1: Reemplazar el contenido completo de ProfessionalCard.tsx**

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
  const { profiles, avg_rating, zone, jobs_count, categories, id } = professional
  const { label, emoji, avatarGradient, accent } = getCategoryMeta(categories[0] ?? '')
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
      <div className="flex items-center gap-3 flex-1 min-w-0" style={{ padding: 'var(--space-3)' }}>

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
        <div className="flex-1 min-w-0">
          <div className="font-bold truncate mb-1" style={{ color: '#111111', fontSize: 'var(--text-base)' }}>
            {profiles.full_name}
          </div>

          {/* Chip de profesión */}
          <div className="mb-1.5">
            <span
              className="inline-block font-bold"
              style={{
                background: 'rgba(232,104,58,.12)',
                color: '#E8683A',
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 6,
              }}
            >
              {emoji} {label}
            </span>
          </div>

          {/* Zona y trabajos */}
          <div className="flex items-center gap-2" style={{ fontSize: 'var(--text-sm)' }}>
            <span style={{ color: '#888888', fontWeight: 600 }}>📍 {zone}</span>
            <span style={{ color: '#DDDDDD' }}>|</span>
            <span>
              <span style={{ color: '#333333', fontWeight: 800 }}>{jobs_count}</span>
              <span style={{ color: '#888888', fontWeight: 500 }}> trabajos</span>
            </span>
          </div>
        </div>

        {/* Rating + favorito */}
        <div className="flex flex-col items-end justify-between flex-shrink-0 self-stretch py-0.5">
          {/* Favorito — cuadrado redondeado */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); toggle(id) }}
            aria-label={favorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
            className="flex items-center justify-center active:scale-90 transition-transform"
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: favorite ? '#FEF2F2' : '#F5F0E8',
              border: `1.5px solid ${favorite ? '#FECACA' : '#E8E0D4'}`,
              flexShrink: 0,
            }}
          >
            <Heart
              size={14}
              style={{ color: favorite ? '#EF4444' : '#CCCCCC' }}
              fill={favorite ? '#EF4444' : 'none'}
            />
          </button>

          {/* Rating */}
          {avg_rating != null && (
            <div className="flex items-center gap-1">
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
git commit -m "feat: redesign ProfessionalCard — chip profesión, favorito cuadrado, sin Verificado"
```

---

## Self-Review

**Spec coverage:**
- ✅ Wizard de 4 pasos (tipo, descripción, urgencia toggle, confirmación) → Task 1
- ✅ Toggle urgencia con 🚨, sin múltiples opciones de tiempo → Task 1 paso 3
- ✅ CategoryChips eliminado del Home → Task 3
- ✅ "Verificado" eliminado de la card → Task 4
- ✅ Botón favorito cuadrado 32×32 con feedback rojo → Task 4
- ✅ Chip de profesión naranja, zona y trabajos con número destacado → Task 4

**Placeholder scan:** ninguno.

**Type consistency:**
- `WizardData` se exporta desde `RequestWizard.tsx` e importa en `RequestService.tsx` con `type WizardData`
- `urgent: boolean` en `WizardData` mapea a `urgency: data.urgent` en `addRequest()` — correcto
- `work_type: data.work_type || undefined` — correcto, el campo es `WorkType | undefined` en el store
- `verified` ya no se desestructura en `ProfessionalCard` — no se usa, no rompe nada
