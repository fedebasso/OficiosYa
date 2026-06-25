// src/pages/pro/ProAvailability.tsx
import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../../components/layout/PageShell'
import { DateStrip } from '../../components/availability/DateStrip'
import { TimeSlotGrid } from '../../components/availability/TimeSlotGrid'
import { BlockSlotSheet } from '../../components/availability/BlockSlotSheet'
import { VacationSheet } from '../../components/availability/VacationSheet'
import { TIME_OPTIONS } from '../../components/availability/timeOptions'
import { useAvailabilityStore, type DayOfWeek, DURATION_OPTIONS, BUFFER_OPTIONS } from '../../store/availabilityStore'
import { useAuthStore } from '../../store/authStore'

const DAYS_CONFIG: { value: DayOfWeek; label: string }[] = [
  { value: 'lunes',     label: 'Lunes' },
  { value: 'martes',    label: 'Martes' },
  { value: 'miercoles', label: 'Miércoles' },
  { value: 'jueves',    label: 'Jueves' },
  { value: 'viernes',   label: 'Viernes' },
  { value: 'sabado',    label: 'Sábado' },
  { value: 'domingo',   label: 'Domingo' },
]

const CARD: React.CSSProperties = {
  background: '#FFFFFF',
  border: '1.5px solid #E8E0D4',
  borderRadius: 20,
  padding: '16px',
}

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: 1.5,
  color: '#AAAAAA',
  textTransform: 'uppercase',
  marginBottom: 10,
}

const SELECT: React.CSSProperties = {
  background: '#F5F0E8',
  border: '1.5px solid #E8E0D4',
  borderRadius: 10,
  padding: '8px 10px',
  fontSize: 13,
  fontWeight: 700,
  color: '#111111',
  outline: 'none',
  flex: 1,
}

