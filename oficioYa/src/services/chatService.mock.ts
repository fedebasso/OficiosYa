// Implementación MOCK del ChatService (modo demo).
// - Datos en memoria + persistencia en localStorage (sobreviven al refresh).
// - subscribeToMessages simula read receipts y respuestas del otro lado con setTimeout.
// Mañana: chatService.supabase.ts implementa la MISMA interfaz (Realtime channels)
// y se cambia un solo import en chatService.ts. La UI no se toca.

import type {
  ChatService,
  Conversation,
  Message,
  NewMessage,
  ChatEvent,
  StartConversationParams,
} from './chatService.types'

const LS_CONV = 'ofix_chat_conversations'
const LS_MSG = 'ofix_chat_messages'

const DEMO_CLIENT = 'mock-client-1'
const DEMO_PRO = 'mock-pro-1'

// Cupo de imágenes conservadas por conversación (localStorage ~5MB).
// A las más viejas se les vacía el contenido y la UI muestra un placeholder.
const MAX_IMAGES_PER_CONV = 8

const VALID_TYPES = new Set<Message['type']>(['text', 'image', 'system'])
const VALID_STATUS = new Set<Message['status']>(['sending', 'sent', 'delivered', 'read'])

function uid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function now() {
  return new Date().toISOString()
}

function minutesAgo(m: number) {
  return new Date(Date.now() - m * 60000).toISOString()
}

// ── Persistencia ─────────────────────────────────────────────────────────────

function read<T>(key: string, fallback: T): T {
  if (typeof localStorage === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* almacenamiento lleno o no disponible — modo demo, se ignora */
  }
}

// ── Seed inicial ─────────────────────────────────────────────────────────────

function seed(): { conversations: Conversation[]; messages: Record<string, Message[]> } {
  const conv1: Conversation = {
    id: 'conv-201',
    client_id: DEMO_CLIENT,
    professional_id: DEMO_PRO, // Carlos — visible para el cliente Y el profesional demo
    service_request_id: '201',
    last_message: '¿Podés mandarme una foto del tablero para verlo antes de ir?',
    last_message_at: minutesAgo(45),
    unread_count_client: 1,
    unread_count_professional: 0,
    created_at: minutesAgo(60),
  }
  const conv2: Conversation = {
    id: 'conv-202',
    client_id: DEMO_CLIENT,
    professional_id: '2', // Roberto — solo lo ve el cliente
    service_request_id: '202',
    last_message: 'Perfecto, coordinamos por acá.',
    last_message_at: minutesAgo(120),
    unread_count_client: 0,
    unread_count_professional: 0,
    created_at: minutesAgo(180),
  }

  const m = (
    convId: string,
    offsetMin: number,
    senderId: string,
    content: string,
    extra?: Partial<Message>,
  ): Message => ({
    id: `seed-${convId}-${offsetMin}`,
    conversation_id: convId,
    sender_id: senderId,
    type: 'text',
    content,
    image_url: null,
    status: 'read',
    created_at: minutesAgo(offsetMin),
    ...extra,
  })

  return {
    conversations: [conv1, conv2],
    messages: {
      'conv-201': [
        m('conv-201', 60, DEMO_PRO, '¡Hola! Recibí tu solicitud. ¿Podés contarme más detalles del problema?'),
        m('conv-201', 55, DEMO_CLIENT, 'Hola, el problema está en el tablero eléctrico del pasillo.'),
        m('conv-201', 45, DEMO_PRO, '¿Podés mandarme una foto del tablero para verlo antes de ir?', { status: 'delivered' }),
      ],
      'conv-202': [
        m('conv-202', 180, DEMO_CLIENT, 'Hola Roberto, necesito arreglar una pérdida de agua.'),
        m('conv-202', 150, '2', 'Hola! Sí, la veo hoy. ¿Dónde queda?'),
        m('conv-202', 120, DEMO_CLIENT, 'Perfecto, coordinamos por acá.'),
      ],
    },
  }
}

// ── Estado en memoria (sincronizado con localStorage) ────────────────────────

let conversations: Conversation[]
let messages: Record<string, Message[]>

