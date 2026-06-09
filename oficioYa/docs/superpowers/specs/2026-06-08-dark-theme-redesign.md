# OficiosYa — Rediseño Dark Premium

## Resumen
Reemplazo completo del tema verde por una dirección visual oscura (Dark Premium). El verde desaparece de toda la app. Nueva paleta, tipografía y disposición de componentes.

## Paleta de colores

| Token | Valor | Uso |
|---|---|---|
| `bg-base` | `#0f0f0f` | Fondo principal |
| `bg-card` | `#141414` | Cards y secciones |
| `bg-elevated` | `#1a1a1a` | Inputs, chips |
| `border` | `#1e1e1e` | Bordes |
| `accent` | `#e8683a` | Color primario (naranja quemado) |
| `accent-muted` | `rgba(232,104,58,.15)` | Fondos sutiles de acento |
| `text-primary` | `#f5f0e8` | Texto principal |
| `text-secondary` | `#888` | Texto secundario |
| `text-muted` | `#555` | Texto terciario |
| `star` | `#f59e0b` | Rating stars |

## Tipografía
- **Display / Títulos**: DM Serif Display (serifa elegante)
- **Body / UI**: DM Sans (geométrica moderna)
- Importar desde Google Fonts en `index.html`

## Pantallas afectadas

### Home
- **Hero**: fondo oscuro degradado, título en DM Serif Display — *"Tu oficio, cuando lo necesitás"*, acento naranja en "oficio", barra de búsqueda sobre fondo oscuro
- **Categorías**: mantener layout actual con fotos reales (grid de imágenes con overlay), NO los icon chips del preview
- **Sección destacados**: renombrar "Disponibles ahora" → **"Más recomendados"** — son los profesionales con suscripción premium. Orden controlado por flag `featured: true` en los datos.
- **Cards de profesionales en home**: horizontal, foto cuadrada a la izquierda, barra de color lateral por categoría, rating y badge a la derecha

### Search (lista de profesionales)
- Mismo card horizontal dark que el home
- Header de búsqueda en oscuro
- Fondo `bg-base`

### ProfessionalProfile
- Hero: foto de trabajo de fondo + overlay oscuro degradado, avatar circular con borde naranja, nombre en DM Serif Display, stats pill con glass oscuro
- Body: `bg-base`, cards en `bg-card` con borde sutil
- Pills de servicios: fondo `accent-muted`, borde naranja, texto naranja
- CTA: botón principal naranja con shadow naranja

### Login / Register
- Fondo `bg-base`, inputs en `bg-elevated`, botones en naranja
- Logo con tipografía DM Serif Display

### Urgencias
- Mantener funcionalidad, adaptar colores

### ProDashboard / ProProfile
- Adaptar a dark theme

## Tailwind config
Actualizar `tailwind.config.js`:
- `primary` → `#e8683a`
- `background` → `#0f0f0f`
- `text-main` → `#f5f0e8`
- Agregar colores: `card`, `elevated`, `border-dark`

## CSS global
En `index.css`:
- Importar DM Sans y DM Serif Display
- `body { background: #0f0f0f; color: #f5f0e8; }`

## Notas
- La sección "Más recomendados" filtra por `featured: true` (ya existe en el modelo)
- No hay cambios en rutas ni lógica de negocio, solo UI
- El verde (#16a34a, #22c55e, etc.) debe eliminarse de todos los componentes
