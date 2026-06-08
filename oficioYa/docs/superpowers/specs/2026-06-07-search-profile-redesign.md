# Search + ProfessionalProfile Redesign

**Date:** 2026-06-07
**Status:** Approved by user

---

## Overview

Rediseño de dos pantallas del flujo principal del cliente:
1. `src/pages/Search.tsx` — opción C: cards expandidas con stats visibles
2. `src/components/professionals/ProfessionalProfile.tsx` — opción C: avatar flotante + stats en cards + CTA grid

---

## 1. Search Page (`src/pages/Search.tsx`)

### Header (sticky, bg-background)
- Fondo: `bg-background` (#f4f4f2), `border-b border-gray-200`
- Fila superior: back button circular (bg-white shadow-sm, ←) + input decorativo "Electricistas..." (bg-white rounded-xl shadow-sm, ícono 🔍 verde) + botón "↕ Rating" (bg-primary text-white rounded-xl text-xs font-bold)
- Fila inferior: texto "**X** profesionales en Montevideo" (text-[11px] text-gray-400, bold en el número)

### Cards expandidas (opción C)
Cada `ProfessionalCard` reemplazada por una nueva card inline:

**Estructura:**
```
┌─────────────────────────────────────────┐
│ [Avatar]  Nombre ✓        ⭐ 4.8        │
│           📍 Zona                       │
├─────────────────────────────────────────┤
│ [🔧 127 trabajos] [⏱ ~15 min] [⚡ Urg] │
└─────────────────────────────────────────┘
```

- Card: `bg-white rounded-2xl shadow-sm px-3 py-3`
- Top row: Avatar (42px) + nombre (font-bold text-sm) + badge verificado + rating (font-bold text-sm) flush right
- Zona: text-[11px] text-gray-400
- Stats row: separador border-t border-gray-50 pt-2 mt-2, pills con `bg-gray-50 rounded-lg px-2 py-1 text-[10px] font-semibold text-gray-500`
- Pill verde si `available_now`: `bg-green-50 text-primary`
- Pill roja si `available_now`: pill "⚡ Urgencias" en `bg-red-50 text-danger`
- `active:scale-[.99] transition-all duration-150`

### Empty state
- Emoji 🔍 (text-4xl) + "No encontramos profesionales" (font-bold) + "Intentá con otra categoría" (text-gray-400 text-sm)
- Centrado, padding py-16

### Loading / Error
- Loading: `LoadingSpinner` centrado con py-12
- Error: texto rojo centrado

---

## 2. ProfessionalProfile (`src/components/professionals/ProfessionalProfile.tsx`)

### Header verde corto
- `bg-primary` padding pt-10 pb-14 relative
- Botón volver: `← Volver` (text-white/70, onClick navigate(-1)) — usar `useNavigate`
- Wave bottom: `absolute bottom-0 left-0 right-0 h-8 bg-background rounded-t-[32px]`

### Avatar flotante
- Centrado, `mt-[-40px]` (flota sobre el wave)
- Tamaño: 80px × 80px, `border-4 border-white shadow-lg rounded-full`
- Usa componente Avatar existente con `size="lg"` pero override de tamaño via className

### Nombre + especialidad (centrado)
- Nombre: text-xl font-black text-text-main
- Especialidad derivada de `categories[0]` usando CATEGORY_LABELS (mismo map que UrgentProfessionalCard)
- Zona: text-sm text-gray-400 "📍 {zone}"

### Badges (fila centrada)
- Verificado: `bg-green-50 text-primary border border-green-200 rounded-full text-[10px] font-bold px-3 py-1`
- Urgencias (si `available_now`): `bg-red-50 text-danger border border-red-200 rounded-full text-[10px] font-bold px-3 py-1`

### Stats en 3 cards
- Grid 3 columnas, gap-3, bg-white rounded-2xl shadow-sm
- Cada card: valor (text-lg font-black) + label (text-[9px] text-gray-400 uppercase tracking-wide)
- Rating | Trabajos | Respuesta (~Xm)
- Si `avg_rating === null`: mostrar "–"
- Si `available_now === false`: respuesta muestra "–"

### CTAs en grid (ARRIBA del bio)
- Grid 2 columnas, gap-3
- "📋 Solicitar servicio" → bg-primary, rounded-2xl, py-3, font-bold, shadow verde
- "💬 WhatsApp" → bg-whatsapp, rounded-2xl, py-3, font-bold
- Ambos con `active:scale-[.99] transition-all duration-150`

### Secciones (cards blancas)
- "Sobre mí" + "Servicios" — `bg-white rounded-2xl shadow-sm p-4`
- Título: text-[10px] font-bold text-gray-400 uppercase tracking-wider
- Servicios: usar CATEGORY_LABELS para mostrar label legible en lugar del id crudo

### Fotos de trabajos
- Mantener WorkPhotoGallery existente dentro de una sección card

### Navegación
- Agregar `useNavigate` para el botón volver (← Volver)

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/Search.tsx` | Rediseño completo con cards expandidas |
| `src/components/professionals/ProfessionalProfile.tsx` | Rediseño completo |

## Out of scope
- Filtros funcionales reales (el botón "↕ Rating" es decorativo en esta iteración)
- Búsqueda por texto dentro de la página Search
- Galería de fotos con lightbox
