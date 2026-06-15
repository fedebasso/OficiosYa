// src/pages/TicketFlow.tsx
import { useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { PageShell } from '../components/layout/PageShell'
import { analyzeTicket } from '../services/ai/ticketService'
import { useProfessionals } from '../hooks/useProfessionals'
import { CATEGORY_LABELS, CATEGORY_EMOJI } from '../lib/categories'
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
