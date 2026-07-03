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

  const hasText = text.trim().length > 0

  return (
    <div
      className="flex items-center gap-2 px-3 py-2.5"
      style={{
        background: '#FFFFFF',
        borderTop: '1px solid #EDE8DE',
        paddingBottom: 'calc(10px + var(--safe-bottom, 0px) + var(--kb-inset, 0px))',
      }}
    >
      {/* Textarea */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Escribir mensaje..."
        rows={1}
        className="flex-1 resize-none outline-none text-[13px] leading-relaxed"
        style={{
          background:   '#F5F0E8',
          border:       '1.5px solid #EDE8DE',
          borderRadius: 24,
          padding:      '9px 14px',
          color:        '#111111',
          maxHeight:    80,
          overflowY:    'auto',
          fontFamily:   'inherit',
        }}
      />

      {/* Cámara */}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="flex-shrink-0 flex items-center justify-center active:scale-90 transition-transform"
        style={{
          width: 36, height: 36, borderRadius: '50%',
          background: '#F5F0E8',
          border: '1.5px solid #EDE8DE',
        }}
      >
        <Camera size={17} style={{ color: '#E8683A' }} />
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {/* Micrófono */}
      <button
        type="button"
        onClick={() => setRecording(true)}
        className="flex-shrink-0 flex items-center justify-center active:scale-90 transition-transform"
        style={{
          width: 36, height: 36, borderRadius: '50%',
          background: '#F5F0E8',
          border: '1.5px solid #EDE8DE',
        }}
      >
        <Mic size={17} style={{ color: '#E8683A' }} />
      </button>

      {/* Enviar */}
      <button
        type="button"
        onClick={handleSendText}
        disabled={!hasText}
        className="flex-shrink-0 flex items-center justify-center active:scale-90 transition-transform disabled:opacity-40"
        style={{
          width: 36, height: 36, borderRadius: '50%',
          background: '#E8683A',
          border: 'none',
        }}
      >
        <Send size={15} color="#FFFFFF" />
      </button>
    </div>
  )
}
