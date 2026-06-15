// src/components/ticket/TicketEntryCard.tsx
import { useNavigate } from 'react-router-dom'

export function TicketEntryCard() {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate('/ticket')}
      className="w-full text-left flex items-center gap-3 active:opacity-80 transition-opacity rounded-2xl p-4"
      style={{
        background: '#FFFFFF',
        border: '2px solid #E8683A',
        boxShadow: '0 2px 12px rgba(232,104,58,.12)',
      }}
    >
      {/* Ícono */}
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: 'linear-gradient(135deg,#E8683A,#c44d1f)',
          fontSize: 22,
        }}
      >
        ✨
      </div>

      {/* Texto */}
      <div className="flex-1 min-w-0">
        <p className="font-black text-sm leading-tight" style={{ color: '#111111' }}>
          Describí tu problema
        </p>
        <p className="text-xs mt-0.5" style={{ color: '#888888' }}>
          La IA encuentra al profesional ideal
        </p>
      </div>

      {/* Flecha */}
      <span className="text-lg flex-shrink-0" style={{ color: '#E8683A' }}>›</span>
    </button>
  )
}
