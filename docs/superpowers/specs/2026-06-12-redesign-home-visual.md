# Rediseño Home — OficioYa
**Date:** 2026-06-12
**Scope:** Sub-proyecto 1 del rediseño completo — nueva estructura del Home con sistema visual moderno (Rappi/PedidosYa style). Funcionalidad existente se mantiene, solo cambia el diseño visual y la estructura de componentes.

---

## Contexto

La app actual tiene un Home funcional pero con demasiadas secciones compitiendo y jerarquía visual confusa. Este spec reemplaza la estructura del Home manteniendo exactamente la misma funcionalidad.

**Commit de referencia (para revertir si se desea):** `94f4619` (antes del spec)

---

## Filosofía del nuevo diseño

**Una acción principal:** encontrar rápidamente el profesional que necesito.

Inspiración: Rappi, PedidosYa — denso pero claro, fondo cálido, íconos con color por categoría, chips de filtro horizontal.

---

## Sistema de colores

| Token | Valor | Uso |
|---|---|---|
| `bg-app` | `#F5F0E8` | Fondo principal (cream) |
| `bg-surface` | `#FFFFFF` | Header, cards, nav |
| `bg-input` | `#F5F0E8` | Inputs y search |
| `border` | `#EDE8DE` | Bordes y separadores |
| `accent` | `#E8683A` | Naranja principal |
| `text-primary` | `#111111` | Textos principales |
| `text-muted` | `#AAAAAA` | Textos secundarios |

Colores por categoría (para íconos):
| Categoría | Gradiente |
|---|---|
| Electricista | `#FFF3C4 → #FDE68A` (amarillo) |
| Sanitario | `#DBEAFE → #BFDBFE` (azul) |
| Aire Ac. | `#CCFBF1 → #99F6E4` (verde agua) |
| Cerrajero | `#F3E8FF → #E9D5FF` (violeta) |
| Pintor | `#FEE2E2 → #FECACA` (rosa) |
| Albañil | `#FEF3C7 → #FDE68A` (amarillo oscuro) |

---

## Estructura del nuevo Home

```
┌─────────────────────────────┐
│  HEADER                     │
│  Logo "OficioYa"            │
│  📍 Ubicación               │
│  [🔍 ¿Qué servicio...?]     │ ← Search único
├─────────────────────────────┤
│  CHIPS HORIZONTALES         │
│  [Todos] [⚡] [🚿] [❄️]...  │ ← filtro rápido
├─────────────────────────────┤
│  CONTENT (scrolleable)      │
│                             │
│  Categorías                 │
│  [⚡] [🚿] [❄️] [🔑] [🎨]  │ ← íconos circulares
│                             │
│  Cerca tuyo                 │
│  [card pro] [card pro]...   │
│                             │
├─────────────────────────────┤
│  BOTTOM NAV                 │
│  🏠 Inicio · 📋 Solicitudes │
│  ☰ Más                      │ ← 3 tabs (sin Buscar)
└─────────────────────────────┘
```

---

## 1. Header + Search

**Archivo:** `src/pages/Home.tsx` (homeHeader inline)

El header tiene dos filas:
1. Logo + ubicación (hardcodeada "Montevideo" por ahora)
2. SearchBar integrado

Al tocar el SearchBar navega a `/buscar` (no hay búsqueda inline en el Home — el Home solo es punto de entrada, la búsqueda real vive en `/buscar`).

```tsx
const homeHeader = (
  <header className="sticky top-0 z-50" style={{ background: '#FFFFFF', boxShadow: '0 1px 0 #EDE8DE' }}>
    {/* Fila 1: logo + ubicación */}
    <div className="flex items-center justify-between px-4 pt-3 pb-2">
      <div>
        <h1 className="font-black leading-none" style={{ fontSize: 'var(--text-xl)', color: '#111111', letterSpacing: '-0.5px' }}>
          Oficio<span style={{ color: '#E8683A' }}>Ya</span>
        </h1>
        <p style={{ fontSize: 'var(--text-xs)', color: '#AAAAAA', marginTop: 1 }}>📍 Montevideo</p>
      </div>
    </div>
    {/* Fila 2: search */}
    <div className="px-4 pb-3">
      <button
        type="button"
        onClick={() => navigate('/buscar')}
        className="w-full flex items-center gap-3 rounded-2xl"
        style={{ height: 44, background: '#F5F0E8', border: '1.5px solid #EDE8DE', padding: '0 14px' }}
      >
        <span style={{ fontSize: 15 }}>🔍</span>
        <span style={{ fontSize: 'var(--text-sm)', color: '#BBBBBB' }}>¿Qué servicio necesitás?</span>
      </button>
    </div>
  </header>
)
```

