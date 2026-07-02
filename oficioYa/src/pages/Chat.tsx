import { createElement, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, MapPin, Calendar, Clock, CheckCircle2, Navigation, Flag } from 'lucide-react'
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
import { getCategoryMeta } from '../lib/categories'

const STATUS_LABEL: Record<string, string> = {
  pending:     'Pendiente',
  confirmed:   'Confirmado',
  in_progress: 'En camino',
  completed:   'Completado',
}

const STATUS_ICON: Record<string, typeof Clock> = {
  pending:     Clock,
  confirmed:   CheckCircle2,
  in_progress: Navigation,
  completed:   Flag,
}

function formatScheduledDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

export default function Chat() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const bottomRef = useRef<HTMLDivElement>(null)

  const user = useAuthStore((s) => s.user)
  const { requests: clientRequests, loadRequests } = useRequestStore()
  const proRequests = useProRequestsStore((s) => s.requests)
  const loadProRequests = useProRequestsStore((s) => s.load)
  const { getMessages, sendTextMessage, sendImageMessage, sendAudioMessage, initMock } = useChatStore()

  const allRequests = user?.role === 'professional' ? proRequests : clientRequests
  const req = allRequests.find((r) => r.id === id)
  const messages = id ? getMessages(id) : []

  const pro = MOCK_PROFESSIONALS.find((p) => p.id === req?.professional_id)
  const proName     = pro?.profiles?.full_name ?? 'Profesional'
  const proAvatar   = pro?.profiles?.avatar_url
  const proInitials = getInitials(proName)
  const categoryMeta = getCategoryMeta(req?.category ?? '')

  useEffect(() => {
    if (user?.role === 'professional' && user.id) loadProRequests(user.id)
    else loadRequests()
  }, [user, loadRequests, loadProRequests])

  useEffect(() => {
    if (id) initMock(id)
  }, [id, initMock])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  // ── Error state ──────────────────────────────────────────────
  if (!req || !id) {
    const errHeader = (
      <div
        className="flex items-center gap-3 px-4"
        style={{
          background: '#E8683A',
          paddingTop: 'calc(12px + var(--safe-top, 0px))',
          paddingBottom: 14,
          minHeight: 64,
        }}
      >
        <button type="button" onClick={() => navigate(-1)} className="p-1 -ml-1 rounded-full active:opacity-60">
          <ChevronLeft size={24} color="white" />
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

  // ── Header ────────────────────────────────────────────────────
  const header = (
    <div
      className="flex items-center gap-3 px-4"
      style={{
        background: '#E8683A',
        paddingTop: 'calc(12px + var(--safe-top, 0px))',
        paddingBottom: 14,
        flexShrink: 0,
      }}
    >
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="p-1 -ml-1 rounded-full active:opacity-60 flex-shrink-0"
      >
        <ChevronLeft size={24} color="white" />
      </button>

      {/* Avatar */}
      <div
        className="flex-shrink-0 flex items-center justify-center font-black text-sm relative"
        style={{
          width: 38, height: 38, borderRadius: '50%',
          background: proAvatar ? 'transparent' : 'rgba(255,255,255,0.25)',
          border: '1.5px solid rgba(255,255,255,0.4)',
          color: 'white',
          overflow: 'hidden',
        }}
      >
        {proAvatar
          ? <img src={proAvatar} alt={proName} className="w-full h-full object-cover" />
          : proInitials
        }
        {/* Online dot */}
        <span
          style={{
            position: 'absolute', bottom: 1, right: 1,
            width: 9, height: 9, borderRadius: '50%',
            background: '#4ADE80',
            border: '1.5px solid #E8683A',
          }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-white truncate leading-tight">{proName}</p>
        <p className="text-[10px] capitalize truncate" style={{ color: 'rgba(255,255,255,0.65)' }}>
          {categoryMeta.label}
        </p>
      </div>

      {/* Status badge */}
      {req.status !== 'cancelled' && (
        <div
          className="px-2 py-1 rounded-lg text-[9px] font-bold flex-shrink-0 inline-flex items-center gap-1"
          style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
        >
          {createElement(STATUS_ICON[req.status] ?? Clock, { size: 10 })}
          {STATUS_LABEL[req.status] ?? req.status}
        </div>
      )}
    </div>
  )

  // ── Tarjeta trabajo ───────────────────────────────────────────
  const jobCard = (
    <div
      className="flex items-center gap-2 px-4 py-2.5 flex-wrap"
      style={{ background: '#FFFFFF', borderBottom: '1px solid #EDE8DE', flexShrink: 0 }}
    >
      {req.address && (
        <>
          <div className="flex items-center gap-1" style={{ fontSize: 11, color: '#555', fontWeight: 500 }}>
            <MapPin size={11} style={{ color: '#E8683A', flexShrink: 0 }} />
            <span className="truncate" style={{ maxWidth: 130 }}>{req.address}</span>
          </div>
          <span style={{ color: '#DDD', fontSize: 11 }}>·</span>
        </>
      )}
      {req.scheduled_date && (
        <>
          <div className="flex items-center gap-1" style={{ fontSize: 11, color: '#555', fontWeight: 500 }}>
            <Calendar size={11} style={{ color: '#E8683A', flexShrink: 0 }} />
            <span>{formatScheduledDate(req.scheduled_date)}</span>
          </div>
          <span style={{ color: '#DDD', fontSize: 11 }}>·</span>
        </>
      )}
      <span
        className="font-bold"
        style={{
          fontSize: 10,
          background: 'rgba(232,104,58,0.12)',
          color: '#E8683A',
          padding: '3px 8px',
          borderRadius: 6,
        }}
      >
        {categoryMeta.emoji} {categoryMeta.label}
      </span>
    </div>
  )

  return (
    <div
      style={{
        background: '#F5F0E8',
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 480,
        margin: '0 auto',
      }}
    >
      {header}
      {jobCard}

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <motion.div
          variants={staggerFast}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-2"
        >
          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg}
              isOwn={msg.senderRole === (user?.role === 'professional' ? 'pro' : 'client')}
            />
          ))}
          <div ref={bottomRef} />
        </motion.div>
      </div>

      {/* Input */}
      <ChatInput
        onSendText={(text) => sendTextMessage(id, user?.role === 'professional' ? 'pro' : 'client', senderName, text)}
        onSendImage={(url, fileName) => sendImageMessage(id, user?.role === 'professional' ? 'pro' : 'client', senderName, url, fileName)}
        onSendAudio={(blobUrl, duration) => sendAudioMessage(id, user?.role === 'professional' ? 'pro' : 'client', senderName, blobUrl, duration)}
      />
    </div>
  )
}
