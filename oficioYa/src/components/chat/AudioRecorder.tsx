import { useEffect, useRef, useState } from 'react'
import { X, Square } from 'lucide-react'

interface Props {
  onSend: (blobUrl: string, duration: number) => void
  onCancel: () => void
}

export function AudioRecorder({ onSend, onCancel }: Props) {
  const [seconds, setSeconds] = useState(0)
  const [micError, setMicError] = useState(false)
  const mediaRef    = useRef<MediaRecorder | null>(null)
  const chunksRef   = useRef<Blob[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    let active = true

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        if (!active) return
        const recorder = new MediaRecorder(stream)
        mediaRef.current = recorder
        chunksRef.current = []

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data)
        }

        recorder.start()

        intervalRef.current = setInterval(() => {
          setSeconds((s) => s + 1)
        }, 1000)
      })
      .catch(() => {
        if (active) setMicError(true)
      })

    return () => {
      active = false
      if (mediaRef.current && mediaRef.current.state !== 'inactive') {
        mediaRef.current.stream.getTracks().forEach((t) => t.stop())
        mediaRef.current.stop()
      }
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  function stop() {
    if (!mediaRef.current || mediaRef.current.state === 'inactive') return
    const recorder = mediaRef.current
    const duration = seconds

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
      const url  = URL.createObjectURL(blob)
      recorder.stream.getTracks().forEach((t) => t.stop())
      onSend(url, duration)
    }

    recorder.stop()
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  function cancel() {
    if (mediaRef.current && mediaRef.current.state !== 'inactive') {
      mediaRef.current.stream.getTracks().forEach((t) => t.stop())
      mediaRef.current.stop()
    }
    if (intervalRef.current) clearInterval(intervalRef.current)
    onCancel()
  }

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const timeLabel = `${mins}:${secs.toString().padStart(2, '0')}`

  const bars = [7, 13, 5, 11, 5, 9, 13, 6, 10, 4, 12, 8]
  const barDelays = [0, 0.1, 0.2, 0.15, 0.25, 0.05, 0.2, 0.1, 0.3, 0.15, 0.05, 0.25]

  if (micError) {
    return (
      <div
        className="flex items-center gap-2 px-3 py-2.5"
        style={{ background: '#FFFFFF', borderTop: '1px solid #EDE8DE' }}
      >
        <button
          type="button"
          onClick={onCancel}
          className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: '#F5F0E8', border: '1.5px solid #EDE8DE' }}
        >
          <X size={15} style={{ color: '#E8683A' }} />
        </button>
        <span className="text-[11px] flex-1 text-center" style={{ color: '#999' }}>
          No se pudo acceder al micrófono
        </span>
      </div>
    )
  }

  return (
    <div
      className="flex items-center gap-2 px-3 py-2.5"
      style={{
        background: '#FFFFFF',
        borderTop: '1px solid #EDE8DE',
        paddingBottom: 'calc(10px + var(--safe-bottom, 0px))',
      }}
    >
      {/* Cancelar */}
      <button
        type="button"
        onClick={cancel}
        className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
        style={{ background: '#FEF2F2', border: '1.5px solid #FECACA' }}
      >
        <X size={15} style={{ color: '#DC2626' }} />
      </button>

      {/* Waveform + timer */}
      <div
        className="flex-1 flex items-center gap-2 rounded-3xl px-3 py-2"
        style={{ background: '#F5F0E8', border: '1.5px solid #EDE8DE' }}
      >
        {/* Punto grabando */}
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: '#E8683A', animation: 'pulse 1s ease-in-out infinite' }}
        />
        {/* Barras animadas */}
        <div className="flex items-center gap-[2px] flex-1">
          {bars.map((h, i) => (
            <div
              key={i}
              className="rounded-sm"
              style={{
                width: 2,
                height: h,
                background: `rgba(232,104,58,${0.35 + (h / 13) * 0.55})`,
                animationName: 'waveBar',
                animationDuration: `${0.55 + (h / 13) * 0.4}s`,
                animationDelay: `${barDelays[i]}s`,
                animationTimingFunction: 'ease-in-out',
                animationIterationCount: 'infinite',
                animationDirection: 'alternate',
              }}
            />
          ))}
        </div>
        <style>{`
          @keyframes waveBar {
            from { transform: scaleY(0.35); }
            to   { transform: scaleY(1.1); }
          }
        `}</style>
        {/* Timer */}
        <span className="text-[10px] font-bold flex-shrink-0" style={{ color: '#E8683A' }}>
          {timeLabel}
        </span>
      </div>

      {/* Enviar */}
      <button
        type="button"
        onClick={stop}
        className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
        style={{ background: '#E8683A', border: 'none' }}
      >
        <Square size={13} fill="white" color="white" />
      </button>
    </div>
  )
}
