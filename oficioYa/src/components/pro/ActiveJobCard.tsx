import { createElement } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Clock, Calendar, Navigation, Flag, CheckCircle2, Siren } from 'lucide-react'
import type { ServiceRequest } from '../../store/requestStore'
import { getCategoryMeta, getCategoryIcon } from '../../lib/categories'
import { timeAgo, formatScheduled } from '../../lib/proFormat'

interface ActiveJobCardProps {
  req: ServiceRequest
  onProgress: (s: ServiceRequest['status']) => void
  onChat: () => void
  sentProgress?: boolean
}

export function ActiveJobCard({ req, onProgress, onChat, sentProgress = false }: ActiveJobCardProps) {
  const { label } = getCategoryMeta(req.category)
  const isInProgress = req.status === 'in_progress'

  return (
    <motion.div
      className="overflow-hidden"
      style={{
        background: '#FFFFFF',
        border: '1px solid #ECE6DC',
        borderRadius: 20,
        boxShadow: '0 2px 6px rgba(60,40,20,.04), 0 12px 28px -12px rgba(60,40,20,.14)',
      }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-3.5 py-2"
        style={{
          background: isInProgress ? 'rgba(139,92,246,.06)' : 'rgba(34,197,94,.06)',
          borderBottom: `1px solid ${isInProgress ? 'rgba(139,92,246,.12)' : 'rgba(34,197,94,.12)'}`,
        }}
      >
        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest" style={{ color: isInProgress ? '#7C3AED' : '#16A34A' }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: isInProgress ? '#8B5CF6' : '#22C55E' }} />
          {isInProgress
            ? createElement(Navigation, { size: 9, style: { color: '#7C3AED' } })
            : createElement(CheckCircle2, { size: 9, style: { color: '#16A34A' } })}
          {isInProgress ? 'En camino' : 'Confirmado'}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px]" style={{ color: '#B3A794' }}>
          <Clock size={9} /> {timeAgo(req.created_at)}
        </span>
      </div>

      <div className="px-3.5 pt-3 pb-3.5 flex flex-col gap-2.5">
        <div className="flex gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(232,104,58,.1)', color: '#E8683A' }}>
            {createElement(getCategoryIcon(req.category), { size: 9, style: { color: '#D4571F' } })}
            {label}
          </span>
          {req.urgency && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(239,68,68,.1)', color: '#DC2626' }}>
              <Siren size={9} style={{ color: '#DC2626' }} /> Urgente
            </span>
          )}
        </div>

        <p className="text-sm leading-relaxed line-clamp-2" style={{ color: '#333' }}>{req.description}</p>

        {req.scheduled_date && (
          <div className="flex items-center gap-1.5 rounded-xl px-3 py-2" style={{ background: 'rgba(232,104,58,.08)', border: '1px solid rgba(232,104,58,.2)' }}>
            <Calendar size={11} style={{ color: '#E8683A', flexShrink: 0 }} />
            <span className="text-xs font-bold" style={{ color: '#E8683A' }}>{formatScheduled(req.scheduled_date)}</span>
          </div>
        )}

        {req.contact_phone && (
          <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: '#F5F0E8', border: '1px solid #ECE4D8' }}>
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#B3A794' }}>Tel</span>
            <span className="text-sm font-semibold" style={{ color: '#111111' }}>{req.contact_phone}</span>
          </div>
        )}

        <div className="flex gap-2">
          <motion.button
            type="button"
            onClick={() => onProgress(isInProgress ? 'completed' : 'in_progress')}
            whileTap={{ scale: 0.97 }}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold"
            style={{
              background: sentProgress ? '#DCFCE7' : isInProgress ? '#DCFCE7' : '#EEF2FF',
              color: sentProgress ? '#16A34A' : isInProgress ? '#16A34A' : '#4F46E5',
              border: `1px solid ${sentProgress || isInProgress ? '#BBF7D0' : '#C7D2FE'}`,
            }}
          >
            {sentProgress
              ? <><CheckCircle2 size={13} /> Cliente notificado</>
              : isInProgress
                ? <><Flag size={13} /> Completado</>
                : <><Navigation size={13} /> En camino</>}
          </motion.button>
          <motion.button
            type="button"
            onClick={onChat}
            whileTap={{ scale: 0.97 }}
            className="w-12 flex items-center justify-center rounded-xl flex-shrink-0"
            style={{ background: 'rgba(232,104,58,.1)', color: '#E8683A', border: '1px solid rgba(232,104,58,.2)' }}
          >
            <MessageCircle size={15} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