// ── Sanitización de datos persistidos ────────────────────────────────────────
// Un localStorage viejo/corrupto (p.ej. mensajes 'audio' del modelo anterior)
// NUNCA debe tirar la app: se descarta lo inválido y, si no queda nada, se re-seedea.

function isConversation(x: unknown): x is Conversation {
  const c = x as Conversation
  return !!c && typeof c.id === 'string' && typeof c.client_id === 'string'
    && typeof c.professional_id === 'string' && typeof c.last_message_at === 'string'
}

function isMessage(x: unknown): x is Message {
  const m = x as Message
  return !!m && typeof m.id === 'string' && typeof m.conversation_id === 'string'
    && typeof m.sender_id === 'string' && VALID_TYPES.has(m.type)
    && typeof m.created_at === 'string'
}

function sanitizeConversations(raw: unknown): Conversation[] | null {
  if (!Array.isArray(raw)) return null
  const valid = raw.filter(isConversation)
  return valid.length ? valid : null
}

function sanitizeMessages(raw: unknown): Record<string, Message[]> | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const out: Record<string, Message[]> = {}
  for (const [key, val] of Object.entries(raw as Record<string, unknown>)) {
    if (!Array.isArray(val)) continue
    out[key] = val.filter(isMessage).map((m) => ({
      ...m,
      image_url: m.image_url ?? null,
      status: VALID_STATUS.has(m.status) ? m.status : 'sent',
    }))
  }
  return out
}

function ensureLoaded() {
  if (conversations) return
  const storedConv = sanitizeConversations(read<unknown>(LS_CONV, null))
  const storedMsg = sanitizeMessages(read<unknown>(LS_MSG, null))
  if (storedConv && storedMsg) {
    conversations = storedConv
    messages = storedMsg
  } else {
    const s = seed()
    conversations = s.conversations
    messages = s.messages
    persist()
  }
}

// Conserva solo las últimas MAX_IMAGES_PER_CONV imágenes por conversación;
// a las más viejas les vacía content/image_url (la UI muestra placeholder).
function capImages() {
  for (const convId of Object.keys(messages)) {
    const list = messages[convId]
    const imageIdx = list.reduce<number[]>((acc, m, i) => (m.type === 'image' ? [...acc, i] : acc), [])
    const excess = imageIdx.length - MAX_IMAGES_PER_CONV
    if (excess <= 0) continue
    for (const i of imageIdx.slice(0, excess)) {
      if (list[i].content || list[i].image_url) {
        list[i] = { ...list[i], content: '', image_url: null }
      }
    }
  }
}

function persist() {
  capImages()
  write(LS_CONV, conversations)
  write(LS_MSG, messages)
}

// ── Suscripciones ────────────────────────────────────────────────────────────

const listeners = new Map<string, Set<(e: ChatEvent) => void>>()

function emit(convId: string, event: ChatEvent) {
  listeners.get(convId)?.forEach((cb) => cb(event))
}

// ── Helpers de dominio ───────────────────────────────────────────────────────

function previewOf(msg: Message): string {
  if (msg.type === 'image') return '📷 Foto'
  if (msg.type === 'system') return msg.content
  return msg.content
}

function touchConversation(convId: string, msg: Message) {
  const conv = conversations.find((c) => c.id === convId)
  if (!conv) return
  conv.last_message = previewOf(msg)
  conv.last_message_at = msg.created_at
  // El no leído sube para el lado que NO envió
  if (msg.sender_id === conv.client_id) conv.unread_count_professional += 1
  else if (msg.sender_id === conv.professional_id) conv.unread_count_client += 1
}

const AUTO_REPLIES = [
  'Dale, perfecto 👍',
  '¿Te viene bien mañana a la mañana?',
  'Genial, cualquier cosa me avisás.',
  'Ok, lo reviso y te confirmo.',
  'Buenísimo, gracias!',
]

