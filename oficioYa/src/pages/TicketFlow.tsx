// src/pages/TicketFlow.tsx
import { useState, useRef, useMemo, useEffect, createElement } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, Sparkles, MapPin, Star, Briefcase, Camera, Pencil, Siren, Globe, HelpCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageShell } from '../components/layout/PageShell'
import { analyzeTicket } from '../services/ai/ticketService'
import { useProfessionals } from '../hooks/useProfessionals'
import { CATEGORY_LABELS, getCategoryIcon, getCategoryMeta } from '../lib/categories'
import { SPRING_GENTLE } from '../lib/motion'
import { BARRIOS_MONTEVIDEO } from '../lib/barrios'
import { professionalService } from '../services/professionalService'
import { scoreBreakdown } from '../lib/scoring'
import { inferCategory } from '../lib/inferCategory'
import { isInRadius } from '../lib/barrio-coords'
import type { TicketInput, GeneratedTicket } from '../types/ticket'
import type { ProfessionalWithProfile } from '../hooks/useProfessionals'

/* ── Datos de categorías para el paso 1 ── */
const CATEGORIES = [
  { id: 'electricista',       label: 'Electricidad',  desc: 'Tomacorrientes, luces, tableros' },
  { id: 'plomero',            label: 'Sanitario',     desc: 'Caños, llaves, pérdidas' },
  { id: 'aire_acondicionado', label: 'Aire Ac.',      desc: 'Instalación y limpieza' },
  { id: 'cerrajero',          label: 'Cerrajería',    desc: 'Cerraduras, llaves, portones' },
  { id: 'pintor',             label: 'Pintura',       desc: 'Interior y exterior' },
  { id: 'albanil',            label: 'Albañilería',   desc: 'Reparaciones, muros, pisos' },
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
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1 inline-flex items-center gap-1" style={{ color: '#D4571F' }}>
          <Sparkles size={12} style={{ color: '#D4571F' }} /> Nuevo ticket
        </p>
        <h2 className="text-xl font-black leading-tight" style={{ color: '#1A1712', letterSpacing: '-0.3px' }}>
          ¿Qué tipo de trabajo necesitás?
        </h2>
      </motion.div>

      <motion.div
        className="grid grid-cols-2 gap-3 flex-1"
        variants={{ hidden: {}, visible: { transition: { delayChildren: 0.1, staggerChildren: 0.07 } } }}
        initial="hidden"
        animate="visible"
      >
        {CATEGORIES.map((cat) => {
          const active = selected === cat.id
          return (
            <motion.button
              key={cat.id}
              type="button"
              onClick={() => onSelect(cat.id)}
              variants={{
                hidden: { opacity: 0, scale: 0.92 },
                visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 500, damping: 35 } },
              }}
              whileTap={{ scale: 0.94 }}
              animate={active ? { scale: [1, 1.04, 1] } : {}}
              className="flex items-center gap-3 rounded-2xl p-4 text-left"
              style={{
                background: active ? '#E8683A' : '#F5F0E8',
                border: `1.5px solid ${active ? '#E8683A' : '#EDE8DE'}`,
                boxShadow: active ? '0 4px 14px rgba(232,104,58,.25)' : '0 1px 3px rgba(0,0,0,.04)',
              }}
            >
              <span className="text-2xl flex-shrink-0">
                {createElement(getCategoryIcon(cat.id), { size: 26, style: { color: active ? '#fff' : '#D4571F' } })}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-bold truncate" style={{ color: active ? '#fff' : '#111' }}>
                  {cat.label}
                </div>
                <div className="text-[10px] mt-0.5 truncate" style={{ color: active ? 'rgba(255,255,255,.75)' : '#999' }}>
                  {cat.desc}
                </div>
              </div>
            </motion.button>
          )
        })}
      </motion.div>

      <motion.button
        type="button"
        onClick={onNext}
        disabled={!selected}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: selected ? 1 : 0.4, y: 0 }}
        transition={{ delay: 0.35 }}
        whileTap={{ scale: 0.97 }}
        className="w-full rounded-2xl py-4 text-base font-bold text-white disabled:cursor-not-allowed"
        style={{ background: '#E8683A', boxShadow: '0 4px 14px rgba(232,104,58,.3)' }}
      >
        Continuar →
      </motion.button>
    </div>
  )
}

