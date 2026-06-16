# IA Ticket Flow — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar el flujo de creación de tickets IA de 5 pasos: categoría → media → procesamiento IA (mock) → resultados → confirmación, con entry point desde el Home y desde perfiles profesionales.

**Architecture:** El flujo vive en `TicketFlow.tsx` (pasos 1-4 con estado local) y `TicketConfirm.tsx` (paso 5). La lógica IA está aislada en `services/ai/ticketService.ts` (mock en MVP, reemplazable con OpenAI sin tocar UI). Los datos del ticket viajan entre páginas vía React Router `navigate` state.

**Tech Stack:** React 19, TypeScript, React Router v7, Tailwind CSS v3, Zustand. Proyecto en `C:\Users\fede8\Documents\OficiosYa\oficioYa`.

---

## Files touched

| Acción | Archivo |
|--------|---------|
| Create | `src/types/ticket.ts` |
| Create | `src/services/ai/ticketService.ts` |
| Create | `src/components/ticket/TicketEntryCard.tsx` |
| Create | `src/pages/TicketFlow.tsx` |
| Create | `src/pages/TicketConfirm.tsx` |
| Modify | `src/App.tsx` |
| Modify | `src/pages/Home.tsx` |
| Modify | `src/components/professionals/ProfessionalProfile.tsx` |

---

## Task 1: Tipos e interfaz del ticket

**Files:**
- Create: `src/types/ticket.ts`

- [ ] **Step 1: Crear src/types/ticket.ts**

```ts
// src/types/ticket.ts
import type { WorkType } from '../store/requestStore'

export interface TicketInput {
  category: string
  photo: File | null
  audioBlob: Blob | null
  text: string
}

export interface GeneratedTicket {
  title: string
  description: string
  category: string
  urgent: boolean
  work_type: WorkType
}
```

- [ ] **Step 2: Verificar que TypeScript compila**

```bash
npm run build
```
Expected: sin errores (archivo solo define tipos, sin imports con errores).

- [ ] **Step 3: Commit**

```bash
git add src/types/ticket.ts
git commit -m "feat: add IA ticket types (TicketInput, GeneratedTicket)"
```

---

## Task 2: Servicio IA mock

**Files:**
- Create: `src/services/ai/ticketService.ts`

Mock que espera 2.5 segundos y devuelve un `GeneratedTicket` diferente según la categoría. Interfaz lista para conectar OpenAI Vision + Whisper.

- [ ] **Step 1: Crear src/services/ai/ticketService.ts**

```ts
// src/services/ai/ticketService.ts
import type { TicketInput, GeneratedTicket } from '../../types/ticket'
import type { WorkType } from '../../store/requestStore'

const MOCK_TICKETS: Record<string, Omit<GeneratedTicket, 'category'>> = {
  electricista: {
    title: 'Falla eléctrica en tomacorriente',
    description: 'Se detectó una posible falla en el circuito eléctrico. El tomacorriente no entrega corriente y puede haber un cortocircuito en el cableado interno. Requiere revisión urgente para evitar riesgo de incendio.',
    urgent: true,
    work_type: 'reparacion' as WorkType,
  },
  plomero: {
    title: 'Pérdida de agua en cañería',
    description: 'Filtración de agua detectada bajo el lavatorio. La pérdida puede deberse a una unión deficiente o a una fisura en el caño. Conviene cortar el paso de agua hasta la reparación.',
    urgent: true,
    work_type: 'reparacion' as WorkType,
  },
  aire_acondicionado: {
    title: 'Aire acondicionado sin frío',
    description: 'El equipo enciende pero no enfría el ambiente. Posible falta de gas refrigerante o filtros obstruidos. Se recomienda limpieza y revisión del sistema de refrigeración.',
    urgent: false,
    work_type: 'mantenimiento' as WorkType,
  },
  cerrajero: {
    title: 'Cerradura bloqueada o rota',
    description: 'La cerradura no responde correctamente a la llave. Puede necesitar lubricación, ajuste del cilindro o reemplazo completo del mecanismo.',
    urgent: false,
    work_type: 'reparacion' as WorkType,
  },
  pintor: {
    title: 'Repintura de superficie interior',
    description: 'La pared presenta humedad, descascarado o manchas que requieren preparación de la superficie y aplicación de nueva pintura. Se necesita sellado previo para resultados duraderos.',
    urgent: false,
    work_type: 'otro' as WorkType,
  },
  albanil: {
    title: 'Reparación de mampostería',
    description: 'Se observan fisuras o desprendimientos en la pared que requieren relleno, fraguado y terminación. Es importante reparar pronto para evitar mayor deterioro estructural.',
    urgent: false,
    work_type: 'reparacion' as WorkType,
  },
}

const FALLBACK_TICKET: Omit<GeneratedTicket, 'category'> = {
  title: 'Trabajo de mantenimiento del hogar',
  description: 'Se requiere la intervención de un profesional para evaluar y resolver el problema detectado en el domicilio.',
  urgent: false,
  work_type: 'otro' as WorkType,
}

export async function analyzeTicket(input: TicketInput): Promise<GeneratedTicket> {
  // Mock: simula latencia de API IA
  await new Promise((resolve) => setTimeout(resolve, 2500))
  const mock = MOCK_TICKETS[input.category] ?? FALLBACK_TICKET
  return { ...mock, category: input.category }
}
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/services/ai/ticketService.ts
git commit -m "feat: add mock AI ticket service (analyzeTicket)"
```

