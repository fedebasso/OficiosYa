import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, MessageCircle, Search } from 'lucide-react'
import { useChatStore } from '../store/chatStore'
import { useAuthStore } from '../store/authStore'
import { otherParticipant, unreadFor } from '../lib/chatParticipants'

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

export default function Mensajes() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const userId = user?.id ?? ''
  const conversations = useChatStore((s) => s.conversations)
  const loading = useChatStore((s) => s.loading)
  const load = useChatStore((s) => s.load)

  const [query, setQuery] = useState('')

  useEffect(() => {
    if (userId) load(userId)
  }, [userId, load])

  const items = useMemo(
    () => conversations.map((c) => ({ conv: c, other: otherParticipant(c, userId), unread: unreadFor(c, userId) })),
    [conversations, userId],
  )

  const filtered = useMemo(() => {
    if (!query.trim()) return items
    const q = query.toLowerCase()
    return items.filter(({ other }) => other.name.toLowerCase().includes(q) || other.subtitle.toLowerCase().includes(q))
  }, [items, query])

  const header = (
    <div className="sticky top-0 z-50" style={{ background: '#FFFFFF', borderBottom: '1px solid #ECE4D8', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
      <div className="flex items-center gap-3 px-4 pt-12 pb-3">
        <button type="button" onClick={() => navigate('/')} className="p-1 -ml-1 rounded-full active:opacity-60 flex-shrink-0" aria-label="Volver">
          <ChevronLeft size={24} style={{ color: '#111111' }} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-black leading-tight" style={{ color: '#111111', letterSpacing: '-0.4px' }}>Mensajes</h1>
          {conversations.length > 0 && (
            <p className="text-xs" style={{ color: '#6E6455' }}>
              {conversations.length} conversación{conversations.length !== 1 ? 'es' : ''}
            </p>
          )}
        </div>
      </div>
      {conversations.length > 0 && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 rounded-2xl px-3 py-2.5" style={{ background: '#F5F0E8', border: '1.5px solid #ECE4D8' }}>
            <Search size={14} style={{ color: '#9A8F80', flexShrink: 0 }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar conversación…"
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: '#111111', caretColor: '#E8683A' }}
            />
            {query && <button type="button" onClick={() => setQuery('')} style={{ color: '#9A8F80', fontSize: 16, lineHeight: 1 }}>×</button>}
          </div>
        </div>
      )}
    </div>
  )

  if (!loading && conversations.length === 0) {
    return (
      <div style={{ background: '#F5F0E8', minHeight: '100dvh', display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto' }}>
        {header}
        <div className="flex flex-col items-center gap-5 py-24 text-center px-8 flex-1">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center" style={{ background: '#FFFFFF', border: '1.5px solid #ECE4D8', boxShadow: '0 4px 16px rgba(0,0,0,.06)' }}>
            <MessageCircle size={32} style={{ color: '#E8683A' }} />
          </div>
          <div>
            <p className="font-black text-base mb-1" style={{ color: '#111111' }}>Todavía no tenés conversaciones</p>
            <p className="text-sm leading-relaxed" style={{ color: '#6E6455' }}>
              Cuando contactes a un profesional, van a aparecer acá.
            </p>
          </div>
          <button type="button" onClick={() => navigate('/buscar')} className="px-6 py-3 rounded-2xl text-sm font-bold text-white" style={{ background: '#E8683A', boxShadow: '0 4px 14px rgba(232,104,58,.3)' }}>
            Buscar profesionales
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#F5F0E8', minHeight: '100dvh', display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto' }}>
      {header}
      <div className="flex flex-col gap-2 p-3 flex-1">
        {filtered.length === 0 && query && (
          <div className="text-center py-12">
            <p className="text-sm font-bold" style={{ color: '#8A7F6E' }}>Sin resultados para “{query}”</p>
          </div>
        )}

        {filtered.map(({ conv, other, unread }) => (
          <button
            key={conv.id}
            type="button"
            onClick={() => navigate(`/chat/${conv.id}`)}
            className="w-full text-left rounded-2xl p-3.5 flex items-center gap-3 active:scale-[0.99] transition-transform"
            style={{
              background: '#FFFFFF',
              border: unread ? '1.5px solid rgba(232,104,58,.3)' : '1.5px solid #EDE8DE',
              boxShadow: unread ? '0 2px 16px rgba(232,104,58,.1), 0 1px 4px rgba(0,0,0,.06)' : '0 1px 4px rgba(0,0,0,.05)',
            }}
          >
            {/* Avatar */}
            <div
              className="flex-shrink-0 overflow-hidden flex items-center justify-center font-bold"
              style={{ width: 52, height: 52, borderRadius: '50%', background: other.avatarUrl ? undefined : 'linear-gradient(135deg, #f5b99a, #E8683A)', color: '#fff', border: '2px solid #EDE8DE', fontSize: 16 }}
            >
              {other.avatarUrl ? <img src={other.avatarUrl} alt={other.name} className="w-full h-full object-cover" /> : other.initials}
            </div>

            {/* Contenido */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-sm truncate" style={{ color: '#111111', fontWeight: unread ? 800 : 600 }}>{other.name}</p>
                <span className="text-[10px] flex-shrink-0 ml-2" style={{ color: unread ? '#E8683A' : '#9A8F80', fontWeight: unread ? 700 : 400 }}>
                  {timeAgo(conv.last_message_at)}
                </span>
              </div>
              {other.subtitle && (
                <p className="text-[11px] mb-0.5" style={{ color: '#8A7F6E' }}>{other.subtitle}</p>
              )}
              <p className="text-xs truncate" style={{ color: unread ? '#333333' : '#8A7F6E', fontWeight: unread ? 600 : 400 }}>
                {conv.last_message || 'Tocá para abrir el chat'}
              </p>
            </div>

            {/* Badge no leídos */}
            <div className="flex-shrink-0 flex flex-col items-center">
              {unread > 0 ? (
                <span className="flex items-center justify-center rounded-full font-black text-white" style={{ minWidth: 20, height: 20, padding: '0 6px', background: '#E8683A', fontSize: 10 }}>{unread}</span>
              ) : (
                <span style={{ color: '#D1D5DB', fontSize: 20 }}>›</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