/* ── Disambiguation step ── */
function DisambiguationStep({ alternatives, onPick, onSeeAll }: { alternatives: string[]; onPick: (category: string) => void; onSeeAll: () => void }) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h2 className="text-xl font-black leading-tight" style={{ color: '#1A1712', letterSpacing: '-0.3px' }}>¿Qué es lo que te pasa?</h2>
        <p className="text-sm mt-1" style={{ color: '#7A6E5E' }}>Elegí lo que más se acerca a tu problema.</p>
      </div>
      <div className="flex flex-col gap-2.5">
        {alternatives.map((id) => (
          <button key={id} type="button" onClick={() => onPick(id)}
            className="w-full flex items-center gap-3 p-4 rounded-2xl text-left active:scale-[0.99] transition-transform"
            style={{ background: '#FFFFFF', border: '1px solid #ECE6DC', boxShadow: '0 2px 6px rgba(60,40,20,.04), 0 12px 28px -12px rgba(60,40,20,.14)' }}>
            <span className="flex items-center justify-center flex-shrink-0" style={{ width: 40, height: 40, borderRadius: 12, background: '#FAF6F0' }}>
              {createElement(getCategoryIcon(id), { size: 20, style: { color: '#D4571F' } })}
            </span>
            <span className="font-bold" style={{ color: '#1A1712', fontSize: 15 }}>{getCategoryMeta(id).label}</span>
          </button>
        ))}
      </div>
      <button type="button" onClick={onSeeAll} className="text-sm font-bold self-center mt-1" style={{ color: '#7A6E5E' }}>No estoy seguro · ver todas las categorías</button>
    </div>
  )
}

