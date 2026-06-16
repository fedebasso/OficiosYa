# App-Wide Animations — OficiosYa

**Fecha:** 2026-06-15
**Scope:** Login, Register, Search, ProfessionalDetail, Urgencias, MisSolicitudes, Home (HowItWorks + FeaturedProfessionals)
**Dirección:** Warm & Premium — mismo sistema que el flujo IA (Framer Motion, `src/lib/motion.ts`)
**Enfoque:** Sistema consistente — patrón base uniforme en todas las pantallas

---

## Objetivo

Extender el motion system ya implementado en el flujo IA al resto de la app. La experiencia debe sentirse cohesiva: el mismo ritmo, las mismas físicas, el mismo lenguaje visual en todas las pantallas.

---

## Patrón base (aplica a todas las pantallas)

Todas las pantallas siguen este patrón sin excepción:

```
Container principal → staggerContainer (hidden/visible)
  └─ Cada sección/bloque → fadeUp variant
  └─ Listas de cards → staggerFast
       └─ Cada card → fadeUp variant
  └─ Botones interactivos → whileTap={{ scale: 0.97 }}, SPRING_SOFT
```

Imports necesarios en cada archivo:
```ts
import { motion } from 'framer-motion'
import { fadeUp, scaleIn, staggerContainer, staggerFast, SPRING_SOFT } from '../lib/motion'
```

---

## Archivos a modificar

| Archivo | Pantalla |
|---------|----------|
| `src/pages/Login.tsx` | Login |
| `src/pages/Register.tsx` | Register |
| `src/pages/Search.tsx` | Search |
| `src/pages/ProfessionalDetail.tsx` | Perfil profesional |
| `src/pages/Urgencias.tsx` | Urgencias |
| `src/pages/MisSolicitudes.tsx` | Mis solicitudes |
| `src/components/home/HowItWorks.tsx` | Banner HowItWorks |
| `src/components/home/FeaturedProfessionals.tsx` | Profesionales destacados |

---

## Diseño por pantalla

### Login (`src/pages/Login.tsx`)

Primera impresión — animación elegante y rápida.

- Container: `motion.div variants={staggerContainer} initial="hidden" animate="visible"`
- Logo/título principal: `motion.div variants={scaleIn}` — entra con scale desde 0.92
- Cada campo del form (email, password): `motion.div variants={fadeUp}` staggered (0.07s entre cada uno)
- Botón "Ingresar": `motion.button variants={fadeUp} whileTap={{ scale: 0.97 }}` con delay natural del stagger
- Link "¿No tenés cuenta? Registrate": `motion.div variants={fadeIn}` al final
- Separador "o": `motion.div variants={fadeIn}`

### Register (`src/pages/Register.tsx`)

Mismo patrón que Login con más campos.

- Container: `staggerContainer`
- Título/subtítulo: `scaleIn`
- Cada campo (nombre, email, password, rol): `fadeUp` staggered
- Botón "Crear cuenta": `motion.button variants={fadeUp} whileTap={{ scale: 0.97 }}`
- Link "¿Ya tenés cuenta?": `fadeIn`

### Search (`src/pages/Search.tsx`)

Lista principal — el stagger de cards es el efecto más importante.

- Header/título de sección: `motion.div variants={fadeUp}`
- Chips de categoría (si los hay): `motion.div variants={staggerFast}` con cada chip en `scaleIn`
- Container de lista de profesionales: `motion.div variants={staggerFast} initial="hidden" animate="visible"`
- Cada `ProfessionalCard` recibe `variants={fadeUp}` como prop o se wrappea en `motion.div variants={fadeUp}`
- Estado vacío ("No hay profesionales"): `motion.div variants={scaleIn}` centrado
- Loading skeleton: `motion.div` con `animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ repeat: Infinity, duration: 1.2 }}`

### ProfessionalDetail (`src/pages/ProfessionalDetail.tsx`)

Perfil con hero + secciones.

- Container: `staggerContainer`
- Hero section (avatar + nombre + categoría): `fadeUp` delay natural (primero)
- Stats row (rating, trabajos, zona): `scaleIn` — entra con scale desde 0.92
- Descripción/bio: `fadeUp`
- Galería de fotos (si existe): `staggerFast` en las miniaturas
- Sección de reseñas: `fadeUp`
- Botón CTA "Solicitar trabajo" (fijo al fondo): `motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4, ...SPRING_GENTLE }}` — entra desde abajo con delay

### Urgencias (`src/pages/Urgencias.tsx`)

Cards de profesionales disponibles 24hs.

- Container: `staggerContainer`
- Título + badge urgencia: `fadeUp`
- Lista de `UrgentProfessionalCard`: `motion.div variants={staggerFast}` con cada card en `motion.div variants={fadeUp}`
- `whileTap={{ scale: 0.98 }}` en cada card de urgencia

### MisSolicitudes (`src/pages/MisSolicitudes.tsx`)

Lista de solicitudes del usuario.

- Container: `staggerContainer`
- Tabs (si los hay): `fadeIn`
- Lista de `RequestCard`: `motion.div variants={staggerFast}` con cada card en `motion.div variants={fadeUp}`
- Estado vacío: `motion.div variants={scaleIn}` con ilustración centrada y texto
- `whileTap={{ scale: 0.98 }}` en cada RequestCard

### HowItWorks (`src/components/home/HowItWorks.tsx`)

Banner de onboarding en el Home.

- Container: `staggerContainer`
- Título "¿Cómo funciona OficioYa?": `fadeUp`
- Cada paso (1, 2, 3) entra en stagger `fadeUp` (0.1s entre cada uno)
- Botón "Entendido, ¡empecemos!": `motion.button variants={fadeUp} whileTap={{ scale: 0.97 }}`

### FeaturedProfessionals (`src/components/home/FeaturedProfessionals.tsx`)

Lista destacada en el Home.

- Título "Más recomendados": `motion.div variants={fadeUp}`
- Chips de filtro por categoría: `motion.div variants={staggerFast}` con cada chip en `scaleIn`
- Lista de profesionales: `motion.div variants={staggerFast}` con cada `ProfessionalCard` en `motion.div variants={fadeUp}`

---

## Notas de implementación

- **No cambiar lógica de negocio** — solo wrappear elementos existentes en `motion.*`
- **ProfessionalCard ya tiene `whileTap`** — no duplicar, solo agregar `variants={fadeUp}` al wrapper externo en listas
- **`staggerFast` para listas de más de 3 items** — `staggerContainer` para secciones de página
- **Todos los `motion.button` reemplazan `<button>`** — preservar todas las props existentes (onClick, disabled, className, style)
- **GPU-only**: solo `opacity`, `scale`, `x`, `y` — sin `width`, `height`, `background`
