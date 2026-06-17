# Chat Cliente–Profesional — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar un chat interno full-screen entre cliente y profesional, accesible desde SolicitudDetail, con soporte de texto, fotos y audio grabado, usando mock local en Fase 1.

**Architecture:** El estado del chat vive en `chatStore.ts` (Zustand), con mensajes por `requestId`. La pantalla `Chat.tsx` orquesta tres componentes hijos: `ChatBubble` (renderiza cada mensaje), `ChatInput` (barra de entrada normal) y `AudioRecorder` (estado de grabación). El store expone una interfaz estable para que Fase 2 (Supabase Realtime) solo reemplace la implementación interna.

**Tech Stack:** React 19, TypeScript, Zustand, Framer Motion, Tailwind CSS v3, Web API MediaRecorder, lucide-react

---

## Mapa de archivos

| Acción | Archivo |
|--------|---------|
| Crear | `src/store/chatStore.ts` |
| Crear | `src/components/chat/ChatBubble.tsx` |
| Crear | `src/components/chat/AudioRecorder.tsx` |
| Crear | `src/components/chat/ChatInput.tsx` |
| Crear | `src/pages/Chat.tsx` |
| Modificar | `src/App.tsx` |
| Modificar | `src/pages/SolicitudDetail.tsx` |

---

## Task 1: chatStore — tipos, mock y acciones

**Files:**
- Create: `src/store/chatStore.ts`

- [ ] **Step 1: Crear el store**

```ts
// src/store/chatStore.ts
import { create } from 'zustand'

export type MessageType = 'text' | 'image' | 'audio' | 'system'
export type SenderRole = 'client' | 'pro' | 'system'

export interface ChatMessage {
  id: string
  requestId: string
  senderRole: SenderRole
  senderName: string
  type: MessageType
  content: string       // texto, object URL de imagen, blob URL de audio, o texto de sistema
  fileName?: string     // solo para type === 'image'
  duration?: number     // segundos, solo para type === 'audio'
  createdAt: string     // ISO
}

function mockMessages(requestId: string): ChatMessage[] {
  const now = new Date()
  const m = (offsetMin: number, role: SenderRole, type: MessageType, content: string, extra?: Partial<ChatMessage>): ChatMessage => ({
    id: `mock-${requestId}-${offsetMin}`,
    requestId,
    senderRole: role,
    senderName: role === 'client' ? 'Vos' : role === 'pro' ? 'Profesional' : 'Sistema',
    type,
    content,
    createdAt: new Date(now.getTime() - offsetMin * 60000).toISOString(),
    ...extra,
  })
  return [
    m(60, 'system', 'system', 'Chat habilitado — profesional asignado'),
    m(55, 'pro',    'text',   '¡Hola! Recibí tu solicitud. ¿Podés contarme más detalles del problema?'),
    m(50, 'client', 'text',   'Hola, el problema está en el tablero eléctrico del pasillo.'),
    m(45, 'pro',    'text',   '¿Podés mandarme una foto del tablero para verlo antes de ir?'),
  ].reverse()
}

interface ChatStore {
  messagesByRequest: Record<string, ChatMessage[]>
  getMessages: (requestId: string) => ChatMessage[]
  sendTextMessage: (requestId: string, senderRole: SenderRole, senderName: string, text: string) => void
  sendImageMessage: (requestId: string, senderRole: SenderRole, senderName: string, objectUrl: string, fileName: string) => void
  sendAudioMessage: (requestId: string, senderRole: SenderRole, senderName: string, blobUrl: string, duration: number) => void
  initMock: (requestId: string) => void
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messagesByRequest: {},

  getMessages: (requestId) => get().messagesByRequest[requestId] ?? [],

  initMock: (requestId) => {
    if (get().messagesByRequest[requestId]) return
    set((s) => ({
      messagesByRequest: { ...s.messagesByRequest, [requestId]: mockMessages(requestId) },
    }))
  },

  sendTextMessage: (requestId, senderRole, senderName, text) => {
    const msg: ChatMessage = {
      id: `${Date.now()}`,
      requestId,
      senderRole,
      senderName,
      type: 'text',
      content: text,
      createdAt: new Date().toISOString(),
    }
    set((s) => ({
      messagesByRequest: {
        ...s.messagesByRequest,
        [requestId]: [...(s.messagesByRequest[requestId] ?? []), msg],
      },
    }))
  },

  sendImageMessage: (requestId, senderRole, senderName, objectUrl, fileName) => {
    const msg: ChatMessage = {
      id: `${Date.now()}`,
      requestId,
      senderRole,
      senderName,
      type: 'image',
      content: objectUrl,
      fileName,
      createdAt: new Date().toISOString(),
    }
    set((s) => ({
      messagesByRequest: {
        ...s.messagesByRequest,
        [requestId]: [...(s.messagesByRequest[requestId] ?? []), msg],
      },
    }))
  },

  sendAudioMessage: (requestId, senderRole, senderName, blobUrl, duration) => {
    const msg: ChatMessage = {
      id: `${Date.now()}`,
      requestId,
      senderRole,
      senderName,
      type: 'audio',
      content: blobUrl,
      duration,
      createdAt: new Date().toISOString(),
    }
    set((s) => ({
      messagesByRequest: {
        ...s.messagesByRequest,
        [requestId]: [...(s.messagesByRequest[requestId] ?? []), msg],
      },
    }))
  },
}))
```