/* ── Paso 2: Media ── */
function MediaStep({
  input,
  onChange,
  onAnalyze,
  lockedPro,
}: {
  input: TicketInput
  onChange: (patch: Partial<TicketInput>) => void
  onAnalyze: () => void
  lockedPro?: ProfessionalWithProfile | null
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [showZoneSheet, setShowZoneSheet] = useState(false)
  const [attempted, setAttempted] = useState(false)

  const photoUrl = useMemo(() => {
    if (!input.photo) return null
    return URL.createObjectURL(input.photo)
  }, [input.photo])

  useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl)
    }
  }, [photoUrl])

  const missingText = input.text.trim().length < 10
  const canAnalyze  = !missingText

  function handleAnalyze() {
    setAttempted(true)
    if (canAnalyze) onAnalyze()
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {lockedPro && (
        <div
          className="flex items-center gap-3 rounded-2xl p-3"
          style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}
        >
          {lockedPro.profiles.avatar_url ? (
            <img
              src={lockedPro.profiles.avatar_url}
              alt={lockedPro.profiles.full_name}
              className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
            />
          ) : (
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#E8683A,#c44d1f)', fontSize: 18 }}
            >
              {lockedPro.profiles.full_name.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold truncate" style={{ color: '#111111' }}>
              {lockedPro.profiles.full_name}
            </div>
            <div className="text-[10px] inline-flex items-center gap-1" style={{ color: '#AAAAAA' }}>
              {createElement(getCategoryIcon(lockedPro.categories[0]), { size: 12, style: { color: '#D4571F' } })} {CATEGORY_LABELS[lockedPro.categories[0]] ?? lockedPro.categories[0]} · {lockedPro.zone}
            </div>
          </div>
          {lockedPro.avg_rating != null && (
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-xl flex-shrink-0"
              style={{ background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.2)' }}
            >
              <Star size={11} fill="#F5A623" color="#F5A623" />
              <span className="text-xs font-black" style={{ color: '#22c55e' }}>{lockedPro.avg_rating}</span>
            </div>
          )}
        </div>
      )}

      <div>
        <h2 className="text-xl font-black leading-tight" style={{ color: '#111111', letterSpacing: '-0.3px' }}>
          Mostranos el problema
        </h2>
        <p className="text-sm mt-1" style={{ color: '#AAAAAA' }}>
          Completá los tres campos para continuar
        </p>
      </div>

      {/* Hero: foto */}
      {input.photo ? (
        <div className="relative rounded-2xl overflow-hidden" style={{ height: 180 }}>
          <img
            src={photoUrl ?? ''}
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
        <>
        <motion.button
          type="button"
          onClick={() => fileRef.current?.click()}
          whileTap={{ scale: 0.98 }}
          className="flex flex-col items-center justify-center gap-2 rounded-2xl relative overflow-hidden"
          style={{ height: 200, border: '2px dashed #E8683A', background: '#FEF0EA' }}
        >
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 50% 50%, rgba(232,104,58,.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <motion.span
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2.5, ease: 'easeInOut', repeat: Infinity }}
            style={{ position: 'relative', zIndex: 1 }}
          >
            <Camera size={32} style={{ color: '#E8683A' }} />
          </motion.span>
          <span className="text-sm font-bold" style={{ color: '#E8683A', position: 'relative', zIndex: 1 }}>
            Sacar o subir foto (opcional)
          </span>
          <span className="text-xs" style={{ color: '#C4927A', position: 'relative', zIndex: 1 }}>
            Tocá para abrir la cámara
          </span>
        </motion.button>
        </>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => onChange({ photo: e.target.files?.[0] ?? null })}
      />

      {/* Texto — siempre visible, obligatorio */}
      <div className="flex flex-col gap-1">
        <textarea
          value={input.text}
          onChange={(e) => onChange({ text: e.target.value })}
          rows={3}
          placeholder="Describí el problema con tus palabras... (mín. 10 caracteres)"
          className="rounded-xl p-3 text-sm resize-none"
          style={{
            background: '#FFFFFF',
            border: `1.5px solid ${attempted && missingText ? '#EF4444' : '#E8E0D4'}`,
            color: '#111',
            outline: 'none',
            caretColor: '#E8683A',
          }}
        />
        <div className="flex items-center justify-between px-1">
          {attempted && missingText
            ? <p className="text-xs font-semibold inline-flex items-center gap-1" style={{ color: '#EF4444' }}><Pencil size={12} style={{ color: '#EF4444' }} /> Describí el problema</p>
            : <span />
          }
          <p className="text-xs" style={{ color: input.text.trim().length >= 10 ? '#16A34A' : '#AAAAAA' }}>
            {input.text.trim().length}/10 mín.
          </p>
        </div>
      </div>

      {/* Zona del cliente — trigger */}
      <div>
        <motion.button
          type="button"
          onClick={() => setShowZoneSheet(true)}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-between rounded-xl py-3 px-4"
          style={{
            background: input.zone ? 'rgba(232,104,58,.08)' : '#FFFFFF',
            border: `1.5px solid ${input.zone ? '#E8683A' : '#EDE8DE'}`,
          }}
        >
          <span className="text-sm font-bold inline-flex items-center gap-1" style={{ color: input.zone ? '#E8683A' : '#555555' }}>
            <MapPin size={13} style={{ color: input.zone ? '#E8683A' : '#555555' }} /> {input.zone || 'Seleccioná tu barrio'}
          </span>
          {input.zone ? (
            <span
              onClick={(e) => { e.stopPropagation(); onChange({ zone: '' }) }}
              className="text-xs font-black px-1.5 py-0.5 rounded-full"
              style={{ color: '#E8683A', background: 'rgba(232,104,58,.15)' }}
            >
              ×
            </span>
          ) : (
            <span className="text-xs" style={{ color: '#CCC' }}>▼</span>
          )}
        </motion.button>
        <p className="text-xs mt-1 px-1" style={{ color: '#AAAAAA' }}>Opcional — te mostramos profesionales más cerca</p>
      </div>

      {/* Bottom sheet de barrios */}
      <AnimatePresence>
        {showZoneSheet && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,.5)' }}
              onClick={() => setShowZoneSheet(false)}
            />
            {/* Panel */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl overflow-hidden"
              style={{ background: '#FFFFFF', maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}
            >
              <div className="px-4 py-3 flex items-center justify-between flex-shrink-0"
                style={{ borderBottom: '1px solid #F0EBE1' }}>
                <p className="text-base font-black" style={{ color: '#111111' }}>¿En qué barrio?</p>
                <button
                  type="button"
                  onClick={() => setShowZoneSheet(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: '#F5F0E8' }}
                >
                  <span className="text-sm font-black" style={{ color: '#555' }}>×</span>
                </button>
              </div>
              <div className="overflow-y-auto flex-1">
                {BARRIOS_MONTEVIDEO.map((barrio) => {
                  const selected = input.zone === barrio
                  return (
                    <button
                      key={barrio}
                      type="button"
                      onClick={() => { onChange({ zone: barrio }); setShowZoneSheet(false) }}
                      className="w-full text-left px-4 py-3 flex items-center justify-between"
                      style={{
                        borderBottom: '1px solid #F5F0E8',
                        background: selected ? 'rgba(232,104,58,.06)' : 'transparent',
                        color: selected ? '#E8683A' : '#333333',
                        fontWeight: selected ? 700 : 400,
                      }}
                    >
                      <span className="text-sm">{barrio}</span>
                      {selected && <span style={{ color: '#E8683A', fontSize: 16 }}>✓</span>}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={handleAnalyze}
        className="w-full rounded-2xl py-4 text-base font-bold text-white active:opacity-80 transition-opacity inline-flex items-center justify-center gap-2"
        style={{ background: '#E8683A', boxShadow: '0 4px 14px rgba(232,104,58,.3)', opacity: canAnalyze ? 1 : 0.65 }}
      >
        Analizar con IA <Sparkles size={16} />
      </button>
    </div>
  )
}

/* ── Paso 3: IA procesando ── */
function AIProcessingStep({ progress }: { progress: number }) {
  const steps = ['Imagen analizada', 'Identificando el problema...', 'Generando ticket', 'Buscando profesionales']

  return (
    <div className="flex flex-col items-center justify-center flex-1 p-8 text-center gap-6">
      {/* Orb multi-layer */}
      <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
        {/* Outer glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(232,104,58,.12) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.8, ease: 'easeInOut', repeat: Infinity }}
        />
        {/* Mid glow */}
        <motion.div
          className="absolute rounded-full"
          style={{ width: 96, height: 96, background: 'radial-gradient(circle, rgba(232,104,58,.15) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.8, ease: 'easeInOut', repeat: Infinity, delay: 0.2 }}
        />
        {/* Inner orb */}
        <motion.div
          className="absolute rounded-full flex items-center justify-center"
          style={{
            width: 80, height: 80,
            background: 'radial-gradient(circle at 35% 35%, #FF9A5C, #E8683A 50%, #B84A1F)',
            boxShadow: '0 8px 32px rgba(232,104,58,.4)',
          }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2.8, ease: 'easeInOut', repeat: Infinity, delay: 0.1 }}
        />
        {/* Core */}
        <motion.span
          className="relative z-10 flex items-center justify-center"
          animate={{ rotate: [-3, 3, -3] }}
          transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity }}
        >
          <Sparkles size={32} style={{ color: '#fff' }} />
        </motion.span>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.3 }}>
        <h2 className="text-xl font-black" style={{ color: '#111111', letterSpacing: '-0.3px' }}>
          Analizando tu problema
        </h2>
        <p className="text-sm mt-1" style={{ color: '#AAAAAA' }}>Tardará solo unos segundos</p>
      </motion.div>

      <motion.div
        className="w-full max-w-xs flex flex-col gap-3 text-left"
        variants={{ hidden: {}, visible: { transition: { delayChildren: 0.3, staggerChildren: 0.15 } } }}
        initial="hidden"
        animate="visible"
      >
        {steps.map((label, i) => {
          const done = i < progress
          const active = i === progress
          return (
            <motion.div
              key={label}
              variants={{ hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } } }}
              className="flex items-center gap-3"
            >
              <div className="relative flex-shrink-0" style={{ width: 22, height: 22 }}>
                <AnimatePresence mode="wait">
                  {done ? (
                    <motion.div
                      key="done"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      className="absolute inset-0 rounded-full flex items-center justify-center font-black text-white"
                      style={{ background: '#E8683A', fontSize: 10 }}
                    >
                      ✓
                    </motion.div>
                  ) : (
                    <motion.div
                      key="pending"
                      className="absolute inset-0 rounded-full"
                      style={{ border: active ? '2px solid #E8683A' : '1.5px solid #EDE8DE' }}
                      animate={active ? { boxShadow: ['0 0 0 0 rgba(232,104,58,.4)', '0 0 0 5px rgba(232,104,58,0)', '0 0 0 0 rgba(232,104,58,.4)'] } : {}}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                  )}
                </AnimatePresence>
              </div>
              <span className="text-sm" style={{
                color: done ? '#555' : active ? '#E8683A' : '#CCC',
                fontWeight: done || active ? 700 : 400,
              }}>
                {label}
              </span>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}

/* ── Paso 4: Resultados ── */
function ResultsStep({
  ticket,
  category,
  clientZone,
  onPedir,
}: {
  ticket: GeneratedTicket
  category: string
  clientZone: string
  onPedir: (pro: ProfessionalWithProfile) => void
}) {
  const navigate = useNavigate()
  const { professionals } = useProfessionals(category)
  const inRange = professionals.filter((p) =>
    isInRadius(p.zone, p.radius_km, clientZone)
  )

  const ranked = inRange
    .map((p) => ({ pro: p, bd: scoreBreakdown(p, clientZone, category) }))
    .filter((r) => r.bd.total > 0)
    .sort((a, b) => b.bd.total - a.bd.total)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const effectiveId = selectedId ?? ranked[0]?.pro.id ?? null
  const selectedPro = ranked.find((r) => r.pro.id === effectiveId)?.pro ?? null

  return (
    <div className="flex flex-col pb-24" style={{ minHeight: '100%' }}>
      {/* Ticket generado */}
      <div className="p-4 pb-3" style={{ borderBottom: '1px solid #F0EBE1' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
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
          <Sparkles size={12} /> Generado por IA
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="text-xl font-black leading-tight mb-2"
          style={{ color: '#111111', letterSpacing: '-0.3px' }}
        >
          {ticket.title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="text-sm leading-relaxed mb-3"
          style={{ color: '#666666' }}
        >
          {ticket.description}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35 }}
          className="flex gap-2 flex-wrap"
        >
          {ticket.urgent && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1"
              style={{ background: 'rgba(239,68,68,.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,.2)' }}>
              <Siren size={11} /> Urgente
            </span>
          )}
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1"
            style={{ background: '#F5F0E8', color: '#666' }}>
            {createElement(getCategoryIcon(category), { size: 11, style: { color: '#D4571F' } })} {CATEGORY_LABELS[category] ?? category}
          </span>
        </motion.div>
      </div>

      {/* Profesionales recomendados */}
      <div className="flex-1 p-4 flex flex-col gap-3" style={{ background: '#F9F6F2' }}>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: '#AAAAAA' }}
        >
          Tocá para elegir un profesional
        </motion.p>
        <motion.div
          className="flex flex-col gap-3"
          variants={{ hidden: {}, visible: { transition: { delayChildren: 0.45, staggerChildren: 0.06 } } }}
          initial="hidden"
          animate="visible"
        >
          {ranked.slice(0, 5).map(({ pro, bd }, index) => {
            const selected = pro.id === effectiveId
            return (
              <motion.div key={pro.id}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 32 } },
                }}
              >
                {index === 0 && (
                  <div className="mb-1.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: '#FEF0EA', color: '#D4571F' }}>
                      <Sparkles size={11} /> Mejor opción para vos
                    </span>
                  </div>
                )}
                <motion.button
                  type="button"
                  onClick={() => setSelectedId(pro.id)}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-2xl overflow-hidden text-left w-full"
                  style={{
                    background: '#FFFFFF',
                    border: `2px solid ${selected ? '#E8683A' : '#EDE8DE'}`,
                    boxShadow: selected ? '0 2px 12px rgba(232,104,58,.18)' : '0 1px 3px rgba(0,0,0,.04)',
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
                      <div className="text-[10px] inline-flex items-center gap-1" style={{ color: '#AAAAAA' }}>
                        {pro.avg_rating != null && <><Star size={11} fill="#F5A623" color="#F5A623" /> {pro.avg_rating} · </>}
                        {pro.jobs_count} trabajos
                        {pro.response_time_min > 0 && ` · ~${pro.response_time_min}min`}
                      </div>
                      <span className="text-[9px] font-bold inline-flex items-center gap-1" style={{ color: '#AAAAAA' }}>
                        {pro.radius_km === null
                          ? <><Globe size={12} /> Toda la ciudad</>
                          : <><MapPin size={12} /> {pro.zone} · {pro.radius_km} km</>
                        }
                      </span>
                    </div>
                    {/* Indicador de selección */}
                    <div className="relative flex-shrink-0" style={{ width: 22, height: 22 }}>
                      <AnimatePresence mode="wait">
                        {selected ? (
                          <motion.div
                            key="selected"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                            className="absolute inset-0 rounded-full flex items-center justify-center font-black text-white"
                            style={{ background: '#E8683A', fontSize: 11 }}
                          >
                            ✓
                          </motion.div>
                        ) : (
                          <motion.div
                            key="unselected"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                            className="absolute inset-0 rounded-full"
                            style={{ border: '1.5px solid #DDD' }}
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  {/* Chips "por qué" */}
                  <div className="flex flex-wrap gap-1.5 px-3 pb-3 mt-1.5">
                    {bd.specialist && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg"
                        style={{ background: '#FAF6F0', border: '1px solid #ECE4D8', color: '#7A6E5E' }}>
                        {createElement(getCategoryIcon(category), { size: 12, style: { color: '#D4571F' } })} Especialista en {getCategoryMeta(category).label}
                      </span>
                    )}
                    {bd.sameZone && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg"
                        style={{ background: '#FAF6F0', border: '1px solid #ECE4D8', color: '#7A6E5E' }}>
                        <MapPin size={12} style={{ color: '#B3A794' }} /> Cerca tuyo
                      </span>
                    )}
                    {bd.rating != null && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg"
                        style={{ background: '#FAF6F0', border: '1px solid #ECE4D8', color: '#7A6E5E' }}>
                        <Star size={12} fill="#F5A623" color="#F5A623" /> {bd.rating.toFixed(1)}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg"
                      style={{ background: '#FAF6F0', border: '1px solid #ECE4D8', color: '#7A6E5E' }}>
                      <Briefcase size={12} style={{ color: '#B3A794' }} /> {bd.jobs} trabajos
                    </span>
                  </div>
                </motion.button>
              </motion.div>
            )
          })}
        </motion.div>

        <button type="button" onClick={() => navigate('/buscar')} className="w-full text-center text-sm font-bold py-3 mt-1" style={{ color: '#7A6E5E' }}>
          ¿Preferís elegir vos? Ver todos los profesionales
        </button>
      </div>

      {/* CTA fijo al fondo */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 p-4"
        style={{ background: 'rgba(249,246,242,.96)', backdropFilter: 'blur(8px)', borderTop: '1px solid #EDE8DE' }}
      >
        <motion.button
          type="button"
          onClick={() => selectedPro && onPedir(selectedPro)}
          disabled={!selectedPro}
          whileTap={{ scale: 0.97 }}
          className="w-full rounded-2xl py-4 text-base font-bold text-white disabled:opacity-40"
          style={{ background: '#E8683A', boxShadow: '0 4px 14px rgba(232,104,58,.3)' }}
        >
          {selectedPro ? `Continuar con ${selectedPro.profiles.full_name.split(' ')[0]} →` : 'Elegí un profesional'}
        </motion.button>
      </motion.div>
    </div>
  )
}

/* ── Orquestador principal ── */
export default function TicketFlow() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedProId = searchParams.get('pro')

  const [step, setStep] = useState<1 | 2 | 3 | 4>(2)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [category, setCategory] = useState<string | null>(null)
  const [input, setInput] = useState<TicketInput>({ category: '', photo: null, text: '', zone: '' })
  const [aiProgress, setAiProgress] = useState(0)
  const [ticket, setTicket] = useState<GeneratedTicket | null>(null)
  const [aiError, setAiError] = useState<'no_match' | null>(null)
  const timeoutIdsRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const [lockedPro, setLockedPro] = useState<ProfessionalWithProfile | null>(null)
  const [guessAlts, setGuessAlts] = useState<string[]>([])
  const [showAllCats, setShowAllCats] = useState(false)

  useEffect(() => {
    return () => {
      timeoutIdsRef.current.forEach(clearTimeout)
    }
  }, [])

  useEffect(() => {
    if (!preselectedProId) return
    professionalService.getById(preselectedProId).then((pro) => {
      if (!pro) return
      setLockedPro(pro)
      setCategory(pro.categories[0] ?? null)
      setStep(2)
    })
  }, [preselectedProId])

  const runAnalyze = async (cat: string) => {
    setCategory(cat)
    const ticketInput: TicketInput = { ...input, category: cat }
    setDirection('forward')
    setStep(3)
    setAiError(null)
    setAiProgress(0)
    timeoutIdsRef.current.forEach(clearTimeout)
    timeoutIdsRef.current = []

    const intervals = [400, 900, 1600, 2500]
    intervals.forEach((delay, i) => {
      const id = setTimeout(() => setAiProgress(i + 1), delay)
      timeoutIdsRef.current.push(id)
    })

    try {
      const result = await analyzeTicket(ticketInput)
      setTicket(result)

      if (lockedPro) {
        const id = setTimeout(() => handlePedir(lockedPro, result), 2600)
        timeoutIdsRef.current.push(id)
      } else {
        const id = setTimeout(() => setStep(4), 2600)
        timeoutIdsRef.current.push(id)
      }
    } catch (err) {
      if (err instanceof Error && err.message === 'NO_MATCH') {
        setAiError('no_match')
      }
    }
  }

  const handleDescribeSubmit = () => {
    const g = inferCategory(input.text)
    if (g.confidence === 'high' && g.category) {
      runAnalyze(g.category)
    } else {
      setGuessAlts(g.alternatives)
      setShowAllCats(false)
      setDirection('forward')
      setStep(1)
    }
  }

  const handlePedir = (pro: ProfessionalWithProfile, resolvedTicket?: GeneratedTicket) => {
    const t = resolvedTicket ?? ticket
    navigate('/ticket/confirmar', {
      state: { ticket: t, proId: pro.id, proName: pro.profiles.full_name, proAvatar: pro.profiles.avatar_url, proRating: pro.avg_rating, zone: input.zone },
    })
  }

  // Slide variants based on direction (transitions embedded so stagger animations are not overridden)
  const slideVariants = {
    enter: (dir: 'forward' | 'back') => ({ x: dir === 'forward' ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1, transition: SPRING_GENTLE },
    exit: (dir: 'forward' | 'back') => ({ x: dir === 'forward' ? -40 : 40, opacity: 0, transition: { duration: 0.2 } as const }),
  }

  const fadeVariants = {
    enter: { opacity: 0 },
    center: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  }

  const header = (
    <div
      className="px-4 pt-10 pb-3 sticky top-0 z-50 flex items-center gap-3"
      style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E0D4', boxShadow: '0 1px 0 #E8E0D4, 0 2px 8px rgba(0,0,0,.04)' }}
    >
      {step === 1 && (
        <button type="button" onClick={() => { setDirection('back'); setStep(2) }}
          className="p-1 -ml-1 rounded-full active:opacity-60 transition-opacity flex-shrink-0">
          <ChevronLeft size={24} style={{ color: '#111111' }} />
        </button>
      )}
      {step === 2 && (
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-1 -ml-1 rounded-full active:opacity-60 transition-opacity flex-shrink-0"
        >
          <ChevronLeft size={24} style={{ color: '#111111' }} />
        </button>
      )}
      {step === 4 && (
        <button type="button" onClick={() => { setDirection('back'); setStep(2) }}
          className="p-1 -ml-1 rounded-full active:opacity-60 transition-opacity flex-shrink-0">
          <ChevronLeft size={24} style={{ color: '#111111' }} />
        </button>
      )}
      <div>
        <h1 className="text-base font-black leading-tight" style={{ color: '#111111' }}>
          {step === 1 && 'Ayudanos a entender'}
          {step === 2 && (lockedPro ? `Describí el problema` : 'Contanos qué pasa')}
          {step === 3 && 'Analizando...'}
          {step === 4 && 'Profesionales para vos'}
        </h1>
        <p className="text-xs mt-0.5" style={{ color: '#AAAAAA' }}>
          {lockedPro && step !== 1 && step !== 4
            ? `Paso ${step === 2 ? 1 : 2} de 2 · ${CATEGORY_LABELS[lockedPro.categories[0]] ?? lockedPro.categories[0]}`
            : step === 2 ? 'Paso 1 de 3' : step === 1 ? 'Paso 2 de 3' : step === 3 ? 'Analizando...' : 'Paso 3 de 3'
          }
        </p>
      </div>
    </div>
  )

  return (
    <PageShell showBottomNav={false} header={header}>
      <div className="flex flex-col" style={{ minHeight: '100%', position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              style={{ width: '100%' }}
            >
              {guessAlts.length > 0 && !showAllCats ? (
                <DisambiguationStep
                  alternatives={guessAlts}
                  onPick={(id) => runAnalyze(id)}
                  onSeeAll={() => setShowAllCats(true)}
                />
              ) : (
                <CategoryStep
                  selected={category}
                  onSelect={(id) => setCategory(id)}
                  onNext={() => { if (category) runAnalyze(category) }}
                />
              )}
            </motion.div>
          )}
          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              style={{ width: '100%' }}
            >
              <MediaStep
                input={input}
                onChange={(patch) => setInput((prev) => ({ ...prev, ...patch }))}
                onAnalyze={lockedPro && category ? () => runAnalyze(category) : handleDescribeSubmit}
                lockedPro={lockedPro}
              />
            </motion.div>
          )}
          {step === 3 && (
            <motion.div
              key="step3"
              variants={fadeVariants}
              initial="enter"
              animate="center"
              exit="exit"
              style={{ width: '100%', display: 'flex', flex: 1 }}
            >
              {aiError === 'no_match' ? (
                <div className="flex flex-col items-center justify-center flex-1 p-8 text-center gap-5">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(239,68,68,.08)', border: '1.5px solid rgba(239,68,68,.15)' }}
                  >
                    <HelpCircle size={32} style={{ color: '#DC2626' }} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black leading-tight mb-2" style={{ color: '#111111', letterSpacing: '-0.3px' }}>
                      No pudimos identificar el problema
                    </h2>
                    <p className="text-sm leading-relaxed" style={{ color: '#777777' }}>
                      La descripción o imagen no corresponde a un servicio del hogar. Intentá con una foto del problema o describí qué trabajo necesitás (electricidad, plomería, pintura, etc).
                    </p>
                  </div>
                  <motion.button
                    type="button"
                    onClick={() => { setAiError(null); setDirection('back'); setStep(2) }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full rounded-2xl py-3.5 text-sm font-bold"
                    style={{ background: '#E8683A', color: '#fff', boxShadow: '0 4px 14px rgba(232,104,58,.3)' }}
                  >
                    Intentar de nuevo
                  </motion.button>
                </div>
              ) : (
                <AIProcessingStep progress={aiProgress} />
              )}
            </motion.div>
          )}
          {step === 4 && ticket && !lockedPro && (
            <motion.div
              key="step4"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              style={{ width: '100%' }}
            >
              <ResultsStep
                ticket={ticket}
                category={category ?? ''}
                clientZone={input.zone}
                onPedir={handlePedir}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageShell>
  )
}
