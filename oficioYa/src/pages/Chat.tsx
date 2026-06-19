// src/pages/Chat.tsx
import { useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageShell } from '../components/layout/PageShell'
import { ChatBubble } from '../components/chat/ChatBubble'
import { ChatInput } from '../components/chat/ChatInput'
import { useChatStore } from '../store/chatStore'
import { useRequestStore } from '../store/requestStore'
import { useProRequestsStore } from '../store/proRequestsStore'
import { useAuthStore } from '../store/authStore'
import { staggerFast } from '../lib/motion'
import { MOCK_PROFESSIONALS } from '../data/mockProfessionals'

const STATUS_LABEL: Record<string, string> = {
  pending:     '⏳ Pendiente',
  confirmed:   '✅ Confirmado',
  in_progress: '🚗 En camino',
  completed:   '🏁 Completado',
}

export default function Chat() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const bottomRef = useRef<HTMLDivElement>(null)

  const user = useAuthStore((s) => s.user)
  const { requests: clientRequests } = useRequestStore()
  const proRequests = useProRequestsStore((s) => s.requests)
  const { getMessages, sendTextMessage, sendImageMessage, sendAudioMessage, initMock } = useChatStore()

  // El pro ve sus solicitudes, el cliente ve las suyas
  const allRequests = user?.role === 'professional' ? proRequests : clientRequests
  const req = allRequests.find((r) => r.id === id)
  const messages = id ? getMessages(id) : []

  // Nombre y avatar del profesional desde mock
  const pro = MOCK_PROFESSIONALS.find((p) => p.id === req?.professional_id)
  const proName    = pro?.profiles?.full_name ?? 'Profesional'
  const proInitials = proName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  const proCategory = pro?.categories?.[0] ?? req?.category ?? ''

  useEffect(() => {
    if (id) initMock(id)
  }, [id, initMock])

  // Scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  if (!req || !id) {
    const errHeader = (
      <div
        className="px-5 sticky top-0 z-50 flex items-center gap-3"
        style={{ background: '#0F6E56', paddingTop: 'calc(12px + var(--safe-top))', paddingBottom: 12, minHeight: 56 }}
      >
        <button type="button" onClick={() => navigate(-1)} className="p-1 -ml-1 rounded-full active:opacity-60">
          <ChevronLeft size={24} color="#9FE1CB" />
        </button>
        <span className="text-sm font-black text-white">Chat</span>
      </div>
    )
    return (
      <PageShell showBottomNav={false} header={errHeader}>
        <div className="flex flex-col items-center gap-4 py-24 text-center px-6">
          <p className="font-black text-base" style={{ color: '#111' }}>Solicitud no encontrada</p>
          <button
            type="button"
            onClick={() => navigate('/mensajes')}
            className="px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: 'rgba(232,104,58,.12)', color: '#E8683A' }}
          >
            Ir a Mensajes
          </button>
        </div>
      </PageShell>
    )
  }

  const senderName = user?.full_name ?? 'Vos'

  const header = (
    <div
      className="px-4 pt-10 pb-3 sticky top-0 z-50 flex items-center gap-3"
      style={{ background: '#0F6E56' }}
    >
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="p-1 -ml-1 rounded-full active:opacity-60 flex-shrink-0"
      >
        <ChevronLeft size={24} color="#9FE1CB" />
      </button>

      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
        style={{ background: '#9FE1CB', color: '#0F6E56' }}
      >
        {proInitials}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-white truncate">{proName}</p>
        <p className="text-[10px] truncate capitalize" style={{ color: '#9FE1CB' }}>
          {proCategory} · Solicitud #{id.slice(-4)}
        </p>
      </div>

      {req.status !== 'cancelled' && (
        <div
          className="px-2 py-1 rounded-lg text-[9px] font-bold flex-shrink-0"
          style={{ background: 'rgba(159,225,203,.2)', color: '#9FE1CB' }}
        >
          {STATUS_LABEL[req.status] ?? req.status}
        </div>
      )}
    </div>
  )

  return (
    <PageShell showBottomNav={false} header={header}>
      <div className="flex flex-col h-full">

        {/* Lista de mensajes */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <motion.div
            variants={staggerFast}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-2"
          >
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}
            <div ref={bottomRef} />
          </motion.div>
        </div>

        {/* Input pegado al fondo */}
        <ChatInput
          onSendText={(text) =>
            sendTextMessage(id, 'client', senderName, text)
          }
          onSendImage={(url, fileName) =>
            sendImageMessage(id, 'client', senderName, url, fileName)
          }
          onSendAudio={(blobUrl, duration) =>
            sendAudioMessage(id, 'client', senderName, blobUrl, duration)
          }
        />
      </div>
    </PageShell>
  )
}
