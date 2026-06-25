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
  const { services, fetchServices, fetchSlots, getSlotsForDate, isDateAvailable, confirmBooking } = useOfficialServiceStore()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [toastVisible, setToastVisible] = useState(false)

  const service = services.find((s) => s.id === id)

  useEffect(() => {
    if (services.length === 0) fetchServices()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
