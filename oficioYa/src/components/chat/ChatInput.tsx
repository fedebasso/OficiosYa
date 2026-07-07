import { useRef, useState } from 'react'
import { Camera, Send } from 'lucide-react'
import { fileToCompressedDataUrl, MAX_IMAGE_BYTES } from '../../lib/imageUtils'

const MAX_LEN = 2000

interface Props {
  onSendText: (text: string) => void
  onSendImage: (dataUrl: string) => void
  disabled?: boolean
}

export function ChatInput({ onSendText, onSendImage, disabled }: Props) {
  const [text, setText] = useState('')
  const [imgError, setImgError] = useState('')
  const taRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function autoGrow() {
    const ta = taRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 110)}px` // ~5 líneas, después scrollea
  }

  function handleSend() {
    const trimmed = text.trim()
    if (!trimmed) return
    onSendText(trimmed.slice(0, MAX_LEN))
    setText('')
    requestAnimationFrame(autoGrow)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setImgError('El archivo no es una imagen')
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImgError('La imagen supera los 10MB')
      return
    }
    setImgError('')
    try {
      const dataUrl = await fileToCompressedDataUrl(file)
      onSendImage(dataUrl)
    } catch {
      setImgError('No se pudo procesar la imagen')
    }
  }

  const hasText = text.trim().length > 0

  return (
    <div style={{ flexShrink: 0 }}>
      {imgError && (
        <div
          className="px-4 py-2 text-[12px] font-semibold flex items-center justify-between gap-2"
          style={{ background: '#FEF2F2', color: '#DC2626', borderTop: '1px solid #FADADA' }}
        >
          <span>{imgError}</span>
          <button type="button" onClick={() => setImgError('')} aria-label="Cerrar aviso" style={{ fontSize: 16, lineHeight: 1 }}>×</button>
        </div>
      )}
    <div
      className="flex items-end gap-2 px-3 py-2.5"
      style={{
        background: '#FFFFFF',
        borderTop: '1px solid #EDE8DE',
        paddingBottom: 'calc(10px + var(--safe-bottom, 0px) + var(--kb-inset, 0px))',
      }}
    >
      <textarea
        ref={taRef}
        value={text}
        onChange={(e) => { setText(e.target.value.slice(0, MAX_LEN)); autoGrow() }}
        onKeyDown={handleKeyDown}
        placeholder="Escribir mensaje…"
        rows={1}
        maxLength={MAX_LEN}
        className="flex-1 resize-none outline-none text-[13px] leading-relaxed"
        style={{
          background: '#F5F0E8',
          border: '1.5px solid #EDE8DE',
          borderRadius: 20,
          padding: '9px 14px',
          color: '#111111',
          maxHeight: 110,
          overflowY: 'auto',
          fontFamily: 'inherit',
        }}
      />

      {/* Foto */}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        aria-label="Enviar foto"
        className="flex-shrink-0 flex items-center justify-center active:scale-90 transition-transform"
        style={{ width: 40, height: 40, borderRadius: '50%', background: '#F5F0E8', border: '1.5px solid #EDE8DE' }}
      >
        <Camera size={18} style={{ color: '#E8683A' }} />
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {/* Enviar */}
      <button
        type="button"
        onClick={handleSend}
        disabled={!hasText || disabled}
        aria-label="Enviar mensaje"
        className="flex-shrink-0 flex items-center justify-center active:scale-90 transition-transform disabled:opacity-40"
        style={{ width: 40, height: 40, borderRadius: '50%', background: '#E8683A', border: 'none' }}
      >
        <Send size={16} color="#FFFFFF" />
      </button>
    </div>
    </div>
  )
}
