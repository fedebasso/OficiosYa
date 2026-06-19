import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChatStore } from '../store/chatStore'
import { useRequestStore } from '../store/requestStore'
import { useAuthStore } from '../store/authStore'
import { PageShell } from '../components/layout/PageShell'
import { MessageCircle } from 'lucide-react'

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Ahora'
  if (m < 60) return `hace ${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `hace ${h}h`
  return `hace ${Math.floor(h / 24)}d`
}

export default function Mensajes() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const requests = useRequestStore((s) => s.requests)
  const loadRequests = useRequestStore((s) => s.loadRequests)

  useEffect(() => {
    loadRequests()
  }, [])
  const messagesByRequest = useChatStore((s) => s.messagesByRequest)

  // Solo solicitudes con chat activo (confirmed o in_progress) del cliente actual
  const activeRequests = requests.filter(
    (r) =>
      (r.status === 'confirmed' || r.status === 'in_progress' || r.status === 'completed') &&
      r.client_id === (user?.id ?? null) &&
      messagesByRequest[r.id]
  )

  const header = (
    <div
      className="px-5 pt-12 pb-4 sticky top-0 z-50"
      style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E0D4' }}
    >
      <h1 className="text-2xl font-black" style={{ color: '#111111', letterSpacing: '-0.5px' }}>
        Mensajes
      </h1>
    </div>
  )

  return (
    <PageShell header={header} showBottomNav={false}>
      <div className="flex flex-col gap-2 py-4">
        {activeRequests.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}
            >
              <MessageCircle size={24} style={{ color: '#CCCCCC' }} />
            </div>
            <div>
              <p className="font-black text-sm" style={{ color: '#111111' }}>
                Aún no tenés conversaciones
              </p>
              <p className="text-xs mt-1" style={{ color: '#AAAAAA' }}>
                Los chats aparecen cuando un profesional acepta tu solicitud
              </p>
            </div>
          </div>
        ) : (
          activeRequests.map((req) => {
            const messages = messagesByRequest[req.id] ?? []
            const last = messages[messages.length - 1]
            return (
              <button
                key={req.id}
                type="button"
                onClick={() => navigate(`/solicitud/${req.id}/chat`)}
                className="flex items-center gap-3 px-4 py-3 text-left transition-opacity active:opacity-60"
                style={{ background: '#FFFFFF', borderBottom: '1px solid #F5F0E8' }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: '#FEF0EA', border: '2px solid #FDDCC8' }}
                >
                  🔧
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-bold truncate" style={{ color: '#111111' }}>
                      {req.category?.replace('_', ' ') ?? 'Servicio'}
                    </p>
                    {last && (
                      <span className="text-[10px] flex-shrink-0 ml-2" style={{ color: '#AAAAAA' }}>
                        {timeAgo(last.createdAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs truncate" style={{ color: '#888888' }}>
                    {last
                      ? last.type === 'text'
                        ? last.content
                        : last.type === 'image'
                        ? '📷 Foto'
                        : '🎙️ Audio'
                      : 'Sin mensajes aún'}
                  </p>
                </div>
              </button>
            )
          })
        )}
      </div>
    </PageShell>
  )
}
