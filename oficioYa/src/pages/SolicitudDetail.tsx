// src/pages/SolicitudDetail.tsx
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, MessageCircle, XCircle, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageShell } from '../components/layout/PageShell'
import { useRequestStore } from '../store/requestStore'
import { ReviewForm } from '../components/requests/ReviewForm'
import { PortfolioItemForm } from '../components/pro/portfolio/PortfolioItemForm'
import { useAuthStore } from '../store/authStore'
import { fadeUp, scaleIn, staggerContainer, SPRING_SOFT } from '../lib/motion'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string; desc: string }> = {
  pending:     { label: 'Pendiente',   color: '#f59e0b', bg: 'rgba(245,158,11,.1)',  icon: '⏳', desc: 'Esperando que el profesional confirme tu solicitud.' },
  confirmed:   { label: 'Confirmado',  color: '#3b82f6', bg: 'rgba(59,130,246,.1)', icon: '✅', desc: 'El profesional aceptó tu solicitud. Podés chatear con él desde acá.' },
  in_progress: { label: 'En camino',   color: '#8b5cf6', bg: 'rgba(139,92,246,.1)', icon: '🚗', desc: 'El profesional está en camino a tu domicilio.' },
  completed:   { label: 'Completado',  color: '#22c55e', bg: 'rgba(34,197,94,.1)',  icon: '🏁', desc: 'Trabajo finalizado. ¡Dejá tu reseña!' },
  cancelled:   { label: 'Cancelado',   color: '#ef4444', bg: 'rgba(239,68,68,.1)',  icon: '❌', desc: 'La solicitud fue cancelada.' },
}

const WORK_TYPE_LABELS: Record<string, string> = {
  reparacion:    'Reparación',
  instalacion:   'Instalación',
  mantenimiento: 'Mantenimiento',
  otro:          'Otro',
}

const STEPS = ['pending', 'confirmed', 'in_progress', 'completed'] as const

function openWhatsApp(phone: string) {
  const clean = phone.replace(/[\s\-().+]/g, '')
  if (!clean) return
  const msg = encodeURIComponent('Hola, te contacto por mi solicitud en OFIX.')
  window.open(`https://wa.me/${clean}?text=${msg}`, '_blank')
}

