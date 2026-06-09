import { useNavigate } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <PageShell showBottomNav={false}>
      <div
        className="flex flex-col items-center justify-center min-h-screen gap-6 px-6 text-center"
        style={{ background: '#0f0f0f' }}
      >
        {/* Número grande */}
        <div className="relative select-none">
          <span
            className="text-[120px] font-black leading-none"
            style={{
              color: 'transparent',
              WebkitTextStroke: '2px #1e1e1e',
              letterSpacing: '-4px',
            }}
          >
            404
          </span>
          <span
            className="absolute inset-0 flex items-center justify-center text-5xl"
          >
            🔧
          </span>
        </div>

        <div>
          <h1 className="text-xl font-black mb-2" style={{ color: '#f5f0e8' }}>
            Página no encontrada
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: '#555' }}>
            Esta página no existe o fue movida.<br />
            Volvé al inicio para continuar.
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full rounded-2xl py-4 text-sm font-bold text-white active:opacity-80 transition-opacity"
            style={{ background: '#e8683a', boxShadow: '0 4px 14px rgba(232,104,58,.25)' }}
          >
            Volver al inicio
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full rounded-2xl py-3.5 text-sm font-bold active:opacity-70 transition-opacity"
            style={{ background: '#141414', color: '#888', border: '1px solid #1e1e1e' }}
          >
            Página anterior
          </button>
        </div>
      </div>
    </PageShell>
  )
}
