import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause } from 'lucide-react'
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

interface AudioBubbleProps {
  src: string
  duration?: number
  isOwn: boolean
}

function AudioBubble({ src, duration, isOwn }: AudioBubbleProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  function togglePlay() {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
    } else {
      audio.play().catch(() => {})
    }
  }

  function handleTimeUpdate() {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    setCurrentTime(audio.currentTime)
    setProgress((audio.currentTime / audio.duration) * 100)
  }

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    audio.currentTime = ratio * audio.duration
  }

  const displayDuration = duration != null
    ? formatDuration(Math.max(0, duration - Math.floor(currentTime)))
    : '0:00'

  return (
    <div
      className="flex items-center gap-2 px-3 py-2.5"
      style={{
        background:   isOwn ? '#E8683A' : '#FFFFFF',
        border:       isOwn ? 'none' : '1.5px solid #EDE8DE',
        borderRadius: isOwn ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
        minWidth: 170,
      }}
    >
      <audio
        ref={audioRef}
        src={src}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setProgress(0); setCurrentTime(0) }}
        onTimeUpdate={handleTimeUpdate}
        preload="metadata"
      />

      {/* Botón play/pause */}
      <button
        type="button"
        onClick={togglePlay}
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform"
        style={{ background: isOwn ? 'rgba(255,255,255,0.25)' : '#E8683A' }}
      >
        {playing
          ? <Pause size={12} fill="white" color="white" />
          : <Play size={12} fill="white" color="white" style={{ marginLeft: 1 }} />
        }
      </button>

      {/* Barra de progreso clickeable */}
      <div className="flex-1 flex flex-col gap-1">
        <div
          className="h-[3px] rounded-full cursor-pointer"
          style={{ background: isOwn ? 'rgba(255,255,255,0.3)' : '#EDE8DE' }}
          onClick={handleSeek}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${progress}%`,
              background: isOwn ? 'rgba(255,255,255,0.85)' : '#E8683A',
            }}
          />
        </div>
      </div>

      {/* Duración restante */}
      <span
        className="text-[10px] flex-shrink-0 font-medium"
        style={{ color: isOwn ? 'rgba(255,255,255,0.7)' : '#AAA' }}
      >
        {displayDuration}
      </span>
    </div>
  )
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
        <div className="max-w-[80%]">
          <AudioBubble
            src={message.content}
            duration={message.duration}
            isOwn={isOwn}
          />
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
