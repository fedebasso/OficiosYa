// src/pages/TicketConfirm.tsx
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageShell } from '../components/layout/PageShell'
import { SPRING_GENTLE } from '../lib/motion'
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

const CONFETTI_COLORS = ['#E8683A', '#25D366', '#F59E0B', '#EF4444', '#E8683A', '#25D366', '#F59E0B', '#A78BFA']

function Confetti() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {CONFETTI_COLORS.map((color, i) => (
        <motion.div
          key={i}
          initial={{ y: -20, x: `${10 + i * 11}%`, opacity: 1, rotate: i * 45 }}
          animate={{ y: 120, opacity: 0, rotate: i * 90 + 360 }}
          transition={{ duration: 0.8 + (i % 3) * 0.2, delay: i * 0.05, ease: 'easeIn' }}
          style={{
            position: 'absolute',
            top: 0,
            width: 8,
            height: 8,
            borderRadius: i % 2 === 0 ? '50%' : 2,
            background: color,
          }}
        />
      ))}
    </div>
  )
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

  const hasState = state !== null
  useEffect(() => {
    if (!hasState) navigate('/ticket')
  }, [hasState, navigate])

  if (!state) return null

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
      <AnimatePresence mode="wait">
        {!sent ? (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="p-4 flex flex-col gap-4"
            style={{ minHeight: '100%' }}
          >
            {/* Mini card del profesional */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, ...SPRING_GENTLE }}
              className="flex items-center gap-3 rounded-2xl p-3.5"
              style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}
            >
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
            </motion.div>

            {/* Resumen del ticket */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, ...SPRING_GENTLE }}
              className="rounded-2xl overflow-hidden"
              style={{ border: '1.5px solid #E8E0D4' }}
            >
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
            </motion.div>

            {/* Teléfono */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, ...SPRING_GENTLE }}
              className="flex flex-col gap-2"
            >
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
              <AnimatePresence>
                {phoneError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs"
                    style={{ color: '#ef4444' }}
                  >
                    {phoneError}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Submit */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, ...SPRING_GENTLE }}
            >
              <motion.button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                whileTap={{ scale: 0.97 }}
                animate={{ scale: loading ? 0.98 : 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="w-full rounded-2xl py-4 text-base font-bold text-white disabled:opacity-50"
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
              </motion.button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-5 py-10 text-center p-4 relative"
            style={{ minHeight: '100%' }}
          >
            <Confetti />

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ type: 'spring', stiffness: 500, damping: 30, delay: 0.1 }}
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl relative z-10"
              style={{ background: 'rgba(232,104,58,.12)', border: '1px solid rgba(232,104,58,.25)' }}
            >
              ✅
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, ...SPRING_GENTLE }}
              className="relative z-10"
            >
              <h2 className="text-xl font-black mb-2" style={{ color: '#111111' }}>¡Solicitud enviada!</h2>
              <p className="text-sm leading-relaxed" style={{ color: '#555555' }}>
                El profesional recibirá tu solicitud. También podés contactarlo directamente por WhatsApp.
              </p>
            </motion.div>

            <motion.button
              type="button"
              onClick={() => window.open(whatsappUrl, '_blank')}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, ...SPRING_GENTLE }}
              whileTap={{ scale: 0.97 }}
              className="w-full rounded-2xl py-4 text-base font-bold text-white relative z-10"
              style={{ background: '#25D366', boxShadow: '0 4px 14px rgba(37,211,102,.2)' }}
            >
              💬 Contactar por WhatsApp
            </motion.button>

            <motion.button
              type="button"
              onClick={() => navigate('/mis-solicitudes')}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42, ...SPRING_GENTLE }}
              whileTap={{ scale: 0.97 }}
              className="w-full rounded-2xl py-3.5 text-sm font-bold relative z-10"
              style={{ background: '#EDE8DE', color: '#111111', border: '1.5px solid #E8E0D4' }}
            >
              Ver mis solicitudes
            </motion.button>

            <motion.button
              type="button"
              onClick={() => navigate('/')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.2 }}
              className="text-sm font-bold relative z-10"
              style={{ color: '#999999' }}
            >
              Volver al inicio
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  )
}
