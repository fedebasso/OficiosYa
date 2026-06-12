# Home UX Refinement — OficioYa
**Date:** 2026-06-12
**Scope:** Refinamiento de la Home para mejorar densidad visual, jerarquía y experiencia mobile-first premium. Incluye rediseño del acceso a cuenta de usuario.

---

## Resumen de cambios

1. **Header compacto** — reducir altura, eliminar SearchBar duplicada, eliminar botón de cuenta
2. **Spacing reducido** — más contenido above the fold
3. **UrgenciasFAB** — reemplaza el banner por FAB flotante con pill expansion
4. **CategoryGrid 6 categorías** — agregar Pintor para grid 3×2 perfecto
5. **BottomNav 4 tabs** — Inicio, Buscar, Solicitudes, Más (☰)
6. **MoreMenu bottom sheet** — despliega Favoritos, Perfil, Ajustes, Ser profesional
7. **ClientProfile page** — nueva página `/perfil`

---

## 1. Header compacto

**Archivo:** `src/pages/Home.tsx` (header inline)

### Cambios
- `pt-12` → `pt-3`: eliminar el padding-top excesivo (48px → 12px)
- Logo `text-[28px]` → `text-[22px]`: más compacto, sigue siendo legible y bold
- `pb-3` → `pb-2`
- **Eliminar completamente** el `<SearchBar>` del header — el tab "Buscar" del BottomNav cumple esa función. Eliminar también el `mb-3` y el import de `SearchBar` si ya no se usa en Home.
- **Eliminar completamente** el botón 👤 de cuenta y su dropdown menu

### Resultado
Header limpio con solo el logo. Sin duplicación de búsqueda. Ahorro de ~80px de altura.

---

## 2. Spacing del contenido home

**Archivo:** `src/pages/Home.tsx` (wrapper del contenido)

```tsx
// Antes:
<div className="px-4 py-5 flex flex-col gap-5">

// Después:
<div className="flex flex-col gap-3 pt-3 pb-4">
```

El padding horizontal (`px-4`) se elimina — ya está aplicado via `--px-container` en `PageShell`. El `gap-3` (12px) reemplaza `gap-5` (20px).

---

## 3. UrgenciasFAB

**Crear:** `src/components/home/UrgenciasFAB.tsx`
**Eliminar:** `src/components/home/UrgenciasBanner.tsx`

### Comportamiento

**Estado collapsed (default):**
- Círculo rojo 48×48px
- `position: fixed`, `bottom: calc(72px + var(--safe-bottom))`, `right: 16px`, `z-index: 40`
- Ícono 🚨, font-size 22px
- Animación: box-shadow pulse usando `urgency-pulse` definido en `index.css`
- Background: `#EF4444`, border-radius: `50%`

**Al tocar (toggle expanded):**
- Width: `48px` → `210px`, border-radius: `50%` → `24px`
- Transition: `width 280ms var(--ease-spring), border-radius 280ms var(--ease-spring)`
- Aparece texto: "Emergencias 24hs" (font-bold, blanco) + contador `{count} disponibles` (--text-xs, blanco 85% opacity)
- El ícono 🚨 se mantiene a la derecha (flex-row-reverse)
- Auto-colapsa después de 4 segundos
- Tocar de nuevo colapsa inmediatamente

**Al tocar la pill expandida:** navegar a `/urgencias`

**Texto del contador:** hook `useUrgentProfessionals` (ya existe). Si `count > 0`: `${count} disponibles ahora`. Si no: `Disponibles ahora`.

### Código

```tsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUrgentProfessionals } from '../../hooks/useProfessionals'

export function UrgenciasFAB() {
  const navigate = useNavigate()
  const { professionals } = useUrgentProfessionals()
  const count = professionals.length
  const [expanded, setExpanded] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleTap = () => {
    if (expanded) {
      navigate('/urgencias')
      return
    }
    setExpanded(true)
    timerRef.current = setTimeout(() => setExpanded(false), 4000)
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  return (
    <button
      type="button"
      onClick={handleTap}
      aria-label="Emergencias 24hs"
      className="fixed z-40 flex items-center overflow-hidden active:opacity-80 transition-opacity"
      style={{
        bottom: 'calc(72px + var(--safe-bottom))',
        right: 16,
        height: 48,
        width: expanded ? 210 : 48,
        borderRadius: expanded ? 24 : '50%',
        background: '#EF4444',
        boxShadow: '0 4px 16px rgba(239,68,68,.45)',
        transition: 'width 280ms var(--ease-spring), border-radius 280ms var(--ease-spring)',
        flexDirection: 'row-reverse',
        paddingRight: expanded ? 4 : 0,
        paddingLeft: expanded ? 12 : 0,
        animation: expanded ? 'none' : 'urgency-pulse 2s ease-in-out infinite',
      }}
    >
      <span style={{ fontSize: 22, flexShrink: 0, width: 40, textAlign: 'center' }}>🚨</span>
      {expanded && (
        <div className="flex-1 text-left min-w-0">
          <div className="font-bold text-white truncate" style={{ fontSize: 'var(--text-sm)' }}>
            Emergencias 24hs
          </div>
          <div className="text-white truncate" style={{ fontSize: 'var(--text-xs)', opacity: 0.85 }}>
            {count > 0 ? `${count} disponibles ahora` : 'Disponibles ahora'}
          </div>
        </div>
      )}
    </button>
  )
}

export default UrgenciasFAB
```

---

## 4. CategoryGrid — agregar Pintor

**Archivo:** `src/components/home/CategoryGrid.tsx`

Agregar al array `CATEGORIES`:

```ts
{
  id: 'pintor',
  label: 'Pintor',
  emoji: '🎨',
  photo: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&q=80',
}
```

Con 6 categorías, el grid `grid-cols-2 sm:grid-cols-3` queda:
- 320px: 2 columnas × 3 filas
- 375px+: 3 columnas × 2 filas (perfecto)

---

## 5. BottomNav — 4 tabs con "Más"

**Archivo:** `src/components/layout/BottomNav.tsx`

Los `clientTabs` pasan a ser 4 tabs: Inicio, Buscar, Solicitudes, Más.

```tsx
const clientTabs: NavTab[] = [
  { label: 'Inicio',      to: '/',               icon: <House size={22} /> },
  { label: 'Buscar',      to: '/buscar',          icon: <Search size={22} /> },
  { label: 'Solicitudes', to: '/mis-solicitudes', icon: <FileText size={22} /> },
  { label: 'Más',         to: '',                 icon: <Menu size={22} /> },
]
```

El tab "Más" no navega a ninguna ruta — al tocarlo abre el `MoreMenu` (bottom sheet). Necesita lógica especial: en vez de `<Link>`, renderiza un `<button>` que llama a `onMorePress()`.

### Cambios en BottomNav
- Agregar prop opcional `onMorePress?: () => void`
- El tab con `to === ''` renderiza `<button>` en vez de `<Link>`
- Agregar import de `Menu` de lucide-react
- Eliminar import de `Heart` y `useFavoritesStore` (ya no se usan en BottomNav)

---

## 6. MoreMenu — bottom sheet

**Crear:** `src/components/layout/MoreMenu.tsx`

Bottom sheet que se abre desde el BottomNav al tocar "Más".

### Props
```tsx
interface MoreMenuProps {
  open: boolean
  onClose: () => void
}
```

### Estructura visual
```
Overlay semitransparente (cierra al tocar)
  └── Sheet (slide-up desde abajo)
        ├── Handle (barra gris centered)
        ├── Fila → /favoritos     (♥  "Mis favoritos")
        ├── Fila → /perfil        (👤 "Mi perfil")
        ├── Separador
        ├── Fila → /pro/registro  (🔧 "Quiero ser profesional")  [solo si role === 'client']
        └── Fila → cerrar sesión  (rojo, icono LogOut)
```

