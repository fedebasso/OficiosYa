# Rediseño Premium del Onboarding — Design Spec

## Objetivo

Rediseñar el onboarding (cliente + profesional) para que se sienta premium
(tipo Uber/Airbnb/Duolingo): composición cuidada con íconos lucide, más aire,
mejor jerarquía, transiciones fluidas, indicador de progreso moderno y
micro-interacciones. Cierra además la última inconsistencia de emojis
(el onboarding todavía usa 🏠⚡💬👷📋⭐).

**Archivos:**
- `src/components/onboarding/OnboardingSlide.tsx`
- `src/components/onboarding/OnboardingFlow.tsx`

Sin tocar lógica: sigue apareciendo una sola vez (localStorage
`onboarding_done_<userId>`), roles, y el montaje en `App.tsx`.

---

## Lenguaje visual (coherente con el rollout premium)

- Base crema `#F5F0E8`, texto principal `#1A1712`, secundario `#7A6E5E`.
- Degradé naranja del tile: `linear-gradient(135deg, #E8683A 0%, #F28C4A 100%)`.
- Íconos lucide (ya instalado). NO emojis.
- framer-motion (ya instalado) para animaciones.

---

## 1. OnboardingSlide (rediseño)

Nueva prop: recibe un **componente de ícono lucide** en vez de un string emoji.

```ts
import type { LucideIcon } from 'lucide-react'

interface OnboardingSlideProps {
  Icon: LucideIcon
  title: string
  description: string
}
```

Estructura (fondo crema, centrado vertical, mucho margen):

- **Tile del ícono:** contenedor relativo centrado. Detrás, 2 "blobs" naranja
  difuminados (`filter: blur(...)`, baja opacidad) para profundidad. Adelante, un
  tile de 120x120, `border-radius: 32`, con el degradé naranja y sombra
  `0 12px 32px -8px rgba(232,104,58,.45)`; el ícono lucide blanco al centro (size 52).
  El tile entra con `initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}`
  spring `stiffness: 260, damping: 18`.
- **Título:** `motion.h2`, fontSize 30, font-weight 900, letterSpacing -0.8,
  color `#1A1712`, entra con fade+y (delay 0.1).
- **Descripción:** `motion.p`, fontSize 15.5, color `#7A6E5E`, lineHeight 1.5,
  max-width ~300px centrado, entra con fade+y (delay 0.18).

El slide NO controla el fondo de pantalla ni el botón (eso lo maneja el Flow).
Solo el bloque central (tile + textos).

---

## 2. OnboardingFlow (rediseño)

### Datos de slides (íconos lucide)

```ts
import { Sparkles, Zap, MessageCircle, Briefcase, ClipboardList, CalendarClock, Star } from 'lucide-react'

const CLIENT_SLIDES = [
  { Icon: Sparkles,      title: 'Bienvenido a OFIX',       description: 'Encontrá profesionales de confianza en Montevideo para cualquier trabajo del hogar' },
  { Icon: Zap,           title: 'Servicios y Urgencias',   description: '¿Es urgente? Activá el modo urgencia y recibí respuesta en minutos. Electricistas, plomeros, pintores y más' },
  { Icon: MessageCircle, title: 'Chateá y coordiná',       description: 'Hablá directo con el profesional, revisá sus reseñas y coordiná todo sin salir de la app' },
]

const PRO_SLIDES = [
  { Icon: Briefcase,     title: 'Bienvenido a OFIX',           description: 'Tu plataforma para conseguir más clientes en Montevideo' },
  { Icon: ClipboardList, title: 'Recibí solicitudes',          description: 'Los clientes te contactan directamente según tu categoría y zona de trabajo' },
  { Icon: CalendarClock, title: 'Urgencias y disponibilidad',  description: 'Activá tu disponibilidad y aparecé primero cuando hay urgencias cerca tuyo' },
  { Icon: Star,          title: 'Construí tu reputación',      description: 'Acumulá reseñas reales, subí fotos de tus trabajos y destacate del resto' },
]
```

### Layout del contenedor
- Overlay `fixed inset-0`, z-index 9998, `maxWidth: 480`, centrado, fondo crema `#F5F0E8`.
- Estructura vertical: (botón Saltar arriba-derecha) · (área de slide flexible) · (footer con progreso + botón).
- Padding generoso (px 28, py con safe areas).

### Botón "Saltar"
- Arriba a la derecha, `top: 48, right: 20`. Texto `#9C917E`, `Saltar`, font-bold, sin fondo.
- Llama a `finish()` (guarda localStorage + onDone).

### Slide animado
- `AnimatePresence mode="wait"`, `motion.div key={index}`.
- Entrada/salida: slide horizontal + fade. `initial={{ x: 40, opacity: 0 }}`,
  `animate={{ x: 0, opacity: 1 }}`, `exit={{ x: -40, opacity: 0 }}`,
  transición `{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }`.

### Indicador de progreso (barra segmentada)
- Fila de N segmentos (uno por slide), cada uno `height: 4, borderRadius: 2`, flex-1.
- Segmento completado/activo: fondo `#E8683A`; pendiente: `#E7DFD2`.
- El segmento activo se anima de ancho 0→100% con `motion.div` (layout interno) o
  transición de background; usar `transition: 'all 0.4s ease'`.
- Ubicado en el footer, sobre el botón.

### Botón primario
- Ancho completo, `height: 54`, `border-radius: 16`, fondo `#E8683A`, texto blanco
  font-black, sombra `0 8px 20px -6px rgba(232,104,58,.5)`.
- Contenido: label + `ArrowRight` (lucide) size 18. En el último slide, label
  `¡Empezar!` sin flecha; en el resto, `Continuar` con flecha.
- `whileTap={{ scale: 0.97 }}`; la flecha con leve desplazamiento en `whileHover`
  (`x: 3`) — sutil.
- `next()`: si es el último, `finish()`; si no, avanza índice.

### Primer slide (bienvenida) — acento
- Para dar impacto en el slide 1, el tile del ícono puede ser un poco más grande
  (opcional). No se cambia el fondo (se mantiene crema en todos para consistencia
  y para que la barra/botones se lean igual). Se prioriza consistencia sobre el
  degradé de fondo del diseño anterior.

---

## 3. Sin cambios de lógica

- `App.tsx` sigue montando `<OnboardingFlow role={user.role} userId={user.id} onDone={...} />`.
- Persistencia localStorage, detección de rol, y "una sola vez" intactos.
- No se toca auth, Supabase, stores ni rutas.

---

## Verificación de consistencia (pasada final, puntos 4-6 del pedido)

Ya cubierto en fases previas (BrandLogo único, manifest/favicon/splash, emojis→lucide
en toda la app). Como cierre, hacer un grep final de emojis en `src/` para confirmar
que no quedan emojis renderizados fuera de props de data muertas. No rehacer branding.

---

## Constraints

- No agregar dependencias (lucide-react + framer-motion ya instalados).
- Íconos dinámicos: como `Icon` es un componente estable pasado por prop y se usa
  como `<Icon />` en JSX (no creado en render), no requiere `createElement`; pero si
  ESLint marca `react-hooks/static-components`, renderizar con `createElement`.
- No cambiar el ancho (480px) ni la lógica del flujo.
- Correr `npm run lint` y `npm run build` antes del push.
