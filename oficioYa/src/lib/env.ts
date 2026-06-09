/**
 * Detección de entorno.
 * La app corre en modo DEMO si:
 *   - No hay .env
 *   - VITE_SUPABASE_URL está vacía o no es una URL válida de Supabase
 * Nunca rompe si faltan variables.
 */

const url = import.meta.env.VITE_SUPABASE_URL ?? ''

export const IS_DEMO_MODE = !url.startsWith('https://')

export const env = {
  supabaseUrl:  url,
  supabaseKey:  import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
  isDemoMode:   IS_DEMO_MODE,
} as const