- [ ] **Step 2: Verificar que TypeScript compila**

```bash
cd oficioYa && npx tsc --noEmit
```
Expected: sin errores relativos a `chatStore.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/store/chatStore.ts
git commit -m "feat(chat): chatStore con tipos, mock y acciones"
```

---

## Task 2: ChatBubble — renderiza cada tipo de mensaje

**Files:**
- Create: `src/components/chat/ChatBubble.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
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
```

- [ ] **Step 2: Verificar compilación**

```bash
npx tsc --noEmit
```
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/chat/ChatBubble.tsx
git commit -m "feat(chat): ChatBubble — text, image, audio, system"
```

---

## Task 3: AudioRecorder — grabación tap-start/stop

**Files:**
- Create: `src/components/chat/AudioRecorder.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
// src/components/chat/AudioRecorder.tsx
import { useEffect, useRef, useState } from 'react'
import { X, Square } from 'lucide-react'

interface Props {
  onSend: (blobUrl: string, duration: number) => void
  onCancel: () => void
}

export function AudioRecorder({ onSend, onCancel }: Props) {
  const [seconds, setSeconds] = useState(0)
  const mediaRef    = useRef<MediaRecorder | null>(null)
  const chunksRef   = useRef<Blob[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    let active = true

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
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

    return () => {
      active = false
    }
  }, [])

  function stop() {
    if (!mediaRef.current) return
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

  // Waveform bars estáticas (decorativas)
  const bars = [7, 13, 5, 11, 5, 9, 13, 6, 10, 4, 12, 8]

  return (
    <div
      className="flex items-center gap-2 px-3 py-2"
      style={{ background: '#0F6E56' }}
    >
      {/* Cancelar */}
      <button
        type="button"
        onClick={cancel}
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: 'transparent', border: '1.5px solid rgba(255,255,255,0.55)' }}
      >
        <X size={14} color="rgba(255,255,255,0.8)" />
      </button>

      {/* Waveform + timer */}
      <div
        className="flex-1 flex items-center gap-2 rounded-3xl px-3 py-1.5"
        style={{ border: '1.5px solid rgba(255,255,255,0.55)' }}
      >
        {/* Punto rojo */}
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: '#ef4444' }}
        />
        {/* Barras */}
        <div className="flex items-center gap-[2px] flex-1">
          {bars.map((h, i) => (
            <div
              key={i}
              className="rounded-sm"
              style={{
                width: 2,
                height: h,
                background: `rgba(255,255,255,${0.3 + (h / 13) * 0.6})`,
              }}
            />
          ))}
        </div>
        {/* Timer */}
        <span className="text-[10px] font-bold flex-shrink-0" style={{ color: 'rgba(255,255,255,0.9)' }}>
          {timeLabel}
        </span>
      </div>

      {/* Detener y enviar */}
      <button
        type="button"
        onClick={stop}
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: '#9FE1CB', border: 'none' }}
      >
        <Square size={12} fill="#0F6E56" color="#0F6E56" />
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Verificar compilación**

