import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProPortfolio } from '../../components/pro/portfolio/ProPortfolio'
import { useAuthStore } from '../../store/authStore'
import { PageShell } from '../../components/layout/PageShell'
import { Camera, Check, LogOut } from 'lucide-react'
import { getInitials } from '../../lib/utils'
import { motion } from 'framer-motion'
import { fadeUp, staggerContainer, SPRING_SOFT } from '../../lib/motion'

const CATEGORIES = [
  { id: 'electricista',      label: 'Electricista',    emoji: '⚡' },
  { id: 'plomero',           label: 'Sanitario',        emoji: '🚿' },
  { id: 'aire_acondicionado',label: 'Aire Acond.',      emoji: '❄️' },
  { id: 'cerrajero',         label: 'Cerrajero',        emoji: '🔑' },
  { id: 'albanil',           label: 'Albañil',          emoji: '🧱' },
]

const ZONES = [
  'Pocitos','Malvín','Centro','Carrasco','Punta Carretas',
  'Cordón','Tres Cruces','La Blanqueada','Buceo','Parque Batlle',
]

const RADIO_OPTIONS: { label: string; value: number | null }[] = [
  { label: '3 km', value: 3 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '20 km', value: 20 },
  { label: 'Toda la ciudad', value: null },
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}
    >
      <div
        className="px-4 py-2.5"
        style={{ borderBottom: '1px solid #E8E0D4', background: '#F5F0E8' }}
      >
        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#999999' }}>
          {title}
        </p>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

