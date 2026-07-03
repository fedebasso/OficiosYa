# P1 — Experiencia de usuario (URGENTE) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Header claro y legible (decisión B), navegación instantánea (sin transiciones de página ni splash artificial), y búsqueda real inline con sinónimos desde fuente única.

**Architecture:** Home header vuelve a fondo claro con `BrandLogo theme="light"`. `AnimatedRoutes` deja de animar (Routes plano). Se elimina el splash artificial. La búsqueda del Home se vuelve inline con sugerencias en tiempo real desde un `searchCategories()` compartido (fuente única en `inferCategory.ts`).

**Tech Stack:** React + TypeScript + framer-motion + lucide-react

## Global Constraints (reglas del pedido)

- Un cambio por commit, mensaje descriptivo
- No agregar funcionalidades nuevas (solo arreglar/optimizar)
- No modificar lógica cuando el cambio es visual y viceversa
- Decisión header: **B** (fondo claro + O naranja + FIX oscuro, contraste WCAG AA)
- Decisión transiciones: **eliminar** transiciones de página + splash artificial (mantener solo feedback táctil de botones)
- Búsqueda: fuente única, sin listas hardcodeadas duplicadas; insensible a mayúsculas/tildes; parcial; sinónimos; estado vacío con populares
- Correr `npm run lint` y `npm run build` tras cada cambio

---

### Task 1: Header claro y legible (P1.1)

**Files:**
- Modify: `src/pages/Home.tsx`

- [ ] **Step 1: Volver el header de Home a fondo claro + logo theme light**

Reemplazar el `<header>` del `homeHeader` (hoy oscuro `#191410`) por la versión clara.
Cambiar:
```tsx
      style={{
        background: '#191410',
        boxShadow: '0 2px 12px rgba(0,0,0,.25)',
      }}
```
por:
```tsx
      style={{
        background: '#FFFFFF',
        boxShadow: '0 1px 0 #EDE8DE, 0 2px 8px rgba(0,0,0,.04)',
      }}
```
Y el `<BrandLogo size="md" />` cambiarlo a `<BrandLogo size="md" theme="light" />` (O naranja `#FF6B00` + FIX `#1A1712`, legible sobre claro, contraste AA).

- [ ] **Step 2: Verificar TypeScript**

Run: `npx tsc --noEmit` → sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Home.tsx
git commit -m "fix(P1.1): light Home header with legible OFIX logo (orange O, dark FIX)"
```

(Nota: el buscador de este header se rehace en Task 3; sus colores se ajustan allí.)

---

### Task 2: Navegación instantánea (P1.2)

**Files:**
- Modify: `src/components/layout/AnimatedRoutes.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Quitar la animación de página en `AnimatedRoutes`**

Leer el archivo. Reemplazar el `return (...)` para renderizar las rutas SIN
`AnimatePresence`/`motion` (navegación instantánea):
```tsx
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes location={location}>
        {/* ← mantener EXACTAMENTE las mismas <Route> que ya están dentro del <Routes location={location}> */}
      </Routes>
    </Suspense>
  )
```
Quitar del archivo: el import y uso de `useNavDirection`, `AnimatePresence`, `motion`,
las constantes `TRANSITION`, `variants`, y `const direction = ...`. Mantener
`useLocation` (se usa como `location` en `<Routes location={location}>`), `Suspense`,
`PageSkeleton`, `useAuthStore`/`isPro`, y todas las rutas.

- [ ] **Step 2: Eliminar el splash artificial en `App.tsx`**

Leer `src/App.tsx`. Quitar el `<SplashScreen />` del render y su import
(`import { SplashScreen } from './components/SplashScreen'`). El splash de arranque en
frío lo cubre el `background_color`/íconos del manifest PWA; así no hay demora artificial
y la app se ve al instante. (Se documenta en el commit; el componente `SplashScreen.tsx`
queda huérfano, no se borra.)

- [ ] **Step 3: Verificar TypeScript y consola**

