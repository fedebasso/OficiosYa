import { env } from './env'
import type { SupabaseClient } from '@supabase/supabase-js'

// Carga diferida del cliente Supabase: el paquete pesado (@supabase/supabase-js,
// ~50KB gzip) se importa dinámicamente sólo la primera vez que realmente se usa.
// En modo demo nunca se llama, por lo que no entra al critical path del arranque.
let client: SupabaseClient | null = null

export async function getSupabase(): Promise<SupabaseClient> {
  if (client) return client
  const { createClient } = await import('@supabase/supabase-js')
  client = createClient(
    env.supabaseUrl || 'https://placeholder.supabase.co',
    env.supabaseKey || 'placeholder',
  )
  return client
}
