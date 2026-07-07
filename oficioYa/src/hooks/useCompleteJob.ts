import { useState, useCallback } from 'react'
import type { ServiceRequest } from '../store/requestStore'
import { earningsService } from '../services/earningsService'
import { chatService } from '../services/chatService'
import { useToastStore } from '../store/toastStore'
import { formatUYU } from '../lib/money'

/**
 * Orquesta el completado de un trabajo con monto.
 * @param onCompleted  la pantalla marca el request como 'completed' en SU store.
 */
export function useCompleteJob(onCompleted: (reqId: string, amount: number) => void) {
  const [completing, setCompleting] = useState<ServiceRequest | null>(null)
  const showToast = useToastStore((s) => s.show)

  const open = useCallback((req: ServiceRequest) => setCompleting(req), [])
  const close = useCallback(() => setCompleting(null), [])

  const confirm = useCallback(async (amount: number) => {
    const req = completing
    if (!req) return
    const completedAt = new Date().toISOString()
    onCompleted(req.id, amount)  // optimista

    await earningsService.recordJob({
      requestId: req.id,
      proId: req.professional_id,
      clientName: 'Cliente',
      category: req.category || 'Servicio',
      amount,
      completedAt,
    })

    // Mensaje de sistema en el chat de la solicitud (no bloquea si falla)
    try {
      if (req.client_id) {
        const conv = await chatService.getOrCreateConversation({
          clientId: req.client_id,
          professionalId: req.professional_id,
          serviceRequestId: req.id,
        })
        await chatService.sendMessage(conv.id, {
          sender_id: req.professional_id,
          type: 'system',
          content: `Trabajo finalizado — ${formatUYU(amount)}`,
        })
      }
    } catch { /* demo: el chat es best-effort */ }

    setCompleting(null)
    showToast(`Sumaste ${formatUYU(amount)}`, { label: 'Ver ganancias', to: '/pro/ganancias' })
  }, [completing, onCompleted, showToast])

  return { completing, open, close, confirm }
}
