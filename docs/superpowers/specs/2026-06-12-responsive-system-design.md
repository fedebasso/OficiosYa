# Responsive System — OficioYa
**Date:** 2026-06-12
**Scope:** Refactorizar el sistema responsive completo para lograr una experiencia premium y consistente en todos los dispositivos mobile y tablet.

---

## Estrategia

**Híbrido: CSS custom properties + Tailwind breakpoints.**

- CSS `clamp()` para tipografía y spacing → fluido entre viewports, sin saltos
- Tailwind breakpoints para layout y grid → predecible y fácil de mantener
- App shell centrada (`max-width: 480px`) → comportamiento tipo PedidosYa/Uber en web

---

## Container principal

Toda la app vive dentro de un wrapper `AppContainer` aplicado en `PageShell`:

```css
max-width: 480px;
margin: 0 auto;
min-height: 100dvh;
background: #F5F0E8;
position: relative;
```

El fondo exterior (fuera de 480px en tablet/desktop) usa el mismo `#F5F0E8` aplicado en `<body>`, sin contraste duro. En mobile (< 480px) ocupa 100% del ancho.

---

## Breakpoints

Definir en `tailwind.config.js`:

| Nombre | Valor | Target |
|---|---|---|
| `xs` | 320px | iPhone SE, Android pequeños |
| `sm` | 375px | iPhone 12/13/14 (default) |
| `md` | 430px | iPhone Pro Max, Android grandes |
| `lg` | 768px | Tablets |
| `xl` | 1024px | Desktop (dentro del shell centrado) |

Tailwind ya tiene `sm: 640px` y `md: 768px` — se reemplazan con los valores mobile-first correctos para esta app.

---

## Tokens CSS (`src/styles/tokens.css`)

### Tipografía fluida

```css
:root {
  --text-xs:   clamp(11px, 2.8vw, 13px);
  --text-sm:   clamp(12px, 3.2vw, 14px);
  --text-base: clamp(14px, 3.7vw, 16px);
  --text-lg:   clamp(16px, 4.2vw, 18px);
  --text-xl:   clamp(18px, 4.8vw, 22px);
  --text-2xl:  clamp(22px, 5.5vw, 28px);
}
```

### Spacing fluido

```css
:root {
  --space-1:  clamp(4px,  1vw,   6px);
  --space-2:  clamp(8px,  2vw,   10px);
  --space-3:  clamp(12px, 3vw,   14px);
  --space-4:  clamp(14px, 3.7vw, 16px);
  --space-5:  clamp(18px, 4.5vw, 20px);
  --space-6:  clamp(22px, 5.5vw, 24px);
}
```

### Padding de contenedor

```css
:root {
  --px-container: clamp(16px, 4.5vw, 24px);
}
```

Valores resultantes: 16px @ 320px · ~17px @ 375px · ~19px @ 430px · 24px @ 768px+.

### Safe areas

```css
:root {
  --safe-top:    env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
}
```

---

## Safe Areas

En `index.html`:
```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

Todos los componentes que tocan bordes de pantalla usan las variables:
- `Header`: `padding-top: calc(12px + var(--safe-top))`
- `BottomNav`: `padding-bottom: calc(8px + var(--safe-bottom))`, `min-height: calc(60px + var(--safe-bottom))`

---

## Componentes — cambios específicos

### PageShell
- Agrega wrapper `AppContainer` con `max-width: 480px`, `margin: 0 auto`
- Aplica `--px-container` como padding horizontal en el contenido

### Header
- `padding-top: calc(12px + var(--safe-top))`
- Altura total mínima: `calc(56px + var(--safe-top))`

### BottomNav
- `padding-bottom: calc(8px + var(--safe-bottom))`
- `min-height: calc(60px + var(--safe-bottom))`
- Iconos y labels con `--text-xs`

### CategoryGrid
- `grid-cols-2` base (320px+)
- `sm:grid-cols-3` en 375px+
- `gap` con `--space-2`
- Texto de categoría con `--text-sm`
- Nunca cortar texto: `truncate` en label

### ProfessionalCard
- `min-width: 0` en todos los flex children (evita overflow)
- `overflow: hidden` en el card container
- Nombre con `--text-base` / 700
- Meta (zona, trabajos) con `--text-sm`
- Rating con `--text-lg` / 900
- Padding interno con `--space-3` / `--space-4`

### SearchBar
- Padding horizontal con `--px-container`
- `font-size: var(--text-base)` (mínimo 16px en mobile evita zoom iOS)

### StatsBar
- Números con `--text-xl`
- Labels con `--text-xs`

### Button
- `min-height: 44px` (touch target mínimo iOS Human Interface Guidelines)
- `font-size: var(--text-base)`

### Formularios (Login, Register, RequestForm)
- `font-size: 16px` mínimo en inputs (evita zoom automático en iOS Safari)
- Labels con `--text-sm`

---

## Archivos a modificar

| Archivo | Acción |
|---|---|
| `index.html` | `viewport-fit=cover` |
| `tailwind.config.js` | Reemplazar breakpoints con xs/sm/md/lg/xl |
| `src/styles/tokens.css` | **Crear** — tokens CSS completos |
| `src/styles/global.css` | Importar tokens, `body { background: #F5F0E8 }` |
| `src/components/layout/PageShell.tsx` | AppContainer wrapper |
| `src/components/layout/Header.tsx` | safe-top |
| `src/components/layout/BottomNav.tsx` | safe-bottom, min-height |
| `src/components/home/CategoryGrid.tsx` | grid-cols-2 → sm:grid-cols-3 |
| `src/components/professionals/ProfessionalCard.tsx` | min-width:0, spacing vars |
| `src/components/home/SearchBar.tsx` | font-size, padding vars |
| `src/components/home/StatsBar.tsx` | text vars |
| `src/components/ui/Button.tsx` | min-height: 44px |
| `src/pages/Login.tsx` | input font-size 16px |
| `src/pages/Register.tsx` | input font-size 16px |
| `src/components/requests/RequestForm.tsx` | input font-size 16px |

---

## Restricciones

- Todos los tokens se usan via variables CSS (no hardcodear px en componentes)
- No introducir librerías nuevas
- TypeScript check debe pasar después de cada componente
- Los estilos inline existentes se mantienen donde no hay breakpoint logic; solo se reemplazan valores hardcodeados por variables
- No cambiar lógica de negocio ni estructura de componentes