Run: `npx tsc --noEmit` → sin errores.
Navegar entre pantallas: el cambio debe ser inmediato, sin slide/fade.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/AnimatedRoutes.tsx src/App.tsx
git commit -m "perf(P1.2): instant navigation — remove page transitions and artificial splash"
```

---

### Task 3: Búsqueda real inline con sinónimos (P1.3)

**Files:**
- Modify: `src/lib/inferCategory.ts` (fuente única: agregar sinónimos + `searchCategories`)
- Modify: `src/pages/Home.tsx` (buscador inline en el header)

**Interfaces:**
- Produces: `searchCategories(query: string): { id: string; label: string }[]` en `inferCategory.ts`.

- [ ] **Step 1: Ampliar `CATEGORY_KEYWORDS` con sinónimos y agregar `searchCategories`**

En `src/lib/inferCategory.ts`, ampliar los keywords (agregar sinónimos uruguayos) y
exportar el buscador. Reemplazar el objeto `CATEGORY_KEYWORDS` por:
```ts
export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  electricista:       ['electri', 'luz', 'luces', 'tomacorriente', 'enchufe', 'tablero', 'corto', 'cortocircuito', 'foco', 'lampara', 'cable'],
  plomero:            ['plom', 'sanit', 'caño', 'agua', 'perdida', 'pérdida', 'filtracion', 'filtración', 'canilla', 'destape', 'inodoro', 'baño', 'humedad', 'cañeria', 'cañería'],
  aire_acondicionado: ['aire', 'ac', 'split', 'frio', 'frío', 'calor', 'refriger', 'no enfria', 'no enfría', 'aire acondicionado', 'climatiz'],
  cerrajero:          ['cerraj', 'llave', 'cerradura', 'porton', 'portón', 'traba', 'no abre', 'candado'],
  albanil:            ['alba', 'pared', 'fisura', 'grieta', 'mampost', 'cemento', 'revoque', 'pisos', 'ladrillo', 'construc'],
  pintor:             ['pint', 'pintar', 'color', 'barniz', 'esmalte'],
}
```
Y agregar, usando el `normalize` y `CATEGORY_LABELS`:
```ts
import { CATEGORY_LABELS } from './categories'

export interface CategoryMatch { id: string; label: string }

