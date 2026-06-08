# Pro Dashboard Ronda 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar ProOnboarding (cards de progreso con barra) y ProProfile (hero gradient oscuro + card flotante con stats + toggle disponibilidad + 5 categorías).

**Architecture:** Dos archivos independientes, cada uno reemplazado en su totalidad. Ambos son full-page layouts sin PageShell. ProProfile agrega estado `availableNow` para el toggle de urgencias y corrige las 5 categorías (antes solo tenía 3). Ambos usan `useNavigate` para el botón volver.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 3, React Router 7, Zustand (authStore), lucide-react (Camera icon), componente Avatar existente

---

## File Map

**Modificar:**
- `src/pages/pro/ProOnboarding.tsx` — rediseño completo opción B
- `src/pages/pro/ProProfile.tsx` — rediseño completo opción B

---

## Task 1: ProOnboarding — Cards de progreso

**Files:**
- Modify: `src/pages/pro/ProOnboarding.tsx`

- [ ] **Step 1: Reemplazar ProOnboarding.tsx completo**

```tsx
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function ProOnboarding() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const firstName = user?.full_name?.split(' ')[0] ?? 'profesional'

  const steps = [
    { icon: '📝', title: 'Bio y experiencia', desc: 'Contá quién sos y qué hacés' },
    { icon: '🔧', title: 'Servicios y zona', desc: 'Qué ofrecés y dónde trabajás' },
    { icon: '📱', title: 'WhatsApp de contacto', desc: 'Para que los clientes te escriban' },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-background">

      {/* Hero gradient */}
      <div
        className="px-6 pt-14 pb-16 relative flex flex-col gap-1"
        style={{ background: 'linear-gradient(160deg, #064e3b, #0F6E56 60%, #047857)' }}
      >
        <p className="text-[9px] font-bold uppercase tracking-widest text-white/50 mb-2">
          Portal profesional
        </p>
        <h1 className="text-2xl font-black text-white leading-none">
          Oficio<span className="text-accent">Ya</span>
        </h1>
        <p className="text-lg font-black text-white mt-2">¡Hola, {firstName}! 👋</p>
        <p className="text-xs text-white/60 mt-0.5">
          Completá tu perfil para empezar a recibir clientes
        </p>
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-background rounded-t-[32px]" />
      </div>

      {/* Body */}
      <div className="flex flex-col gap-4 px-4 pt-5 pb-10">

        {/* Progress bar */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">
            Progreso del perfil — 0 de 3
          </p>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-1.5 bg-primary rounded-full" style={{ width: '0%' }} />
          </div>
        </div>

        {/* Step cards */}
        <div className="flex flex-col gap-3">
          {steps.map((step, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm p-3.5 flex items-center gap-3"
            >
              <span style={{ fontSize: 22, flexShrink: 0 }}>{step.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text-main">{step.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
              </div>
              <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                Pendiente
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={() => navigate('/pro/perfil')}
          className="w-full bg-primary text-white rounded-2xl py-3.5 text-base font-bold transition-all duration-150 active:scale-[.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          style={{ boxShadow: '0 4px 14px rgba(15,110,86,.3)' }}
        >
          Completar mi perfil →
        </button>

        <button
          type="button"
          onClick={() => navigate('/pro/solicitudes')}
          className="w-full text-primary font-bold text-sm py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl"
        >
          Ver solicitudes
        </button>

      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd C:\Users\fede8\Documents\OficiosYa\oficioYa
npx tsc --noEmit
```

Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/pages/pro/ProOnboarding.tsx
git commit -m "feat: ProOnboarding rediseñado — hero gradient, cards de progreso con barra"
```

---

## Task 2: ProProfile — Hero gradient + card flotante

**Files:**
- Modify: `src/pages/pro/ProProfile.tsx`

- [ ] **Step 1: Reemplazar ProProfile.tsx completo**

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { Avatar } from '../../components/ui/Avatar'

const CATEGORIES = [
  { id: 'electricista', label: 'Electricista', emoji: '⚡' },
  { id: 'plomero', label: 'Sanitario', emoji: '🚿' },
  { id: 'aire_acondicionado', label: 'Aire Ac.', emoji: '❄️' },
  { id: 'cerrajero', label: 'Cerrajero', emoji: '🔑' },
  { id: 'albanil', label: 'Albañil', emoji: '🧱' },
] as const

const CATEGORY_LABELS: Record<string, string> = {
  electricista: 'Electricista',
  plomero: 'Sanitario',
  aire_acondicionado: 'Aire Acondicionado',
  cerrajero: 'Cerrajero/a',
  albanil: 'Albañil',
}

const ZONES = [
  'Pocitos', 'Malvín', 'Centro', 'Carrasco', 'Punta Carretas',
  'Cordón', 'Tres Cruces', 'La Blanqueada', 'Buceo', 'Parque Batlle',
]

export default function ProProfile() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [bio, setBio] = useState('')
  const [whatsapp, setWhatsapp] = useState(user?.phone ?? '')
  const [zone, setZone] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [availableNow, setAvailableNow] = useState(false)
  const [saved, setSaved] = useState(false)

  const firstCategory = selectedCategories[0]
  const specialty = firstCategory ? CATEGORY_LABELS[firstCategory] : 'Profesional'

  const toggleCategory = (id: string) =>
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">

      {/* Hero gradient oscuro */}
      <div
        className="px-4 pt-10 pb-16 relative flex flex-col items-center gap-2"
        style={{ background: 'linear-gradient(150deg, #064e3b, #0F6E56 50%, #047857)' }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Volver"
          className="self-start text-white/70 text-sm mb-4 active:opacity-60 transition-opacity focus:outline-none"
        >
          ← Volver
        </button>

        {/* Avatar con glow */}
        <div className="relative">
          <div
            className="w-[72px] h-[72px] rounded-full overflow-hidden flex-shrink-0"
            style={{
              border: '3px solid rgba(255,255,255,.4)',
              boxShadow: '0 0 0 6px rgba(255,255,255,.1)',
            }}
          >
            <Avatar src={user?.avatar_url ?? null} name={user?.full_name ?? 'P'} size="lg" />
          </div>
          <button
            type="button"
            aria-label="Cambiar foto de perfil"
            className="absolute bottom-0 right-0 bg-white w-6 h-6 rounded-full flex items-center justify-center shadow-md active:opacity-70 transition-opacity focus:outline-none"
          >
            <Camera size={12} className="text-primary" />
          </button>
        </div>

        <p className="text-base font-black text-white">{user?.full_name ?? 'Mi nombre'}</p>
        <p className="text-xs text-white/65">{specialty}</p>
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-background rounded-t-[32px]" />
      </div>

      {/* Floating card */}
      <div className="bg-white rounded-2xl shadow-xl mx-4 mt-[-28px] p-4 mb-4 relative z-10">
        {/* Stats row */}
        <div className="flex justify-around pb-3 border-b border-gray-100 mb-3">
          {(
            [
              { val: '4.8', lbl: 'Rating' },
              { val: '127', lbl: 'Trabajos' },
              { val: '~15m', lbl: 'Respuesta' },
            ] as const
          ).map((s, i, arr) => (
            <div key={s.lbl} className="flex items-center">
              <div className="text-center px-2">
                <div className="text-base font-black text-text-main">{s.val}</div>
                <div className="text-[8px] text-gray-400 uppercase tracking-wide mt-0.5">{s.lbl}</div>
              </div>
              {i < arr.length - 1 && <div className="w-px h-8 bg-gray-100 ml-2" />}
            </div>
          ))}
        </div>

        {/* Disponibilidad toggle */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setAvailableNow(true)}
            className={`py-2 rounded-xl text-[11px] font-bold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              availableNow
                ? 'bg-primary text-white'
                : 'bg-gray-50 text-gray-400 border border-gray-200'
            }`}
          >
            ⚡ Urgencias 24H
          </button>
          <button
            type="button"
            onClick={() => setAvailableNow(false)}
            className={`py-2 rounded-xl text-[11px] font-bold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              !availableNow
                ? 'bg-primary text-white'
                : 'bg-gray-50 text-gray-400 border border-gray-200'
            }`}
          >
            Solo diurno
          </button>
        </div>
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-3 px-4 pb-6">

        {/* Bio */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
            Descripción
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Contá tu experiencia y especialidades..."
            className="w-full border-[1.5px] border-gray-100 rounded-xl p-3 text-sm bg-gray-50 resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-150 placeholder:text-gray-300"
          />
        </div>

        {/* WhatsApp */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
            WhatsApp
          </label>
          <div className="relative">
            <span aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">
              📱
            </span>
            <input
              type="tel"
              value={whatsapp ?? ''}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="598 9X XXX XXX"
              className="w-full border-[1.5px] border-gray-100 rounded-xl py-3 pl-9 pr-3 text-sm bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-150 placeholder:text-gray-300"
            />
          </div>
        </div>

        {/* Servicios */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">
            Servicios
          </p>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => {
              const selected = selectedCategories.includes(cat.id)
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`rounded-xl p-2.5 text-center transition-all duration-150 active:scale-[.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 border-[1.5px] ${
                    selected
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-primary'
                      : 'bg-gray-50 border-gray-100'
                  }`}
                  aria-pressed={selected}
                >
                  <span
                    aria-hidden="true"
                    style={{ fontSize: 18, display: 'block', lineHeight: 1, marginBottom: 4 }}
                  >
                    {cat.emoji}
                  </span>
                  <span className={`text-[9px] font-bold ${selected ? 'text-primary' : 'text-gray-400'}`}>
                    {cat.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Zona */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
            Zona de trabajo
          </label>
          <div className="relative">
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="w-full border-[1.5px] border-gray-100 rounded-xl py-3 px-3 text-sm bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-150 appearance-none text-gray-500"
            >
              <option value="">Seleccioná un barrio</option>
              {ZONES.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
            <span aria-hidden="true" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm">
              ▼
            </span>
          </div>
        </div>

        {/* Save */}
        <button
          type="button"
          onClick={handleSave}
          className="w-full text-white rounded-2xl py-4 text-base font-black transition-all duration-150 active:scale-[.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          style={{
            background: 'linear-gradient(135deg, #0F6E56, #047857)',
            boxShadow: '0 6px 16px rgba(15,110,86,.35)',
          }}
        >
          {saved ? '✓ Guardado' : 'Guardar cambios'}
        </button>

      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/pages/pro/ProProfile.tsx
git commit -m "feat: ProProfile rediseñado — hero gradient oscuro, card flotante stats, toggle disponibilidad, 5 categorías"
```

---

## Task 3: Verificación visual + push

- [ ] **Step 1: Dev server**

```bash
npm run dev
```

Navegar a `http://localhost:5173/pro/registro` (autenticado como pro@demo.com / demo123)

- [ ] **Step 2: Checklist ProOnboarding (390px)**

- [ ] Hero gradient oscuro verde con logo + greeting con nombre
- [ ] Barra de progreso en 0%
- [ ] 3 cards con emoji + título + desc + badge "Pendiente" (ámbar)
- [ ] Botón "Completar mi perfil →" verde con sombra
- [ ] Link "Ver solicitudes" verde ghost
- [ ] Tap en completar → navega a /pro/perfil
- [ ] Tap en ver solicitudes → navega a /pro/solicitudes

- [ ] **Step 3: Checklist ProProfile (390px)**

- [ ] Hero gradient verde profundo con ← Volver funcional
- [ ] Avatar con glow ring y botón cámara
- [ ] Nombre del usuario y especialidad (si hay categoría seleccionada)
- [ ] Card flotante con stats (4.8 / 127 / ~15m) y dividers verticales
- [ ] Toggle disponibilidad: "Solo diurno" activo por defecto, click en "⚡ Urgencias 24H" lo activa
- [ ] 5 categorías en grid 3 cols: click selecciona con gradiente verde
- [ ] Textarea bio, input WhatsApp con ícono, select zona
- [ ] Botón "Guardar cambios" gradient → muestra "✓ Guardado" 2 segundos
- [ ] Sin overflow horizontal

- [ ] **Step 4: Push**

```bash
git push origin main
```
