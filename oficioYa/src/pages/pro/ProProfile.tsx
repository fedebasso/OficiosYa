import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Edit2, LogOut, Phone, MapPin, Star, Briefcase, CheckCircle, Share2, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageShell } from '../../components/layout/PageShell'
import { ProPortfolio } from '../../components/pro/portfolio/ProPortfolio'
import { useProfessionalStore } from '../../store/professionalStore'
import { useAuthStore } from '../../store/authStore'
import { getCategoryMeta } from '../../lib/categories'
import { getInitials } from '../../lib/utils'
import { fadeUp, staggerContainer } from '../../lib/motion'

export default function ProProfile() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)
  const { profile, loading, load } = useProfessionalStore()
  const [activeTab, setActiveTab] = useState<'datos' | 'trabajos'>('datos')
  const [shared, setShared] = useState(false)

  useEffect(() => {
    if (user?.id) load(user.id)
  }, [user?.id, load])

  const handleShare = async () => {
    const url = `${window.location.origin}/profesional/${user?.id}`
    const proName = user?.full_name ?? 'este profesional'
    const text = `Te recomiendo a ${proName} en Ofix`
    if (navigator.share) {
      try {
        await navigator.share({ title: proName, text, url })
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    }
  }

  const header = (
    <div
      className="px-4 pt-10 pb-4 sticky top-0 z-50"
      style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E0D4' }}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#E8683A' }}>
        Panel profesional
      </p>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black leading-none" style={{ color: '#111111', letterSpacing: '-0.5px' }}>
          Mi perfil
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold"
            style={{
              background: shared ? 'rgba(34,197,94,.12)' : '#F5F0E8',
              border: `1px solid ${shared ? 'rgba(34,197,94,.3)' : '#E8E0D4'}`,
              color: shared ? '#16A34A' : '#E8683A',
            }}
          >
            {shared ? <Check size={13} /> : <Share2 size={13} />}
            {shared ? 'Copiado' : 'Compartir'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/pro/perfil/editar')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold"
            style={{ background: 'rgba(232,104,58,0.12)', color: '#E8683A' }}
          >
            <Edit2 size={13} /> Editar
          </button>
        </div>
      </div>
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
      ) : loading ? (
        <div className="flex flex-col gap-3 p-4">
          {[80, 120, 100, 100].map((h, i) => (
            <div
              key={i}
              className="rounded-2xl"
              style={{ height: h, background: '#EDE8DE', border: '1.5px solid #E8E0D4' }}
            />
          ))}
        </div>
      ) : (
        <motion.div
          className="p-4 flex flex-col gap-3 pb-24"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Hero avatar */}
          <motion.div variants={fadeUp}>
            <div
              className="rounded-2xl p-5 flex flex-col items-center gap-3"
              style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}
            >
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black overflow-hidden"
                style={{
                  background: user?.avatar_url ? undefined : 'linear-gradient(135deg, #2a1f10, #e8683a)',
                  color: '#fff',
                }}
              >
                {user?.avatar_url
                  ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                  : getInitials(user?.full_name ?? '')
                }
              </div>
              <div className="text-center">
                <p className="font-black text-base" style={{ color: '#111111' }}>{user?.full_name}</p>
                <p className="text-xs mt-0.5" style={{ color: '#999999' }}>{user?.city ?? 'Montevideo'}</p>
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                {profile?.verification_status === 'verified' && (
                  <span
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold"
                    style={{ background: '#DCFCE7', color: '#16A34A' }}
                  >
                    <CheckCircle size={10} /> Verificado
                  </span>
                )}
                {profile?.work_mode === 'independiente' && (
                  <span
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                    style={{ background: '#F5F0E8', color: '#555' }}
                  >
                    Independiente
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Bio */}
          {profile?.bio && (
            <motion.div variants={fadeUp}>
              <div className="rounded-2xl" style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}>
                <div className="px-4 py-2.5" style={{ borderBottom: '1px solid #E8E0D4', background: '#F5F0E8' }}>
                  <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#999' }}>Descripción</p>
                </div>
                <p className="p-4 text-sm leading-relaxed" style={{ color: '#333' }}>{profile.bio}</p>
              </div>
            </motion.div>
          )}

          {/* Categorías */}
          {(profile?.specialties?.length ?? 0) > 0 && (
            <motion.div variants={fadeUp}>
              <div className="rounded-2xl" style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}>
                <div className="px-4 py-2.5" style={{ borderBottom: '1px solid #E8E0D4', background: '#F5F0E8' }}>
                  <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#999' }}>Servicios</p>
                </div>
                <div className="p-4 flex flex-wrap gap-2">
                  {profile!.specialties.map((cat) => {
                    const { emoji, label } = getCategoryMeta(cat)
                    return (
                      <span
                        key={cat}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold"
                        style={{ background: 'rgba(232,104,58,0.1)', color: '#E8683A', border: '1px solid rgba(232,104,58,0.2)' }}
                      >
                        {emoji} {label}
                      </span>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Info rápida */}
          <motion.div variants={fadeUp}>
            <div className="rounded-2xl" style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}>
              <div className="px-4 py-2.5" style={{ borderBottom: '1px solid #E8E0D4', background: '#F5F0E8' }}>
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#999' }}>Información</p>
              </div>
              <div className="p-4 flex flex-col gap-3">
                {profile?.years_experience != null && (
                  <div className="flex items-center gap-3">
                    <Briefcase size={15} style={{ color: '#E8683A', flexShrink: 0 }} />
                    <span className="text-sm" style={{ color: '#333' }}>{profile.years_experience} años de experiencia</span>
                  </div>
                )}
                {(profile?.coverage_departments?.length ?? 0) > 0 && (
                  <div className="flex items-center gap-3">
                    <MapPin size={15} style={{ color: '#E8683A', flexShrink: 0 }} />
                    <span className="text-sm" style={{ color: '#333' }}>{profile!.coverage_departments.join(', ')}</span>
                  </div>
                )}
                {profile?.whatsapp && (
                  <div className="flex items-center gap-3">
                    <Phone size={15} style={{ color: '#E8683A', flexShrink: 0 }} />
                    <span className="text-sm" style={{ color: '#333' }}>+{profile.whatsapp}</span>
                  </div>
                )}
                {profile?.quality_score != null && (
                  <div className="flex items-center gap-3">
                    <Star size={15} style={{ color: '#F59E0B', flexShrink: 0 }} />
                    <span className="text-sm" style={{ color: '#333' }}>Score de calidad: {profile.quality_score}/100</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Cerrar sesión */}
          <motion.div variants={fadeUp}>
            <button
              type="button"
              onClick={async () => { await signOut(); navigate('/login') }}
              className="w-full rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-2"
              style={{ background: 'transparent', color: '#999', border: '1.5px solid #E8E0D4' }}
            >
              <LogOut size={14} /> Cerrar sesión
            </button>
          </motion.div>
        </motion.div>
      )}
    </PageShell>
  )
}
