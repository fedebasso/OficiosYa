// Punto de entrada del chat. La UI importa SIEMPRE desde acá:
//   import { chatService } from '../services/chatService'
//
// Hoy apunta al mock. Cuando exista Supabase:
//   1. crear chatService.supabase.ts (misma interfaz ChatService, Realtime channels)
//   2. cambiar la línea de abajo por: export { chatServiceSupabase as chatService } from './chatService.supabase'
// La UI no se toca.

export * from './chatService.types'
export { chatServiceMock as chatService } from './chatService.mock'
