import { create } from 'zustand'
import { chatService, type Conversation } from '../services/chatService'
import { unreadFor } from '../lib/chatParticipants'

// Store fino: mantiene la lista de conversaciones para la pantalla Mensajes y el
// badge de no-leídos de la navegación. Todo el acceso a datos pasa por chatService.

interface ChatStore {
  conversations: Conversation[]
  loading: boolean
  loadedForUser: string | null
  load: (userId: string) => Promise<void>
  totalUnread: (userId: string) => number
}

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [],
  loading: false,
  loadedForUser: null,

  load: async (userId) => {
    set({ loading: true })
    const conversations = await chatService.getConversations(userId)
    set({ conversations, loading: false, loadedForUser: userId })
  },

  totalUnread: (userId) =>
    get().conversations.reduce((sum, c) => sum + unreadFor(c, userId), 0),
}))
