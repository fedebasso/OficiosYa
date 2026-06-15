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
