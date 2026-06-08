# Login Redesign + CategoryGrid con Fotos Reales

**Date:** 2026-06-07  
**Status:** Approved by user

---

## Overview

Dos mejoras visuales independientes que elevan el nivel premium de la app:
1. **Login page** — rediseño completo con hero verde, inputs modernos y demo card elegante
2. **CategoryGrid** — reemplazar emojis por fotos reales de Unsplash con overlay oscuro

---

## 1. Login Page (`src/pages/Login.tsx`)

### Hero section
- Fondo verde `#0F6E56` con padding generoso (pt-32 pb-12)
- Logo "Oficio**Ya**" (Ya en `#9FE1CB`) centrado, font-size grande (text-4xl font-black)
- Tagline "Profesionales de confianza en Montevideo" en blanco/65%
- **Wave bottom**: div blanco con `rounded-t-[32px]` que "sube" sobre el verde creando separación suave

### Form section (sobre el wave)
- Padding horizontal px-6, gap entre elementos gap-4
- Título `"Bienvenido de vuelta"` — text-xl font-black text-text-main
- Subtítulo `"Ingresá a tu cuenta para continuar"` — text-sm text-gray-400

### Inputs
- Label: text-xs font-semibold text-gray-700 uppercase tracking-wide
- Wrapper con ícono izquierdo absoluto (✉️ para email, 🔒 para password)
- Input: bg-white border-[1.5px] border-gray-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm
- Focus: border-primary ring-2 ring-primary/10
- Placeholder: text-gray-300

### Botón primario
- bg-primary text-white rounded-2xl py-4 font-bold text-base w-full
- Sombra: `shadow-[0_4px_14px_rgba(15,110,86,.3)]`
- Hover: opacity-90, active:scale-[.99] transition-all duration-150

### Divider + link registro
- Divider con línea y texto "o" en text-gray-300
- Link "¿No tenés cuenta? **Registrate gratis**" — text-primary font-bold

### Demo card
- Background: `bg-gradient-to-br from-green-50 to-emerald-50`
- Border: `border border-green-200` rounded-2xl
- Badge "DEMO" verde pequeño (text-[9px] uppercase bg-primary text-white rounded-full px-2)
- Tabla de credenciales: dos filas (Cliente / Profesional) con rol + email/pass en monospace
- Separador entre filas: border-b border-green-100

### Loading state
- Botón muestra spinner inline + "Ingresando..." cuando loading=true
- Botón disabled durante loading

---

## 2. CategoryGrid con Fotos Reales (`src/components/home/CategoryGrid.tsx`)

### Layout
Mantener grid 3+2 (primera fila 3 columnas, segunda fila 2 columnas), gap-2.

### Card de categoría
- `aspect-square` (cuadrada)
- `rounded-2xl overflow-hidden relative`
- Hover: `hover:shadow-lg`, imagen hace `scale-105` con `transition-transform duration-300`
- active:scale-[.97]

### Imagen
- `<img>` con `object-fit: cover`, `w-full h-full`
- Fuente: Unsplash (URLs directas con parámetros w=400&q=80)
- `loading="lazy"` para performance

### Overlay
- `absolute inset-0` con `bg-gradient-to-t from-black/70 via-black/20 to-transparent`
- Nombre de categoría en la parte inferior: text-white text-[10px] font-black uppercase tracking-wider con text-shadow

### URLs de imágenes Unsplash
```
electricista: https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&q=80
plomero:      https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80
aire_acond.:  https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&q=80
cerrajero:    https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&q=80
albanil:      https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80
```

### Fallback
Si la imagen no carga: fondo gradient de color por categoría + emoji centrado (comportamiento actual).

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/Login.tsx` | Rediseño completo |
| `src/components/home/CategoryGrid.tsx` | Cards con fotos Unsplash |

---

## Out of scope
- Register page (próxima iteración)
- Cambios en lógica de auth
- Cambios en routing