export default function ProAvailability() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const proId = user?.id ?? '1'

  const { schedules, blockedSlots, vacations, setSchedule, removeBlockedSlot, removeVacation, getSlots } =
    useAvailabilityStore()

  const schedule = schedules[proId]

  // Local schedule editor state
  const [localDays, setLocalDays] = useState<DayOfWeek[]>(schedule?.days ?? [])
  const [fromHour, setFromHour] = useState(schedule?.fromHour ?? '08:00')
  const [toHour, setToHour] = useState(schedule?.toHour ?? '18:00')
  const [scheduleSaved, setScheduleSaved] = useState(false)
  const [localDuration, setLocalDuration] = useState<number>(
    schedule?.serviceDurationMin ?? 60
  )
  const [localBuffer, setLocalBuffer] = useState<number>(
    schedule?.bufferMin ?? 0
  )
  const [showBuffer, setShowBuffer] = useState<boolean>(
    (schedule?.bufferMin ?? 0) > 0
  )

  // Preview state
  const today = new Date().toISOString().split('T')[0]
  const [previewDate, setPreviewDate] = useState<string | null>(today)
  const previewSlots = previewDate ? getSlots(proId, previewDate) : []

  // Sheet state
  const [blockOpen, setBlockOpen] = useState(false)
  const [vacOpen, setVacOpen] = useState(false)

  function toggleDay(d: DayOfWeek) {
    setLocalDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    )
    setScheduleSaved(false)
  }

  function handleSaveSchedule() {
    setSchedule(proId, {
      days: localDays,
      fromHour,
      toHour,
      intervalMin: schedule?.intervalMin ?? 30,
      serviceDurationMin: localDuration,
      bufferMin: localBuffer,
    })
    setScheduleSaved(true)
    setTimeout(() => setScheduleSaved(false), 2000)
  }

  function formatVacation(from: string, to: string) {
    const fmt = (d: string) => {
      const [, m, day] = d.split('-')
      return `${day}/${m}`
    }
    return `${fmt(from)} → ${fmt(to)}`
  }

  const proBlocks = blockedSlots.filter((b) => b.proId === proId)
  const proVacations = vacations.filter((v) => v.proId === proId)

  const header = (
    <div
      className="px-4 pt-10 pb-4 sticky top-0 z-50 flex items-center gap-3"
      style={{ background: '#F5F0E8', borderBottom: '1px solid #E8E0D4' }}
    >
      <button
        type="button" onClick={() => navigate(-1)}
        className="p-1 -ml-1 rounded-full active:opacity-60 transition-opacity"
      >
        <ChevronLeft size={24} style={{ color: '#111111' }} />
      </button>
      <div>
        <h1 className="text-xl font-black leading-tight" style={{ color: '#111111', letterSpacing: '-0.3px' }}>
          Mi Disponibilidad
        </h1>
        <p className="text-xs mt-0.5" style={{ color: '#AAAAAA' }}>
          Gestioná tu agenda
        </p>
      </div>
    </div>
  )

  return (
    <PageShell header={header} showBottomNav={false}>
      <div className="p-4 flex flex-col gap-5 pb-10">

        {/* ── Sección 1: Horario laboral ── */}
        <div>
          <p style={SECTION_LABEL}>Horario laboral</p>
          <div style={CARD}>
            {/* Días */}
            <p className="text-xs font-bold mb-2" style={{ color: '#555555' }}>Días que trabajás</p>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {DAYS_CONFIG.map(({ value, label }) => {
                const active = localDays.includes(value)
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleDay(value)}
                    className="flex flex-col items-center py-2 rounded-xl transition-all active:scale-95"
                    style={{
                      background: active ? '#E8683A' : '#F5F0E8',
                      border: `1.5px solid ${active ? '#E8683A' : '#E8E0D4'}`,
                      color: active ? '#FFFFFF' : '#888888',
                    }}
                  >
                    <span style={{ fontSize: 9, fontWeight: 800 }}>
                      {label.slice(0, 3)}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Horario */}
            <p className="text-xs font-bold mb-2" style={{ color: '#555555' }}>Horario</p>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs" style={{ color: '#888' }}>Desde</span>
              <select value={fromHour} onChange={(e) => { setFromHour(e.target.value); setScheduleSaved(false) }} style={SELECT}>
                {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <span className="text-xs" style={{ color: '#888' }}>Hasta</span>
              <select value={toHour} onChange={(e) => { setToHour(e.target.value); setScheduleSaved(false) }} style={SELECT}>
                {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Duración del servicio */}
            <div style={{ marginTop: 16 }}>
              <p style={SECTION_LABEL}>Duración del servicio</p>
              <div className="flex flex-wrap gap-2">
                {DURATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { setLocalDuration(opt.value); setScheduleSaved(false) }}
                    className="font-bold transition-all active:scale-95"
                    style={{
                      padding: '7px 14px',
                      borderRadius: 10,
                      fontSize: 'var(--text-sm)',
                      background: localDuration === opt.value ? '#0F6E56' : '#F5F0E8',
                      color:      localDuration === opt.value ? '#FFFFFF'  : '#555555',
                      border: '1.5px solid',
                      borderColor: localDuration === opt.value ? '#0F6E56' : '#E8E0D4',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pausa entre servicios */}
            <div style={{ marginTop: 16 }}>
              <p style={SECTION_LABEL}>Pausa entre servicios</p>
              {!showBuffer ? (
                <button
                  type="button"
                  onClick={() => setShowBuffer(true)}
                  className="font-bold"
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: '#0F6E56',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                  }}
                >
                  + Agregar pausa entre servicios
                </button>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {BUFFER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setLocalBuffer(opt.value)
                        setScheduleSaved(false)
                        if (opt.value === 0) setShowBuffer(false)
                      }}
                      className="font-bold transition-all active:scale-95"
                      style={{
                        padding: '7px 14px',
                        borderRadius: 10,
                        fontSize: 'var(--text-sm)',
                        background: localBuffer === opt.value ? '#E8683A' : '#F5F0E8',
                        color:      localBuffer === opt.value ? '#FFFFFF'  : '#555555',
                        border: '1.5px solid',
                        borderColor: localBuffer === opt.value ? '#E8683A' : '#E8E0D4',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button" onClick={handleSaveSchedule}
              className="w-full rounded-xl py-3 text-sm font-bold transition-all"
              style={{
                background: scheduleSaved ? '#16A34A' : '#E8683A',
                color: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(232,104,58,.25)',
              }}
            >
              {scheduleSaved ? '✓ Guardado' : 'Guardar horario'}
            </button>
          </div>
        </div>

        {/* ── Sección 2: Bloqueos manuales ── */}
        <div>
          <p style={SECTION_LABEL}>Bloqueos manuales</p>
          <button
            type="button" onClick={() => setBlockOpen(true)}
            className="w-full rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-2 mb-3"
            style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4', color: '#555555' }}
          >
            ➕ Bloquear horario
          </button>

          {proBlocks.length > 0 && (
            <div className="flex flex-col gap-2">
              {proBlocks.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5"
                  style={{ background: '#FFFFFF', border: '1px solid #EDE8DE' }}
                >
                  <div>
                    <p className="text-xs font-bold" style={{ color: '#111111' }}>
                      {b.date} · {b.fromTime}–{b.toTime}
                    </p>
                    {b.reason && (
                      <p className="text-[10px]" style={{ color: '#AAAAAA' }}>{b.reason}</p>
                    )}
                  </div>
                  <button
                    type="button" onClick={() => removeBlockedSlot(b.id)}
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: '#FEF0EA', color: '#E8683A', fontWeight: 900, fontSize: 16 }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Sección 3: Vacaciones ── */}
        <div>
          <p style={SECTION_LABEL}>Vacaciones y días no laborables</p>
          <button
            type="button" onClick={() => setVacOpen(true)}
            className="w-full rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-2 mb-3"
            style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4', color: '#555555' }}
          >
            🏖️ Agregar período
          </button>

          {proVacations.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {proVacations.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
                  style={{ background: '#FEF0EA', border: '1px solid #FDDCC8' }}
                >
                  <span className="text-xs font-bold" style={{ color: '#E8683A' }}>
                    {formatVacation(v.fromDate, v.toDate)}
                  </span>
                  <button
                    type="button" onClick={() => removeVacation(v.id)}
                    style={{ color: '#E8683A', fontWeight: 900, fontSize: 14, lineHeight: 1 }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Sección 4: Preview del día ── */}
        <div>
          <p style={SECTION_LABEL}>Vista previa</p>
          <div style={CARD}>
            <p className="text-xs font-bold mb-3" style={{ color: '#555555' }}>
              Elegí un día para ver la disponibilidad
            </p>
            <DateStrip proId={proId} selected={previewDate} onSelect={setPreviewDate} />
            {previewDate && (
              <div className="mt-4">
                <div className="flex gap-3 text-[10px] font-bold mb-3">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ background: 'linear-gradient(135deg,#16A34A,#15803D)' }} />
                    Disponible
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ background: 'linear-gradient(135deg,#DC2626,#B91C1C)' }} />
                    Ocupado
                  </span>
                </div>
                <TimeSlotGrid slots={previewSlots} selected={null} onSelect={() => {}} />
              </div>
            )}
          </div>
        </div>

      </div>

      <BlockSlotSheet proId={proId} open={blockOpen} onClose={() => setBlockOpen(false)} />
      <VacationSheet proId={proId} open={vacOpen} onClose={() => setVacOpen(false)} />
    </PageShell>
  )
}
