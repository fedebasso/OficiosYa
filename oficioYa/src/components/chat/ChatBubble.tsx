// src/components/chat/ChatBubble.tsx
import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import { fadeUp } from '../../lib/motion'
import type { ChatMessage } from '../../store/chatStore'

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

interface Props {
  message: ChatMessage
}

export function ChatBubble({ message }: Props) {
  const isOwn   = message.senderRole === 'client'
  const isSystem = message.senderRole === 'system'

  if (isSystem) {
    return (
      <motion.div variants={fadeUp} className="flex justify-center my-1">
        <span
          className="text-[10px] font-semibold px-3 py-1 rounded-full"
          style={{ background: 'rgba(15,110,86,.08)', color: '#0F6E56' }}
        >
          {message.content}
        </span>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={fadeUp}
      className={`flex flex-col gap-0.5 ${isOwn ? 'items-end' : 'items-start'}`}
    >
      <span className="text-[9px] px-1" style={{ color: '#aaa' }}>
        {message.senderName} · {formatTime(message.createdAt)}
      </span>

      {message.type === 'text' && (
        <div
          className="max-w-[78%] px-3 py-2 text-[12px] leading-relaxed"
          style={{
            background:    isOwn ? '#0F6E56' : '#fff',
            color:         isOwn ? '#fff'    : '#333',
            border:        isOwn ? 'none'    : '1px solid #e8e0d4',
            borderRadius:  isOwn ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
          }}
        >
          {message.content}
        </div>
      )}

      {message.type === 'image' && (
        <div
          className="max-w-[78%] overflow-hidden"
          style={{
            background:   '#0F6E56',
            borderRadius: isOwn ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
          }}
        >
          <img
            src={message.content}
            alt={message.fileName ?? 'imagen'}
            className="w-full max-w-[200px] object-cover"
            style={{ maxHeight: 160, display: 'block' }}
          />
          <p className="text-[9px] px-2 py-1" style={{ color: '#9FE1CB' }}>
            {message.fileName}
          </p>
        </div>
      )}

      {message.type === 'audio' && (
        <div
          className="flex items-center gap-2 px-3 py-2"
          style={{
            background:   isOwn ? '#0F6E56' : '#fff',
            border:       isOwn ? 'none'    : '1px solid #e8e0d4',
            borderRadius: isOwn ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
            minWidth: 140,
          }}
        >
          <button
            type="button"
            className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: isOwn ? '#9FE1CB' : '#0F6E56' }}
          >
            <Play size={11} style={{ color: isOwn ? '#0F6E56' : '#fff' }} fill="currentColor" />
          </button>
          <div className="flex-1">
            <div className="h-[3px] rounded-full" style={{ background: isOwn ? 'rgba(255,255,255,0.3)' : '#e8e0d4' }}>
              <div className="h-full w-[40%] rounded-full" style={{ background: isOwn ? '#9FE1CB' : '#0F6E56' }} />
            </div>
          </div>
          <span className="text-[10px] flex-shrink-0" style={{ color: isOwn ? '#9FE1CB' : '#aaa' }}>
            {message.duration != null ? formatDuration(message.duration) : '0:00'}
          </span>
        </div>
      )}
    </motion.div>
  )
}
