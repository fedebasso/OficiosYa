# OficioYa — Premium Redesign + Urgencias 24H

**Date:** 2026-06-04  
**Status:** Approved by user

---

## Overview

Transform OficioYa into a premium, mobile-first service marketplace. The redesign covers the Home screen, category grid, a new featured professionals section (monetization via paid leads), and a complete Urgencias 24H feature for emergency services.

---

## Business Model Context

**Profesionales Destacados = paid leads.** Professionals who pay appear in the featured section on the Home screen. This is the primary monetization vector for the POC. The `featured` boolean field on professionals drives this.

---

## Home Screen

**Order (top to bottom):**
1. Header verde fijo (#0F6E56) — Logo + location + search bar integrada
2. Categorías — grid 3+2 (5 categorías)
3. Profesionales Destacados — lista de pros con `featured: true`
4. Urgencias 24H — banner rojo con dot animado → navega a `/urgencias`
5. CTA Pro — "¿Sos profesional?" → `/pro/registro`

**Header:**
- Logo "OficioYa" blanco con "Ya" en #9FE1CB
- Subtítulo "📍 Montevideo" en blanco/60%
- Avatar button (top-right) para acceso a perfil
- SearchBar con fondo blanco, placeholder "Electricista, plomero, cerrajero..."
- Sticky top, z-index alto

**Categorías — 5 total:**
| id | label | emoji |
|----|-------|-------|
| electricista | Electricista | ⚡ |
| plomero | Sanitario | 🚿 |
| aire_acondicionado | Aire Ac. | ❄️ |
| cerrajero | Cerrajero | 🔑 |
| albanil | Albañil | 🧱 |

Grid layout: row 1 = 3 columnas, row 2 = 2 columnas centradas.

**Profesionales Destacados:**
- Filtra `professionals` donde `featured === true`
- ProfessionalCard mejorada: avatar + nombre + badge verificado + rating + zona + cantidad trabajos + chevron
- Tap navega a `/profesional/:id`
- Si no hay destacados: ocultar sección (no mostrar empty state)

**Urgencias Banner:**
- Gradiente rojo `linear-gradient(135deg, #dc2626, #991b1b)`
- Dot verde animado (pulse) + texto "X DISPONIBLES AHORA"
- Título "🚨 Urgencias 24H"
- Subtítulo "Profesionales verificados que responden en menos de 30 minutos"
- CTA blanco "Ver profesionales disponibles →"
- Tap navega a `/urgencias`
- Sombra `box-shadow: 0 6px 20px rgba(220,38,38,.3)`

---

## Urgencias 24H Feature

**Route:** `/urgencias`

**Header de la página:**
- Gradiente rojo (igual al banner)
- Botón ← Volver
- Título "🚨 Urgencias 24H"
- Subtítulo
- Badge live con dot animado y count de disponibles

**UrgentProfessionalCard (nuevo componente):**
- Barra superior roja con dot verde + "DISPONIBLE AHORA · 24H"
- Avatar + nombre + especialidad + badge verificado
- Rating + zona + cantidad trabajos (en una línea)
- Chip rojo "⏱ Responde en ~X minutos"
- Botones: 📞 Llamar (verde #0F6E56) + 💬 WhatsApp (verde #25D366)
- Tap en la card navega a `/profesional/:id`
- Llamar: `tel:` link
- WhatsApp: `https://wa.me/:number` link

**Mock data — 3 profesionales urgentes:**
```
1. Carlos Méndez — Electricista — Pocitos — 4.8 — 127 trabajos — ~15 min — verified
2. Ana Rodríguez — Cerrajera — Centro — 4.9 — 89 trabajos — ~10 min — verified  
3. Pablo Torres — Sanitario — Punta Carretas — 4.7 — 64 trabajos — ~20 min — verified
```

Campos nuevos en el tipo `UrgentProfessional`:
- `available_now: boolean`
- `response_time_min: number` (minutos estimados)
- `specialty_label: string` (label legible de la categoría)
- `featured: boolean` (para destacados en home)
- `jobs_count: number` (cantidad de trabajos realizados)

---

## ProfessionalCard Mejorada

La card regular en Search y Home/Destacados muestra:
- Avatar con iniciales y color
- Nombre + badge verificado (si aplica)
- Rating (estrellas o número) + zona + jobs_count
- Chevron derecha

---

## Datos Mock Actualizados

Agregar a `MOCK_PROFESSIONALS` en `useProfessionals.ts`:
- `featured: boolean`
- `jobs_count: number`
- `response_time_min: number`
- Nuevas categorías: `cerrajero`, `albanil`
- 2 profesionales nuevos (cerrajero + albañil)

Agregar en `CATEGORY_LABELS` (Search.tsx) las 2 nuevas categorías.

---

## Nuevas Rutas

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/urgencias` | `Urgencias` | Lista de profesionales disponibles 24h |

Agregar en `App.tsx`.

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/Home.tsx` | Rediseño completo — nuevo layout |
| `src/components/home/CategoryGrid.tsx` | 5 categorías, grid 3+2 |
| `src/components/home/SearchBar.tsx` | Sin cambios de lógica, revisar estilo |
| `src/components/professionals/ProfessionalCard.tsx` | Agregar jobs_count y mejor layout |
| `src/hooks/useProfessionals.ts` | Agregar campos, mock data nuevo |
| `src/pages/Search.tsx` | CATEGORY_LABELS nuevas categorías |
| `src/App.tsx` | Agregar ruta /urgencias |

## Archivos Nuevos

| Archivo | Descripción |
|---------|-------------|
| `src/pages/Urgencias.tsx` | Página completa urgencias 24H |
| `src/components/professionals/UrgentProfessionalCard.tsx` | Card estilo B para urgentes |
| `src/components/home/FeaturedProfessionals.tsx` | Sección de destacados (paid leads) |
| `src/components/home/UrgenciasBanner.tsx` | Banner rojo del home |

---

## Diseño Visual — Tokens

```
primary: #0F6E56
accent:  #9FE1CB
danger:  #dc2626
danger-dark: #991b1b
success: #16a34a
whatsapp: #25D366
background: #f4f4f2
text-main: #1a1a1a
text-muted: #888888
```

Agregar `danger` y `danger-dark` al `tailwind.config.js`.

---

## Animaciones

- Dot pulse: `animation: pulse 2s ease-in-out infinite` con box-shadow
- Transiciones de cards: `transition-all duration-150`
- active:scale-95 en botones táctiles

---

## Out of Scope

- Backend real (todo mock)
- Sistema de pagos para leads
- Push notifications reales
- Sistema de reseñas (mantener ReviewForm existente sin cambios)
