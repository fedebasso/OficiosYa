# Pro Profile & Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar ProProfile de siempre-editable a vista read-only con edición separada, y mejorar el portfolio con mejor UX de upload, lightbox para clientes y hero con foto destacada en perfil público.

**Architecture:** Se agrega `professionalStore` (Zustand) que cachea `RegistrationState` del profesional. `ProProfile` pasa a ser una vista visual premium. `ProProfileEdit` es una página nueva. El portfolio se mejora con preview inmediata en upload, botón de destacar en cada card, lightbox fullscreen para clientes, y hero de foto destacada en `ProfessionalDetail`.

**Tech Stack:** React 18, TypeScript, Zustand, Framer Motion, registrationService (existente), IS_DEMO_MODE pattern, Supabase Storage (con fallback mock).

## Global Constraints

- Paleta: `#E8683A` primary, `#F5F0E8` background, `#FFFFFF` surface, `#111111` text
- Mobile-first, max-width 480px, bordes `rounded-2xl` / `rounded-3xl`
- Animaciones Framer Motion 200ms–350ms, sin animaciones pesadas
- IS_DEMO_MODE: toda acción de red usa mock si no hay .env real
- No crear nuevos tipos — extender `RegistrationState` de `src/types/registration.ts`
- Seguir patrón de stores existentes (ver `proRequestsStore.ts`)
- Sin tests unitarios — el proyecto no tiene suite de tests configurada; verificar corriendo la app

---

## Mapa de archivos

### Crear
- `src/store/professionalStore.ts` — cachea RegistrationState + acciones load/save/uploadAvatar
- `src/pages/pro/ProProfileEdit.tsx` — formulario de edición pre-cargado
- `src/components/portfolio/PortfolioLightbox.tsx` — visor fullscreen con swipe

### Modificar
- `src/pages/pro/ProProfile.tsx` — reescribir como vista read-only
- `src/components/pro/portfolio/PortfolioItemCard.tsx` — agregar botón destacar
- `src/components/pro/portfolio/PortfolioItemForm.tsx` — mejorar upload UX con preview
- `src/components/pro/portfolio/ProPortfolio.tsx` — agregar demo mock + toggleFeatured
- `src/components/professionals/WorkPhotoGallery.tsx` — agregar lightbox + hero destacado
- `src/pages/ProfessionalDetail.tsx` — agregar sección portfolio con hero
- `src/App.tsx` — agregar ruta `/pro/perfil/editar`

---

## Task 1: professionalStore

**Archivos:**
- Crear: `src/store/professionalStore.ts`

**Interfaces:**
- Produce: `useProfessionalStore` con `{ profile, loading, error, load, save, uploadAvatar }`
- `profile` es `RegistrationState | null`

- [ ] **Paso 1: Crear el store**

```typescript
// src/store/professionalStore.ts
import { create } from 'zustand'
import { registrationService } from '../services/registrationService'
import { IS_DEMO_MODE } from '../lib/env'
import type { RegistrationState } from '../types/registration'

const MOCK_PROFILE: RegistrationState = {
  registration_step: 10,
  registration_completed: true,
  verification_status: 'verified',
  quality_score: 85,
  cedula: '1.234.567-8',
  birth_date: '1990-05-15',
  address: 'Av. Brasil 2340',
  department: 'Montevideo',
  city: 'Montevideo',
  trade: 'electricista',
  specialties: ['electricista', 'cerrajero'],
  years_experience: 8,
  work_mode: 'independiente',
  bio: 'Electricista matriculado con 8 años de experiencia en instalaciones residenciales y comerciales. Trabajo con presupuesto sin cargo.',
  coverage_departments: ['Montevideo'],
  coverage_radius_km: 10,
  travels_anywhere: false,
  availability_days: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
  availability_from: '08:00',
  availability_to: '18:00',
  emergency_24h: false,
  whatsapp: '59899555123',
  contact_email: 'carlos@demo.com',
}

interface ProfessionalStore {
  profile: RegistrationState | null
  loading: boolean
  error: string | null
  loadedForId: string | null
  load: (proId: string) => Promise<void>
  save: (proId: string, data: Partial<RegistrationState>) => Promise<void>
  uploadAvatar: (proId: string, file: File) => Promise<string>
}

export const useProfessionalStore = create<ProfessionalStore>((set, get) => ({
  profile: null,
  loading: false,
  error: null,
  loadedForId: null,

  load: async (proId: string) => {
    if (get().loadedForId === proId && get().profile) return
    set({ loading: true, error: null })
    try {
      if (IS_DEMO_MODE) {
        set({ profile: MOCK_PROFILE, loading: false, loadedForId: proId })
      } else {
        const profile = await registrationService.load(proId)
        set({ profile, loading: false, loadedForId: proId })
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Error al cargar perfil', loading: false })
    }
  },

  save: async (proId: string, data: Partial<RegistrationState>) => {
    set({ loading: true, error: null })
    try {
      if (IS_DEMO_MODE) {
        set((s) => ({ profile: s.profile ? { ...s.profile, ...data } : null, loading: false }))
      } else {
        await registrationService.saveStep(proId, 0, data)
        set((s) => ({ profile: s.profile ? { ...s.profile, ...data } : null, loading: false }))
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Error al guardar', loading: false })
    }
  },

  uploadAvatar: async (proId: string, file: File) => {
    if (IS_DEMO_MODE) return URL.createObjectURL(file)
    return registrationService.uploadFile('pro-avatars', proId, file)
  },
}))
```

