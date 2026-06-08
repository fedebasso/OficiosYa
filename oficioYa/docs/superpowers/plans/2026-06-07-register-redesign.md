# Register Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar Register.tsx para que sea visualmente consistente con el Login rediseñado, con role selector de cards visuales (opción A aprobada por usuario).

**Architecture:** Un único archivo `src/pages/Register.tsx` reemplazado en su totalidad. Misma estructura que Login (hero verde + wave + form), mismos patrones de accesibilidad (aria-hidden en emojis, role="alert", aria-describedby, focus-visible ring). Sin nuevas dependencias.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 3, React Router 7, Zustand (authStore)

---

## File Map

**Modificar:**
- `src/pages/Register.tsx` — reemplazar completo

---

## Task 1: Rediseño de Register

**Files:**
- Modify: `src/pages/Register.tsx`

- [ ] **Step 1: Reemplazar Register.tsx completo**

```tsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { useAuthStore } from '../store/authStore'

export default function Register() {
  const navigate = useNavigate()
  const signUp = useAuthStore((s) => s.signUp)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'client' | 'professional'>('client')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signUp(email, password, fullName, role)
      navigate(role === 'professional' ? '/pro/registro' : '/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse')
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
          <p className="text-white/60 text-sm">Creá tu cuenta gratis</p>
          {/* Wave */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-background rounded-t-[32px]" />
        </div>

        {/* Form */}
        <div className="flex flex-col gap-5 px-6 pt-6 pb-10">

          <div>
            <h2 className="text-xl font-black text-text-main">Empezá ahora</h2>
            <p className="text-sm text-gray-400 mt-0.5">Solo te lleva 1 minuto</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {error && (
              <div
                id="register-error"
                role="alert"
                aria-live="polite"
                className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-600"
              >
                {error}
              </div>
            )}

            {/* Nombre */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Nombre completo
              </label>
              <div className="relative">
                <span aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-base pointer-events-none">
                  👤
                </span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Tu nombre"
                  required
                  aria-describedby={error ? 'register-error' : undefined}
                  className="w-full bg-white border-[1.5px] border-gray-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-text-main placeholder:text-gray-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-150"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <span aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-base pointer-events-none">
                  ✉️
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  aria-describedby={error ? 'register-error' : undefined}
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
                <span aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-base pointer-events-none">
                  🔒
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  aria-describedby={error ? 'register-error' : undefined}
                  className="w-full bg-white border-[1.5px] border-gray-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-text-main placeholder:text-gray-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-150"
                />
              </div>
            </div>

            {/* Role selector — Cards visuales */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Soy...
              </label>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { value: 'client', icon: '👤', name: 'Cliente', desc: 'Busco profesionales para mi hogar' },
                  { value: 'professional', icon: '🔧', name: 'Profesional', desc: 'Ofrezco mis servicios y consigo clientes' },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value)}
                    className={[
                      'flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all duration-150 active:scale-[.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                      role === opt.value
                        ? 'border-primary bg-green-50'
                        : 'border-gray-200 bg-white',
                    ].join(' ')}
                    aria-pressed={role === opt.value}
                  >
                    <span aria-hidden="true" style={{ fontSize: 28, lineHeight: 1 }}>{opt.icon}</span>
                    <span className={`text-sm font-black ${role === opt.value ? 'text-primary' : 'text-text-main'}`}>
                      {opt.name}
                    </span>
                    <span className="text-[10px] text-gray-400 text-center leading-tight">
                      {opt.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white rounded-2xl py-4 text-base font-bold tracking-wide transition-all duration-150 active:scale-[.99] disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              style={{ boxShadow: '0 4px 14px rgba(15,110,86,.3)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Creando cuenta...
                </span>
              ) : (
                'Crear cuenta'
              )}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-300 font-medium">o</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Login link */}
          <p className="text-center text-sm text-gray-500">
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" className="text-primary font-bold">
              Iniciá sesión
            </Link>
          </p>

        </div>
      </div>
    </PageShell>
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
git add src/pages/Register.tsx
git commit -m "feat: Register rediseñado — hero verde, inputs modernos, role selector cards"
```

---

## Task 2: Verificación visual

- [ ] **Step 1: Abrir dev server**

Navegar a `http://localhost:5174/registro`

- [ ] **Step 2: Checklist en DevTools mobile (390px)**

- [ ] Hero verde con "Creá tu cuenta gratis"
- [ ] Wave blanco redondeado separa hero del form
- [ ] Título "Empezá ahora" + subtítulo "Solo te lleva 1 minuto"
- [ ] 3 inputs con íconos (👤✉️🔒), focus verde al clickear
- [ ] Role cards: por defecto Cliente seleccionado (borde verde + bg verde claro)
- [ ] Click en Profesional → cambia selección visualmente
- [ ] Botón "Crear cuenta" verde con sombra
- [ ] Link "Iniciá sesión" → navega a /login
- [ ] Error visible si se envía vacío
- [ ] Spinner al hacer submit
- [ ] Registro exitoso navega a / (cliente) o /pro/registro (profesional)
- [ ] Sin overflow horizontal

- [ ] **Step 3: Push**

```bash
git push origin main
```
