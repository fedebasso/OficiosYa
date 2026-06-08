# Login Redesign + CategoryGrid con Fotos Reales

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar Login con hero premium + inputs modernos + demo card elegante, y reemplazar emojis de CategoryGrid por fotos reales de Unsplash con overlay oscuro.

**Architecture:** Dos cambios independientes en archivos aislados — Login.tsx (rediseño completo de la página) y CategoryGrid.tsx (reemplazar CategoryButton con foto+overlay). Sin cambios en lógica de auth ni routing. Sin dependencias nuevas.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 3, React Router 7, Unsplash CDN (URLs directas, sin API key)

---

## File Map

**Modificar:**
- `src/pages/Login.tsx` — rediseño completo, misma lógica de auth
- `src/components/home/CategoryGrid.tsx` — CategoryButton con foto real + overlay

---

## Task 1: Rediseño de Login

**Files:**
- Modify: `src/pages/Login.tsx`

- [ ] **Step 1: Reemplazar Login.tsx completo**

```tsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { useAuthStore } from '../store/authStore'

export default function Login() {
  const navigate = useNavigate()
  const signIn = useAuthStore((s) => s.signIn)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signIn(email, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell showBottomNav={false}>
      <div className="flex flex-col min-h-screen">

        {/* Hero verde */}
        <div className="bg-primary px-6 pt-16 pb-14 flex flex-col items-center gap-2 relative">
          <h1 className="text-4xl font-black text-white tracking-tight leading-none">
            Oficio<span className="text-accent">Ya</span>
          </h1>
          <p className="text-white/60 text-sm">Profesionales de confianza en Montevideo</p>
          {/* Wave */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-background rounded-t-[32px]" />
        </div>

        {/* Form */}
        <div className="flex flex-col gap-5 px-6 pt-6 pb-10">

          <div>
            <h2 className="text-xl font-black text-text-main">Bienvenido de vuelta</h2>
            <p className="text-sm text-gray-400 mt-0.5">Ingresá a tu cuenta para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-base pointer-events-none">
                  ✉️
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="w-full bg-white border-[1.5px] border-gray-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-text-main placeholder:text-gray-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-150"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-base pointer-events-none">
                  🔒
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white border-[1.5px] border-gray-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-text-main placeholder:text-gray-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-150"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white rounded-2xl py-4 text-base font-bold tracking-wide transition-all duration-150 active:scale-[.99] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ boxShadow: '0 4px 14px rgba(15,110,86,.3)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Ingresando...
                </span>
              ) : (
                'Ingresar'
              )}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-300 font-medium">o</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-gray-500">
            ¿No tenés cuenta?{' '}
            <Link to="/registro" className="text-primary font-bold">
              Registrate gratis
            </Link>
          </p>

          {/* Demo card */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-primary text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                DEMO
              </span>
              <span className="text-xs font-bold text-emerald-800">Accesos de prueba</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between py-1.5 border-b border-green-100">
                <span className="text-xs font-bold text-primary">👤 Cliente</span>
                <span className="text-[11px] text-gray-500 font-mono">cliente@demo.com / demo123</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-xs font-bold text-primary">🔧 Profesional</span>
                <span className="text-[11px] text-gray-500 font-mono">pro@demo.com / demo123</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </PageShell>
  )
}
```

- [ ] **Step 2: Verificar que compila**

```bash
cd C:\Users\fede8\Documents\OficiosYa\oficioYa
npx tsc --noEmit
```

Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Login.tsx
git commit -m "feat: Login rediseñado — hero verde, inputs modernos, demo card premium"
```

---

## Task 2: CategoryGrid con fotos reales

**Files:**
- Modify: `src/components/home/CategoryGrid.tsx`

- [ ] **Step 1: Reemplazar CategoryGrid.tsx completo**

```tsx
import { useNavigate } from 'react-router-dom'

interface Category {
  id: string
  label: string
  emoji: string
  photo: string
}

const CATEGORIES: Category[] = [
  {
    id: 'electricista',
    label: 'Electricista',
    emoji: '⚡',
    photo: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&q=80',
  },
  {
    id: 'plomero',
    label: 'Sanitario',
    emoji: '🚿',
    photo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  },
  {
    id: 'aire_acondicionado',
    label: 'Aire Ac.',
    emoji: '❄️',
    photo: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&q=80',
  },
  {
    id: 'cerrajero',
    label: 'Cerrajero',
    emoji: '🔑',
    photo: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&q=80',
  },
  {
    id: 'albanil',
    label: 'Albañil',
    emoji: '🧱',
    photo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80',
  },
]

const ROW_ONE = CATEGORIES.slice(0, 3)
const ROW_TWO = CATEGORIES.slice(3)

function CategoryButton({ cat, onClick }: { cat: Category; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative aspect-square rounded-2xl overflow-hidden active:scale-[.97] transition-transform duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      {/* Foto real */}
      <img
        src={cat.photo}
        alt={cat.label}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
      />
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      {/* Fallback si no carga */}
      <div className="absolute inset-0 -z-10 bg-primary/20 flex items-center justify-center">
        <span style={{ fontSize: 28 }}>{cat.emoji}</span>
      </div>
      {/* Nombre */}
      <div className="absolute bottom-0 left-0 right-0 p-2">
        <span
          className="text-white text-[9px] font-black uppercase tracking-wider leading-tight block"
          style={{ textShadow: '0 1px 3px rgba(0,0,0,.6)' }}
        >
          {cat.label}
        </span>
      </div>
    </button>
  )
}

export function CategoryGrid() {
  const navigate = useNavigate()
  const go = (id: string) => navigate(`/buscar/${id}`)

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-2">
        {ROW_ONE.map((cat) => (
          <CategoryButton key={cat.id} cat={cat} onClick={() => go(cat.id)} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {ROW_TWO.map((cat) => (
          <CategoryButton key={cat.id} cat={cat} onClick={() => go(cat.id)} />
        ))}
      </div>
    </div>
  )
}

export default CategoryGrid
```

- [ ] **Step 2: Verificar que compila**

```bash
npx tsc --noEmit
```

Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/CategoryGrid.tsx
git commit -m "feat: CategoryGrid con fotos reales Unsplash + overlay oscuro"
```

---

## Task 3: Verificación visual

- [ ] **Step 1: Arrancar dev server si no está corriendo**

```bash
npm run dev
```

Abrir `http://localhost:5173` (o el puerto que indique Vite).

- [ ] **Step 2: Checklist Login**

En DevTools mobile (iPhone 12, 390px):
- [ ] Hero verde con logo grande y tagline
- [ ] Wave blanco redondeado separa hero del form
- [ ] "Bienvenido de vuelta" como título
- [ ] Inputs con ícono izquierdo (✉️ / 🔒), border suave, focus verde
- [ ] Botón verde sólido con sombra
- [ ] Divider "o" + link registro
- [ ] Demo card verde suave con badge DEMO y credenciales en tabla
- [ ] Spinner al hacer submit
- [ ] Error visible si credenciales incorrectas
- [ ] Login exitoso navega a /

- [ ] **Step 3: Checklist CategoryGrid**

En Home:
- [ ] 5 fotos cuadradas cargando correctamente (Unsplash)
- [ ] Overlay oscuro visible con nombre en blanco abajo
- [ ] Grid 3+2 mantenido
- [ ] Hover: foto hace zoom sutil
- [ ] Tap navega a /buscar/:categoria
- [ ] No hay overflow horizontal

- [ ] **Step 4: Push a GitHub**

```bash
git push origin main
```