---

## Task 3: TicketEntryCard — card del Home

**Files:**
- Create: `src/components/ticket/TicketEntryCard.tsx`

Card blanca con borde naranja que navega a `/ticket`.

- [ ] **Step 1: Crear src/components/ticket/TicketEntryCard.tsx**

```tsx
// src/components/ticket/TicketEntryCard.tsx
import { useNavigate } from 'react-router-dom'

export function TicketEntryCard() {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate('/ticket')}
      className="w-full text-left flex items-center gap-3 active:opacity-80 transition-opacity rounded-2xl p-4"
      style={{
        background: '#FFFFFF',
        border: '2px solid #E8683A',
        boxShadow: '0 2px 12px rgba(232,104,58,.12)',
      }}
    >
      {/* Ícono */}
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: 'linear-gradient(135deg,#E8683A,#c44d1f)',
          fontSize: 22,
        }}
      >
        ✨
      </div>

      {/* Texto */}
      <div className="flex-1 min-w-0">
        <p className="font-black text-sm leading-tight" style={{ color: '#111111' }}>
          Describí tu problema
        </p>
        <p className="text-xs mt-0.5" style={{ color: '#888888' }}>
          La IA encuentra al profesional ideal
        </p>
      </div>

      {/* Flecha */}
      <span className="text-lg flex-shrink-0" style={{ color: '#E8683A' }}>›</span>
    </button>
  )
}
```

- [ ] **Step 2: Build**

```bash
npm run build
```
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/ticket/TicketEntryCard.tsx
git commit -m "feat: add TicketEntryCard component for Home"
```

---

## Task 4: TicketFlow — página principal (pasos 1 a 4)

**Files:**
- Create: `src/pages/TicketFlow.tsx`

Página que orquesta los 4 primeros pasos. El estado vive aquí. Los pasos son secciones internas (no componentes separados porque no son reutilizables).

- [ ] **Step 1: Crear src/pages/TicketFlow.tsx**

```tsx
// src/pages/TicketFlow.tsx
import { useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { PageShell } from '../components/layout/PageShell'
import { analyzeTicket } from '../services/ai/ticketService'
import { useProfessionals } from '../hooks/useProfessionals'
import { getCategoryMeta, CATEGORY_LABELS, CATEGORY_EMOJI } from '../lib/categories'
import type { TicketInput, GeneratedTicket } from '../types/ticket'
import type { ProfessionalWithProfile } from '../hooks/useProfessionals'

/* ── Datos de categorías para el paso 1 ── */
const CATEGORIES = [
  { id: 'electricista',       emoji: '⚡', label: 'Electricidad',  desc: 'Tomacorrientes, luces, tableros' },
  { id: 'plomero',            emoji: '🚿', label: 'Sanitario',     desc: 'Caños, llaves, pérdidas' },
  { id: 'aire_acondicionado', emoji: '❄️', label: 'Aire Ac.',      desc: 'Instalación y limpieza' },
  { id: 'cerrajero',          emoji: '🔑', label: 'Cerrajería',    desc: 'Cerraduras, llaves, portones' },
  { id: 'pintor',             emoji: '🎨', label: 'Pintura',       desc: 'Interior y exterior' },
  { id: 'albanil',            emoji: '🧱', label: 'Albañilería',   desc: 'Reparaciones, muros, pisos' },
]

/* ── Paso 1: Categoría ── */
function CategoryStep({
  selected,
  onSelect,
  onNext,
}: {
  selected: string | null
  onSelect: (id: string) => void
  onNext: () => void
}) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#E8683A' }}>
          ✨ Nuevo ticket
        </p>
        <h2 className="text-xl font-black leading-tight" style={{ color: '#111111', letterSpacing: '-0.3px' }}>
          ¿Qué tipo de trabajo necesitás?
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 flex-1">
        {CATEGORIES.map((cat) => {
          const active = selected === cat.id
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelect(cat.id)}
              className="flex items-center gap-3 rounded-2xl p-4 text-left active:scale-[.98] transition-transform"
              style={{
                background: active ? '#E8683A' : '#F5F0E8',
                border: `1.5px solid ${active ? '#E8683A' : '#EDE8DE'}`,
                boxShadow: active ? '0 4px 14px rgba(232,104,58,.25)' : '0 1px 3px rgba(0,0,0,.04)',
              }}
            >
              <span className="text-2xl flex-shrink-0">{cat.emoji}</span>
              <div className="min-w-0">
                <div className="text-sm font-bold truncate" style={{ color: active ? '#fff' : '#111' }}>
                  {cat.label}
                </div>
                <div className="text-[10px] mt-0.5 truncate" style={{ color: active ? 'rgba(255,255,255,.75)' : '#999' }}>
                  {cat.desc}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!selected}
        className="w-full rounded-2xl py-4 text-base font-bold text-white active:opacity-80 disabled:opacity-40 transition-opacity"
        style={{ background: '#E8683A', boxShadow: '0 4px 14px rgba(232,104,58,.3)' }}
      >
        Continuar →
      </button>
    </div>
  )
}