```bash
npx tsc --noEmit
```
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/chat/AudioRecorder.tsx
git commit -m "feat(chat): AudioRecorder — tap start/stop con timer y waveform"
```

---

## Task 4: ChatInput — barra de entrada normal

**Files:**
- Create: `src/components/chat/ChatInput.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
// src/components/chat/ChatInput.tsx
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
```

- [ ] **Step 2: Verificar compilación**

```bash
npx tsc --noEmit
```
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/chat/ChatInput.tsx
git commit -m "feat(chat): ChatInput — texto, foto, micrófono, enviar"
```

---

## Task 5: Chat.tsx — pantalla principal

**Files:**
- Create: `src/pages/Chat.tsx`

- [ ] **Step 1: Crear la página**

```tsx
// src/pages/Chat.tsx
import { useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageShell } from '../components/layout/PageShell'
import { ChatBubble } from '../components/chat/ChatBubble'
import { ChatInput } from '../components/chat/ChatInput'
import { useChatStore } from '../store/chatStore'
import { useRequestStore } from '../store/requestStore'
import { useAuthStore } from '../store/authStore'
import { staggerFast } from '../lib/motion'
import { MOCK_PROFESSIONALS } from '../data/mockProfessionals'

const STATUS_LABEL: Record<string, string> = {
  pending:     '⏳ Pendiente',
  confirmed:   '✅ Confirmado',
  in_progress: '🚗 En camino',
  completed:   '🏁 Completado',
}

export default function Chat() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const bottomRef = useRef<HTMLDivElement>(null)

  const user = useAuthStore((s) => s.user)
  const { requests } = useRequestStore()
  const { getMessages, sendTextMessage, sendImageMessage, sendAudioMessage, initMock } = useChatStore()

  const req = requests.find((r) => r.id === id)
  const messages = id ? getMessages(id) : []

  // Nombre y avatar del profesional desde mock
  const pro = MOCK_PROFESSIONALS.find((p) => p.id === req?.professional_id)
  const proName    = pro?.profiles?.full_name ?? 'Profesional'
  const proInitials = proName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  const proCategory = pro?.categories?.[0] ?? req?.category ?? ''

  useEffect(() => {
    if (id) initMock(id)
  }, [id, initMock])

  // Scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  if (!req || !id) {
    return (
      <PageShell showBottomNav={false}>
        <div className="flex flex-col items-center gap-4 py-24 text-center px-6">
          <p className="font-black text-base" style={{ color: '#111' }}>Solicitud no encontrada</p>
        </div>
      </PageShell>
    )
  }

  const senderName = user?.full_name ?? 'Vos'

  const header = (
    <div
      className="px-4 pt-10 pb-3 sticky top-0 z-50 flex items-center gap-3"
      style={{ background: '#0F6E56' }}
    >
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="p-1 -ml-1 rounded-full active:opacity-60 flex-shrink-0"
      >
        <ChevronLeft size={24} color="#9FE1CB" />
      </button>

      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
        style={{ background: '#9FE1CB', color: '#0F6E56' }}
      >
        {proInitials}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-white truncate">{proName}</p>
        <p className="text-[10px] truncate capitalize" style={{ color: '#9FE1CB' }}>
          {proCategory} · Solicitud #{id.slice(-4)}
        </p>
      </div>

      {req.status !== 'cancelled' && (
        <div
          className="px-2 py-1 rounded-lg text-[9px] font-bold flex-shrink-0"
          style={{ background: 'rgba(159,225,203,.2)', color: '#9FE1CB' }}
        >
          {STATUS_LABEL[req.status] ?? req.status}
        </div>
      )}
    </div>
  )

  return (
    <PageShell showBottomNav={false} header={header}>
      <div className="flex flex-col h-full">

        {/* Lista de mensajes */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <motion.div
            variants={staggerFast}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-2"
          >
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}
            <div ref={bottomRef} />
          </motion.div>
        </div>

        {/* Input pegado al fondo */}
        <ChatInput
          onSendText={(text) =>
            sendTextMessage(id, 'client', senderName, text)
          }
          onSendImage={(url, fileName) =>
            sendImageMessage(id, 'client', senderName, url, fileName)
          }
          onSendAudio={(blobUrl, duration) =>
            sendAudioMessage(id, 'client', senderName, blobUrl, duration)
          }
        />
      </div>
    </PageShell>
  )
}
```

