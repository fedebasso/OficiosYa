// Esquema de datos del chat — idéntico al que tendrán las tablas de Supabase.
// La UI SOLO conoce estos tipos y la interfaz ChatService; nunca toca el mock.

export type MessageType = 'text' | 'image' | 'system'
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read'

/** Tabla `messages` */
export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  type: MessageType
  content: string
  image_url: string | null
  status: MessageStatus
  created_at: string // ISO
}

/** Tabla `conversations` */
export interface Conversation {
  id: string
  client_id: string
  professional_id: string
  service_request_id: string | null
  last_message: string
  last_message_at: string // ISO
  unread_count_client: number
  unread_count_professional: number
  created_at: string // ISO
}

/** Datos para crear un mensaje (el resto lo completa el servicio). */
export interface NewMessage {
  sender_id: string
  type: MessageType
  content: string
  image_url?: string | null
}

/**
 * Eventos de la suscripción en tiempo real.
 * Con Supabase Realtime: INSERT en `messages` → 'message', UPDATE → 'status'.
 * (Preparado a futuro: se puede agregar { kind: 'typing', userId } acá.)
 */
export type ChatEvent =
  | { kind: 'message'; message: Message }
  | { kind: 'status'; messageId: string; status: MessageStatus }

/**
 * Contrato único del chat. Hoy lo implementa el mock; mañana
 * `chatService.supabase.ts` implementa lo mismo y se cambia un import.
 */
export interface ChatService {
  getConversations(userId: string): Promise<Conversation[]>
  getMessages(conversationId: string): Promise<Message[]>
  sendMessage(conversationId: string, msg: NewMessage): Promise<Message>
  subscribeToMessages(conversationId: string, cb: (event: ChatEvent) => void): () => void
  markAsRead(conversationId: string, userId: string): Promise<void>
}