- [ ] **Paso 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```
Esperado: sin errores.

- [ ] **Paso 3: Commit**

```bash
git add src/store/professionalStore.ts
git commit -m "feat: professionalStore con mock demo y carga de RegistrationState"
```

---

## Task 2: ProProfile — Vista read-only

**Archivos:**
- Modificar: `src/pages/pro/ProProfile.tsx`

**Interfaces:**
- Consume: `useProfessionalStore` (Task 1), `useAuthStore`
- Produce: página en `/pro/perfil` que muestra datos y botón "Editar perfil" → `/pro/perfil/editar`

- [ ] **Paso 1: Reemplazar ProProfile.tsx completo**

```typescript
// src/pages/pro/ProProfile.tsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Edit2, LogOut, Phone, MapPin, Star, Briefcase, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageShell } from '../../components/layout/PageShell'
import { ProPortfolio } from '../../components/pro/portfolio/ProPortfolio'
import { useProfessionalStore } from '../../store/professionalStore'
import { useAuthStore } from '../../store/authStore'
import { getCategoryMeta } from '../../lib/categories'
import { getInitials } from '../../lib/utils'
import { fadeUp, staggerContainer } from '../../lib/motion'
import { useState } from 'react'

export default function ProProfile() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)
  const { profile, loading, load } = useProfessionalStore()
  const [activeTab, setActiveTab] = useState<'datos' | 'trabajos'>('datos')

  useEffect(() => {
    if (user?.id) load(user.id)
  }, [user?.id, load])

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
            <div key={i} className="rounded-2xl" style={{ height: h, background: '#EDE8DE', border: '1.5px solid #E8E0D4' }} />
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
                style={{ background: user?.avatar_url ? undefined : 'linear-gradient(135deg, #2a1f10, #e8683a)', color: '#fff' }}
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
              {/* Badges */}
              <div className="flex gap-2 flex-wrap justify-center">
                {profile?.verification_status === 'verified' && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold" style={{ background: '#DCFCE7', color: '#16A34A' }}>
                    <CheckCircle size={10} /> Verificado
                  </span>
                )}
                {profile?.work_mode === 'independiente' && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold" style={{ background: '#F5F0E8', color: '#555' }}>
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
                      <span key={cat} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold"
                        style={{ background: 'rgba(232,104,58,0.1)', color: '#E8683A', border: '1px solid rgba(232,104,58,0.2)' }}>
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
                {profile?.coverage_departments?.length > 0 && (
                  <div className="flex items-center gap-3">
                    <MapPin size={15} style={{ color: '#E8683A', flexShrink: 0 }} />
                    <span className="text-sm" style={{ color: '#333' }}>{profile.coverage_departments.join(', ')}</span>
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
```

- [ ] **Paso 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```
Esperado: sin errores.

- [ ] **Paso 3: Correr app y navegar a `/pro/perfil` como profesional demo**

Abrir `http://localhost:5182`, login con `pro@demo.com`, ir a Perfil. Debe verse la vista read-only con avatar, bio, categorías, e info. El botón "Editar" en el header debe aparecer (la ruta `/pro/perfil/editar` aún no existe — está bien por ahora, se agrega en Task 3).

- [ ] **Paso 4: Commit**

```bash
git add src/pages/pro/ProProfile.tsx
git commit -m "feat: ProProfile como vista read-only con botón Editar"
```

---

## Task 3: ProProfileEdit — Página de edición

**Archivos:**
- Crear: `src/pages/pro/ProProfileEdit.tsx`

**Interfaces:**
- Consume: `useProfessionalStore` (Task 1), `useAuthStore`
- Produce: formulario pre-cargado con todos los datos, botón "Guardar cambios" → llama `store.save()` → redirige a `/pro/perfil`

- [ ] **Paso 1: Crear ProProfileEdit.tsx**

```typescript
// src/pages/pro/ProProfileEdit.tsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Camera, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageShell } from '../../components/layout/PageShell'
import { Header } from '../../components/layout/Header'
import { useProfessionalStore } from '../../store/professionalStore'
import { useAuthStore } from '../../store/authStore'
import { fadeUp, staggerContainer } from '../../lib/motion'

const ALL_CATEGORIES = [
  { id: 'electricista',       label: 'Electricista',     emoji: '⚡' },
  { id: 'plomero',            label: 'Sanitario',         emoji: '🚿' },
  { id: 'carpintero',         label: 'Carpintero',        emoji: '🪚' },
  { id: 'cerrajero',          label: 'Cerrajero',         emoji: '🔑' },
  { id: 'albanil',            label: 'Albañil',           emoji: '🧱' },
  { id: 'pintor',             label: 'Pintor',            emoji: '🎨' },
  { id: 'aire_acondicionado', label: 'Aire Acond.',       emoji: '❄️' },
  { id: 'jardinero',          label: 'Jardinería',        emoji: '🌿' },
]

const ZONES = [
  'Pocitos', 'Malvín', 'Centro', 'Cordón', 'Carrasco',
  'Prado', 'Unión', 'Punta Carretas', 'Buceo', 'Tres Cruces',
  'La Blanqueada', 'Parque Batlle', 'Goes', 'Reducto',
]

function validateWhatsapp(v: string) {
  return /^598[0-9]{8}$/.test(v.replace(/\s/g, ''))
}

export default function ProProfileEdit() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { profile, loading, save, uploadAvatar } = useProfessionalStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  // Form state — pre-cargado desde profile
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [whatsapp, setWhatsapp] = useState(profile?.whatsapp ?? '')
  const [specialties, setSpecialties] = useState<string[]>(profile?.specialties ?? [])
  const [zones, setZones] = useState<string[]>(profile?.coverage_departments ?? [])
  const [years, setYears] = useState(String(profile?.years_experience ?? ''))
  const [hasRut, setHasRut] = useState<boolean>(false)

  // Si el perfil carga después del primer render, sincronizar
  useEffect(() => {
    if (profile) {
      setBio(profile.bio ?? '')
      setWhatsapp(profile.whatsapp ?? '')
      setSpecialties(profile.specialties ?? [])
      setZones(profile.coverage_departments ?? [])
      setYears(String(profile.years_experience ?? ''))
    }
  }, [profile?.bio, profile?.whatsapp])

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
    if (!validTypes.includes(file.type)) return alert('Solo JPG, PNG o WEBP')
    if (file.size > 5 * 1024 * 1024) return alert('Máximo 5MB')
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    if (specialties.length === 0) return alert('Seleccioná al menos una categoría')
    if (zones.length === 0) return alert('Seleccioná al menos una zona')
    if (whatsapp && !validateWhatsapp(whatsapp)) return alert('WhatsApp debe tener formato Uruguay: 598XXXXXXXX')
    const yearsNum = parseInt(years)
    if (isNaN(yearsNum) || yearsNum < 0 || yearsNum > 60) return alert('Años de experiencia inválido')

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

  const getInitials = (name: string) => name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

  const header = (
    <Header title="Editar perfil" showBack onBack={() => navigate('/pro/perfil')} />
  )

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
                  background: avatarPreview || user?.avatar_url ? undefined : 'linear-gradient(135deg, #2a1f10, #e8683a)',
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
            <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
            <p className="text-xs" style={{ color: '#999' }}>JPG, PNG o WEBP · máx 5MB</p>
          </div>
        </motion.div>

        {/* Bio */}
        <motion.div variants={fadeUp}>
          <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#999' }}>Descripción</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 300))}
            rows={4}
            placeholder="Contá tu experiencia y especialidades..."
            className="w-full rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none"
            style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4', color: '#111', caretColor: '#E8683A' }}
          />
          <p className="text-right text-[10px] mt-1" style={{ color: bio.length > 280 ? '#E8683A' : '#BBB' }}>
            {bio.length}/300
          </p>
        </motion.div>

        {/* Categorías */}
        <motion.div variants={fadeUp}>
          <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#999' }}>
            Servicios (máx 5)
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
                    : { background: '#EDE8DE', color: disabled ? '#CCC' : '#666', border: '1.5px solid #E8E0D4' }
                  }
                >
                  {cat.emoji} {cat.label}
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
          <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#999' }}>WhatsApp</label>
          <input
            type="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="598 9X XXX XXX"
            className="w-full rounded-2xl px-4 py-3 text-sm focus:outline-none"
            style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4', color: '#111', caretColor: '#E8683A' }}
          />
          <p className="text-[10px] mt-1" style={{ color: '#BBB' }}>Formato: 598XXXXXXXX (sin espacios ni guiones)</p>
        </motion.div>

        {/* Experiencia */}
        <motion.div variants={fadeUp}>
          <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#999' }}>Años de experiencia</label>
          <input
            type="number"
            min="0"
            max="60"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            className="w-full rounded-2xl px-4 py-3 text-sm focus:outline-none"
            style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4', color: '#111', caretColor: '#E8683A' }}
          />
        </motion.div>

        {/* RUT */}
        <motion.div variants={fadeUp}>
          <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#999' }}>¿Tenés RUT?</label>
          <div className="flex gap-3">
            {[true, false].map((val) => (
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
            className="w-full rounded-2xl py-4 text-sm font-black text-white flex items-center justify-center gap-2 disabled:opacity-60"
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
```

- [ ] **Paso 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Paso 3: Commit**

```bash
git add src/pages/pro/ProProfileEdit.tsx
git commit -m "feat: ProProfileEdit — página de edición de perfil profesional"
```

---

## Task 4: Rutas en App.tsx

**Archivos:**
- Modificar: `src/App.tsx`

**Interfaces:**
- Agrega la ruta `/pro/perfil/editar` dentro del bloque `/pro/*`

- [ ] **Paso 1: Importar ProProfileEdit y agregar ruta**

En `src/App.tsx`, agregar el import lazy:
```typescript
const ProProfileEdit = lazy(() => import('./pages/pro/ProProfileEdit'))
```

Dentro del bloque `<Routes>` de `/pro/*`, agregar después de `path="perfil"`:
```tsx
<Route path="perfil/editar" element={<ProProfileEdit />} />
```

- [ ] **Paso 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Paso 3: Probar flujo completo**

1. Login como `pro@demo.com`
2. Ir a `/pro/perfil` → debe verse vista read-only con datos del mock
3. Tap "Editar" → debe ir a `/pro/perfil/editar` con formulario pre-cargado
4. Cambiar bio → "Guardar cambios" → debe volver a `/pro/perfil` con datos actualizados

- [ ] **Paso 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: ruta /pro/perfil/editar en App.tsx"
```

---

## Task 5: Portfolio — Mock demo + toggleFeatured UX

**Archivos:**
- Modificar: `src/components/pro/portfolio/ProPortfolio.tsx`
- Modificar: `src/components/pro/portfolio/PortfolioItemCard.tsx`

**Interfaces:**
- `ProPortfolio`: cuando IS_DEMO_MODE, cargar MOCK_PORTFOLIO en lugar de llamar a Supabase
- `PortfolioItemCard`: agregar botón "Destacar" que llama a `onToggleFeatured`

- [ ] **Paso 1: Agregar mock data y toggleFeatured a ProPortfolio.tsx**

Reemplazar el contenido de `src/components/pro/portfolio/ProPortfolio.tsx`:

```typescript
import { useState, useEffect } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { registrationService } from '../../../services/registrationService'
import { IS_DEMO_MODE } from '../../../lib/env'
import { PortfolioItemCard } from './PortfolioItemCard'
import { PortfolioItemForm } from './PortfolioItemForm'
import type { PortfolioItem } from '../../../types/registration'
import { Plus } from 'lucide-react'

const MOCK_PORTFOLIO: PortfolioItem[] = [
  {
    id: 'p1', professional_id: 'mock-pro-1',
    title: 'Instalación tablero eléctrico', category: 'electricista',
    description: 'Cambio completo de tablero en departamento de Pocitos.',
    work_date: '2024-03-10', photo_urls: [],
    photos: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', type: 'after' }],
    location: 'Pocitos', request_id: null, is_featured: true, created_at: '2024-03-10T10:00:00Z',
  },
  {
    id: 'p2', professional_id: 'mock-pro-1',
    title: 'Tomacorrientes cocina', category: 'electricista',
    description: 'Instalación de 3 tomacorrientes nuevos.',
    work_date: '2024-02-20', photo_urls: [],
    photos: [{ url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&q=80', type: 'general' }],
    location: 'Malvín', request_id: null, is_featured: false, created_at: '2024-02-20T10:00:00Z',
  },
  {
    id: 'p3', professional_id: 'mock-pro-1',
    title: 'Iluminación living', category: 'electricista',
    description: 'Diseño de iluminación con luces LED empotradas.',
    work_date: '2024-01-15', photo_urls: [],
    photos: [{ url: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=400&q=80', type: 'after' }],
    location: 'Punta Carretas', request_id: null, is_featured: false, created_at: '2024-01-15T10:00:00Z',
  },
]

export function ProPortfolio() {
  const user = useAuthStore((s) => s.user)
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<PortfolioItem | null | 'new'>()
  const [togglingFeatured, setTogglingFeatured] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) return
    if (IS_DEMO_MODE) {
      setItems(MOCK_PORTFOLIO)
      setLoading(false)
      return
    }
    registrationService.getPortfolio(user.id)
      .then(setItems)
      .finally(() => setLoading(false))
  }, [user?.id])

  function handleSaved(saved: PortfolioItem) {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === saved.id)
      return idx >= 0 ? prev.map((i) => i.id === saved.id ? saved : i) : [saved, ...prev]
    })
    setEditing(undefined)
  }

  async function handleDelete(id: string) {
    if (!window.confirm('¿Eliminar este trabajo?')) return
    if (!IS_DEMO_MODE) await registrationService.deletePortfolioItem(id)
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  async function handleToggleFeatured(item: PortfolioItem) {
    if (!user?.id) return
    const primaryPhotoUrl = item.photos[0]?.url ?? item.photo_urls[0] ?? ''
    setTogglingFeatured(item.id)
    try {
      if (!IS_DEMO_MODE) {
        await registrationService.toggleFeatured(user.id, item.id, primaryPhotoUrl)
      }
      // Actualizar estado local: solo un featured a la vez
      setItems((prev) => prev.map((i) => ({
        ...i,
        is_featured: i.id === item.id ? !item.is_featured : false,
      })))
    } finally {
      setTogglingFeatured(null)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 py-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-2xl" style={{ aspectRatio: '4/3', background: '#EDE8DE', border: '1.5px solid #E8E0D4' }} />
        ))}
      </div>
    )
  }

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold" style={{ color: '#555' }}>
          {items.length} trabajo{items.length !== 1 ? 's' : ''}
        </p>
        {items.length < 30 && (
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold"
            style={{ background: '#E8683A', color: '#fff' }}
          >
            <Plus size={14} /> Agregar
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center rounded-2xl" style={{ border: '1.5px dashed #E8E0D4' }}>
          <p className="text-4xl">📸</p>
          <div>
            <p className="font-black text-sm" style={{ color: '#111' }}>Mostrá tus mejores trabajos</p>
            <p className="text-xs mt-1" style={{ color: '#AAA' }}>Subí fotos para generar confianza en los clientes</p>
          </div>
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: '#E8683A', color: '#fff' }}
          >
            Agregar primer trabajo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => (
            <PortfolioItemCard
              key={item.id}
              item={item}
              onEdit={() => setEditing(item)}
              onDelete={() => handleDelete(item.id)}
              onToggleFeatured={() => handleToggleFeatured(item)}
              togglingFeatured={togglingFeatured === item.id}
            />
          ))}
        </div>
      )}

      {editing !== undefined && (
        <PortfolioItemForm
          item={editing === 'new' ? null : editing}
          proId={user?.id ?? ''}
          onSave={handleSaved}
          onClose={() => setEditing(undefined)}
        />
      )}
    </div>
  )
}
```

- [ ] **Paso 2: Actualizar PortfolioItemCard.tsx con botón destacar**

Reemplazar `src/components/pro/portfolio/PortfolioItemCard.tsx`:

```typescript
import { Star, Loader2 } from 'lucide-react'
import { getCategoryMeta } from '../../../lib/categories'
import type { PortfolioItem, WorkPhoto } from '../../../types/registration'