### Comportamiento
- Slide-up: `transform: translateY(100%)` → `translateY(0)`, transition `300ms var(--ease-ios)`
- Overlay: `opacity: 0` → `opacity: 1`, transition `200ms ease`
- Cerrar: tocar overlay, swipe down, o tocar "Más" de nuevo
- Cerrar sesión: `signOut()` + `navigate('/login')`
- Cada fila navega y cierra el menú

### Estilo de filas
```tsx
// Fila estándar
<button className="w-full flex items-center gap-3 px-4 py-3.5 active:opacity-60 transition-opacity rounded-2xl"
  style={{ background: '#F5F0E8' }}>
  <span style={{ fontSize: 20 }}>{icon}</span>
  <span className="font-bold" style={{ fontSize: 'var(--text-base)', color: '#111111' }}>{label}</span>
  <ChevronRight size={18} style={{ color: '#CCCCCC', marginLeft: 'auto' }} />
</button>
```

### Integración en Home
`MoreMenu` se renderiza en `Home.tsx` (o en el componente raíz que contiene el BottomNav). El estado `moreOpen` vive en `Home.tsx` y se pasa como prop a `PageShell` → `BottomNav`.

Para evitar prop drilling excesivo, la alternativa es que `MoreMenu` viva directamente dentro de `BottomNav.tsx` con estado local.

**Decisión de implementación:** `MoreMenu` vive dentro de `BottomNav.tsx` con estado local `moreOpen`. Es el lugar más natural — el BottomNav ya sabe qué tabs renderizar.

---

## 7. ClientProfile page

**Crear:** `src/pages/ClientProfile.tsx`
**Agregar ruta en:** `src/App.tsx` → `<Route path="/perfil" element={<ClientProfile />} />`

### Estructura

```
PageShell (showBottomNav, header con title="Mi perfil" y showBack)
  │
  ├── Avatar circular (iniciales, fondo naranja, texto blanco, 72×72px)
  ├── Nombre completo (font-bold, --text-xl, centrado)
  ├── Rol ("Cliente" / "Profesional", --text-sm, color muted, centrado)
  │
  ├── Sección "Mi actividad"
  │   ├── Fila → /favoritos  (♥ "Mis favoritos")
  │   └── Fila → /mis-solicitudes (📋 "Mis solicitudes")
  │
  ├── Sección "Ajustes"
  │   └── [si role === 'client'] Fila → /pro/registro (🔧 "Quiero ser profesional")
  │
  └── Botón "Cerrar sesión" (rojo, fullWidth, rounded-2xl, min-height 44px)
```

### Comportamiento
- Si `user === null` → `<Navigate to="/login" replace />`
- Iniciales: `getInitials(user.full_name)` (ya existe en `src/lib/utils.ts`)
- Cerrar sesión: `await signOut()` + `navigate('/login')`
- Filas con el mismo estilo que `MoreMenu`

---

## Archivos afectados

| Archivo | Acción |
|---|---|
| `src/pages/Home.tsx` | Header compacto sin SearchBar ni botón cuenta, spacing reducido, usar UrgenciasFAB |
| `src/components/home/UrgenciasFAB.tsx` | **Crear** |
| `src/components/home/UrgenciasBanner.tsx` | **Eliminar** |
| `src/components/home/CategoryGrid.tsx` | Agregar Pintor |
| `src/components/layout/BottomNav.tsx` | 4 tabs (Inicio/Buscar/Solicitudes/Más), MoreMenu integrado |
| `src/components/layout/MoreMenu.tsx` | **Crear** — bottom sheet con navegación secundaria |
| `src/pages/ClientProfile.tsx` | **Crear** |
| `src/App.tsx` | Agregar ruta `/perfil` |

---

## Restricciones

- No cambiar lógica de negocio ni authStore
- TypeScript check debe pasar después de cada archivo
- Mantener todos los tokens CSS (`var(--text-*)`, `var(--space-*)`, etc.)
- FAB: `z-index: 40` (por debajo del BottomNav z-50)
- MoreMenu overlay: `z-index: 45` (sobre el contenido, por debajo del BottomNav)
- No introducir librerías nuevas — las animaciones se hacen con CSS transitions
