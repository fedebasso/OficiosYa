import { createElement, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, MessageCircle, Search, MapPin, Image as ImageIcon, Mic } from 'lucide-react'
import { getCategoryIcon } from '../lib/categories'
import { useChatStore } from '../store/chatStore'
import { useRequestStore } from '../store/requestStore'
import { useProRequestsStore } from '../store/proRequestsStore'
import { useAuthStore } from '../store/authStore'
import { IS_DEMO_MODE } from '../lib/env'
import { MOCK_PROFESSIONALS } from '../data/mockProfessionals'
import { getCategoryMeta } from '../lib/categories'
import { getInitials } from '../lib/utils'
import { fadeUp, staggerFast } from '../lib/motion'

// ── Metadatos de estado ────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  pending:     { label: 'Pendiente',  color: '#D97706', bg: 'rgba(245,158,11,.12)', dot: '#F59E0B' },
  confirmed:   { label: 'Confirmado', color: '#16A34A', bg: 'rgba(34,197,94,.12)',  dot: '#22C55E' },
  in_progress: { label: 'En camino',  color: '#7C3AED', bg: 'rgba(139,92,246,.12)', dot: '#8B5CF6' },
  completed:   { label: 'Finalizado', color: '#6B7280', bg: 'rgba(107,114,128,.12)', dot: '#9CA3AF' },
  cancelled:   { label: 'Cancelado',  color: '#DC2626', bg: 'rgba(239,68,68,.12)',  dot: '#EF4444' },
}

// ── Helpers ────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Ahora'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d`
  return new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'short' })
}

function lastMessagePreview(type: string, content: string) {
  if (type === 'image') return <span className="inline-flex items-center gap-1"><ImageIcon size={11} /> Foto</span>
  if (type === 'audio') return <span className="inline-flex items-center gap-1"><Mic size={11} /> Audio</span>
  return content.length > 50 ? content.slice(0, 50) + '…' : content
}

// ── Componente principal ───────────────────────────────────────────────────

