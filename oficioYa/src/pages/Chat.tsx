import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, ArrowDown } from 'lucide-react'
import { ChatBubble } from '../components/chat/ChatBubble'
import { ChatInput } from '../components/chat/ChatInput'
import { useChatStore } from '../store/chatStore'
import { useRequestStore } from '../store/requestStore'
import { useProRequestsStore } from '../store/proRequestsStore'
import { useAuthStore } from '../store/authStore'
import { chatService, type Conversation, type Message, type NewMessage } from '../services/chatService'
import { otherParticipant } from '../lib/chatParticipants'

type UIMessage = Message & { _error?: boolean; _pending?: NewMessage }

const NEAR_BOTTOM_PX = 80

function tempId() {
  return `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

export default function Chat() {
  const { conversationId: convParam, id: requestParam } = useParams<{ conversationId?: string; id?: string }>()
  const navigate = useNavigate()

  const user = useAuthStore((s) => s.user)
  const userId = user?.id ?? ''
  const reloadConversations = useChatStore((s) => s.load)

  const clientRequests = useRequestStore((s) => s.requests)
  const loadClient = useRequestStore((s) => s.loadRequests)
  const proRequests = useProRequestsStore((s) => s.requests)
  const loadPro = useProRequestsStore((s) => s.load)

  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<UIMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [newCount, setNewCount] = useState(0)

  const scrollRef = useRef<HTMLDivElement>(null)
  const atBottomRef = useRef(true)

  // Cargar las solicitudes (para resolver la conversación desde una solicitud y el job card)
  useEffect(() => {
    if (user?.role === 'professional' && user.id) loadPro(user.id)
    else loadClient()
  }, [user, loadClient, loadPro])

  // ── Resolver la conversación (por id directo o por solicitud) ────────────────
  useEffect(() => {
    let active = true
    async function resolve() {
      setLoading(true)
      let conv: Conversation | null = null
      if (convParam) {
        conv = await chatService.getConversation(convParam)
      } else if (requestParam) {
        const all = user?.role === 'professional' ? proRequests : clientRequests
        const req = all.find((r) => r.id === requestParam)
        if (req && req.professional_id) {
          conv = await chatService.getOrCreateConversation({
            clientId: req.client_id ?? userId,
            professionalId: req.professional_id,
            serviceRequestId: req.id,
          })
        }
      }
      if (!active) return
      if (!conv) { setNotFound(true); setLoading(false); return }
      setConversation(conv)
      const msgs = await chatService.getMessages(conv.id)
      if (!active) return
      setMessages(msgs)
      setLoading(false)
      // markAsRead + refrescar badge de la nav
      await chatService.markAsRead(conv.id, userId)
      if (userId) reloadConversations(userId)
    }
    resolve()
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convParam, requestParam, clientRequests, proRequests])

  const scrollToBottom = useCallback((smooth = false) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
    setNewCount(0)
  }, [])

  // Scroll al fondo al abrir (instantáneo)
  useEffect(() => {
    if (!loading && messages.length) requestAnimationFrame(() => scrollToBottom(false))
    // solo al terminar de cargar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  // ── Suscripción en tiempo real ───────────────────────────────────────────────
  useEffect(() => {
    if (!conversation) return
    const unsub = chatService.subscribeToMessages(conversation.id, (event) => {
      if (event.kind === 'status') {
        setMessages((prev) => prev.map((m) => (m.id === event.messageId ? { ...m, status: event.status } : m)))
        return
      }
      // nuevo mensaje
      setMessages((prev) => {
        if (prev.some((m) => m.id === event.message.id)) return prev
        return [...prev, event.message]
      })
      const isMine = event.message.sender_id === userId
      if (isMine || atBottomRef.current) {
        requestAnimationFrame(() => scrollToBottom(true))
      } else {
        setNewCount((n) => n + 1)
      }
      // si el que llega es del otro y estoy en el chat, marcar leído
      if (!isMine) {
        chatService.markAsRead(conversation.id, userId).then(() => { if (userId) reloadConversations(userId) })
      }
    })
    return unsub
  }, [conversation, userId, scrollToBottom, reloadConversations])

  function onScroll() {
    const el = scrollRef.current
    if (!el) return
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX
    atBottomRef.current = nearBottom
    if (nearBottom && newCount) setNewCount(0)
  }

  // ── Envío optimista ──────────────────────────────────────────────────────────
  const send = useCallback(async (payload: NewMessage) => {
    if (!conversation) return
    const tid = tempId()
    const optimistic: UIMessage = {
      id: tid,
      conversation_id: conversation.id,
      sender_id: payload.sender_id,
      type: payload.type,
      content: payload.content,
      image_url: payload.image_url ?? null,
      status: 'sending',
      created_at: new Date().toISOString(),
      _pending: payload,
    }
    setMessages((prev) => [...prev, optimistic])
    requestAnimationFrame(() => scrollToBottom(true))
    try {
      const saved = await chatService.sendMessage(conversation.id, payload)
      setMessages((prev) => prev.map((m) => (m.id === tid ? saved : m)))
    } catch {
      setMessages((prev) => prev.map((m) => (m.id === tid ? { ...m, status: 'sending', _error: true } : m)))
    }
  }, [conversation, scrollToBottom])

  function retry(m: UIMessage) {
    if (!m._pending) return
    setMessages((prev) => prev.filter((x) => x.id !== m.id))
    send(m._pending)
  }

  // ── Header ───────────────────────────────────────────────────────────────────
  const other = conversation ? otherParticipant(conversation, userId) : null

  const header = (
    <div
      className="flex items-center gap-3 px-4"
      style={{ background: '#E8683A', paddingTop: 'calc(12px + var(--safe-top, 0px))', paddingBottom: 14, flexShrink: 0 }}
    >
      <button type="button" onClick={() => navigate(-1)} className="p-1 -ml-1 rounded-full active:opacity-60 flex-shrink-0" aria-label="Volver">
        <ChevronLeft size={24} color="white" />
      </button>
      <div
        className="flex-shrink-0 flex items-center justify-center font-black text-sm relative overflow-hidden"
        style={{ width: 38, height: 38, borderRadius: '50%', background: other?.avatarUrl ? 'transparent' : 'rgba(255,255,255,0.25)', border: '1.5px solid rgba(255,255,255,0.4)', color: 'white' }}
      >
        {other?.avatarUrl ? <img src={other.avatarUrl} alt={other.name} className="w-full h-full object-cover" /> : (other?.initials ?? '?')}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-white truncate leading-tight">{other?.name ?? 'Chat'}</p>
        {other?.subtitle && (
          <p className="text-[10px] capitalize truncate" style={{ color: 'rgba(255,255,255,0.65)' }}>{other.subtitle}</p>
        )}
      </div>
    </div>
  )

  // ── Estados ──────────────────────────────────────────────────────────────────
  if (notFound) {
    return (
      <div style={{ background: '#F5F0E8', height: '100dvh', display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto' }}>
        {header}
        <div className="flex flex-col items-center gap-4 py-24 text-center px-6 flex-1">
          <p className="font-black text-base" style={{ color: '#111' }}>Conversación no encontrada</p>
          <button type="button" onClick={() => navigate('/mensajes')} className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: 'rgba(232,104,58,.12)', color: '#E8683A' }}>
            Ir a Mensajes
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#F5F0E8', height: '100dvh', display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto', position: 'relative' }}>
      {header}

      {/* Mensajes */}
      <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto px-4 py-3">
        {loading ? (
          <div className="flex flex-col gap-2">
            {[70, 55, 60].map((w, i) => (
              <div key={i} className={i % 2 ? 'self-end' : 'self-start'} style={{ width: `${w}%`, height: 38, borderRadius: 14, background: 'linear-gradient(90deg,#EDE8DE 25%,#F5F0E8 50%,#EDE8DE 75%)', backgroundSize: '200% 100%', animation: `shimmer 1.4s ease-in-out ${i * 0.15}s infinite` }} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {messages.map((m) => (
              <ChatBubble
                key={m.id}
                message={m}
                isOwn={m.sender_id === userId}
                error={m._error}
                onRetry={() => retry(m)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Botón "nuevos mensajes" */}
      {newCount > 0 && (
        <button
          type="button"
          onClick={() => scrollToBottom(true)}
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-2 rounded-full text-white text-xs font-bold active:scale-95 transition-transform"
          style={{ bottom: 'calc(74px + var(--kb-inset, 0px))', background: '#E8683A', boxShadow: '0 4px 14px rgba(232,104,58,.4)' }}
        >
          <ArrowDown size={14} /> {newCount} mensaje{newCount !== 1 ? 's' : ''} nuevo{newCount !== 1 ? 's' : ''}
        </button>
      )}

      {/* Input */}
      <ChatInput
        disabled={!conversation}
        onSendText={(text) => send({ sender_id: userId, type: 'text', content: text })}
        onSendImage={(url) => send({ sender_id: userId, type: 'image', content: url, image_url: url })}
      />
    </div>
  )
}