function scheduleSimulatedResponses(convId: string, sentMsg: Message) {
  const conv = conversations.find((c) => c.id === convId)
  if (!conv) return
  const other = sentMsg.sender_id === conv.client_id ? conv.professional_id : conv.client_id

  // Read receipts: entregado ~1.2s, leído ~2.5s
  setTimeout(() => {
    updateStatus(convId, sentMsg.id, 'delivered')
  }, 1200)
  setTimeout(() => {
    updateStatus(convId, sentMsg.id, 'read')
  }, 2500)

  // Respuesta automática del otro lado (solo texto, ~60% de las veces)
  if (sentMsg.type === 'text' && Math.random() < 0.6) {
    setTimeout(() => {
      const reply: Message = {
        id: uid(),
        conversation_id: convId,
        sender_id: other,
        type: 'text',
        content: AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)],
        image_url: null,
        status: 'sent',
        created_at: now(),
      }
      messages[convId] = [...(messages[convId] ?? []), reply]
      touchConversation(convId, reply)
      persist()
      emit(convId, { kind: 'message', message: reply })
    }, 2500 + Math.random() * 2000)
  }
}

function updateStatus(convId: string, messageId: string, status: Message['status']) {
  const list = messages[convId]
  if (!list) return
  const msg = list.find((x) => x.id === messageId)
  if (!msg || msg.status === status) return
  msg.status = status
  persist()
  emit(convId, { kind: 'status', messageId, status })
}

// ── Implementación del contrato ──────────────────────────────────────────────

export const chatServiceMock: ChatService = {
  async getConversations(userId) {
    ensureLoaded()
    return conversations
      .filter((c) => c.client_id === userId || c.professional_id === userId)
      .sort((a, b) => b.last_message_at.localeCompare(a.last_message_at))
      .map((c) => ({ ...c })) // copia defensiva
  },

  async getConversation(conversationId) {
    ensureLoaded()
    const c = conversations.find((x) => x.id === conversationId)
    return c ? { ...c } : null
  },

  async getOrCreateConversation({ clientId, professionalId, serviceRequestId }: StartConversationParams) {
    ensureLoaded()
    const existing = conversations.find((c) =>
      (serviceRequestId != null && c.service_request_id === serviceRequestId) ||
      (c.client_id === clientId && c.professional_id === professionalId),
    )
    if (existing) return { ...existing }
    const conv: Conversation = {
      id: uid(),
      client_id: clientId,
      professional_id: professionalId,
      service_request_id: serviceRequestId ?? null,
      last_message: '',
      last_message_at: now(),
      unread_count_client: 0,
      unread_count_professional: 0,
      created_at: now(),
    }
    conversations = [conv, ...conversations]
    messages[conv.id] = []
    persist()
    return { ...conv }
  },

  async getMessages(conversationId) {
    ensureLoaded()
    return (messages[conversationId] ?? [])
      .slice()
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((m) => ({ ...m }))
  },

  async sendMessage(conversationId, msg: NewMessage) {
    ensureLoaded()
    // Simular fallo de red aleatorio (5%) — la UI muestra "reintentar"
    await delay(300 + Math.random() * 300)
    if (Math.random() < 0.05) {
      throw new Error('No se pudo enviar el mensaje')
    }
    const message: Message = {
      id: uid(),
      conversation_id: conversationId,
      sender_id: msg.sender_id,
      type: msg.type,
      content: msg.content,
      image_url: msg.image_url ?? null,
      status: 'sent',
      created_at: now(),
    }
    messages[conversationId] = [...(messages[conversationId] ?? []), message]
    touchConversation(conversationId, message)
    persist()
    scheduleSimulatedResponses(conversationId, message)
    return { ...message }
  },

  subscribeToMessages(conversationId, cb) {
    let set = listeners.get(conversationId)
    if (!set) {
      set = new Set()
      listeners.set(conversationId, set)
    }
    set.add(cb)
    return () => {
      set?.delete(cb)
      if (set && set.size === 0) listeners.delete(conversationId)
    }
  },

  async markAsRead(conversationId, userId) {
    ensureLoaded()
    const conv = conversations.find((c) => c.id === conversationId)
    if (!conv) return
    if (userId === conv.client_id) conv.unread_count_client = 0
    else if (userId === conv.professional_id) conv.unread_count_professional = 0
    persist()
  },
}

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms))
}
