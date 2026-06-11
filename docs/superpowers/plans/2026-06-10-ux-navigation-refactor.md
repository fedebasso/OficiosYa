# UX/Navigation Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Garantizar navegación consistente en toda la app — BottomNav siempre visible en pantallas de contenido, ProfessionalProfile integrada al sistema de navegación, búsqueda accesible desde cualquier pantalla.

**Architecture:** Correcciones quirúrgicas en 5 archivos. No se crea infraestructura nueva — se integran las pantallas que usan layouts propios al sistema PageShell existente. El BottomNav ya es role-aware y funcional; solo necesita estar presente donde falta.

**Tech Stack:** React 19, TypeScript, Tailwind CSS (inline styles), React Router v7, Zustand

---

## Audit de estado actual

| Pantalla | BottomNav | Header back | SearchBar | Estado |
|---|---|---|---|---|
| Home | ✅ | N/A (root) | ✅ input | OK |
| Search | ✅ | ✅ | ✅ editable | OK |
| ProfessionalDetail/Profile | ❌ layout propio | ✅ custom | ❌ | 🔴 BUG |
| RequestService | ❌ intencional | ✅ | N/A | OK |
| MisSolicitudes | ✅ | N/A (root tab) | N/A | OK |
| Urgencias | ❌ sin razón | ✅ | N/A | 🟡 FIX |
| ProRequests | ✅ | N/A (root tab) | N/A | OK |
| ProProfile | ✅ | N/A (root tab) | N/A | OK |
| ProWorkHistory | ✅ | N/A (root tab) | N/A | OK |
| Login | ❌ intencional | N/A | N/A | OK |
| Register | ❌ intencional | N/A | N/A | OK |
| ProOnboarding | ❌ intencional | N/A | N/A | OK |
| NotFound | ❌ | N/A | N/A | 🟡 FIX |

---

## File Map

| Archivo | Acción | Razón |
|---|---|---|
| `src/components/professionals/ProfessionalProfile.tsx` | Modify | Agregar BottomNav + ajustar CTA fijo |
| `src/pages/Urgencias.tsx` | Modify | `showBottomNav={false}` → default true |
| `src/pages/NotFound.tsx` | Modify | Agregar BottomNav para usuarios logueados |
| `src/components/layout/BottomNav.tsx` | Modify | Fix active state para `/buscar` sin categoría |
| `src/pages/Search.tsx` | Modify | Ensure `/buscar` sin categoría activa tab correctamente |

---

## Task 1: Fix ProfessionalProfile — agregar BottomNav

**El problema mayor.** El usuario toca un profesional, ve el perfil, y no hay BottomNav ni forma de navegar salvo el botón ← custom. En mobile esto se siente como quedar atrapado.

**Solución:** Importar `BottomNav` directamente en `ProfessionalProfile.tsx` (no usar PageShell porque tiene un layout de hero muy específico). El CTA fijo ya está a `bottom-0`; con BottomNav de altura ~60px hay que subir el CTA a `bottom-16` (64px).

**Files:**
- Modify: `src/components/professionals/ProfessionalProfile.tsx`

- [ ] **Step 1: Agregar import de BottomNav**

En `src/components/professionals/ProfessionalProfile.tsx`, agregar el import:

```tsx
import { BottomNav } from '../layout/BottomNav'
```

- [ ] **Step 2: Render BottomNav al final del componente**

Localizar el cierre del `<div className="flex flex-col min-h-screen"...>` (última línea antes del return closure) y agregar `<BottomNav />` justo antes:

```tsx
      {/* ── CTA FIJO ── */}
      <div
        className="fixed bottom-16 left-0 right-0 px-4 pb-4 pt-3 grid gap-3"
        style={{
          gridTemplateColumns: '1fr 2fr',
          background: 'linear-gradient(to top, #0f0f0f 70%, transparent)',
        }}
      >
        {/* ... buttons sin cambio ... */}
      </div>

      <BottomNav />
    </div>
  )
```

El cambio clave: `bottom-0` → `bottom-16` en el div del CTA para que no quede tapado por BottomNav.

- [ ] **Step 3: TypeScript check**

```bash
node_modules/.bin/tsc --noEmit --project tsconfig.app.json
```
Expected: sin errores.

- [ ] **Step 4: Verificar visualmente**

```bash
# Dev server ya corriendo en :5173
# Navegar a http://localhost:5173/profesional/1
# Verificar: BottomNav visible abajo, CTA visible sobre el BottomNav
```

- [ ] **Step 5: Commit**

```bash
git add src/components/professionals/ProfessionalProfile.tsx
git commit -m "fix(nav): agregar BottomNav a ProfessionalProfile"
```

---

## Task 2: Fix Urgencias — habilitar BottomNav

**Files:**
- Modify: `src/pages/Urgencias.tsx` línea 72

- [ ] **Step 1: Cambiar showBottomNav**

```tsx
// ANTES:
<PageShell header={header} showBottomNav={false}>

// DESPUÉS:
<PageShell header={header}>
```

- [ ] **Step 2: TypeScript check**