// Fuente única de búsqueda de oficios (label + keywords/sinónimos, sin tildes ni mayúsculas)
export function searchCategories(query: string): CategoryMatch[] {
  const q = normalize(query.trim())
  const ids = Object.keys(CATEGORY_KEYWORDS)
  if (!q) return ids.map((id) => ({ id, label: CATEGORY_LABELS[id] ?? id }))
  return ids
    .map((id) => {
      const label = CATEGORY_LABELS[id] ?? id
      const inLabel = normalize(label).includes(q)
      const inKw = CATEGORY_KEYWORDS[id].some((k) => normalize(k).includes(q))
      return { id, label, match: inLabel || inKw, labelHit: inLabel }
    })
    .filter((c) => c.match)
    .sort((a, b) => Number(b.labelHit) - Number(a.labelHit))
    .map(({ id, label }) => ({ id, label }))
}
```
(`import { CATEGORY_LABELS } from './categories'` — verificar que no genere ciclo de
imports; `categories.ts` no importa de `inferCategory.ts`, así que no hay ciclo.)

- [ ] **Step 2: Buscador inline en el header del Home**

En `src/pages/Home.tsx`:
- Importar: `import { useState, useRef } from 'react'` (agregar a los hooks existentes) y
  `import { searchCategories } from '../lib/inferCategory'`.
- Dentro de `Home()`, estado:
  ```tsx
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const results = query.trim() ? searchCategories(query) : []
  ```
- Reemplazar el `<button>` del buscador (el que hoy hace `navigate('/buscar')`) por un
  input inline que se expande en el lugar, con autofocus y sugerencias:
  ```tsx
  <div style={{ padding: '0 var(--px-container) 12px', position: 'relative' }}>
    <div
      className="w-full flex items-center gap-2.5"
      style={{ height: 48, background: '#F6F1EA', border: '1.5px solid #ECE4D8', borderRadius: 15, padding: '0 14px' }}
      onClick={() => { setSearchOpen(true); setTimeout(() => inputRef.current?.focus(), 0) }}
    >
      <Search size={19} strokeWidth={2.3} style={{ color: '#C2B8A6' }} />
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setSearchOpen(true)}
        placeholder="¿Qué servicio necesitás?"
        className="flex-1 bg-transparent outline-none"
        style={{ fontSize: 15, color: '#1A1712', caretColor: '#E8683A' }}
      />
      {query && (
        <button type="button" onClick={() => setQuery('')} aria-label="Limpiar" style={{ color: '#B0A594', fontSize: 18, lineHeight: 1 }}>×</button>
      )}
    </div>

    {searchOpen && query.trim() && (
      <div
        className="absolute left-0 right-0 z-50 flex flex-col"
        style={{ top: '100%', margin: '4px var(--px-container) 0', background: '#FFFFFF', border: '1px solid #ECE6DC', borderRadius: 16, boxShadow: '0 12px 28px -12px rgba(60,40,20,.25)', overflow: 'hidden' }}
      >
        {results.length > 0 ? results.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => { setSearchOpen(false); setQuery(''); navigate(`/buscar/${r.id}`) }}
            className="flex items-center gap-3 px-4 py-3 text-left active:opacity-70"
            style={{ borderBottom: '1px solid #F5F0E8' }}
          >
            <span className="flex items-center justify-center flex-shrink-0" style={{ width: 34, height: 34, borderRadius: 10, background: '#FAF6F0' }}>
              {createElement(getCategoryIcon(r.id), { size: 17, style: { color: '#D4571F' } })}
            </span>
            <span className="font-bold" style={{ color: '#1A1712', fontSize: 14 }}>{r.label}</span>
          </button>
        )) : (
          <div className="px-4 py-4">
            <p className="text-sm font-bold" style={{ color: '#1A1712' }}>No encontramos "{query}"</p>
            <p className="text-xs mt-1 mb-3" style={{ color: '#7A6E5E' }}>Probá con alguna categoría popular:</p>
            <div className="flex flex-wrap gap-2">
              {searchCategories('').slice(0, 6).map((r) => (
                <button key={r.id} type="button" onClick={() => { setSearchOpen(false); setQuery(''); navigate(`/buscar/${r.id}`) }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg" style={{ background: '#FAF6F0', border: '1px solid #ECE4D8', color: '#7A6E5E' }}>
                  {createElement(getCategoryIcon(r.id), { size: 13, style: { color: '#D4571F' } })} {r.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )}
  </div>
  ```
- Agregar imports que falten en Home: `createElement` de 'react', `getCategoryIcon` de
  '../lib/categories'. (`Search` de lucide ya está importado.)

- [ ] **Step 3: Verificar TypeScript y comportamiento**

Run: `npx tsc --noEmit` → sin errores.
Probar en `/`: tocar la barra la enfoca sin cambiar de pantalla; escribir "elec" muestra
Electricista; "plomero" → Sanitario; "split" → Aire Acondicionado; "alBAÑil" sin/con
tildes funciona; un término sin match muestra "No encontramos" + populares; tocar un
resultado navega a `/buscar/:cat`.

- [ ] **Step 4: Commit**

```bash
git add src/lib/inferCategory.ts src/pages/Home.tsx
git commit -m "feat(P1.3): inline Home search with synonyms from single source"
```

---

### Task 4: Lint, build, deploy

- [ ] **Step 1: Lint**

Run: `npm run lint` → sin errores (quitar imports sin uso que queden, ej. en
`AnimatedRoutes` o `App`).

- [ ] **Step 2: Build**

Run: `npm run build` → `✓ built` sin errores.

- [ ] **Step 3: Push y deploy**

```bash
git push origin main
vercel --prod
```

- [ ] **Step 4: Verificación del flujo principal (consola sin errores)**

En producción (incógnito): buscar (inline) → ver categoría → ver profesional →
solicitar trabajo. Confirmar cero errores de consola y navegación instantánea.