- [ ] **Step 2: Verificar compilación**

```bash
npx tsc --noEmit
```
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Chat.tsx
git commit -m "feat(chat): página Chat — header verde, mensajes, input"
```

---

## Task 6: Ruta en App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Agregar import y ruta**

En `src/App.tsx`, agregar el import después de la línea de `SolicitudDetail`:

```tsx
import Chat from './pages/Chat'
```

Agregar la ruta dentro de `<Routes>`, después de la ruta `/solicitud/:id`:

```tsx
<Route
  path="/solicitud/:id/chat"
  element={
    <ProtectedRoute requiredRole="client">
      <Chat />
    </ProtectedRoute>
  }
/>
```

- [ ] **Step 2: Verificar compilación**

```bash
npx tsc --noEmit
```
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat(chat): agregar ruta /solicitud/:id/chat"
```

---

## Task 7: Botón "💬 Chat" en SolicitudDetail

**Files:**
- Modify: `src/pages/SolicitudDetail.tsx`

- [ ] **Step 1: Agregar import de MessageCircle y useNavigate ya está importado**

En `src/pages/SolicitudDetail.tsx`, `MessageCircle` ya está importado de lucide-react y `useNavigate` también. Solo agregar el botón.

En la sección de acciones (dentro de `<motion.div variants={fadeUp} className="flex flex-col gap-2 mt-1">`), agregar el botón de chat **antes** del botón de WhatsApp (línea ~181):

```tsx
{/* Chat interno — siempre disponible si no está cancelado */}
{!isCancelled && (
  <motion.button
    type="button"
    onClick={() => navigate(`/solicitud/${req.id}/chat`)}
    whileTap={{ scale: 0.97 }} transition={SPRING_SOFT}
    className="w-full rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-2 text-white"
    style={{ background: '#0F6E56', boxShadow: '0 4px 14px rgba(15,110,86,.25)' }}
  >
    <MessageCircle size={16} />
    Chatear con el profesional
  </motion.button>
)}
```

- [ ] **Step 2: Verificar compilación**

```bash
npx tsc --noEmit
```
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/pages/SolicitudDetail.tsx
git commit -m "feat(chat): botón 'Chatear con el profesional' en SolicitudDetail"
```

---

## Task 8: Smoke test manual — verificar criterios de éxito

- [ ] **Step 1: Levantar el servidor de desarrollo**

```bash
npm run dev
```

- [ ] **Step 2: Verificar cada criterio del spec**

1. Ir a `/mis-solicitudes` → abrir una solicitud activa → confirmar que el botón **"Chatear con el profesional"** aparece.
2. Tocar el botón → confirmar que navega a `/solicitud/:id/chat` con header verde y nombre del pro.
3. Confirmar que se ven mensajes mock al abrir el chat.
4. Escribir texto y tocar enviar → confirmar que aparece burbuja verde a la derecha.
5. Tocar el ícono de cámara → seleccionar una imagen → confirmar que aparece como thumbnail.
6. Tocar el ícono de micrófono → confirmar que la barra se reemplaza por el estado de grabación (punto rojo + waveform + timer).
7. Tocar ⏹ (detener) → confirmar que se envía burbuja de audio con botón ▶ y duración.
8. Iniciar una grabación y tocar ✕ (cancelar) → confirmar que vuelve a la barra normal sin mensaje.
9. Confirmar paleta: header `#0F6E56`, burbujas propias verdes, ajenas blancas con borde `#e8e0d4`.

- [ ] **Step 3: Commit final si todo pasa**

```bash
git add -A
git commit -m "feat(chat): smoke test OK — chat cliente-profesional Fase 1 completo"
```