export default function SolicitudDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { requests, updateStatus, submitReview } = useRequestStore()
  const user = useAuthStore((s) => s.user)
  const [showReview, setShowReview] = useState(false)
  const [showCancel, setShowCancel] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [showPortfolioForm, setShowPortfolioForm] = useState(false)
  const [portfolioAdded, setPortfolioAdded] = useState(false)

  const req = requests.find((r) => r.id === id)

  if (!req) {
    return (
      <PageShell showBottomNav={false}>
        <motion.div
          variants={scaleIn} initial="hidden" animate="visible"
          className="flex flex-col items-center gap-4 py-24 text-center px-6"
        >
          <div className="text-4xl">📋</div>
          <p className="font-black text-base" style={{ color: '#111' }}>Solicitud no encontrada</p>
          <motion.button
            type="button" onClick={() => navigate('/mis-solicitudes')}
            whileTap={{ scale: 0.97 }} transition={SPRING_SOFT}
            className="rounded-2xl px-6 py-3 text-sm font-bold text-white"
            style={{ background: '#E8683A' }}
          >
            Ver mis solicitudes
          </motion.button>
        </motion.div>
      </PageShell>
    )
  }

  const status = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.pending
  const date = new Date(req.created_at).toLocaleDateString('es', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
  const time = new Date(req.created_at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
  const currentStepIndex = STEPS.indexOf(req.status as typeof STEPS[number])
  const isCancelled = req.status === 'cancelled'

  const header = (
    <div className="px-4 pt-10 pb-4 sticky top-0 z-50 flex items-center gap-3"
      style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E0D4', boxShadow: '0 1px 0 #E8E0D4, 0 2px 8px rgba(0,0,0,.04)' }}>
      <button type="button" onClick={() => navigate(-1)}
        className="p-1 -ml-1 rounded-full active:opacity-60 flex-shrink-0">
        <ChevronLeft size={24} style={{ color: '#111' }} />
      </button>
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-black" style={{ color: '#111' }}>Detalle de solicitud</h1>
        <p className="text-xs" style={{ color: '#AAA' }}>{date}</p>
      </div>
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
        style={{ background: status.bg, color: status.color }}>
        {status.icon} {status.label}
      </div>
    </div>
  )

  return (
    <PageShell showBottomNav={false} header={header}>
      <motion.div
        variants={staggerContainer} initial="hidden" animate="visible"
        className="p-4 flex flex-col gap-3 pb-8"
      >

        {/* Progreso visual (solo si no está cancelado) */}
        {!isCancelled && (
          <motion.div variants={fadeUp}
            className="rounded-2xl p-4"
            style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#AAA' }}>
              Estado del pedido
            </p>
            <div className="flex items-center gap-0">
              {STEPS.map((step, i) => {
                const cfg = STATUS_CONFIG[step]
                const done = i <= currentStepIndex
                const active = i === currentStepIndex
                return (
                  <div key={step} className="flex items-center flex-1">
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black"
                        style={{
                          background: done ? cfg.color : '#EDE8DE',
                          color: done ? '#fff' : '#AAA',
                          boxShadow: active ? `0 0 0 4px ${cfg.color}22` : 'none',
                        }}>
                        {done ? '✓' : i + 1}
                      </div>
                      <span className="text-[8px] font-bold text-center leading-tight" style={{ color: done ? cfg.color : '#CCC', maxWidth: 44 }}>
                        {cfg.label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className="flex-1 h-0.5 mx-1 rounded-full"
                        style={{ background: i < currentStepIndex ? status.color : '#EDE8DE' }} />
                    )}
                  </div>
                )
              })}
            </div>
            <p className="text-xs mt-3 leading-relaxed" style={{ color: '#666' }}>{status.desc}</p>
          </motion.div>
        )}

        {/* Descripción del trabajo */}
        <motion.div variants={fadeUp}
          className="rounded-2xl overflow-hidden"
          style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}
        >
          <div className="px-4 py-2.5" style={{ background: '#F5F0E8', borderBottom: '1px solid #EDE8DE' }}>
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#999' }}>Descripción</p>
          </div>
          <div className="p-4 flex flex-col gap-2">
            <p className="text-sm leading-relaxed" style={{ color: '#333' }}>{req.description}</p>
            <div className="flex gap-2 flex-wrap mt-1">
              {req.work_type && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: '#F5F0E8', color: '#666' }}>
                  📋 {WORK_TYPE_LABELS[req.work_type] ?? req.work_type}
                </span>
              )}
              {req.location && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: '#F5F0E8', color: '#666' }}>
                  📍 {req.location}
                </span>
              )}
              {req.address && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: '#F5F0E8', color: '#666' }}>
                  📍 {req.address}
                </span>
              )}
              {req.scheduled_date && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: '#F5F0E8', color: '#666' }}>
                  📅 {new Date(req.scheduled_date).toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              {req.urgency && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(239,68,68,.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,.2)' }}>
                  🚨 Urgente
                </span>
              )}
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: '#F5F0E8', color: '#888' }}>
                🕐 {time}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Contacto */}
        {req.contact_phone && (
          <motion.div variants={fadeUp}
            className="rounded-2xl p-4"
            style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}
          >
            <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#AAA' }}>
              Tu teléfono de contacto
            </p>
            <p className="text-sm font-bold" style={{ color: '#111' }}>📱 {req.contact_phone}</p>
          </motion.div>
        )}

        {/* Acciones */}
        <motion.div variants={fadeUp} className="flex flex-col gap-2 mt-1">

          {/* Chat — disponible cuando el profesional aceptó */}
          {(req.status === 'confirmed' || req.status === 'in_progress' || req.status === 'completed') && (
            <motion.button
              type="button"
              onClick={() => navigate(`/solicitud/${req.id}/chat`)}
              whileTap={{ scale: 0.97 }} transition={SPRING_SOFT}
              className="w-full rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-2 text-white"
              style={{ background: '#E8683A', boxShadow: '0 4px 14px rgba(232,104,58,.25)' }}
            >
              <MessageCircle size={16} />
              Chatear con el profesional
            </motion.button>
          )}

          {/* WhatsApp — solo cuando el profesional aceptó */}
          {(req.status === 'confirmed' || req.status === 'in_progress') && req.contact_phone && (
            <motion.button
              type="button"
              onClick={() => openWhatsApp(req.contact_phone!)}
              whileTap={{ scale: 0.97 }} transition={SPRING_SOFT}
              className="w-full rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-2 text-white"
              style={{ background: '#25D366', boxShadow: '0 4px 14px rgba(37,211,102,.25)' }}
            >
              <MessageCircle size={16} />
              Contactar por WhatsApp
            </motion.button>
          )}

          {/* Dejar reseña — solo si completado */}
          {req.status === 'completed' && (
            <motion.button
              type="button"
              onClick={() => setShowReview(true)}
              whileTap={{ scale: 0.97 }} transition={SPRING_SOFT}
              className="w-full rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-2"
              style={{ background: 'rgba(232,104,58,.1)', color: '#E8683A', border: '1.5px solid rgba(232,104,58,.25)' }}
            >
              <Star size={16} />
              Dejar reseña
            </motion.button>
          )}

          {/* Agregar a portfolio — solo si completado y es profesional */}
          {req.status === 'completed' && user?.role === 'professional' && !portfolioAdded && (
            <button
              type="button"
              onClick={() => setShowPortfolioForm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold"
              style={{ background: '#FEF0EA', color: '#E8683A', border: '1.5px solid #FDDCC8' }}
            >
              📸 Agregar a mi portfolio
            </button>
          )}

          {portfolioAdded && (
            <div
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold"
              style={{ background: '#F0FDF4', color: '#0F6E56', border: '1.5px solid #86EFAC' }}
            >
              ✓ Trabajo agregado al portfolio
            </div>
          )}

          {/* Cancelar — solo si está pendiente */}
          {req.status === 'pending' && (
            <motion.button
              type="button"
              onClick={() => setShowCancel(true)}
              whileTap={{ scale: 0.97 }} transition={SPRING_SOFT}
              className="w-full rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-2"
              style={{ background: 'rgba(239,68,68,.06)', color: '#ef4444', border: '1.5px solid rgba(239,68,68,.15)' }}
            >
              <XCircle size={16} />
              Cancelar solicitud
            </motion.button>
          )}

        </motion.div>

        {/* CTA buscar otro profesional (solo para solicitudes canceladas) */}
        {isCancelled && (
          <motion.div variants={fadeUp}>
            <div
              className="rounded-2xl p-4 flex flex-col gap-3"
              style={{ background: 'rgba(232,104,58,.06)', border: '1.5px solid rgba(232,104,58,.2)' }}
            >
              <div>
                <p className="text-sm font-black" style={{ color: '#111111' }}>
                  El profesional no pudo tomar el trabajo
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#AAAAAA' }}>
                  Podés enviar la misma solicitud a otro profesional.
                </p>
              </div>
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/buscar-profesional/${req.id}`)}
                className="w-full rounded-2xl py-3.5 text-sm font-bold text-white"
                style={{ background: '#E8683A', boxShadow: '0 4px 14px rgba(232,104,58,.3)' }}
              >
                🔍 Buscar otro profesional
              </motion.button>
            </div>
          </motion.div>
        )}

      </motion.div>

      {/* Modal reseña */}
      <AnimatePresence>
        {showReview && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ background: 'rgba(0,0,0,.6)' }}
            onClick={() => setShowReview(false)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="w-full max-w-md rounded-t-2xl p-6"
              style={{ background: '#FFFFFF' }}
              onClick={(e) => e.stopPropagation()}
            >
              <ReviewForm
                requestId={req.id}
                onSubmit={async (rating, comment) => {
                  await submitReview(req.id, rating, comment)
                  setShowReview(false)
                }}
                onClose={() => setShowReview(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal portfolio */}
      <AnimatePresence>
        {showPortfolioForm && user?.id && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ background: 'rgba(0,0,0,.6)' }}
            onClick={() => setShowPortfolioForm(false)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="w-full max-w-md rounded-t-2xl p-6"
              style={{ background: '#FFFFFF' }}
              onClick={(e) => e.stopPropagation()}
            >
              <PortfolioItemForm
                item={null}
                proId={user.id}
                prefill={{
                  category: req.category ?? null,
                  description: req.description ?? null,
                  request_id: req.id ?? null,
                }}
                onSave={() => { setPortfolioAdded(true); setShowPortfolioForm(false) }}
                onClose={() => setShowPortfolioForm(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal cancelar */}
      <AnimatePresence>
        {showCancel && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ background: 'rgba(0,0,0,.6)' }}
            onClick={() => setShowCancel(false)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="w-full max-w-md rounded-t-2xl p-6 flex flex-col gap-4"
              style={{ background: '#FFFFFF' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#ef4444' }}>
                  Cancelar solicitud
                </p>
                <p className="text-base font-black" style={{ color: '#111' }}>¿Confirmás la cancelación?</p>
                <p className="text-sm mt-1" style={{ color: '#999' }}>El profesional será notificado.</p>
              </div>
              <div className="flex gap-2.5">
                <motion.button
                  type="button" onClick={() => setShowCancel(false)}
                  whileTap={{ scale: 0.97 }} transition={SPRING_SOFT}
                  className="flex-1 rounded-xl py-3 text-sm font-bold"
                  style={{ background: '#EDE8DE', color: '#555', border: '1.5px solid #E8E0D4' }}
                >
                  Volver
                </motion.button>
                <motion.button
                  type="button"
                  onClick={async () => {
                    setCancelling(true)
                    await updateStatus(req.id, 'cancelled')
                    setCancelling(false)
                    setShowCancel(false)
                  }}
                  disabled={cancelling}
                  whileTap={{ scale: 0.97 }} transition={SPRING_SOFT}
                  className="flex-1 rounded-xl py-3 text-sm font-bold text-white disabled:opacity-60"
                  style={{ background: '#ef4444' }}
                >
                  {cancelling ? 'Cancelando...' : 'Sí, cancelar'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  )
}
