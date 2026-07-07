import { Check, CheckCheck, Clock, AlertCircle, ImageOff } from 'lucide-react'
import type { Message } from '../../services/chatService.types'

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
}

interface Props {
  message: Message
  isOwn: boolean
  /** false cuando el mensaje se agrupa con el siguiente del mismo emisor (Fase 3). */
  showMeta?: boolean
  /** el envío falló (estado local optimista) → muestra reintentar */
  error?: boolean
  onRetry?: () => void
}

function StatusTick({ status }: { status: Message['status'] }) {
  const gray = '#B3A794'
  if (status === 'sending') return <Clock size={11} style={{ color: gray }} />
  if (status === 'sent') return <Check size={13} style={{ color: gray }} />
  if (status === 'delivered') return <CheckCheck size={13} style={{ color: gray }} />
  // read → color de marca
  return <CheckCheck size={13} style={{ color: '#E8683A' }} />
}

export function ChatBubble({ message, isOwn, showMeta = true, error, onRetry }: Props) {
  // ── Mensaje de sistema: centrado, gris, sin burbuja ──────────────────────
  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-1">
        <span
          className="text-[11px] text-center px-3 py-1 rounded-full"
          style={{ background: 'rgba(0,0,0,0.05)', color: '#8A7F6E' }}
        >
          {message.content}
        </span>
      </div>
    )
  }

  return (
    <div className={`flex flex-col gap-0.5 ${isOwn ? 'items-end' : 'items-start'}`}>
      {message.type === 'text' && (
        <div
          className="max-w-[80%] px-3 py-2 text-[13px] leading-relaxed break-words"
          style={{
            background: isOwn ? '#E8683A' : '#FFFFFF',
            color: isOwn ? '#FFFFFF' : '#111111',
            border: isOwn ? 'none' : '1.5px solid #EDE8DE',
            borderRadius: isOwn ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
            opacity: error ? 0.7 : 1,
          }}
        >
          {message.content}
        </div>
      )}

      {message.type === 'image' && (() => {
        const src = message.image_url || message.content
        // blob: no sobrevive al refresh; content vacío = imagen purgada del cupo de localStorage
        const available = !!src && !src.startsWith('blob:')
        return (
          <div
            className="max-w-[80%] overflow-hidden"
            style={{
              borderRadius: isOwn ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
              border: '1.5px solid #EDE8DE',
              opacity: error ? 0.7 : 1,
            }}
          >
            {available ? (
              <img
                src={src}
                alt="imagen"
                className="w-full object-cover"
                style={{ maxWidth: 220, maxHeight: 200, display: 'block' }}
              />
            ) : (
              <div
                className="flex flex-col items-center justify-center gap-1"
                style={{ width: 200, height: 130, background: '#F0EAE0', color: '#9C917E' }}
              >
                <ImageOff size={22} />
                <span className="text-[11px] font-medium">Imagen no disponible</span>
              </div>
            )}
          </div>
        )
      })()}

      {/* Meta: hora + estado / reintentar */}
      {(showMeta || error) && (
        <div className="flex items-center gap-1 px-1">
          {error ? (
            <button
              type="button"
              onClick={onRetry}
              className="flex items-center gap-1 text-[10px] font-semibold active:opacity-70"
              style={{ color: '#DC2626' }}
            >
              <AlertCircle size={12} /> No se envió · Reintentar
            </button>
          ) : (
            <>
              <span className="text-[9px]" style={{ color: isOwn ? 'rgba(0,0,0,0.35)' : '#BBBBBB' }}>
                {formatTime(message.created_at)}
              </span>
              {isOwn && <StatusTick status={message.status} />}
            </>
          )}
        </div>
      )}
    </div>
  )
}