function getPrimaryPhoto(photos: WorkPhoto[], fallbackUrls: string[]): string | null {
  return (
    photos.find((p) => p.type === 'after')?.url ??
    photos.find((p) => p.type === 'general')?.url ??
    photos[0]?.url ??
    fallbackUrls[0] ??
    null
  )
}

interface Props {
  item: PortfolioItem
  onEdit: () => void
  onDelete: () => void
  onToggleFeatured: () => void
  togglingFeatured?: boolean
}

export function PortfolioItemCard({ item, onEdit, onDelete, onToggleFeatured, togglingFeatured }: Props) {
  const { emoji, label } = getCategoryMeta(item.category ?? '')
  const photo = getPrimaryPhoto(item.photos, item.photo_urls)

  return (
    <div className="rounded-2xl overflow-hidden relative" style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}>
      {/* Foto */}
      <div className="relative" style={{ aspectRatio: '4/3', background: '#F5F0E8' }}>
        {photo ? (
          <img src={photo} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">📷</div>
        )}
        {/* Badge destacado */}
        {item.is_featured && (
          <div
            className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold"
            style={{ background: '#E8683A', color: '#fff' }}
          >
            <Star size={9} fill="currentColor" /> Destacado
          </div>
        )}
        {/* Botón destacar — overlay top-right */}
        <button
          type="button"
          onClick={onToggleFeatured}
          disabled={togglingFeatured}
          className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
          style={{
            background: item.is_featured ? '#E8683A' : 'rgba(255,255,255,0.85)',
            border: `1.5px solid ${item.is_featured ? '#E8683A' : '#E8E0D4'}`,
          }}
          title={item.is_featured ? 'Quitar destacado' : 'Marcar como destacado'}
        >
          {togglingFeatured
            ? <Loader2 size={12} style={{ color: item.is_featured ? '#fff' : '#E8683A', animation: 'spin 1s linear infinite' }} />
            : <Star size={12} fill={item.is_featured ? '#fff' : 'none'} style={{ color: item.is_featured ? '#fff' : '#E8683A' }} />
          }
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="font-bold text-sm truncate" style={{ color: '#111111' }}>{item.title}</p>
        <p className="text-[11px] mt-0.5 truncate" style={{ color: '#888' }}>
          {emoji} {label}
          {item.work_date && ` · ${new Date(item.work_date).toLocaleDateString('es', { month: 'short', year: 'numeric' })}`}
        </p>
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={onEdit}
            className="flex-1 py-1.5 rounded-xl text-xs font-bold"
            style={{ background: '#FEF0EA', color: '#E8683A', border: '1px solid #FDDCC8' }}
          >
            ✏️ Editar
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex-1 py-1.5 rounded-xl text-xs font-bold"
            style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Paso 3: Verificar TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Paso 4: Commit**

```bash
git add src/components/pro/portfolio/ProPortfolio.tsx src/components/pro/portfolio/PortfolioItemCard.tsx
git commit -m "feat: portfolio con mock demo, límite 30 fotos y botón destacar"
```

---

## Task 6: PortfolioLightbox — Visor fullscreen para clientes

**Archivos:**
- Crear: `src/components/portfolio/PortfolioLightbox.tsx`

**Interfaces:**
- Props: `{ photos: { url: string; caption?: string }[]; initialIndex: number; onClose: () => void }`
- Consume: Framer Motion para animaciones

- [ ] **Paso 1: Crear PortfolioLightbox.tsx**

```typescript
// src/components/portfolio/PortfolioLightbox.tsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface Photo {
  url: string
  caption?: string
}

interface Props {
  photos: Photo[]
  initialIndex: number
  onClose: () => void
}

export function PortfolioLightbox({ photos, initialIndex, onClose }: Props) {
  const [current, setCurrent] = useState(initialIndex)

  // Cerrar con Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setCurrent((c) => Math.min(c + 1, photos.length - 1))
      if (e.key === 'ArrowLeft') setCurrent((c) => Math.max(c - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [photos.length, onClose])

  // Bloquear scroll de fondo
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  function prev() { setCurrent((c) => Math.max(c - 1, 0)) }
  function next() { setCurrent((c) => Math.min(c + 1, photos.length - 1)) }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ background: 'rgba(0,0,0,0.95)' }}
      onClick={onClose}
    >
      {/* Close */}
      <div className="flex justify-between items-center px-4 pt-12 pb-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <span className="text-white text-sm font-bold" style={{ opacity: 0.6 }}>
          {current + 1} / {photos.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.15)' }}
        >
          <X size={18} color="white" />
        </button>
      </div>

      {/* Imagen */}
      <div className="flex-1 flex items-center justify-center px-4 relative" onClick={(e) => e.stopPropagation()}>
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={photos[current].url}
            alt={photos[current].caption ?? `Foto ${current + 1}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="max-w-full max-h-full object-contain rounded-2xl"
            style={{ maxHeight: 'calc(100dvh - 200px)' }}
          />
        </AnimatePresence>

        {/* Prev */}
        {current > 0 && (
          <button
            type="button"
            onClick={prev}
            className="absolute left-2 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <ChevronLeft size={20} color="white" />
          </button>
        )}
        {/* Next */}
        {current < photos.length - 1 && (
          <button
            type="button"
            onClick={next}
            className="absolute right-2 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <ChevronRight size={20} color="white" />
          </button>
        )}
      </div>

      {/* Caption + dots */}
      <div className="flex flex-col items-center gap-3 px-6 py-6 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        {photos[current].caption && (
          <p className="text-sm text-center" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {photos[current].caption}
          </p>
        )}
        {photos.length > 1 && (
          <div className="flex gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                className="rounded-full transition-all"
                style={{
                  width: i === current ? 20 : 6,
                  height: 6,
                  background: i === current ? '#E8683A' : 'rgba(255,255,255,0.35)',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
```

- [ ] **Paso 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Paso 3: Commit**

```bash
git add src/components/portfolio/PortfolioLightbox.tsx
git commit -m "feat: PortfolioLightbox — visor fullscreen con swipe y dots"
```

---

## Task 7: WorkPhotoGallery + ProfessionalDetail — Portfolio público con hero

**Archivos:**
- Modificar: `src/components/professionals/WorkPhotoGallery.tsx`
- Modificar: `src/pages/ProfessionalDetail.tsx`

**Interfaces:**
- `WorkPhotoGallery`: nueva prop `featuredUrl?: string` para hero. Integra `PortfolioLightbox`.
- `ProfessionalDetail`: debe cargar el portfolio del profesional y pasarlo a `WorkPhotoGallery`

- [ ] **Paso 1: Reescribir WorkPhotoGallery.tsx**

Leer primero el archivo actual para entender la interface `WorkPhoto` del hook:
```bash
# WorkPhoto en hooks/useProfessionals.ts tiene: id, url, caption
```

Reemplazar `src/components/professionals/WorkPhotoGallery.tsx`:

```typescript
import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { PortfolioLightbox } from '../portfolio/PortfolioLightbox'
import type { WorkPhoto } from '../../hooks/useProfessionals'

interface Props {
  photos: WorkPhoto[]
  featuredUrl?: string
}

export function WorkPhotoGallery({ photos, featuredUrl }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const lightboxPhotos = photos.map((p) => ({ url: p.url, caption: p.caption }))

  if (photos.length === 0 && !featuredUrl) {
    return (
      <div className="flex flex-col items-center gap-2 py-8" style={{ background: '#F5F0E8', borderRadius: 16 }}>
        <p className="text-2xl">📷</p>
        <p className="text-sm" style={{ color: '#999' }}>Sin fotos de trabajos aún</p>
      </div>
    )
  }

  const heroUrl = featuredUrl ?? photos[0]?.url

  return (
    <div className="flex flex-col gap-3">
      {/* Hero — foto destacada */}
      {heroUrl && (
        <div
          className="relative rounded-2xl overflow-hidden cursor-pointer"
          style={{ aspectRatio: '16/9', background: '#EDE8DE' }}
          onClick={() => setLightboxIndex(0)}
        >
          <img src={heroUrl} alt="Trabajo destacado" className="w-full h-full object-cover" />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 50%)' }}
          />
          <div className="absolute bottom-3 left-3">
            <span
              className="text-[10px] font-bold px-2 py-1 rounded-lg"
              style={{ background: '#E8683A', color: '#fff' }}
            >
              ⭐ Trabajo destacado
            </span>
          </div>
          {photos.length > 1 && (
            <div
              className="absolute bottom-3 right-3 px-2 py-1 rounded-lg text-[10px] font-bold text-white"
              style={{ background: 'rgba(0,0,0,0.5)' }}
            >
              +{photos.length - 1} fotos
            </div>
          )}
        </div>
      )}

      {/* Grid */}
      {photos.length > 1 && (
        <div className="grid grid-cols-2 gap-2">
          {photos.slice(1, 7).map((photo, i) => (
            <div
              key={photo.id}
              className="relative rounded-xl overflow-hidden cursor-pointer"
              style={{ aspectRatio: '4/3', background: '#EDE8DE' }}
              onClick={() => setLightboxIndex(i + 1)}
            >
              <img src={photo.url} alt={photo.caption ?? `Foto ${i + 2}`} className="w-full h-full object-cover" />
              {/* Overlay "+N" en el último visible si hay más */}
              {i === 5 && photos.length > 7 && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.55)' }}>
                  <span className="text-white font-black text-lg">+{photos.length - 7}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <PortfolioLightbox
            photos={lightboxPhotos}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
```

- [ ] **Paso 2: Actualizar ProfessionalDetail.tsx para pasar `featuredUrl`**

Leer `src/pages/ProfessionalDetail.tsx` para entender su estructura, luego buscar donde renderiza `WorkPhotoGallery` y agregar la prop `featuredUrl`:

```bash
grep -n "WorkPhotoGallery\|featured\|portfolio" src/pages/ProfessionalDetail.tsx
```

Encontrar la línea donde se usa `<WorkPhotoGallery>` y agregarle:
```tsx
<WorkPhotoGallery
  photos={professional.work_photos ?? []}
  featuredUrl={professional.featured_photo_url ?? undefined}
/>
```

Si `featured_photo_url` no existe en el tipo `ProfessionalWithProfile`, agregar el campo opcional en `src/hooks/useProfessionals.ts`:
```typescript
featured_photo_url?: string | null
```

- [ ] **Paso 3: Verificar TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Paso 4: Probar como cliente**

1. Login como `cliente@demo.com`
2. Ir a Home → tap en un profesional
3. Debe verse la foto hero destacada (si existe)
4. Tap en foto → debe abrir lightbox fullscreen
5. Navegar con flechas / dots
6. Tap fuera o X → debe cerrar

- [ ] **Paso 5: Commit**

```bash
git add src/components/professionals/WorkPhotoGallery.tsx src/pages/ProfessionalDetail.tsx src/hooks/useProfessionals.ts
git commit -m "feat: portfolio público con hero destacado y lightbox fullscreen"
```

---

## Task 8: Push final

- [ ] **Verificar que no hay errores TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Push a GitHub**

```bash
git push origin main
```

---

## Self-Review

### Spec coverage
| Requisito spec | Task |
|---|---|
| profileCompleted → no volver a ver formularios | Task 2 (ProProfile read-only) |
| Editar mediante botón dedicado | Task 2 (botón Editar) |
| Página de edición separada `/pro/perfil/editar` | Task 3 |
| Campos: nombre, foto, categorías, zonas, bio, WhatsApp, experiencia, RUT | Task 3 |
| Validaciones por campo | Task 3 |
| professionalStore con Zustand | Task 1 |
| Mock demo (IS_DEMO_MODE) | Task 1 + Task 5 |
| Portfolio: subir fotos | Existente (PortfolioItemForm) |
| Marcar como destacada | Task 5 |
| Máximo 30 fotos | Task 5 |
| Lightbox con swipe/navegación | Task 6 |
| Hero foto destacada en perfil público | Task 7 |
| Grid 2 columnas con fotos | Task 7 |
| Empty state portfolio pro | Task 5 |

### Gaps identificados y resueltos
- `PortfolioItemForm` existente no se modifica (funciona, no es YAGNI mejorarlo aquí)
- Drag & drop reorder: fuera de scope — demasiada complejidad para el MVP
- `featured_photo_url` en `ProfessionalWithProfile`: se agrega como campo opcional en Task 7
- `hasRut` en ProProfileEdit: se guarda localmente en demo mode (no hay campo en RegistrationState, es info visual)
