/**
 * Detección de entorno.
 * La app corre en modo DEMO si:
 *   - No hay .env
 *   - VITE_SUPABASE_URL está vacía o no es una URL válida de Supabase
 * Nunca rompe si faltan variables.
 */

const url = import.meta.env.VITE_SUPABASE_URL ?? ''
const key = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

// Demo mode si la URL está vacía, es placeholder, o la key es placeholder
export const IS_DEMO_MODE =
  !url.startsWith('https://') ||
  url.includes('placeholder') ||
  key.includes('placeholder') ||
  key === ''

export const env = {
  supabaseUrl:  url,
  supabaseKey:  key,
  isDemoMode:   IS_DEMO_MODE,
} as const
