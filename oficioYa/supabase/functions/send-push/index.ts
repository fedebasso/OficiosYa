// Edge Function: send-push
// Fase 2 — se activa via Supabase Realtime cuando cambia requests.status
// Busca la suscripción del destinatario en push_subscriptions y envía push via VAPID
//
// Para implementar:
// 1. Instalar web-push: deno add npm:web-push
// 2. Configurar VAPID_PRIVATE_KEY en Supabase Secrets
// 3. Implementar el handler que llama webPush.sendNotification(subscription, payload)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { userId, payload } = await req.json()

  // TODO fase 2:
  // const sub = await supabase.from('push_subscriptions').select().eq('user_id', userId).single()
  // await webPush.sendNotification(sub, JSON.stringify(payload), { vapidDetails: {...} })

  return new Response(JSON.stringify({ ok: true, userId, payload }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
