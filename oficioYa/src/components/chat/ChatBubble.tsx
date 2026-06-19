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
  const isOwn = message.senderRole === 'client'

  return (
    <motion.div
      variants={fadeUp}
      className={`flex flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'}`}
    >
      {message.type === 'text' && (
        <div
          className="max-w-[78%] px-3 py-2 text-[13px] leading-relaxed"
          style={{
            background:   isOwn ? '#E8683A' : '#FFFFFF',
            color:        isOwn ? '#FFFFFF' : '#111111',
            border:       isOwn ? 'none' : '1.5px solid #EDE8DE',
            borderRadius: isOwn ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
          }}
        >
          {message.content}
        </div>
      )}

      {message.type === 'image' && (
        <div
          className="max-w-[78%] overflow-hidden"
          style={{
            borderRadius: isOwn ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
            border: '1.5px solid #EDE8DE',
          }}
        >
          <img
            src={message.content}
            alt={message.fileName ?? 'imagen'}
            className="w-full object-cover"
            style={{ maxWidth: 220, maxHeight: 180, display: 'block' }}
          />
          {message.fileName && (
            <div
              className="px-3 py-1.5"
              style={{
                background: isOwn ? '#E8683A' : '#F5F0E8',
                color: isOwn ? 'rgba(255,255,255,0.8)' : '#888',
                fontSize: 10,
              }}
            >
              {message.fileName}
            </div>
          )}
        </div>
      )}

      {message.type === 'audio' && (
        <div
          className="flex items-center gap-2 px-3 py-2.5"
          style={{
            background:   isOwn ? '#E8683A' : '#FFFFFF',
            border:       isOwn ? 'none' : '1.5px solid #EDE8DE',
            borderRadius: isOwn ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
            minWidth: 160,
          }}
        >
          <button
            type="button"
            className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: isOwn ? 'rgba(255,255,255,0.25)' : '#E8683A' }}
          >
            <Play size={11} style={{ color: isOwn ? '#fff' : '#fff' }} fill="currentColor" />
          </button>
          <div className="flex-1">
            <div className="h-[3px] rounded-full" style={{ background: isOwn ? 'rgba(255,255,255,0.3)' : '#EDE8DE' }}>
              <div className="h-full w-[40%] rounded-full" style={{ background: isOwn ? 'rgba(255,255,255,0.8)' : '#E8683A' }} />
            </div>
          </div>
          <span className="text-[10px] flex-shrink-0" style={{ color: isOwn ? 'rgba(255,255,255,0.7)' : '#AAA' }}>
            {message.duration != null ? formatDuration(message.duration) : '0:00'}
          </span>
        </div>
      )}

      <span
        className="text-[9px] px-1"
        style={{ color: isOwn ? 'rgba(232,104,58,0.55)' : '#BBBBBB' }}
      >
        {formatTime(message.createdAt)}
      </span>
    </motion.div>
  )
}
