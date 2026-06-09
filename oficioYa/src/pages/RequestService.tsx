import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { RequestForm } from '../components/requests/RequestForm'
import { useProfessionalById } from '../hooks/useProfessionals'
import { useRequestStore } from '../store/requestStore'
import { getCategoryMeta } from '../lib/categories'
import { getInitials } from '../lib/utils'

export default function RequestService() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { professional } = useProfessionalById(id ?? '')
  const addRequest = useRequestStore((s) => s.addRequest)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [whatsappUrl, setWhatsappUrl] = useState('')

  const handleSubmit = async (data: { description: string; contact_phone: string; urgency: boolean }) => {
    if (!professional) return
    setLoading(true)
    try {
      await addRequest({
        professional_id: professional.id,
        category: professional.categories[0] ?? '',
        description: data.description,
        urgency: data.urgency,
        contact_phone: data.contact_phone,
      })
      const message = encodeURIComponent(
        `Hola! Vi tu perfil en OficioYa y necesito tu ayuda.\n\n${data.description}\n\nMi teléfono: ${data.contact_phone}`
      )
      setWhatsappUrl(`https://wa.me/${professional.whatsapp}?text=${message}`)
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  const { emoji, label } = getCategoryMeta(professional?.categories[0] ?? '')

  const header = (
    <div className="px-4 pt-10 pb-4 sticky top-0 z-50" style={{ background: '#0f0f0f', borderBottom: '1px solid #1e1e1e' }}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-base"
          style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#f5f0e8' }}
        >
          ←
        </button>
        <div>
          <h1 className="text-base font-black leading-tight" style={{ color: '#f5f0e8' }}>Solicitar servicio</h1>
          {professional && (
            <p className="text-xs mt-0.5" style={{ color: '#888' }}>
              {emoji} {label} · {professional.profiles.full_name}
            </p>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <PageShell showBottomNav={false} header={header}>
      <div className="p-4 flex flex-col gap-4" style={{ background: '#0f0f0f', minHeight: '100%' }}>

        {!sent ? (
          <>
            {/* Mini card del profesional */}
            {professional && (
              <div
                className="flex items-center gap-3 rounded-2xl p-3.5"
                style={{ background: '#141414', border: '1px solid #1e1e1e' }}
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
                    style={{ background: 'linear-gradient(135deg,#2a1f10,#e8683a)' }}
                  >
                    {getInitials(professional.profiles.full_name)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate" style={{ color: '#f5f0e8' }}>
                    {professional.profiles.full_name}
                  </div>
                  <div className="text-xs font-medium mt-0.5" style={{ color: '#e8683a' }}>
                    {emoji} {label} · {professional.zone}
                  </div>
                </div>
                {professional.avg_rating != null && (
                  <div className="text-sm font-black flex-shrink-0" style={{ color: '#f5f0e8' }}>
                    <span style={{ color: '#f59e0b' }}>★</span> {professional.avg_rating}
                  </div>
                )}
              </div>
            )}

            <RequestForm onSubmit={handleSubmit} loading={loading} />
          </>
        ) : (
          /* Success state */
          <div className="flex flex-col items-center gap-5 py-10 text-center">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
              style={{ background: 'rgba(232,104,58,.12)', border: '1px solid rgba(232,104,58,.25)' }}
            >
              ✅
            </div>
            <div>
              <h2 className="text-xl font-black mb-2" style={{ color: '#f5f0e8' }}>¡Solicitud enviada!</h2>
              <p className="text-sm leading-relaxed" style={{ color: '#888' }}>
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
              style={{ background: '#1a1a1a', color: '#f5f0e8', border: '1px solid #2a2a2a' }}
            >
              Ver mis solicitudes
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-sm font-bold active:opacity-70"
              style={{ color: '#555' }}
            >
              Volver al inicio
            </button>
          </div>
        )}

      </div>
    </PageShell>
  )
}
