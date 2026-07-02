import { useState, useRef, createElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Check } from 'lucide-react'
import { getCategoryIcon } from '../../lib/categories'
import { motion } from 'framer-motion'
import { PageShell } from '../../components/layout/PageShell'
import { Header } from '../../components/layout/Header'
import { useProfessionalStore } from '../../store/professionalStore'
import { useAuthStore } from '../../store/authStore'
import { fadeUp, staggerContainer } from '../../lib/motion'

const ALL_CATEGORIES = [
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

function validateWhatsapp(v: string) {
  return /^598[0-9]{8}$/.test(v.replace(/\s/g, ''))
}

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

export default function ProProfileEdit() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { profile, save, uploadAvatar } = useProfessionalStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const [bio, setBio] = useState(profile?.bio ?? '')
  const [whatsapp, setWhatsapp] = useState(profile?.whatsapp ?? '')
  const [specialties, setSpecialties] = useState<string[]>(profile?.specialties ?? [])
  const [zones, setZones] = useState<string[]>(profile?.coverage_departments ?? [])
  const [years, setYears] = useState(String(profile?.years_experience ?? ''))
  const [hasRut, setHasRut] = useState(false)

  // Sync form fields from profile when it loads/changes, during render
  // (React's "adjust state when a prop changes" pattern — no effect needed).
  const [prevProfile, setPrevProfile] = useState(profile)
  if (profile && profile !== prevProfile) {
    setPrevProfile(profile)
    setBio(profile.bio ?? '')
    setWhatsapp(profile.whatsapp ?? '')
    setSpecialties(profile.specialties ?? [])
    setZones(profile.coverage_departments ?? [])
    setYears(String(profile.years_experience ?? ''))
  }

  function toggleSpecialty(id: string) {
    setSpecialties((prev) =>
      prev.includes(id)
        ? prev.filter((s) => s !== id)
        : prev.length < 5 ? [...prev, id] : prev
    )
  }

  function toggleZone(z: string) {
    setZones((prev) =>
      prev.includes(z)
        ? prev.filter((s) => s !== z)
        : prev.length < 10 ? [...prev, z] : prev
    )
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) { alert('Solo JPG, PNG o WEBP'); return }
    if (file.size > 5 * 1024 * 1024) { alert('Máximo 5MB'); return }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    if (specialties.length === 0) { alert('Seleccioná al menos una categoría'); return }
    if (zones.length === 0) { alert('Seleccioná al menos una zona'); return }
    if (whatsapp && !validateWhatsapp(whatsapp)) { alert('WhatsApp debe tener formato Uruguay: 598XXXXXXXX'); return }
    const yearsNum = parseInt(years)
    if (isNaN(yearsNum) || yearsNum < 0 || yearsNum > 60) { alert('Años de experiencia inválido (0-60)'); return }

    setSaving(true)
    try {
      if (avatarFile && user?.id) {
        const url = await uploadAvatar(user.id, avatarFile)
        useAuthStore.setState((s) => ({ user: s.user ? { ...s.user, avatar_url: url } : null }))
      }
      await save(user!.id, {
        bio: bio.slice(0, 300),
        whatsapp: whatsapp.replace(/\s/g, ''),
        specialties,
        coverage_departments: zones,
        years_experience: yearsNum,
      })
      setSaved(true)
      setTimeout(() => navigate('/pro/perfil'), 1200)
    } finally {
      setSaving(false)
    }
  }

  const header = <Header title="Editar perfil" showBack onBack={() => navigate('/pro/perfil')} />

  return (
    <PageShell header={header} showBottomNav={false}>
      <motion.div
        className="p-4 flex flex-col gap-4 pb-24"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Avatar */}
        <motion.div variants={fadeUp}>
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="relative">
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-2xl font-black overflow-hidden"
                style={{
                  background: avatarPreview || user?.avatar_url
                    ? undefined
                    : 'linear-gradient(135deg, #2a1f10, #e8683a)',
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
                className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: '#E8683A', border: '2px solid #FFFFFF' }}
              >
                <Camera size={14} color="#fff" />
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <p className="text-xs" style={{ color: '#999' }}>JPG, PNG o WEBP · máx 5MB</p>
          </div>
        </motion.div>

        {/* Bio */}
        <motion.div variants={fadeUp}>
          <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#999' }}>
            Descripción
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 300))}
            rows={4}
            placeholder="Contá tu experiencia y especialidades..."
            className="w-full rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none"
            style={{ background: '#FFFFFF', border: '1.5px solid #ECE4D8', color: '#111', caretColor: '#E8683A' }}
          />
          <p className="text-right text-[10px] mt-1" style={{ color: bio.length > 280 ? '#E8683A' : '#BBB' }}>
            {bio.length}/300
          </p>
        </motion.div>

        {/* Categorías */}
        <motion.div variants={fadeUp}>
          <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#999' }}>
            Servicios que ofrecés (máx 5)
          </label>
          <div className="flex flex-wrap gap-2">
            {ALL_CATEGORIES.map((cat) => {
              const active = specialties.includes(cat.id)
              const disabled = !active && specialties.length >= 5
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleSpecialty(cat.id)}
                  disabled={disabled}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold transition-all"
                  style={active
                    ? { background: 'rgba(232,104,58,0.15)', color: '#E8683A', border: '1px solid rgba(232,104,58,0.35)' }
                    : { background: '#EDE8DE', color: disabled ? '#CCC' : '#666', border: '1.5px solid #ECE4D8' }
                  }
                >
                  {createElement(getCategoryIcon(cat.id), { size: 14, style: { color: active ? '#D4571F' : (disabled ? '#CCC' : '#D4571F') } })} {cat.label}
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Zonas */}
        <motion.div variants={fadeUp}>
          <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#999' }}>
            Zonas de trabajo (máx 10)
          </label>
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
                  className="px-3 py-1.5 rounded-full text-xs font-bold"
                  style={active
                    ? { background: '#E8683A', color: '#fff', border: '1px solid #E8683A' }
                    : { background: '#F5F0E8', color: disabled ? '#CCC' : '#555', border: '1.5px solid #EDE8DE' }
                  }
                >
                  {z}
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* WhatsApp */}
        <motion.div variants={fadeUp}>
          <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#999' }}>
            WhatsApp
          </label>
          <input
            type="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="598 9X XXX XXX"
            className="w-full rounded-2xl px-4 py-3 text-sm focus:outline-none"
            style={{ background: '#FFFFFF', border: '1.5px solid #ECE4D8', color: '#111', caretColor: '#E8683A' }}
          />
          <p className="text-[10px] mt-1" style={{ color: '#BBB' }}>Formato: 598XXXXXXXX (sin espacios ni guiones)</p>
        </motion.div>

        {/* Años de experiencia */}
        <motion.div variants={fadeUp}>
          <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#999' }}>
            Años de experiencia
          </label>
          <input
            type="number"
            min="0"
            max="60"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            className="w-full rounded-2xl px-4 py-3 text-sm focus:outline-none"
            style={{ background: '#FFFFFF', border: '1.5px solid #ECE4D8', color: '#111', caretColor: '#E8683A' }}
          />
        </motion.div>

        {/* RUT */}
        <motion.div variants={fadeUp}>
          <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#999' }}>
            ¿Tenés RUT?
          </label>
          <div className="flex gap-3">
            {([true, false] as const).map((val) => (
              <button
                key={String(val)}
                type="button"
                onClick={() => setHasRut(val)}
                className="flex-1 py-3 rounded-2xl text-sm font-bold"
                style={hasRut === val
                  ? { background: '#E8683A', color: '#fff', border: '1.5px solid #E8683A' }
                  : { background: '#F5F0E8', color: '#555', border: '1.5px solid #EDE8DE' }
                }
              >
                {val ? 'Sí' : 'No'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Guardar */}
        <motion.div variants={fadeUp}>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || saved}
            className="w-full rounded-2xl py-4 text-sm font-black flex items-center justify-center gap-2 disabled:opacity-60"
            style={{
              background: saved ? 'rgba(34,197,94,.15)' : '#E8683A',
              border: saved ? '1px solid rgba(34,197,94,.3)' : 'none',
              color: saved ? '#22C55E' : '#fff',
              boxShadow: saved ? 'none' : '0 4px 14px rgba(232,104,58,.25)',
              transition: 'all .2s ease',
            }}
          >
            {saved ? <><Check size={15} /> ¡Guardado!</> : saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </motion.div>
      </motion.div>
    </PageShell>
  )
}
