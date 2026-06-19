import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Camera, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { useProfessionalStore } from '../../store/professionalStore'
import { getInitials } from '../../lib/utils'

// ── Datos ────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'electricista',       label: 'Electricista',  emoji: '⚡' },
  { id: 'plomero',            label: 'Sanitario',      emoji: '🚿' },
  { id: 'carpintero',         label: 'Carpintero',     emoji: '🪚' },
  { id: 'cerrajero',          label: 'Cerrajero',      emoji: '🔑' },
  { id: 'albanil',            label: 'Albañil',        emoji: '🧱' },
  { id: 'pintor',             label: 'Pintor',         emoji: '🎨' },
  { id: 'aire_acondicionado', label: 'Aire Acond.',    emoji: '❄️' },
  { id: 'jardinero',          label: 'Jardinería',     emoji: '🌿' },
]

const ZONES = [
  'Pocitos', 'Malvín', 'Centro', 'Cordón', 'Carrasco',
  'Prado', 'Unión', 'Punta Carretas', 'Buceo', 'Tres Cruces',
  'La Blanqueada', 'Parque Batlle', 'Goes', 'Reducto',
]

const TOTAL_STEPS = 7

// ── Animación de slide ────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function ProOnboarding() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { save, uploadAvatar } = useProfessionalStore()

  const [step, setStep] = useState(1)
  const [dir, setDir] = useState(1)
  const [saving, setSaving] = useState(false)

  // Datos acumulados
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [zones, setZones] = useState<string[]>([])
  const [years, setYears] = useState('')
  const [hasRut, setHasRut] = useState<boolean | null>(null)
  const [whatsapp, setWhatsapp] = useState('')
  const [bio, setBio] = useState('')

  const fileRef = useRef<HTMLInputElement>(null)

  function go(next: number) {
    setDir(next > step ? 1 : -1)
    setStep(next)
  }

  function canNext() {
    if (step === 1) return true
    if (step === 2) return categories.length > 0
    if (step === 3) return zones.length > 0
    if (step === 4) return years !== '' && hasRut !== null
    if (step === 5) return whatsapp.length >= 9
    if (step === 6) return true
    return true
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert('Máximo 5MB'); return }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  function toggleCategory(id: string) {
    setCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : prev.length < 5 ? [...prev, id] : prev
    )
  }

  function toggleZone(z: string) {
    setZones((prev) =>
      prev.includes(z) ? prev.filter((s) => s !== z) : prev.length < 10 ? [...prev, z] : prev
    )
  }

  async function handleFinish() {
    if (!user?.id) return
    setSaving(true)
    try {
      if (avatarFile) {
        const url = await uploadAvatar(user.id, avatarFile)
        useAuthStore.setState((s) => ({ user: s.user ? { ...s.user, avatar_url: url } : null }))
      }
      await save(user.id, {
        specialties: categories,
        coverage_departments: zones,
        years_experience: parseInt(years) || 0,
        bio: bio.slice(0, 300),
        whatsapp: whatsapp.replace(/\D/g, ''),
        registration_completed: true,
      })
      navigate('/pro/perfil', { replace: true })
    } finally {
      setSaving(false)
    }
  }

  const stepTitles = [
    'Tu información',
    'Tus servicios',
    'Zona de trabajo',
    'Experiencia',
    'Contacto',
    'Sobre vos',
    'Todo listo',
  ]

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: '#F5F0E8', maxWidth: 480, margin: '0 auto' }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center gap-3 px-4 pt-12 pb-4 flex-shrink-0"
        style={{ background: '#FFFFFF', borderBottom: '1px solid #EDE8DE' }}
      >
        {step > 1 && (
          <button
            type="button"
            onClick={() => go(step - 1)}
            className="p-1 -ml-1 rounded-full active:opacity-60"
          >
            <ChevronLeft size={22} style={{ color: '#111' }} />
          </button>
        )}
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#E8683A' }}>
            Paso {step} de {TOTAL_STEPS}
          </p>
          <p className="text-base font-black" style={{ color: '#111', letterSpacing: '-0.3px' }}>
            {stepTitles[step - 1]}
          </p>
        </div>
      </div>

      {/* ── Barra de progreso ── */}
      <div className="flex gap-1 px-4 pt-3 pb-1 flex-shrink-0">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ background: i < step ? '#E8683A' : '#EDE8DE' }}
          />
        ))}
      </div>

      {/* ── Contenido por paso ── */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence custom={dir} mode="wait">
          <motion.div
            key={step}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            className="absolute inset-0 overflow-y-auto"
          >
            <div className="p-5 flex flex-col gap-5 pb-32">

              {/* PASO 1: Nombre + Foto */}
              {step === 1 && (
                <>
                  <div className="flex flex-col items-center gap-4 py-4">
                    <div className="relative">
                      <div
                        className="w-28 h-28 rounded-3xl overflow-hidden flex items-center justify-center text-3xl font-black"
                        style={{
                          background: avatarPreview || user?.avatar_url
                            ? undefined
                            : 'linear-gradient(135deg, #f5b99a, #E8683A)',
                          color: '#fff',
                        }}
                      >
                        {avatarPreview
                          ? <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                          : user?.avatar_url
                            ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                            : getInitials(user?.full_name ?? '')
                        }
                      </div>
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: '#E8683A', border: '3px solid #F5F0E8' }}
                      >
                        <Camera size={16} color="#fff" />
                      </button>
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    <p className="text-xs" style={{ color: '#AAA' }}>Tocá para agregar una foto de perfil</p>
                  </div>
                  <div
                    className="rounded-2xl p-4"
                    style={{ background: '#FFFFFF', border: '1.5px solid #EDE8DE' }}
                  >
                    <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#999' }}>Nombre completo</p>
                    <p className="text-base font-bold" style={{ color: '#111' }}>{user?.full_name ?? '—'}</p>
                    <p className="text-xs mt-1" style={{ color: '#BBB' }}>Tomado de tu cuenta. Podés cambiarlo en el perfil.</p>
                  </div>
                </>
              )}

              {/* PASO 2: Categorías */}
              {step === 2 && (
                <>
                  <p className="text-sm" style={{ color: '#666' }}>
                    Elegí los servicios que ofrecés. Podés seleccionar hasta 5.
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {CATEGORIES.map((cat) => {
                      const active = categories.includes(cat.id)
                      const disabled = !active && categories.length >= 5
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => toggleCategory(cat.id)}
                          disabled={disabled}
                          className="flex items-center gap-3 rounded-2xl p-4 text-left transition-all active:scale-95"
                          style={active
                            ? { background: 'rgba(232,104,58,0.12)', border: '2px solid #E8683A' }
                            : { background: '#FFFFFF', border: `2px solid ${disabled ? '#F0EBE3' : '#EDE8DE'}`, opacity: disabled ? 0.5 : 1 }
                          }
                        >
                          <span className="text-2xl">{cat.emoji}</span>
                          <span className="text-sm font-bold" style={{ color: active ? '#E8683A' : '#333' }}>
                            {cat.label}
                          </span>
                          {active && (
                            <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#E8683A' }}>
                              <Check size={11} color="white" />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                  {categories.length > 0 && (
                    <p className="text-xs text-center" style={{ color: '#E8683A' }}>
                      {categories.length}/5 seleccionado{categories.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </>
              )}

              {/* PASO 3: Zonas */}
              {step === 3 && (
                <>
                  <p className="text-sm" style={{ color: '#666' }}>
                    ¿En qué barrios trabajás? Podés elegir hasta 10.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ZONES.map((z) => {
                      const active = zones.includes(z)
                      const disabled = !active && zones.length >= 10
                      return (
                        <button
                          key={z}
                          type="button"
                          onClick={() => toggleZone(z)}
                          disabled={disabled}
                          className="px-4 py-2.5 rounded-2xl text-sm font-bold transition-all active:scale-95"
                          style={active
                            ? { background: '#E8683A', color: '#fff', border: '2px solid #E8683A' }
                            : { background: '#FFFFFF', color: disabled ? '#CCC' : '#444', border: '2px solid #EDE8DE' }
                          }
                        >
                          {z}
                        </button>
                      )
                    })}
                  </div>
                  {zones.length > 0 && (
                    <p className="text-xs text-center" style={{ color: '#E8683A' }}>
                      {zones.length}/10 zona{zones.length !== 1 ? 's' : ''} seleccionada{zones.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </>
              )}

              {/* PASO 4: Experiencia + RUT */}
              {step === 4 && (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#999' }}>
                      Años de experiencia
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={years}
                      onChange={(e) => setYears(e.target.value)}
                      placeholder="Ej: 5"
                      className="w-full rounded-2xl px-4 py-4 text-lg font-bold focus:outline-none"
                      style={{ background: '#FFFFFF', border: '1.5px solid #EDE8DE', color: '#111', caretColor: '#E8683A' }}
                      autoFocus
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#999' }}>
                      ¿Tenés RUT?
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { val: true,  label: 'Sí, tengo RUT', emoji: '✅' },
                        { val: false, label: 'No tengo RUT',  emoji: '❌' },
                      ].map(({ val, label, emoji }) => (
                        <button
                          key={String(val)}
                          type="button"
                          onClick={() => setHasRut(val)}
                          className="rounded-2xl p-4 flex flex-col items-center gap-2 transition-all active:scale-95"
                          style={hasRut === val
                            ? { background: 'rgba(232,104,58,0.12)', border: '2px solid #E8683A' }
                            : { background: '#FFFFFF', border: '2px solid #EDE8DE' }
                          }
                        >
                          <span className="text-2xl">{emoji}</span>
                          <span className="text-xs font-bold text-center" style={{ color: hasRut === val ? '#E8683A' : '#555' }}>
                            {label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* PASO 5: WhatsApp */}
              {step === 5 && (
                <>
                  <p className="text-sm" style={{ color: '#666' }}>
                    Los clientes te contactan por WhatsApp para coordinar la visita.
                  </p>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#999' }}>
                      Número de WhatsApp
                    </label>
                    <div
                      className="flex items-center gap-3 rounded-2xl px-4"
                      style={{ background: '#FFFFFF', border: '1.5px solid #EDE8DE' }}
                    >
                      <span className="text-base font-bold flex-shrink-0" style={{ color: '#888' }}>🇺🇾 +598</span>
                      <input
                        type="tel"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, '').slice(0, 9))}
                        placeholder="9X XXX XXX"
                        className="flex-1 py-4 text-lg font-bold focus:outline-none bg-transparent"
                        style={{ color: '#111', caretColor: '#E8683A' }}
                        autoFocus
                      />
                    </div>
                    <p className="text-xs px-1" style={{ color: '#BBB' }}>
                      Ingresá los 9 dígitos sin el código de país
                    </p>
                  </div>
                </>
              )}

              {/* PASO 6: Bio */}
              {step === 6 && (
                <>
                  <p className="text-sm" style={{ color: '#666' }}>
                    Contá quién sos y qué te hace diferente. Los clientes lo leerán antes de contratarte.
                  </p>
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value.slice(0, 300))}
                      placeholder="Ej: Electricista matriculado con 8 años de experiencia en instalaciones residenciales. Trabajo con presupuesto sin cargo y garantía en todos mis trabajos..."
                      rows={6}
                      autoFocus
                      className="w-full rounded-2xl px-4 py-4 text-sm leading-relaxed resize-none focus:outline-none"
                      style={{ background: '#FFFFFF', border: '1.5px solid #EDE8DE', color: '#111', caretColor: '#E8683A' }}
                    />
                    <p className="text-right text-xs" style={{ color: bio.length > 270 ? '#E8683A' : '#BBB' }}>
                      {bio.length}/300
                    </p>
                  </div>
                </>
              )}

              {/* PASO 7: Resumen */}
              {step === 7 && (
                <>
                  <p className="text-sm" style={{ color: '#666' }}>
                    Revisá tu información antes de publicar tu perfil.
                  </p>

                  {/* Avatar + nombre */}
                  <div
                    className="flex items-center gap-4 p-4 rounded-2xl"
                    style={{ background: '#FFFFFF', border: '1.5px solid #EDE8DE' }}
                  >
                    <div
                      className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center font-bold text-xl flex-shrink-0"
                      style={{
                        background: avatarPreview ? undefined : 'linear-gradient(135deg, #f5b99a, #E8683A)',
                        color: '#fff',
                      }}
                    >
                      {avatarPreview
                        ? <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                        : getInitials(user?.full_name ?? '')
                      }
                    </div>
                    <div>
                      <p className="font-black text-base" style={{ color: '#111' }}>{user?.full_name}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#AAA' }}>
                        {years ? `${years} años de experiencia` : ''}
                        {hasRut ? ' · Con RUT' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Servicios */}
                  {categories.length > 0 && (
                    <div className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1.5px solid #EDE8DE' }}>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: '#999' }}>Servicios</p>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((id) => {
                          const cat = CATEGORIES.find((c) => c.id === id)
                          return cat ? (
                            <span key={id} className="px-3 py-1.5 rounded-full text-xs font-bold"
                              style={{ background: 'rgba(232,104,58,0.12)', color: '#E8683A' }}>
                              {cat.emoji} {cat.label}
                            </span>
                          ) : null
                        })}
                      </div>
                    </div>
                  )}

                  {/* Zonas */}
                  {zones.length > 0 && (
                    <div className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1.5px solid #EDE8DE' }}>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#999' }}>Zonas</p>
                      <p className="text-sm" style={{ color: '#444' }}>{zones.join(', ')}</p>
                    </div>
                  )}

                  {/* Bio */}
                  {bio && (
                    <div className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1.5px solid #EDE8DE' }}>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#999' }}>Descripción</p>
                      <p className="text-sm leading-relaxed" style={{ color: '#444' }}>{bio}</p>
                    </div>
                  )}

                  {/* WhatsApp */}
                  {whatsapp && (
                    <div className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1.5px solid #EDE8DE' }}>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: '#999' }}>WhatsApp</p>
                      <p className="text-sm font-bold" style={{ color: '#111' }}>+598 {whatsapp}</p>
                    </div>
                  )}
                </>
              )}

            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Botón de acción ── */}
      <div
        className="px-5 pb-10 pt-4 flex-shrink-0"
        style={{ background: 'linear-gradient(to top, #F5F0E8 70%, transparent)' }}
      >
        {step < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={() => go(step + 1)}
            disabled={!canNext()}
            className="w-full rounded-2xl py-4 text-base font-black text-white disabled:opacity-40 transition-opacity"
            style={{ background: '#E8683A', boxShadow: '0 4px 14px rgba(232,104,58,.3)' }}
          >
            Continuar →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            disabled={saving}
            className="w-full rounded-2xl py-4 text-base font-black text-white disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: '#E8683A', boxShadow: '0 4px 14px rgba(232,104,58,.3)' }}
          >
            {saving ? 'Guardando...' : '🚀 Completar perfil'}
          </button>
        )}
        {step === 1 && (
          <button
            type="button"
            onClick={() => navigate('/pro/dashboard')}
            className="w-full pt-3 text-sm font-bold"
            style={{ color: '#BBB', background: 'none', border: 'none' }}
          >
            Completar más tarde
          </button>
        )}
      </div>
    </div>
  )
}
