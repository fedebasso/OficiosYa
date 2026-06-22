// src/pages/BuscarOtroProfesional.tsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageShell } from '../components/layout/PageShell'
import { useRequestStore } from '../store/requestStore'
import { useProfessionals } from '../hooks/useProfessionals'
import { scoreProfessional } from '../lib/scoring'
import { isInRadius } from '../lib/barrio-coords'
import { getCategoryMeta } from '../lib/categories'
import { SPRING_GENTLE, fadeUp, staggerFast } from '../lib/motion'

export default function BuscarOtroProfesional() {
  const { requestId } = useParams<{ requestId: string }>()
  const navigate = useNavigate()
  const { requests } = useRequestStore()

  const req = requests.find((r) => r.id === requestId)
  const category = req?.category ?? ''
  const clientZone = req?.location ?? ''

  const { professionals, loading } = useProfessionals(category)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const sorted = professionals
    .filter((p) => isInRadius(p.zone, p.radius_km, clientZone))
    .map((p) => ({ pro: p, score: scoreProfessional(p, clientZone) }))
    .sort((a, b) => b.score - a.score)
    .map(({ pro }) => pro)

  useEffect(() => {
    if (sorted.length > 0 && selectedId === null) setSelectedId(sorted[0].id)
  }, [sorted.length])

  const selectedPro = sorted.find((p) => p.id === selectedId) ?? null

  function handleContinuar() {
    if (!selectedPro || !req) return
    navigate('/ticket/confirmar', {
      state: {
        ticket: {
          title: req.description,
          description: req.description,
          category: req.category,
          urgent: req.urgency,
          work_type: req.work_type ?? 'otro',
        },
        proId: selectedPro.id,
        proName: selectedPro.profiles.full_name,
        proAvatar: selectedPro.profiles.avatar_url ?? null,
        proRating: selectedPro.avg_rating ?? null,
        zone: clientZone,
      },
    })
  }

  const { emoji, label } = getCategoryMeta(category)

  const header = (
    <div
      className="px-4 pt-10 pb-4 sticky top-0 z-50 flex items-center gap-3"
      style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E0D4', boxShadow: '0 1px 0 #E8E0D4, 0 2px 8px rgba(0,0,0,.04)' }}
    >
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="p-1 -ml-1 rounded-full active:opacity-60 transition-opacity flex-shrink-0"
      >
        <ChevronLeft size={24} style={{ color: '#111111' }} />
      </button>
      <div>
        <h1 className="text-base font-black leading-tight" style={{ color: '#111111' }}>
          Buscar otro profesional
        </h1>
        <p className="text-xs mt-0.5" style={{ color: '#AAAAAA' }}>
          {emoji} {label}{clientZone ? ` · ${clientZone}` : ''}
        </p>
      </div>
    </div>
  )

  if (!req) {
    return (
      <PageShell showBottomNav={false} header={header}>
        <div className="flex flex-col items-center gap-4 py-24 text-center px-6">
          <div className="text-4xl">📋</div>
          <p className="font-black text-base" style={{ color: '#111' }}>Solicitud no encontrada</p>
          <button
            type="button"
            onClick={() => navigate('/mis-solicitudes')}
            className="rounded-2xl px-6 py-3 text-sm font-bold text-white"
            style={{ background: '#E8683A' }}
          >
            Volver a mis solicitudes
          </button>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell showBottomNav={false} header={header}>
      <div className="flex flex-col pb-28" style={{ background: '#F9F6F2', minHeight: '100%' }}>

        {/* Descripción original */}
        <div className="p-4 pb-3" style={{ background: '#FFFFFF', borderBottom: '1px solid #F0EBE1' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#AAAAAA' }}>
            Tu solicitud original
          </p>
          <p className="text-sm leading-relaxed line-clamp-2" style={{ color: '#555555' }}>
            {req.description}
          </p>
        </div>

        {/* Lista de profesionales */}
        <div className="flex-1 p-4 flex flex-col gap-3">
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#AAAAAA' }}>
            Tocá para elegir un profesional
          </p>

          {loading && (
            <div className="flex flex-col gap-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-2xl"
                  style={{
                    background: 'linear-gradient(90deg,#EDE8DE 25%,#F5F0E8 50%,#EDE8DE 75%)',
                    backgroundSize: '200% 100%',
                    animation: `shimmer 1.4s ease-in-out ${i * 0.15}s infinite`,
                    border: '1.5px solid #E8E0D4',
                  }}
                />
              ))}
            </div>
          )}

          {!loading && sorted.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="text-4xl">😔</div>
              <p className="font-black text-base" style={{ color: '#111' }}>
                Sin profesionales disponibles
              </p>
              <p className="text-sm" style={{ color: '#AAA' }}>
                No encontramos profesionales para esta categoría en tu zona.
              </p>
            </div>
          )}

          {!loading && (
            <motion.div
              variants={staggerFast}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-3"
            >
              {sorted.slice(0, 8).map((pro) => {
                const selected = pro.id === selectedId
                return (
                  <motion.button
                    key={pro.id}
                    type="button"
                    variants={fadeUp}
                    onClick={() => setSelectedId(pro.id)}
                    whileTap={{ scale: 0.98 }}
                    className="rounded-2xl text-left w-full"
                    style={{
                      background: '#FFFFFF',
                      border: `2px solid ${selected ? '#E8683A' : '#EDE8DE'}`,
                      boxShadow: selected ? '0 2px 12px rgba(232,104,58,.18)' : '0 1px 3px rgba(0,0,0,.04)',
                    }}
                  >
                    <div className="flex items-center gap-3 p-3">
                      {pro.profiles.avatar_url ? (
                        <img
                          src={pro.profiles.avatar_url}
                          alt={pro.profiles.full_name}
                          className="rounded-xl object-cover flex-shrink-0"
                          style={{ width: 44, height: 44 }}
                        />
                      ) : (
                        <div
                          className="rounded-xl flex items-center justify-center flex-shrink-0 font-black text-white"
                          style={{ width: 44, height: 44, background: 'linear-gradient(135deg,#E8683A,#c44d1f)', fontSize: 17 }}
                        >
                          {pro.profiles.full_name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate" style={{ color: '#111' }}>
                          {pro.profiles.full_name}
                        </div>
                        <div className="text-[10px]" style={{ color: '#AAAAAA' }}>
                          {pro.avg_rating != null && (
                            <><span style={{ color: '#f59e0b' }}>★</span> {pro.avg_rating} · </>
                          )}
                          {pro.jobs_count} trabajos
                          {pro.response_time_min > 0 && ` · ~${pro.response_time_min}min`}
                        </div>
                        <span className="text-[9px] font-bold" style={{ color: '#AAAAAA' }}>
                          {pro.radius_km === null ? '🌍 Toda la ciudad' : `📍 ${pro.zone} · ${pro.radius_km} km`}
                        </span>
                      </div>
                      <div className="relative flex-shrink-0" style={{ width: 22, height: 22 }}>
                        <AnimatePresence mode="wait">
                          {selected ? (
                            <motion.div
                              key="selected"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                              className="absolute inset-0 rounded-full flex items-center justify-center font-black text-white"
                              style={{ background: '#E8683A', fontSize: 11 }}
                            >
                              ✓
                            </motion.div>
                          ) : (
                            <motion.div
                              key="unselected"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                              className="absolute inset-0 rounded-full"
                              style={{ border: '1.5px solid #DDD' }}
                            />
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </motion.div>
          )}
        </div>
      </div>

      {/* CTA fijo */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, ...SPRING_GENTLE }}
        className="fixed bottom-0 left-0 right-0 p-4"
        style={{ background: 'rgba(249,246,242,.96)', backdropFilter: 'blur(8px)', borderTop: '1px solid #EDE8DE', maxWidth: 480, margin: '0 auto' }}
      >
        <motion.button
          type="button"
          onClick={handleContinuar}
          disabled={!selectedPro}
          whileTap={{ scale: 0.97 }}
          className="w-full rounded-2xl py-4 text-base font-bold text-white disabled:opacity-40"
          style={{ background: '#E8683A', boxShadow: '0 4px 14px rgba(232,104,58,.3)' }}
        >
          {selectedPro
            ? `Continuar con ${selectedPro.profiles.full_name.split(' ')[0]} →`
            : 'Elegí un profesional'}
        </motion.button>
      </motion.div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </PageShell>
  )
}