```bash
node_modules/.bin/tsc --noEmit --project tsconfig.app.json
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/Urgencias.tsx
git commit -m "fix(nav): habilitar BottomNav en Urgencias"
```

---

## Task 3: Fix NotFound — BottomNav para usuarios logueados

Un usuario logueado que llega a una ruta inexistente debe poder navegar. Si no tiene sesión, BottomNav no muestra tabs útiles — mostrarla igual está bien (puede iniciar sesión o volver al inicio).

**Files:**
- Modify: `src/pages/NotFound.tsx`

- [ ] **Step 1: Cambiar showBottomNav**

```tsx
// ANTES:
<PageShell showBottomNav={false}>

// DESPUÉS:
<PageShell showBottomNav>
```

- [ ] **Step 2: Ajustar padding inferior del contenido**

El contenido usa `min-h-screen` con flex centered. Con BottomNav visible (64px), hay que agregar `pb-16` al div interior para que los botones no queden tapados:

```tsx
<div
  className="flex flex-col items-center justify-center min-h-screen gap-6 px-6 pb-16 text-center"
  style={{ background: '#0f0f0f' }}
>
```

- [ ] **Step 3: TypeScript check + commit**

```bash
node_modules/.bin/tsc --noEmit --project tsconfig.app.json
git add src/pages/NotFound.tsx
git commit -m "fix(nav): agregar BottomNav a NotFound"
```

---

## Task 4: Fix BottomNav — active state para /buscar sin categoría

Actualmente el tab "Buscar" apunta a `/buscar`. La función `isActive` usa `pathname.startsWith(to)`, así que `/buscar/electricista` activa el tab correctamente. Pero hay que verificar que `/buscar` sin categoría también lo active.

**Files:**
- Modify: `src/components/layout/BottomNav.tsx`

- [ ] **Step 1: Verificar lógica actual**

En `BottomNav.tsx` la función isActive es:
```tsx
function isActive(to: string): boolean {
  if (to === '/') return pathname === '/'
  return pathname.startsWith(to)
}
```

`'/buscar/electricista'.startsWith('/buscar')` → `true` ✅  
`'/buscar'.startsWith('/buscar')` → `true` ✅  

La lógica ya es correcta. **No se necesita cambio.** Marcar este task como verificado.

- [ ] **Step 2: Verificar visualmente en browser**

```
http://localhost:5173/buscar → tab "Buscar" debe estar en naranja
http://localhost:5173/buscar/electricista → tab "Buscar" debe estar en naranja
```

---

## Task 5: Audit global — verificar todos los flujos

- [ ] **Step 1: Flujo cliente completo**

Navegar como cliente logueado (`cliente@demo.com / demo123`):
1. Home → BottomNav visible con 3 tabs ✅
2. Tocar categoría → Search → BottomNav visible ✅
3. Tocar profesional → ProfessionalProfile → BottomNav visible (post Task 1)
4. Botón "Solicitar trabajo" → RequestService → sin BottomNav (intencional) ✅
5. Submit → success → botón "Ver mis solicitudes" → MisSolicitudes → BottomNav ✅
6. Home → Emergencias 24hs → Urgencias → BottomNav visible (post Task 2)

- [ ] **Step 2: Flujo profesional completo**

Navegar como pro logueado (`pro@demo.com / demo123`):
1. Home → BottomNav con 4 tabs ✅
2. Solicitudes → ProRequests → BottomNav ✅
3. Trabajos → ProWorkHistory → BottomNav ✅
4. Perfil → ProProfile → BottomNav ✅

- [ ] **Step 3: Flujo sin sesión**

1. Home → BottomNav con tabs cliente ✅
2. Tocar profesional → ProfessionalProfile → BottomNav visible ✅
3. Ruta desconocida → NotFound → BottomNav visible (post Task 3)

- [ ] **Step 4: Commit final del plan**

```bash
git add docs/
git commit -m "docs: plan de refactor UX/navegación"
```

---

## Self-Review

**Spec coverage:**
- ✅ Búsqueda persistente: el tab "Buscar" en BottomNav ya es la búsqueda persistente. Accesible desde cualquier pantalla de contenido. Task 1-3 aseguran que BottomNav esté en todas las pantallas.
- ✅ BottomNav consistente en todas las pantallas de contenido
- ✅ Solo oculto en login/register/onboarding/formularios críticos
- ✅ MisSolicitudes ya tiene BottomNav y header consistente
- ✅ Pantallas secundarias tienen botón volver (Search, RequestService, Urgencias ya lo tienen)
- ✅ Audit global en Task 5

**Gaps identificados:**
- El spec menciona "SearchBar en más pantallas". La decisión de arquitectura es NO duplicar el SearchBar en cada header (sería ruido), sino que el tab "Buscar" en BottomNav cumple esa función. Esto está alineado con apps como Uber/PedidosYa donde la búsqueda está en la tab, no en cada header.

**Placeholder scan:** sin TBDs ni TODOs.

**Type consistency:** sin nuevos tipos. Solo cambios de props booleanas y import de componente existente.
