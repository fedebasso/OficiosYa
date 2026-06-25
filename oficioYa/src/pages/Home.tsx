// src/pages/Home.tsx
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageShell } from '../components/layout/PageShell'
import { FeaturedProfessionals } from '../components/home/FeaturedProfessionals'
import { HowItWorks } from '../components/home/HowItWorks'
import { TicketEntryCard } from '../components/ticket/TicketEntryCard'
import { UrgenciasFAB } from '../components/home/UrgenciasFAB'
import { FEATURES } from '../lib/featureFlags'

export default function Home() {
  const navigate = useNavigate()

  const homeHeader = (
    <header
      className="sticky top-0 z-50"
      style={{
        background: '#FFFFFF',
        boxShadow: '0 1px 0 #EDE8DE, 0 2px 8px rgba(0,0,0,.04)',
      }}
    >
      <div
        className="flex items-center"
        style={{ padding: 'calc(14px + var(--safe-top)) var(--px-container) 10px' }}
      >
        <h1
          className="font-black leading-none"
          style={{ fontSize: 32, color: '#111111', letterSpacing: '-1px' }}
        >
          <span style={{ color: '#E8683A' }}>O</span>fix
        </h1>
      </div>
      <div style={{ padding: '0 var(--px-container) 12px' }}>
        <button
          type="button"
          onClick={() => navigate('/buscar')}
          className="w-full flex items-center gap-3 active:opacity-80 transition-opacity"
          style={{
            height: 44,
            background: '#F5F0E8',
            border: '1.5px solid #EDE8DE',
            borderRadius: 14,
            padding: '0 14px',
          }}
        >
          <span style={{ fontSize: 15 }}>🔍</span>
          <span style={{ fontSize: 'var(--text-sm)', color: '#BBBBBB' }}>
            ¿Qué servicio necesitás?
          </span>
        </button>
      </div>
    </header>
  )

  return (
    <PageShell header={homeHeader} showBottomNav>
      <div className="flex flex-col gap-4 pt-4 pb-4">
        <HowItWorks />
        <TicketEntryCard />
        {/* Banner Servicios Oficiales — Fase 2: activar en featureFlags.ts */}
        {FEATURES.SERVICIOS_OFICIALES && <motion.button
          type="button"
          onClick={() => navigate('/servicios-oficiales')}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="w-full text-left"
          style={{
            background: 'linear-gradient(135deg, #0F6E56 0%, #1a9b78 100%)',
            borderRadius: 20,
            padding: '16px 20px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-black mb-1" style={{ fontSize: 'var(--text-base)', color: '#FFFFFF' }}>
                🔧 Servicios Técnicos Oficiales
              </p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.75)' }}>
                Samsung · LG · Whirlpool · y más
              </p>
              <p className="font-bold mt-2" style={{ fontSize: 'var(--text-xs)', color: '#9FE1CB' }}>
                Agendá directo con el service →
              </p>
            </div>
            <span style={{ fontSize: 36 }}>🏷️</span>
          </div>
        </motion.button>}
        <section>
          <FeaturedProfessionals />
        </section>
      </div>
      <UrgenciasFAB />
    </PageShell>
  )
}
