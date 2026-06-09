import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { PageShell } from '../../components/layout/PageShell'
import { Camera, Check } from 'lucide-react'
import { getInitials } from '../../lib/utils'

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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: '#141414', border: '1px solid #1e1e1e' }}
    >
      <div
        className="px-4 py-2.5"
        style={{ borderBottom: '1px solid #1e1e1e', background: '#111' }}
      >
        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#444' }}>
          {title}
        </p>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

export default function ProProfile() {
  const user = useAuthStore((s) => s.user)
  const [bio, setBio]                           = useState('')
  const [whatsapp, setWhatsapp]                 = useState(user?.phone ?? '')
  const [zone, setZone]                         = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [saved, setSaved]                       = useState(false)

  const toggleCategory = (id: string) =>
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )

  const handleSave = async () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const header = (
    <div
      className="px-4 pt-10 pb-4 sticky top-0 z-50"
      style={{ background: '#0a0a0a', borderBottom: '1px solid #1a1a1a' }}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#e8683a' }}>
        Panel profesional
      </p>
      <h1 className="text-2xl font-black leading-none" style={{ color: '#f5f0e8', letterSpacing: '-0.5px' }}>
        Mi perfil
      </h1>
    </div>
  )

  return (
    <PageShell header={header}>
      <div className="p-4 flex flex-col gap-3 pb-8">

        {/* Avatar */}
        <div
          className="rounded-2xl p-5 flex flex-col items-center gap-3"
          style={{ background: '#141414', border: '1px solid #1e1e1e' }}
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
              style={{ background: '#e8683a', border: '2px solid #0f0f0f' }}
            >
              <Camera size={12} color="#fff" />
            </button>
          </div>
          <div className="text-center">
            <p className="font-black text-base" style={{ color: '#f5f0e8' }}>{user?.full_name}</p>
            <p className="text-xs mt-0.5" style={{ color: '#555' }}>{user?.city ?? 'Montevideo'}</p>
          </div>
        </div>

        {/* Bio */}
        <Section title="Descripción">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Contá tu experiencia y especialidades..."
            className="w-full rounded-xl px-3.5 py-3 text-sm resize-none focus:outline-none"
            style={{
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              color: '#f5f0e8',
              caretColor: '#e8683a',
            }}
          />
        </Section>

        {/* Categorías */}
        <Section title="Servicios que ofrecés">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const active = selectedCategories.includes(cat.id)
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-[.96]"
                  style={active ? {
                    background: 'rgba(232,104,58,.15)',
                    color: '#e8683a',
                    border: '1px solid rgba(232,104,58,.35)',
                  } : {
                    background: '#1a1a1a',
                    color: '#666',
                    border: '1px solid #2a2a2a',
                  }}
                >
                  <span>{cat.emoji}</span>
                  {cat.label}
                </button>
              )
            })}
          </div>
        </Section>

        {/* WhatsApp */}
        <Section title="WhatsApp">
          <input
            type="tel"
            value={whatsapp ?? ''}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="598 9X XXX XXX"
            className="w-full rounded-xl px-3.5 py-3 text-sm focus:outline-none"
            style={{
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              color: '#f5f0e8',
              caretColor: '#e8683a',
            }}
          />
        </Section>

        {/* Zona */}
        <Section title="Zona de trabajo">
          <select
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            className="w-full rounded-xl px-3.5 py-3 text-sm focus:outline-none appearance-none"
            style={{
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              color: zone ? '#f5f0e8' : '#555',
            }}
          >
            <option value="">Seleccioná un barrio</option>
            {ZONES.map((z) => (
              <option key={z} value={z} style={{ background: '#1a1a1a', color: '#f5f0e8' }}>{z}</option>
            ))}
          </select>
        </Section>

        {/* Guardar */}
        <button
          type="button"
          onClick={handleSave}
          className="w-full rounded-2xl py-4 text-sm font-black text-white flex items-center justify-center gap-2 active:opacity-80 transition-opacity mt-1"
          style={{
            background: saved ? 'rgba(34,197,94,.15)' : '#e8683a',
            border: saved ? '1px solid rgba(34,197,94,.3)' : 'none',
            color: saved ? '#22c55e' : '#fff',
            boxShadow: saved ? 'none' : '0 4px 14px rgba(232,104,58,.25)',
            transition: 'all .2s ease',
          }}
        >
          {saved ? <><Check size={15} /> Guardado</> : 'Guardar cambios'}
        </button>

      </div>
    </PageShell>
  )
}