export default function ProProfile() {
  const user = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'datos' | 'trabajos'>('datos')
  const [bio, setBio]                           = useState('')
  const [whatsapp, setWhatsapp]                 = useState(user?.phone ?? '')
  const [zone, setZone]                         = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [radiusKm, setRadiusKm]                 = useState<number | null>(null)
  const [saved, setSaved]                       = useState(false)

  const toggleCategory = (id: string) =>
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )

  const handleSave = async () => {
    // En demo actualiza el store local; en prod conectará a Supabase
    if (whatsapp && whatsapp !== user?.phone) {
      useAuthStore.setState((s) => ({
        user: s.user ? { ...s.user, phone: whatsapp ?? null } : null,
      }))
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const header = (
    <div
      className="px-4 pt-10 pb-4 sticky top-0 z-50"
      style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E0D4' }}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#e8683a' }}>
        Panel profesional
      </p>
      <h1 className="text-2xl font-black leading-none" style={{ color: '#111111', letterSpacing: '-0.5px' }}>
        Mi perfil
      </h1>
    </div>
  )

  return (
    <PageShell header={header}>
      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: '#E8E0D4', background: '#fff' }}>
        {(['datos', 'trabajos'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-3 text-sm font-bold capitalize transition-colors"
            style={{
              color: activeTab === tab ? '#E8683A' : '#AAAAAA',
              borderBottom: activeTab === tab ? '2px solid #E8683A' : '2px solid transparent',
            }}
          >
            {tab === 'datos' ? 'Mis Datos' : 'Mis Trabajos'}
          </button>
        ))}
      </div>

      {activeTab === 'trabajos' ? (
        <div className="px-4">
          <ProPortfolio />
        </div>
      ) : (
      <motion.div
        className="p-4 flex flex-col gap-3 pb-8"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >

        {/* Avatar */}
        <motion.div variants={fadeUp}>
          <div
            className="rounded-2xl p-5 flex flex-col items-center gap-3"
            style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}
          >
            <div className="relative">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black"
                style={{
                  background: user?.avatar_url
                    ? undefined
                    : 'linear-gradient(135deg, #2a1f10, #e8683a)',
                  color: '#fff',
                }}
              >
                {user?.avatar_url
                  ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover rounded-2xl" />
                  : getInitials(user?.full_name ?? '')
                }
              </div>
              <button
                type="button"
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: '#E8683A', border: '2px solid #FFFFFF' }}
              >
                <Camera size={12} color="#fff" />
              </button>
            </div>
            <div className="text-center">
              <p className="font-black text-base" style={{ color: '#111111' }}>{user?.full_name}</p>
              <p className="text-xs mt-0.5" style={{ color: '#999999' }}>{user?.city ?? 'Montevideo'}</p>
            </div>
          </div>
        </motion.div>

        {/* Bio */}
        <motion.div variants={fadeUp}>
          <Section title="Descripción">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Contá tu experiencia y especialidades..."
              className="w-full rounded-xl px-3.5 py-3 text-sm resize-none focus:outline-none"
              style={{
                background: '#EDE8DE',
                border: '1.5px solid #E8E0D4',
                color: '#111111',
                caretColor: '#e8683a',
              }}
            />
          </Section>
        </motion.div>

        {/* Categorías */}
        <motion.div variants={fadeUp}>
          <Section title="Servicios que ofrecés">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const active = selectedCategories.includes(cat.id)
                return (
                  <motion.button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    whileTap={{ scale: 0.95 }}
                    transition={SPRING_SOFT}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                    style={active ? {
                      background: 'rgba(232,104,58,.15)',
                      color: '#e8683a',
                      border: '1px solid rgba(232,104,58,.35)',
                    } : {
                      background: '#EDE8DE',
                      color: '#666',
                      border: '1.5px solid #E8E0D4',
                    }}
                  >
                    <span>{cat.emoji}</span>
                    {cat.label}
                  </motion.button>
                )
              })}
            </div>
          </Section>
        </motion.div>

        {/* WhatsApp */}
        <motion.div variants={fadeUp}>
          <Section title="WhatsApp">
            <input
              type="tel"
              value={whatsapp ?? ''}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="598 9X XXX XXX"
              className="w-full rounded-xl px-3.5 py-3 text-sm focus:outline-none"
              style={{
                background: '#EDE8DE',
                border: '1.5px solid #E8E0D4',
                color: '#111111',
                caretColor: '#e8683a',
              }}
            />
          </Section>
        </motion.div>

        {/* Zona */}
        <motion.div variants={fadeUp}>
          <Section title="Zona de trabajo">
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="w-full rounded-xl px-3.5 py-3 text-sm focus:outline-none appearance-none"
              style={{
                background: '#EDE8DE',
                border: '1.5px solid #E8E0D4',
                color: zone ? '#111111' : '#999999',
              }}
            >
              <option value="">Seleccioná un barrio</option>
              {ZONES.map((z) => (
                <option key={z} value={z} style={{ background: '#EDE8DE', color: '#111111' }}>{z}</option>
              ))}
            </select>
          </Section>
        </motion.div>

        {/* Radio de cobertura */}
        <motion.div variants={fadeUp}>
          <Section title="Radio de cobertura">
            <p className="text-xs mb-3" style={{ color: '#999' }}>
              ¿Hasta dónde te desplazás desde tu zona?
            </p>
            <div className="flex flex-wrap gap-2">
              {RADIO_OPTIONS.map((opt) => {
                const active = radiusKm === opt.value
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => setRadiusKm(opt.value)}
                    className="rounded-xl px-3 py-2 text-xs font-bold"
                    style={{
                      background: active ? '#E8683A' : '#F5F0E8',
                      color: active ? '#FFFFFF' : '#555555',
                      border: `1.5px solid ${active ? '#E8683A' : '#EDE8DE'}`,
                    }}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </Section>
        </motion.div>

        {/* Cerrar sesión */}
        <motion.div variants={fadeUp}>
          <motion.button
            type="button"
            onClick={async () => { await signOut(); navigate('/login') }}
            whileTap={{ scale: 0.97 }}
            transition={SPRING_SOFT}
            className="w-full rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-2"
            style={{ background: 'transparent', color: '#999999', border: '1.5px solid #E8E0D4' }}
          >
            <LogOut size={14} />
            Cerrar sesión
          </motion.button>
        </motion.div>

        {/* Guardar */}
        <motion.div variants={fadeUp}>
          <motion.button
            type="button"
            onClick={handleSave}
            whileTap={{ scale: 0.97 }}
            transition={SPRING_SOFT}
            className="w-full rounded-2xl py-4 text-sm font-black text-white flex items-center justify-center gap-2 mt-1"
            style={{
              background: saved ? 'rgba(34,197,94,.15)' : '#e8683a',
              border: saved ? '1px solid rgba(34,197,94,.3)' : 'none',
              color: saved ? '#22c55e' : '#fff',
              boxShadow: saved ? 'none' : '0 4px 14px rgba(232,104,58,.25)',
              transition: 'all .2s ease',
            }}
          >
            {saved ? <><Check size={15} /> Guardado</> : 'Guardar cambios'}
          </motion.button>
        </motion.div>

      </motion.div>
      )}
    </PageShell>
  )
}
