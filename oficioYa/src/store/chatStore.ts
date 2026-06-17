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