---

## 2. Chips de filtro horizontal

Debajo del header (sticky también), fila horizontal scrolleable con filtros rápidos por categoría. Al tocar un chip navega a `/buscar/${categoria}`. "Todos" navega a `/buscar`.

```
[Todos] [⚡ Electr.] [🚿 Sanit.] [❄️ Aire] [🔑 Cerraj.] [🎨 Pintor] [🧱 Albañil]
```

**Nuevo componente:** `src/components/home/CategoryChips.tsx`

- Fila sticky bajo el header
- Overflow-x scroll
- Chip activo: background naranja, texto blanco
- Chip default: background `#F5F0E8`, borde `#EDE8DE`, texto `#888888`
- No gestiona estado local — es navegación pura (sin state)

---

## 3. CategoryIcons (reemplaza CategoryGrid)

**Nuevo componente:** `src/components/home/CategoryIcons.tsx`

Íconos circulares con gradiente por categoría, en fila horizontal scrolleable. Reemplaza el grid de fotos actual.

Cada ícono:
- Contenedor `56×56px`, `border-radius: 18px`
- Gradiente de fondo según categoría (ver tabla de colores)
- Emoji centrado, `font-size: 26px`
- Label debajo, `font-size: var(--text-xs)`, truncate, `max-width: 56px`
- Al tocar: navega a `/buscar/${categoria}`

Las 6 categorías: Electricista, Sanitario, Aire Ac., Cerrajero, Pintor, Albañil.

---

## 4. FeaturedProfessionals — card rediseñada

El componente `FeaturedProfessionals` existente se mantiene pero `ProfessionalCard` se rediseña.

**Cambios en `ProfessionalCard.tsx`:**
- Avatar: iniciales con gradiente de color por categoría (en vez de foto o avatar gris)
  - Si tiene `avatar_url`: mostrar foto
  - Si no tiene foto: iniciales con gradiente de la categoría
- Quitar la barra de color vertical izquierda
- Padding con `--space-3`
- Layout igual al actual pero más limpio

---

## 5. Eliminar secciones del Home

**Eliminar de Home.tsx:**
- `StatsBar` — queda fuera del Home (demasiado ruido)
- El CTA "¿Sos profesional?" — se mueve al MoreMenu o queda en el onboarding

**Mantener:**
- `CategoryIcons` (reemplaza CategoryGrid)
- `CategoryChips` (nuevo)
- `FeaturedProfessionals` (rediseñado)
- `UrgenciasFAB` (sin cambios)

---

## 6. BottomNav — 3 tabs

**Cambios en `BottomNav.tsx`:**

`clientTabs` pasa de 4 tabs a 3:
```tsx
const clientTabs: NavTab[] = [
  { label: 'Inicio',      to: '/',               icon: <House size={22} /> },
  { label: 'Solicitudes', to: '/mis-solicitudes', icon: <FileText size={22} /> },
  { label: 'Más',         to: '',                 icon: <Menu size={22} />, onPress: () => setMoreOpen(v => !v) },
]
```

Se elimina el tab "Buscar" — la búsqueda vive en el header del Home.

---

## 7. Back arrow — estandarizar Header

Todas las páginas internas ya usan el componente `Header` con `showBack`. No hay cambios adicionales — el estándar `ChevronLeft size={24}` ya está aplicado en todos lados del fix anterior.

---

## Archivos afectados

| Archivo | Acción |
|---|---|
| `src/pages/Home.tsx` | Nueva estructura: header con search, chips, CategoryIcons, FeaturedProfessionals |
| `src/components/home/CategoryChips.tsx` | **Crear** — chips horizontales de filtro |
| `src/components/home/CategoryIcons.tsx` | **Crear** — íconos circulares con gradiente |
| `src/components/home/CategoryGrid.tsx` | **Eliminar** — reemplazado por CategoryIcons |
| `src/components/home/StatsBar.tsx` | **Eliminar** del Home (archivo se mantiene) |
| `src/components/professionals/ProfessionalCard.tsx` | Rediseñar avatar con gradiente por categoría |
| `src/components/layout/BottomNav.tsx` | 3 tabs (eliminar Buscar) |

---

## Restricciones

- No cambiar lógica de negocio ni stores
- No cambiar rutas existentes
- TypeScript check después de cada archivo
- Mantener tokens CSS (`var(--text-*)`, `var(--space-*)`, etc.)
- El CTA "¿Sos profesional?" se elimina del Home — no reemplazar por ahora
- StatsBar se elimina del Home pero el componente se mantiene (podría usarse en otra pantalla)
