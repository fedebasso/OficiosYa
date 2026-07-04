// Resolución de nombre/avatar/oficio de un participante del chat a partir de su
// id. Es presentación (no toca datos del chat). Con Supabase esto se reemplaza
// por un join a `profiles`/`professionals`.

import { MOCK_PROFESSIONALS } from '../data/mockProfessionals'
import { getCategoryMeta } from './categories'
import { getInitials } from './utils'
import type { Conversation } from '../services/chatService.types'

export interface Participant {
  id: string
  name: string
  avatarUrl: string | null
  subtitle: string // oficio (pro) o "Cliente"
  initials: string
}

// Usuarios demo que no están en MOCK_PROFESSIONALS
const DEMO_USERS: Record<string, { name: string; proId?: string; subtitle: string }> = {
  'mock-client-1': { name: 'María González', subtitle: 'Cliente' },
  'mock-pro-1': { name: 'Carlos Méndez', proId: '1', subtitle: 'Electricista' },
}

function fromProfessional(id: string): Participant | null {
  const pro = MOCK_PROFESSIONALS.find((p) => p.id === id)
  if (!pro) return null
  return {
    id,
    name: pro.profiles.full_name,
    avatarUrl: pro.profiles.avatar_url ?? null,
    subtitle: getCategoryMeta(pro.categories[0] ?? '').label,
    initials: getInitials(pro.profiles.full_name),
  }
}

export function resolveParticipant(userId: string): Participant {
  const demo = DEMO_USERS[userId]
  if (demo) {
    const pro = demo.proId ? fromProfessional(demo.proId) : null
    return {
      id: userId,
      name: demo.name,
      avatarUrl: pro?.avatarUrl ?? null,
      subtitle: demo.subtitle,
      initials: getInitials(demo.name),
    }
  }
  return (
    fromProfessional(userId) ?? {
      id: userId,
      name: 'Usuario',
      avatarUrl: null,
      subtitle: '',
      initials: '?',
    }
  )
}

/** El otro participante de la conversación según quién está mirando. */
export function otherParticipant(conv: Conversation, viewerId: string): Participant {
  const otherId = viewerId === conv.client_id ? conv.professional_id : conv.client_id
  return resolveParticipant(otherId)
}

/** Contador de no leídos que le corresponde al viewer. */
export function unreadFor(conv: Conversation, viewerId: string): number {
  if (viewerId === conv.client_id) return conv.unread_count_client
  if (viewerId === conv.professional_id) return conv.unread_count_professional
  return 0
}
