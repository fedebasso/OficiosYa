export type CategoryKey =
  | 'electricista'
  | 'plomero'
  | 'albanil'
  | 'cerrajero'
  | 'aire_acondicionado'
  | 'pintor'

export const CATEGORY_LABELS: Record<string, string> = {
  electricista:       'Electricista',
  plomero:            'Sanitario',
  albanil:            'Albañil',
  cerrajero:          'Cerrajero',
  aire_acondicionado: 'Aire Ac.',
  pintor:             'Pintor',
}

export const CATEGORY_EMOJI: Record<string, string> = {
  electricista:       '⚡',
  plomero:            '🚿',
  albanil:            '🧱',
  cerrajero:          '🔑',
  aire_acondicionado: '❄️',
  pintor:             '🎨',
}

export const CATEGORY_COVER: Record<string, string> = {
  electricista:       'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  plomero:            'https://images.unsplash.com/photo-1621905251189-08b45249a5c5?w=800&q=80',
  albanil:            'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
  cerrajero:          'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80',
  aire_acondicionado: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80',
  pintor:             'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&q=80',
}

export const CATEGORY_COVER_THUMB: Record<string, string> = {
  electricista:       'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=75',
  plomero:            'https://images.unsplash.com/photo-1621905251189-08b45249a5c5?w=400&q=75',
  albanil:            'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=75',
  cerrajero:          'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&q=75',
  aire_acondicionado: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&q=75',
  pintor:             'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&q=75',
}

export const CATEGORY_ACCENT: Record<string, string> = {
  electricista:       '#e8683a',
  plomero:            '#3b82f6',
  albanil:            '#f59e0b',
  cerrajero:          '#8b5cf6',
  aire_acondicionado: '#14b8a6',
  pintor:             '#ef4444',
}

export const CATEGORY_GRADIENT: Record<CategoryKey, string> = {
  electricista:       'linear-gradient(135deg, #FFF3C4, #FDE68A)',
  plomero:            'linear-gradient(135deg, #DBEAFE, #BFDBFE)',
  albanil:            'linear-gradient(135deg, #FEF3C7, #FDE68A)',
  cerrajero:          'linear-gradient(135deg, #F3E8FF, #E9D5FF)',
  aire_acondicionado: 'linear-gradient(135deg, #CCFBF1, #99F6E4)',
  pintor:             'linear-gradient(135deg, #FEE2E2, #FECACA)',
}

export const CATEGORY_AVATAR_GRADIENT: Record<CategoryKey, string> = {
  electricista:       'linear-gradient(135deg, #FEF0EA, #FDDCC8)',
  plomero:            'linear-gradient(135deg, #DBEAFE, #BFDBFE)',
  albanil:            'linear-gradient(135deg, #FEF9C3, #FDE68A)',
  cerrajero:          'linear-gradient(135deg, #F3E8FF, #E9D5FF)',
  aire_acondicionado: 'linear-gradient(135deg, #CCFBF1, #99F6E4)',
  pintor:             'linear-gradient(135deg, #FEE2E2, #FECACA)',
}

const FALLBACK_COVER = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80'
const FALLBACK_COVER_THUMB = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=75'

export function getCategoryMeta(cat: string) {
  return {
    label:          CATEGORY_LABELS[cat]          ?? cat,
    emoji:          CATEGORY_EMOJI[cat]           ?? '🛠️',
    cover:          CATEGORY_COVER[cat]           ?? FALLBACK_COVER,
    coverThumb:     CATEGORY_COVER_THUMB[cat]     ?? FALLBACK_COVER_THUMB,
    accent:         CATEGORY_ACCENT[cat]          ?? '#e8683a',
    gradient:       CATEGORY_GRADIENT[cat as CategoryKey]        ?? 'linear-gradient(135deg, #F5F0E8, #EDE8DE)',
    avatarGradient: CATEGORY_AVATAR_GRADIENT[cat as CategoryKey] ?? 'linear-gradient(135deg, #FEF0EA, #FDDCC8)',
  }
}
