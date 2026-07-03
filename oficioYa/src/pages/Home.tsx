// src/pages/Home.tsx
import { createElement, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { PageShell } from '../components/layout/PageShell'
import { BrandLogo } from '../components/common/BrandLogo'
import { FeaturedProfessionals } from '../components/home/FeaturedProfessionals'
import { CategoryIcons } from '../components/home/CategoryIcons'
import { TicketEntryCard } from '../components/ticket/TicketEntryCard'
import { UrgenciasFAB } from '../components/home/UrgenciasFAB'
import { TopRated } from '../components/home/TopRated'
import { FEATURES } from '../lib/featureFlags'
import { searchCategories } from '../lib/inferCategory'
import { getCategoryIcon } from '../lib/categories'

export default function Home() {
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = searchCategories(query)
  const showEmpty = searchOpen && query.trim().length > 0 && results.length === 0
  const popular = searchCategories('') // las 6 categorías, orden fijo

  function goToCategory(id: string) {
    setSearchOpen(false)
    setQuery('')
    inputRef.current?.blur()
    navigate(`/buscar/${id}`)
  }

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
        <BrandLogo size="md" theme="light" />
      </div>
      <div style={{ padding: '0 var(--px-container) 12px' }}>
        <div
          className="w-full flex items-center gap-2.5"
          style={{
            height: 48,
            background: '#F5F1E8',
            border: `1.5px solid ${searchOpen ? '#FF6B00' : '#E5DECF'}`,
            borderRadius: 15,
            padding: '0 14px',
          }}
        >
          <Search size={19} strokeWidth={2.3} style={{ color: searchOpen ? '#FF6B00' : '#9A8F80' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setSearchOpen(true)}
            enterKeyHint="search"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && results.length > 0) goToCategory(results[0].id)
            }}
            placeholder="¿Qué servicio necesitás?"
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: 15, color: '#1A1712', fontWeight: 500 }}
          />
          {searchOpen && (
            <button
              type="button"
              aria-label="Cerrar búsqueda"
              onClick={() => { setQuery(''); setSearchOpen(false); inputRef.current?.blur() }}
              className="active:opacity-60"
            >
              <X size={18} strokeWidth={2.3} style={{ color: '#9A8F80' }} />
            </button>
          )}
        </div>

        {searchOpen && (
          <div
            style={{
              marginTop: 8,
              background: '#FFFFFF',
              border: '1.5px solid #EDE8DE',
              borderRadius: 15,
              overflow: 'hidden',
              boxShadow: '0 6px 20px rgba(0,0,0,.06)',
            }}
          >
            {showEmpty ? (
              <div style={{ padding: '14px 16px' }}>
                <p style={{ fontSize: 14, color: '#6B6153', marginBottom: 10 }}>
                  No encontramos “{query.trim()}”. Probá con:
                </p>
                <div className="flex flex-wrap gap-2">
                  {popular.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => goToCategory(c.id)}
                      className="active:opacity-70"
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#1A1712',
                        background: '#F5F1E8',
                        border: '1px solid #E5DECF',
                        borderRadius: 999,
                        padding: '6px 12px',
                      }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              (query.trim() ? results : popular).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => goToCategory(c.id)}
                  className="w-full flex items-center gap-3 active:bg-black/[.03]"
                  style={{ padding: '12px 16px', borderBottom: '1px solid #F2EEE5' }}
                >
                  {createElement(getCategoryIcon(c.id), { size: 20, strokeWidth: 2.2, style: { color: '#FF6B00' } })}
                  <span style={{ fontSize: 15, fontWeight: 500, color: '#1A1712' }}>{c.label}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </header>
  )

  return (
    <PageShell header={homeHeader} showBottomNav>
      <div className="flex flex-col gap-4 pt-4 pb-4">
        <CategoryIcons />
        <TopRated />
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