export default function Mensajes() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isPro = user?.role === 'professional'

  const clientRequests  = useRequestStore((s) => s.requests)
  const loadClient      = useRequestStore((s) => s.loadRequests)
  const proRequests     = useProRequestsStore((s) => s.requests)
  const loadPro         = useProRequestsStore((s) => s.load)
  const { messagesByRequest, initMock } = useChatStore()

  const [query, setQuery] = useState('')

  useEffect(() => {
    if (isPro && user?.id) loadPro(user.id)
    else loadClient()
  }, [isPro, user?.id, loadClient, loadPro])

  const rawRequests = isPro ? proRequests : clientRequests

  const chatRequests = useMemo(() => rawRequests.filter((r) => {
    const hasStatus = r.status === 'confirmed' || r.status === 'in_progress' || r.status === 'completed'
    if (!hasStatus) return false
    if (IS_DEMO_MODE) return true
    return isPro ? r.professional_id === user?.id : r.client_id === user?.id
  }), [rawRequests, isPro, user?.id])

  useEffect(() => {
    chatRequests.forEach((r) => {
      if (!messagesByRequest[r.id]) initMock(r.id)
    })
  }, [chatRequests, messagesByRequest, initMock])

  // Filtro de búsqueda
  const filtered = useMemo(() => {
    if (!query.trim()) return chatRequests
    const q = query.toLowerCase()
    return chatRequests.filter((r) => {
      const pro = MOCK_PROFESSIONALS.find((p) => p.id === r.professional_id)
      const name = pro?.profiles?.full_name?.toLowerCase() ?? ''
      const { label } = getCategoryMeta(r.category)
      return name.includes(q) || label.toLowerCase().includes(q)
    })
  }, [chatRequests, query])

  // ── Header ────────────────────────────────────────────────────────────────

  const header = (
    <div
      className="sticky top-0 z-50"
      style={{ background: '#FFFFFF', borderBottom: '1px solid #ECE4D8', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}
    >
      {/* Título */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-3">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="p-1 -ml-1 rounded-full active:opacity-60 transition-opacity flex-shrink-0"
        >
          <ChevronLeft size={24} style={{ color: '#111111' }} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-black leading-tight" style={{ color: '#111111', letterSpacing: '-0.4px' }}>
            Mensajes
          </h1>
          {chatRequests.length > 0 && (
            <p className="text-xs" style={{ color: '#AAAAAA' }}>
              {chatRequests.length} conversación{chatRequests.length !== 1 ? 'es' : ''} activa{chatRequests.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Búsqueda */}
      {chatRequests.length > 0 && (
        <div className="px-4 pb-3">
          <div
            className="flex items-center gap-2 rounded-2xl px-3 py-2.5"
            style={{ background: '#F5F0E8', border: '1.5px solid #ECE4D8' }}
          >
            <Search size={14} style={{ color: '#AAAAAA', flexShrink: 0 }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar profesional o conversación…"
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: '#111111', caretColor: '#E8683A' }}
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} style={{ color: '#AAAAAA', fontSize: 16, lineHeight: 1 }}>×</button>
            )}
          </div>
        </div>
      )}
    </div>
  )

  // ── Empty state ───────────────────────────────────────────────────────────

  if (chatRequests.length === 0) {
    return (
      <div style={{ background: '#F5F0E8', minHeight: '100dvh', display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto' }}>
        {header}
        <div className="flex flex-col items-center gap-5 py-24 text-center px-8 flex-1">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{ background: '#FFFFFF', border: '1.5px solid #ECE4D8', boxShadow: '0 4px 16px rgba(0,0,0,.06)' }}
          >
            <MessageCircle size={32} style={{ color: '#E8683A' }} />
          </div>
          <div>
            <p className="font-black text-base mb-1" style={{ color: '#111111' }}>
              No tenés conversaciones todavía
            </p>
            <p className="text-sm leading-relaxed" style={{ color: '#AAAAAA' }}>
              Cuando solicites un profesional, aparecerán aquí tus chats.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/buscar')}
            className="px-6 py-3 rounded-2xl text-sm font-bold text-white"
            style={{ background: '#E8683A', boxShadow: '0 4px 14px rgba(232,104,58,.3)' }}
          >
            Buscar profesionales
          </button>
        </div>
      </div>
    )
  }

  // ── Lista de conversaciones ───────────────────────────────────────────────

  return (
    <div style={{ background: '#F5F0E8', minHeight: '100dvh', display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto' }}>
      {header}

      <motion.div
        variants={staggerFast}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-2 p-3 flex-1"
      >
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm font-bold" style={{ color: '#888' }}>Sin resultados para "{query}"</p>
          </div>
        )}

        {filtered.map((req) => {
          const pro         = MOCK_PROFESSIONALS.find((p) => p.id === req.professional_id)
          const proName     = pro?.profiles?.full_name ?? 'Profesional'
          const proAvatar   = pro?.profiles?.avatar_url
          const proInitials = getInitials(proName)
          const proZone     = pro?.zone
          const { label } = getCategoryMeta(req.category)
          const messages    = messagesByRequest[req.id] ?? []
          const last        = messages[messages.length - 1]
          const meta        = STATUS_META[req.status] ?? STATUS_META.confirmed
          const isOnline    = req.status === 'confirmed' || req.status === 'in_progress'

          // Mensajes no leídos: último msg del "otro" lado en demo
          const myRole      = isPro ? 'pro' : 'client'
          const unread      = last && last.senderRole !== myRole ? 1 : 0

          return (
            <motion.button
              key={req.id}
              variants={fadeUp}
              type="button"
              onClick={() => navigate(`/solicitud/${req.id}/chat`)}
              className="w-full text-left rounded-2xl p-3.5 flex items-center gap-3 active:scale-[0.99] transition-all"
              style={{
                background: '#FFFFFF',
                border: unread ? '1.5px solid rgba(232,104,58,.3)' : '1.5px solid #EDE8DE',
                boxShadow: unread
                  ? '0 2px 16px rgba(232,104,58,.1), 0 1px 4px rgba(0,0,0,.06)'
                  : '0 1px 4px rgba(0,0,0,.05)',
              }}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div
                  className="overflow-hidden flex items-center justify-center font-bold text-sm"
                  style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: proAvatar ? undefined : 'linear-gradient(135deg, #f5b99a, #E8683A)',
                    color: '#fff',
                    border: '2px solid #EDE8DE',
                    fontSize: 16,
                  }}
                >
                  {proAvatar
                    ? <img src={proAvatar} alt={proName} className="w-full h-full object-cover" />
                    : proInitials
                  }
                </div>
                {/* Online dot */}
                <span
                  className="absolute bottom-0.5 right-0.5 rounded-full"
                  style={{
                    width: 12, height: 12,
                    background: isOnline ? '#22C55E' : '#D1D5DB',
                    border: '2px solid #FFFFFF',
                  }}
                />
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                {/* Fila 1: nombre + hora */}
                <div className="flex items-center justify-between mb-0.5">
                  <p
                    className="text-sm truncate"
                    style={{ color: '#111111', fontWeight: unread ? 800 : 600 }}
                  >
                    {proName}
                  </p>
                  {last && (
                    <span
                      className="text-[10px] flex-shrink-0 ml-2"
                      style={{ color: unread ? '#E8683A' : '#BBBBBB', fontWeight: unread ? 700 : 400 }}
                    >
                      {timeAgo(last.createdAt)}
                    </span>
                  )}
                </div>

                {/* Fila 2: oficio + estado */}
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                    style={{ background: 'rgba(232,104,58,.1)', color: '#E8683A' }}
                  >
                    {createElement(getCategoryIcon(req.category), { size: 11, style: { color: '#D4571F' } })} {label}
                  </span>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                    style={{ background: meta.bg, color: meta.color }}
                  >
                    {meta.label}
                  </span>
                </div>

                {/* Fila 3: zona */}
                {proZone && (
                  <p className="inline-flex items-center gap-1 text-[10px] mb-0.5" style={{ color: '#AAAAAA' }}>
                    <MapPin size={11} /> {proZone}
                  </p>
                )}

                {/* Fila 4: último mensaje */}
                <p
                  className="text-xs truncate"
                  style={{ color: unread ? '#333333' : '#999999', fontWeight: unread ? 600 : 400 }}
                >
                  {last
                    ? lastMessagePreview(last.type, last.content)
                    : 'Tocá para abrir el chat'
                  }
                </p>
              </div>

              {/* Unread badge o chevron */}
              <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
                {unread > 0 ? (
                  <span
                    className="flex items-center justify-center rounded-full font-black text-white"
                    style={{ width: 20, height: 20, background: '#E8683A', fontSize: 10 }}
                  >
                    {unread}
                  </span>
                ) : (
                  <span style={{ color: '#D1D5DB', fontSize: 20 }}>›</span>
                )}
              </div>
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
}
