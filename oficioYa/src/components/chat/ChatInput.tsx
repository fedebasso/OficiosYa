import { useRef, useState } from 'react'
import { Camera, Mic, Send } from 'lucide-react'
import { AudioRecorder } from './AudioRecorder'

interface Props {
  onSendText:  (text: string) => void
  onSendImage: (objectUrl: string, fileName: string) => void
  onSendAudio: (blobUrl: string, duration: number) => void
}

export function ChatInput({ onSendText, onSendImage, onSendAudio }: Props) {
  const [text, setText]           = useState('')
  const [recording, setRecording] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleSendText() {
    const trimmed = text.trim()
    if (!trimmed) return
    onSendText(trimmed)
    setText('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendText()
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    onSendImage(url, file.name)
    e.target.value = ''
  }

  if (recording) {
    return (
      <AudioRecorder
        onSend={(blobUrl, duration) => {
          onSendAudio(blobUrl, duration)
          setRecording(false)
        }}
        onCancel={() => setRecording(false)}
      />
    )
  }

  const iconButtonStyle: React.CSSProperties = {
    background:   'transparent',
    border:       '1.5px solid rgba(255,255,255,0.55)',
    borderRadius: '50%',
    width:        34,
    height:       34,
    display:      'flex',
    alignItems:   'center',
    justifyContent: 'center',
    flexShrink:   0,
    cursor:       'pointer',
  }

  return (
    <div
      className="flex items-center gap-2 px-3 py-2"
      style={{ background: '#0F6E56' }}
    >
      {/* Input */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Escribir mensaje..."
        rows={1}
        className="flex-1 resize-none outline-none text-[12px] leading-relaxed bg-transparent placeholder:text-white/40 text-white"
        style={{
          border:       '1.5px solid rgba(255,255,255,0.55)',
          borderRadius: 24,
          padding:      '7px 14px',
          maxHeight:    80,
        }}
      />

      {/* Cámara */}
      <button type="button" style={iconButtonStyle} onClick={() => fileRef.current?.click()}>
        <Camera size={16} color="rgba(255,255,255,0.9)" />
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Micrófono */}
      <button type="button" style={iconButtonStyle} onClick={() => setRecording(true)}>
        <Mic size={16} color="rgba(255,255,255,0.9)" />
      </button>

      {/* Enviar */}
      <button
        type="button"
        onClick={handleSendText}
        disabled={!text.trim()}
        className="flex-shrink-0 w-[34px] h-[34px] rounded-full flex items-center justify-center disabled:opacity-40"
        style={{ background: '#9FE1CB', border: 'none' }}
      >
        <Send size={15} color="#0F6E56" />
      </button>
    </div>
  )
}