/* ── Paso 2: Media ── */
function MediaStep({
  input,
  onChange,
  onAnalyze,
}: {
  input: TicketInput
  onChange: (patch: Partial<TicketInput>) => void
  onAnalyze: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [recording, setRecording] = useState(false)
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const [showText, setShowText] = useState(false)

  const hasContent = input.photo !== null || input.audioBlob !== null || input.text.length >= 10

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      chunksRef.current = []
      mr.ondataavailable = (e) => chunksRef.current.push(e.data)
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        onChange({ audioBlob: blob })
        stream.getTracks().forEach((t) => t.stop())
      }
      mr.start()
      mediaRef.current = mr
      setRecording(true)
    } catch {
      alert('No se pudo acceder al micrófono')
    }
  }

  const stopRecording = () => {
    mediaRef.current?.stop()
    setRecording(false)
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h2 className="text-xl font-black leading-tight" style={{ color: '#111111', letterSpacing: '-0.3px' }}>
          Mostranos el problema
        </h2>
        <p className="text-sm mt-1" style={{ color: '#AAAAAA' }}>
          Lo que sea más fácil para vos
        </p>
      </div>

      {/* Hero: foto */}
      {input.photo ? (
        <div className="relative rounded-2xl overflow-hidden" style={{ height: 180 }}>
          <img
            src={URL.createObjectURL(input.photo)}
            alt="foto del problema"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => onChange({ photo: null })}
            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-white font-black"
            style={{ background: '#EF4444', fontSize: 14 }}
          >
            ×
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 rounded-2xl active:opacity-80 transition-opacity"
          style={{
            height: 160,
            border: '2px dashed #E8683A',
            background: '#FEF0EA',
          }}
        >
          <span style={{ fontSize: 36 }}>📷</span>
          <span className="text-sm font-bold" style={{ color: '#E8683A' }}>Sacar o subir foto</span>
          <span className="text-xs" style={{ color: '#BBBBBB' }}>Tocá para abrir la cámara</span>
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => onChange({ photo: e.target.files?.[0] ?? null })}
      />

      {/* Alternativas: audio, video, texto */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          className="flex flex-col items-center gap-1.5 rounded-xl py-3 active:opacity-80 transition-opacity"
          style={{
            background: recording ? 'rgba(239,68,68,.1)' : '#F5F0E8',
            border: `1.5px solid ${recording ? '#EF4444' : '#EDE8DE'}`,
          }}
        >
          <span style={{ fontSize: 20 }}>{recording ? '⏹️' : '🎤'}</span>
          <span className="text-[10px] font-bold" style={{ color: recording ? '#EF4444' : '#666' }}>
            {recording ? 'Detener' : 'Audio'}
          </span>
        </button>
        <button
          type="button"
          onClick={() => { const i = document.createElement('input'); i.type='file'; i.accept='video/*'; i.click() }}
          className="flex flex-col items-center gap-1.5 rounded-xl py-3 active:opacity-80 transition-opacity"
          style={{ background: '#F5F0E8', border: '1.5px solid #EDE8DE' }}
        >
          <span style={{ fontSize: 20 }}>🎥</span>
          <span className="text-[10px] font-bold" style={{ color: '#666' }}>Video</span>
        </button>
        <button
          type="button"
          onClick={() => setShowText((v) => !v)}
          className="flex flex-col items-center gap-1.5 rounded-xl py-3 active:opacity-80 transition-opacity"
          style={{
            background: showText ? 'rgba(232,104,58,.1)' : '#F5F0E8',
            border: `1.5px solid ${showText ? '#E8683A' : '#EDE8DE'}`,
          }}
        >
          <span style={{ fontSize: 20 }}>✏️</span>
          <span className="text-[10px] font-bold" style={{ color: showText ? '#E8683A' : '#666' }}>Texto</span>
        </button>
      </div>

      {input.audioBlob && (
        <div className="flex items-center gap-2 rounded-xl p-3" style={{ background: '#F5F0E8', border: '1.5px solid #EDE8DE' }}>
          <span>🎤</span>
          <span className="text-sm font-semibold flex-1" style={{ color: '#555' }}>Audio grabado</span>
          <button type="button" onClick={() => onChange({ audioBlob: null })} style={{ color: '#EF4444', fontWeight: 700, fontSize: 12 }}>Quitar</button>
        </div>
      )}

      {showText && (
        <textarea
          value={input.text}
          onChange={(e) => onChange({ text: e.target.value })}
          rows={3}
          placeholder="Describí el problema con tus palabras..."
          className="rounded-xl p-3 text-sm resize-none"
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #E8E0D4',
            color: '#111',
            outline: 'none',
            caretColor: '#E8683A',
          }}
        />
      )}

      <button
        type="button"
        onClick={onAnalyze}
        disabled={!hasContent}
        className="w-full rounded-2xl py-4 text-base font-bold text-white active:opacity-80 disabled:opacity-40 transition-opacity"
        style={{ background: '#E8683A', boxShadow: '0 4px 14px rgba(232,104,58,.3)' }}
      >
        Analizar con IA ✨
      </button>
    </div>
  )
}

