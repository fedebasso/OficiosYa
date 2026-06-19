import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { useChatStore } from '../store/chatStore'
import { useRequestStore } from '../store/requestStore'
import { useAuthStore } from '../store/authStore'
import { PageShell } from '../components/layout/PageShell'
import { IS_DEMO_MODE } from '../lib/env'
import { MOCK_PROFESSIONALS } from '../data/mockProfessionals'
import { getCategoryMeta } from '../lib/categories'
import { getInitials } from '../lib/utils'
import { fadeUp, staggerFast } from '../lib/motion'

const STATUS_DOT: Record<string, string> = {
  confirmed:   '#22c55e',
  in_progress: '#8b5cf6',
  completed:   '#AAAAAA',
}

const STATUS_LABEL: Record<string, string> = {
  confirmed:   'Confirmado',
  in_progress: 'En camino',
  completed:   'Completado',
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Ahora'
  if (m < 60) return `hace ${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `hace ${h}h`
  return `hace ${Math.floor(h / 24)}d`
}

function lastMessagePreview(type: string, content: string) {
  if (type === 'image') return '📷 Foto'
  if (type === 'audio') return '🎙️ Audio'
  return content.length > 45 ? content.slice(0, 45) + '…' : content
}

export default function Mensajes() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const requests = useRequestStore((s) => s.requests)
  const loadRequests = useRequestStore((s) => s.loadRequests)
  const { messagesByRequest, initMock } = useChatStore()

  useEffect(() => { loadRequests() }, [loadRequests])

  // Solicitudes con chat activo: confirmadas, en curso o completadas
  const chatRequests = requests.filter((r) => {
    const hasStatus = r.status === 'confirmed' || r.status === 'in_progress' || r.status === 'completed'
    if (!hasStatus) return false
    // En demo mode mostramos todo; en prod filtramos por client_id
    if (IS_DEMO_MODE) return true
    return r.client_id === user?.id
  })

  // Inicializar mensajes mock para cada request activa (preview)
  useEffect(() => {
    chatRequests.forEach((r) => {
      if (!messagesByRequest[r.id]) initMock(r.id)
    })
  }, [chatRequests.length])

  const header = (
    <div
      className="px-5 pt-12 pb-4 sticky top-0 z-50"
      style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E0D4' }}
    >
      <h1 className="text-2xl font-black" style={{ color: '#111111', letterSpacing: '-0.5px' }}>
        Mensajes
      </h1>
      {chatRequests.length > 0 && (
        <p className="text-xs mt-0.5" style={{ color: '#AAAAAA' }}>
          {chatRequests.length} conversación{chatRequests.length !== 1 ? 'es' : ''} activa{chatRequests.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )

  return (
    <PageShell header={header} showBottomNav={false}>
      {chatRequests.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center px-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: '#FEF0EA', border: '1.5px solid #FDDCC8' }}
          >
            <MessageCircle size={24} style={{ color: '#E8683A' }} />
          </div>
          <div>
            <p className="font-black text-sm" style={{ color: '#111111' }}>
              Aún no tenés conversaciones
            </p>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: '#AAAAAA' }}>
              Los chats aparecen cuando un profesional acepta tu solicitud
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/buscar')}
            className="px-5 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: '#E8683A', color: '#fff' }}
          >
            Buscar profesionales
          </button>
        </div>
      ) : (
        <motion.div
          variants={staggerFast}
          initial="hidden"
          animate="visible"
          className="flex flex-col"
        >
          {chatRequests.map((req) => {
            const pro = MOCK_PROFESSIONALS.find((p) => p.id === req.professional_id)
            const proName = pro?.profiles?.full_name ?? 'Profesional'
            const proAvatar = pro?.profiles?.avatar_url
            const proInitials = getInitials(proName)
            const { emoji, label } = getCategoryMeta(req.category)
            const messages = messagesByRequest[req.id] ?? []
            const last = messages[messages.length - 1]
            const dotColor = STATUS_DOT[req.status] ?? '#AAAAAA'
            const statusLabel = STATUS_LABEL[req.status] ?? req.status

            return (
              <motion.button
                key={req.id}
                variants={fadeUp}
                type="button"
                onClick={() => navigate(`/solicitud/${req.id}/chat`)}
                className="flex items-center gap-3 px-4 py-3.5 text-left w-full active:bg-[#F5F0E8] transition-colors"
                style={{ borderBottom: '1px solid #F0EBE3' }}
              >
                {/* Avatar profesional */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-13 h-13 rounded-full overflow-hidden flex items-center justify-center font-bold text-sm"
                    style={{
                      width: 52, height: 52,
                      background: proAvatar ? undefined : 'linear-gradient(135deg, #f5b99a, #E8683A)',
                      color: '#fff',
                      border: '2px solid #EDE8DE',
                    }}
                  >
                    {proAvatar
                      ? <img src={proAvatar} alt={proName} className="w-full h-full object-cover" />
                      : proInitials
                    }
                  </div>
                  {/* Dot de estado */}
                  <span
                    className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full"
                    style={{ background: dotColor, border: '2px solid #FFFFFF' }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-black truncate" style={{ color: '#111111' }}>
                      {proName}
                    </p>
                    {last && (
                      <span className="text-[10px] flex-shrink-0 ml-2" style={{ color: '#BBBBBB' }}>
                        {timeAgo(last.createdAt)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                      style={{ background: 'rgba(232,104,58,0.1)', color: '#E8683A' }}
                    >
                      {emoji} {label}
                    </span>
                    <span className="text-[10px] font-semibold" style={{ color: dotColor }}>
                      · {statusLabel}
                    </span>
                  </div>
                  <p className="text-xs truncate" style={{ color: '#888888' }}>
                    {last
                      ? lastMessagePreview(last.type, last.content)
                      : 'Tocá para abrir el chat'
                    }
                  </p>
                </div>

                {/* Chevron */}
                <span style={{ color: '#DDD', fontSize: 18, flexShrink: 0 }}>›</span>
              </motion.button>
            )
          })}
        </motion.div>
      )}
    </PageShell>
  )
}
