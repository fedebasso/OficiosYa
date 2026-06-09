import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { PageShell } from '../components/layout/PageShell'
import { Header } from '../components/layout/Header'
import { RequestForm } from '../components/requests/RequestForm'
import { Button } from '../components/ui/Button'
import { useProfessionalById } from '../hooks/useProfessionals'
import { useRequestStore } from '../store/requestStore'

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

  return (
    <PageShell
      showBottomNav={false}
      header={<Header title="Solicitar servicio" showBack onBack={() => navigate(-1)} />}
    >
      <div className="p-4">
        {!sent ? (
          <>
            {professional && (
              <p className="text-sm text-text-secondary mb-4">
                Enviando solicitud a <strong>{professional.profiles.full_name}</strong>
              </p>
            )}
            <RequestForm onSubmit={handleSubmit} loading={loading} />
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <CheckCircle size={56} className="text-primary" />
            <h2 className="font-semibold text-lg text-text-main">¡Solicitud enviada!</h2>
            <p className="text-sm text-text-secondary">
              El profesional recibirá tu solicitud. También podés contactarlo directamente por WhatsApp.
            </p>
            <Button variant="primary" fullWidth onClick={() => window.open(whatsappUrl, '_blank')}>
              Contactar por WhatsApp
            </Button>
            <Button variant="ghost" onClick={() => navigate('/')}>
              Volver al inicio
            </Button>
          </div>
        )}
      </div>
    </PageShell>
  )
}
