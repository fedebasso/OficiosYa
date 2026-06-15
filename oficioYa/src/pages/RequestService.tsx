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