/* ── Paso 3: IA procesando ── */
function AIProcessingStep({ progress }: { progress: number }) {
  const steps = [
    'Imagen analizada',
    'Identificando el problema...',
    'Generando ticket',
    'Buscando profesionales',
  ]

  return (
    <div className="flex flex-col items-center justify-center flex-1 p-8 text-center gap-6">
      {/* Orb */}
      <div
        className="flex items-center justify-center"
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'linear-gradient(135deg,#E8683A,#c44d1f)',
          fontSize: 36,
          boxShadow: '0 0 0 16px rgba(232,104,58,.08), 0 0 0 32px rgba(232,104,58,.04)',
        }}
      >
        ✨
      </div>

      <div>
        <h2 className="text-xl font-black" style={{ color: '#111111', letterSpacing: '-0.3px' }}>
          Analizando tu problema
        </h2>
        <p className="text-sm mt-1" style={{ color: '#AAAAAA' }}>Tardará solo unos segundos</p>
      </div>

      {/* Progress steps */}
      <div className="w-full max-w-xs flex flex-col gap-3 text-left">
        {steps.map((label, i) => {
          const done = i < progress
          const active = i === progress
          return (
            <div key={label} className="flex items-center gap-3">
              <div
                className="flex items-center justify-center flex-shrink-0 font-black text-white"
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  fontSize: 10,
                  background: done ? '#E8683A' : 'transparent',
                  border: done ? 'none' : active ? '2px solid #E8683A' : '1.5px solid #EDE8DE',
                }}
              >
                {done ? '✓' : ''}
              </div>
              <span
                className="text-sm"
                style={{
                  color: done ? '#555' : active ? '#E8683A' : '#CCC',
                  fontWeight: done || active ? 700 : 400,
                }}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Paso 4: Resultados ── */
function ResultsStep({
  ticket,
  category,
  preselectedProId,
  onPedir,
}: {
  ticket: GeneratedTicket
  category: string
  preselectedProId: string | null
  onPedir: (pro: ProfessionalWithProfile) => void
}) {
  const { professionals } = useProfessionals(category)

  const sorted = [...professionals].sort((a, b) => {
    if (a.id === preselectedProId) return -1
    if (b.id === preselectedProId) return 1
    if (a.available_now !== b.available_now) return a.available_now ? -1 : 1
    return (b.avg_rating ?? 0) - (a.avg_rating ?? 0)
  })

  return (
    <div className="flex flex-col" style={{ minHeight: '100%' }}>
      {/* Ticket generado */}
      <div className="p-4 pb-3" style={{ borderBottom: '1px solid #F0EBE1' }}>
        <div
          className="inline-flex items-center gap-1.5 rounded-full mb-3"
          style={{
            background: 'rgba(232,104,58,.1)',
            border: '1px solid rgba(232,104,58,.25)',
            padding: '3px 10px',
            fontSize: 10,
            fontWeight: 800,
            color: '#E8683A',
          }}
        >
          ✨ Generado por IA
        </div>
        <h2 className="text-xl font-black leading-tight mb-2" style={{ color: '#111111', letterSpacing: '-0.3px' }}>
          {ticket.title}
        </h2>
        <p className="text-sm leading-relaxed mb-3" style={{ color: '#666666' }}>
          {ticket.description}
        </p>
        <div className="flex gap-2 flex-wrap">
          {ticket.urgent && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(239,68,68,.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,.2)' }}>
              🚨 Urgente
            </span>
          )}
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: '#F5F0E8', color: '#666' }}>
            {CATEGORY_EMOJI[category]} {CATEGORY_LABELS[category] ?? category}
          </span>
        </div>
      </div>

      {/* Profesionales recomendados */}
      <div className="flex-1 p-4 flex flex-col gap-3" style={{ background: '#F9F6F2' }}>
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#AAAAAA' }}>
          Profesionales recomendados
        </p>
        {sorted.slice(0, 5).map((pro, i) => {
          const best = i === 0
          const { emoji, label } = getCategoryMeta(pro.categories[0] ?? '')
          return (
            <div
              key={pro.id}
              className="rounded-2xl overflow-hidden"
              style={{
                background: '#FFFFFF',
                border: `1.5px solid ${best ? '#E8683A' : '#EDE8DE'}`,
                boxShadow: best ? '0 2px 10px rgba(232,104,58,.12)' : '0 1px 3px rgba(0,0,0,.04)',
              }}
            >
              <div className="flex items-center gap-3 p-3">
                {pro.profiles.avatar_url ? (
                  <img src={pro.profiles.avatar_url} alt={pro.profiles.full_name}
                    className="rounded-xl object-cover flex-shrink-0" style={{ width: 40, height: 40 }} />
                ) : (
                  <div className="rounded-xl flex items-center justify-center flex-shrink-0 font-black text-white"
                    style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#E8683A,#c44d1f)', fontSize: 16 }}>
                    {pro.profiles.full_name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate" style={{ color: '#111' }}>{pro.profiles.full_name}</div>
                  <div className="text-[10px]" style={{ color: '#AAAAAA' }}>
                    {pro.avg_rating != null && <><span style={{ color: '#f59e0b' }}>★</span> {pro.avg_rating} · </>}
                    {pro.jobs_count} trabajos
                    {pro.response_time_min > 0 && ` · ~${pro.response_time_min}min`}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onPedir(pro)}
                  className="rounded-xl px-3 py-2 text-xs font-bold flex-shrink-0 active:opacity-80 transition-opacity"
                  style={best
                    ? { background: '#E8683A', color: '#fff' }
                    : { background: '#fff', color: '#E8683A', border: '1.5px solid rgba(232,104,58,.4)' }
                  }
                >
                  Pedir
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Orquestador principal ── */
export default function TicketFlow() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedProId = searchParams.get('pro')

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [category, setCategory] = useState<string | null>(null)
  const [input, setInput] = useState<TicketInput>({ category: '', photo: null, audioBlob: null, text: '' })
  const [aiProgress, setAiProgress] = useState(0)
  const [ticket, setTicket] = useState<GeneratedTicket | null>(null)

  const handleAnalyze = async () => {
    if (!category) return
    const ticketInput: TicketInput = { ...input, category }
    setStep(3)
    setAiProgress(0)

    // Simular progreso de 4 pasos
    const intervals = [400, 900, 1600, 2500]
    intervals.forEach((delay, i) => {
      setTimeout(() => setAiProgress(i + 1), delay)
    })

    const result = await analyzeTicket(ticketInput)
    setTicket(result)
    setTimeout(() => setStep(4), 2600)
  }

  const handlePedir = (pro: ProfessionalWithProfile) => {
    navigate('/ticket/confirmar', {
      state: { ticket, proId: pro.id, proName: pro.profiles.full_name, proAvatar: pro.profiles.avatar_url, proRating: pro.avg_rating, proWhatsapp: pro.whatsapp },
    })
  }

  const header = (
    <div
      className="px-4 pt-10 pb-3 sticky top-0 z-50 flex items-center gap-3"
      style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E0D4', boxShadow: '0 1px 0 #E8E0D4, 0 2px 8px rgba(0,0,0,.04)' }}
    >
      {step > 1 && step < 3 && (
        <button type="button" onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3 | 4)}
          className="p-1 -ml-1 rounded-full active:opacity-60 transition-opacity flex-shrink-0">
          <ChevronLeft size={24} style={{ color: '#111111' }} />
        </button>
      )}
      {step === 4 && (
        <button type="button" onClick={() => setStep(2)}
          className="p-1 -ml-1 rounded-full active:opacity-60 transition-opacity flex-shrink-0">
          <ChevronLeft size={24} style={{ color: '#111111' }} />
        </button>
      )}
      <div>
        <h1 className="text-base font-black leading-tight" style={{ color: '#111111' }}>
          {step === 1 && 'Nuevo ticket'}
          {step === 2 && 'Describí el problema'}
          {step === 3 && 'Analizando...'}
          {step === 4 && 'Profesionales para vos'}
        </h1>
        <p className="text-xs mt-0.5" style={{ color: '#AAAAAA' }}>Paso {step} de 4</p>
      </div>
    </div>
  )

  return (
    <PageShell showBottomNav={false} header={header}>
      <div className="flex flex-col" style={{ minHeight: '100%' }}>
        {step === 1 && (
          <CategoryStep
            selected={category}
            onSelect={(id) => setCategory(id)}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <MediaStep
            input={input}
            onChange={(patch) => setInput((prev) => ({ ...prev, ...patch }))}
            onAnalyze={handleAnalyze}
          />
        )}
        {step === 3 && <AIProcessingStep progress={aiProgress} />}
        {step === 4 && ticket && (
          <ResultsStep
            ticket={ticket}
            category={category ?? ''}
            preselectedProId={preselectedProId}
            onPedir={handlePedir}
          />
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
Expected: puede haber error de rutas faltantes hasta Task 6. Verificar que TicketFlow.tsx compila sin errores de TypeScript propios.

- [ ] **Step 3: Commit**

```bash
git add src/pages/TicketFlow.tsx
git commit -m "feat: add TicketFlow page with 4-step IA ticket creation"
```

---

## Task 5: TicketConfirm — paso 5 (confirmación)

**Files:**
- Create: `src/pages/TicketConfirm.tsx`

Recibe ticket + datos del profesional via `location.state`. Muestra resumen + input de teléfono + submit.

- [ ] **Step 1: Crear src/pages/TicketConfirm.tsx**

```tsx
// src/pages/TicketConfirm.tsx
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { PageShell } from '../components/layout/PageShell'
import { useRequestStore } from '../store/requestStore'
import type { GeneratedTicket } from '../types/ticket'

interface LocationState {
  ticket: GeneratedTicket
  proId: string
  proName: string
  proAvatar: string | null
  proRating: number | null
  proWhatsapp: string
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
  caretColor: '#E8683A',
}

export default function TicketConfirm() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null
  const addRequest = useRequestStore((s) => s.addRequest)

  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [whatsappUrl, setWhatsappUrl] = useState('')

  if (!state) {
    navigate('/ticket')
    return null
  }

  const { ticket, proId, proName, proAvatar, proRating, proWhatsapp } = state

  const handleSubmit = async () => {
    if (phone.length < 8) {
      setPhoneError('Ingresá tu teléfono de contacto')
      return
    }
    setPhoneError('')
    setLoading(true)
    try {
      await addRequest({
        professional_id: proId,
        category: ticket.category,
        description: ticket.description,
        urgency: ticket.urgent,
        contact_phone: phone,
        work_type: ticket.work_type,
      })
      const urgencyText = ticket.urgent ? ' Es urgente.' : ''
      const message = encodeURIComponent(
        `Hola! Vi tu perfil en OficioYa.\n\n${ticket.title}: ${ticket.description}${urgencyText}\n\nMi teléfono: ${phone}`
      )
      setWhatsappUrl(`https://wa.me/${proWhatsapp}?text=${message}`)
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  const header = (
    <div
      className="px-4 pt-10 pb-4 sticky top-0 z-50 flex items-center gap-3"
      style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E0D4', boxShadow: '0 1px 0 #E8E0D4, 0 2px 8px rgba(0,0,0,.04)' }}
    >
      {!sent && (
        <button type="button" onClick={() => navigate(-1)}
          className="p-1 -ml-1 rounded-full active:opacity-60 transition-opacity flex-shrink-0">
          <ChevronLeft size={24} style={{ color: '#111111' }} />
        </button>
      )}
      <h1 className="text-base font-black" style={{ color: '#111111' }}>Confirmar solicitud</h1>
    </div>
  )

  return (
    <PageShell showBottomNav={false} header={header}>
      <div className="p-4 flex flex-col gap-4" style={{ minHeight: '100%' }}>
        {!sent ? (
          <>
            {/* Mini card del profesional */}
            <div className="flex items-center gap-3 rounded-2xl p-3.5"
              style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}>
              {proAvatar ? (
                <img src={proAvatar} alt={proName}
                  className="rounded-xl object-cover flex-shrink-0" style={{ width: 44, height: 44 }} />
              ) : (
                <div className="rounded-xl flex items-center justify-center flex-shrink-0 font-black text-white"
                  style={{ width: 44, height: 44, background: 'linear-gradient(135deg,#E8683A,#c44d1f)', fontSize: 18 }}>
                  {proName.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate" style={{ color: '#111' }}>{proName}</div>
                {proRating != null && (
                  <div className="text-xs" style={{ color: '#AAAAAA' }}>
                    <span style={{ color: '#f59e0b' }}>★</span> {proRating}
                  </div>
                )}
              </div>
            </div>

            {/* Resumen del ticket */}
            <div className="rounded-2xl overflow-hidden" style={{ border: '1.5px solid #E8E0D4' }}>
              <div className="flex items-center gap-2 px-4 py-2.5"
                style={{ background: 'rgba(232,104,58,.06)', borderBottom: '1px solid rgba(232,104,58,.12)' }}>
                <span style={{ fontSize: 12 }}>✨</span>
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#E8683A' }}>
                  Ticket generado por IA
                </span>
              </div>
              <div className="p-4">
                <p className="text-sm font-bold mb-1" style={{ color: '#111' }}>{ticket.title}</p>
                <p className="text-xs leading-relaxed" style={{ color: '#777' }}>{ticket.description}</p>
                {ticket.urgent && (
                  <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(239,68,68,.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,.2)' }}>
                    🚨 Urgente
                  </span>
                )}
              </div>
            </div>

            {/* Teléfono */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: '#999999' }}>
                Tu teléfono de contacto
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setPhoneError('') }}
                placeholder="Ej: 099 123 456"
                style={INPUT_STYLE}
              />
              {phoneError && <p className="text-xs" style={{ color: '#ef4444' }}>{phoneError}</p>}
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full rounded-2xl py-4 text-base font-bold text-white active:opacity-80 disabled:opacity-50 transition-opacity"
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
          </>
        ) : (
          <div className="flex flex-col items-center gap-5 py-10 text-center">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
              style={{ background: 'rgba(232,104,58,.12)', border: '1px solid rgba(232,104,58,.25)' }}>
              ✅
            </div>
            <div>
              <h2 className="text-xl font-black mb-2" style={{ color: '#111111' }}>¡Solicitud enviada!</h2>
              <p className="text-sm leading-relaxed" style={{ color: '#555555' }}>
                El profesional recibirá tu solicitud. También podés contactarlo directamente por WhatsApp.
              </p>
            </div>
            <button type="button" onClick={() => window.open(whatsappUrl, '_blank')}
              className="w-full rounded-2xl py-4 text-base font-bold text-white active:opacity-80"
              style={{ background: '#25D366', boxShadow: '0 4px 14px rgba(37,211,102,.2)' }}>
              💬 Contactar por WhatsApp
            </button>
            <button type="button" onClick={() => navigate('/mis-solicitudes')}
              className="w-full rounded-2xl py-3.5 text-sm font-bold active:opacity-70 transition-opacity"
              style={{ background: '#EDE8DE', color: '#111111', border: '1.5px solid #E8E0D4' }}>
              Ver mis solicitudes
            </button>
            <button type="button" onClick={() => navigate('/')}
              className="text-sm font-bold active:opacity-70" style={{ color: '#999999' }}>
              Volver al inicio
            </button>
          </div>
        )}
      </div>
    </PageShell>
  )
}
```

- [ ] **Step 2: Build**

```bash
npm run build
```
Expected: sin errores de TypeScript.

- [ ] **Step 3: Commit**

```bash
git add src/pages/TicketConfirm.tsx
git commit -m "feat: add TicketConfirm page (step 5 — phone + submit)"
```

---

## Task 6: Registrar rutas en App.tsx

**Files:**
- Modify: `src/App.tsx`

Agregar imports de TicketFlow y TicketConfirm, y las dos rutas `/ticket` y `/ticket/confirmar`.

- [ ] **Step 1: Editar src/App.tsx**

Agregar imports después de `import RequestService`:
```tsx
import TicketFlow from './pages/TicketFlow'
import TicketConfirm from './pages/TicketConfirm'
```

Agregar rutas antes de `<Route path="*"`:
```tsx
<Route path="/ticket" element={<TicketFlow />} />
<Route path="/ticket/confirmar" element={<TicketConfirm />} />
```

El archivo completo queda:

```tsx
// src/App.tsx
import { type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

import Home from './pages/Home'
import Search from './pages/Search'
import ProfessionalDetail from './pages/ProfessionalDetail'
import RequestService from './pages/RequestService'
import TicketFlow from './pages/TicketFlow'
import TicketConfirm from './pages/TicketConfirm'
import MisSolicitudes from './pages/MisSolicitudes'
import Login from './pages/Login'
import Register from './pages/Register'
import ProOnboarding from './pages/pro/ProOnboarding'
import ProProfile from './pages/pro/ProProfile'
import ProRequests from './pages/pro/ProRequests'
import ProWorkHistory from './pages/pro/ProWorkHistory'
import Urgencias from './pages/Urgencias'
import Favoritos from './pages/Favoritos'
import ClientProfile from './pages/ClientProfile'
import NotFound from './pages/NotFound'

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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/buscar/:categoria" element={<Search />} />
        <Route path="/buscar" element={<Search />} />
        <Route path="/urgencias" element={<Urgencias />} />
        <Route path="/profesional/:id" element={<ProfessionalDetail />} />
        <Route path="/solicitar/:id" element={<RequestService />} />
        <Route path="/ticket" element={<TicketFlow />} />
        <Route path="/ticket/confirmar" element={<TicketConfirm />} />
        <Route
          path="/mis-solicitudes"
          element={
            <ProtectedRoute requiredRole="client">
              <MisSolicitudes />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/favoritos" element={<Favoritos />} />
        <Route path="/perfil" element={<ClientProfile />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/pro/registro" element={<ProOnboarding />} />
        <Route
          path="/pro/perfil"
          element={
            <ProtectedRoute requiredRole="professional">
              <ProProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pro/solicitudes"
          element={
            <ProtectedRoute requiredRole="professional">
              <ProRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pro/trabajos"
          element={
            <ProtectedRoute requiredRole="professional">
              <ProWorkHistory />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

- [ ] **Step 2: Build completo**

```bash
npm run build
```
Expected: BUILD EXITOSO sin errores de TypeScript. Todas las rutas resuelven.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: register /ticket and /ticket/confirmar routes in App"
```

---

## Task 7: Wiring — Home y ProfessionalProfile

**Files:**
- Modify: `src/pages/Home.tsx`
- Modify: `src/components/professionals/ProfessionalProfile.tsx` (línea ~240)

### 7a — Home.tsx: agregar TicketEntryCard

Agregar import y colocar `<TicketEntryCard />` entre `<HowItWorks />` y `<FeaturedProfessionals />`.

```tsx
// src/pages/Home.tsx
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { FeaturedProfessionals } from '../components/home/FeaturedProfessionals'
import { HowItWorks } from '../components/home/HowItWorks'
import { TicketEntryCard } from '../components/ticket/TicketEntryCard'
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
      <div
        className="flex items-center"
        style={{ padding: 'calc(14px + var(--safe-top)) var(--px-container) 10px' }}
      >
        <h1
          className="font-black leading-none"
          style={{ fontSize: 32, color: '#111111', letterSpacing: '-1px' }}
        >
          Oficio<span style={{ color: '#E8683A' }}>Ya</span>
        </h1>
      </div>
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
      <div className="flex flex-col gap-4 pt-4 pb-4">
        <HowItWorks />
        <TicketEntryCard />
        <section>
          <FeaturedProfessionals />
        </section>
      </div>
      <UrgenciasFAB />
    </PageShell>
  )
}
```

### 7b — ProfessionalProfile.tsx: cambiar botón "Solicitar trabajo"

En la línea ~240, cambiar `navigate('/solicitar/${id}')` a `navigate('/ticket?pro=${id}')`:

```tsx
// Cambiar esta línea:
onClick={() => navigate(`/solicitar/${id}`)}
// Por:
onClick={() => navigate(`/ticket?pro=${id}`)}
```

- [ ] **Step 1: Editar Home.tsx** con el contenido de 7a.

- [ ] **Step 2: Editar ProfessionalProfile.tsx** — solo la línea del onClick del botón "Solicitar trabajo".

- [ ] **Step 3: Build final**

```bash
npm run build
```
Expected: BUILD EXITOSO. Verificar que no hay errores de TypeScript en ningún archivo.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Home.tsx src/components/professionals/ProfessionalProfile.tsx
git commit -m "feat: wire TicketEntryCard in Home and update Solicitar trabajo to /ticket flow"
```

---

## Self-Review

**Spec coverage:**
- ✅ Home entry card (blanca + borde naranja) → Task 7a (`TicketEntryCard`)
- ✅ "Solicitar trabajo" en perfil navega a `/ticket?pro={id}` → Task 7b
- ✅ Paso 1: categorías 2 col con emoji + label + desc → Task 4 `CategoryStep`
- ✅ Paso 2: foto hero + audio/video/texto → Task 4 `MediaStep`
- ✅ Paso 3: orb animado + 4 steps de progreso → Task 4 `AIProcessingStep`
- ✅ Paso 4: ticket generado (badge pill naranja, título grande, desc, tags) + profesionales ordenados → Task 4 `ResultsStep`
- ✅ `preselectedProId` desde `?pro={id}` aparece primero en la lista → Task 4 `ResultsStep`
- ✅ Paso 5: mini card del pro + resumen ticket + teléfono + submit → Task 5 `TicketConfirm`
- ✅ Mock service en `services/ai/ticketService.ts` con datos por categoría → Task 2
- ✅ Rutas `/ticket` y `/ticket/confirmar` → Task 6

**Placeholder scan:** ninguno.

**Type consistency:**
- `GeneratedTicket.work_type: WorkType` definido en Task 1, usado en Tasks 4 y 5 — consistente.
- `analyzeTicket(input: TicketInput): Promise<GeneratedTicket>` definido en Task 2, llamado en Task 4 — consistente.
- `navigate('/ticket/confirmar', { state: { ticket, proId, ... } })` en Task 4, consumido con `location.state as LocationState` en Task 5 — consistente.
- `addRequest()` en Task 5 recibe `{ professional_id, category, description, urgency, contact_phone, work_type }` — todos campos válidos en `Omit<ServiceRequest, 'id' | 'client_id' | 'created_at' | 'status'>`.
