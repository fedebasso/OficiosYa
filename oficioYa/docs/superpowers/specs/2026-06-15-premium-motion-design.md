# Premium Motion Design — OficiosYa IA Flow

**Fecha:** 2026-06-15  
**Scope:** Flujo IA completo (`/ticket`, `/ticket/confirmar`) + Home (`TicketEntryCard`) + Professional cards (todas las instancias)  
**Dirección:** Warm & Premium — paleta naranja #E8683A, oscura profunda, spring physics  
**Librería:** Framer Motion (instalar como dependencia de producción)

---

## Objetivo

Transformar la experiencia de un UI funcional a una app IA premium. La diferencia no está en los colores ni en el layout — está en cómo cada elemento entra, responde y transiciona. El resultado debe sentirse como una startup IA seria (Perplexity, Linear, Stripe) corriendo en mobile.

---

## Arquitectura: Motion System

### `src/lib/motion.ts` — archivo central

Todo el sistema de animaciones vive aquí. Ningún componente hardcodea valores de duración o spring — importan desde este archivo.

**Spring configs:**
```ts
export const SPRING_SOFT    = { type: 'spring', stiffness: 300, damping: 30 }   // taps, selección
export const SPRING_SNAPPY  = { type: 'spring', stiffness: 500, damping: 35 }   // aparición de elementos
export const SPRING_GENTLE  = { type: 'spring', stiffness: 200, damping: 28 }   // page transitions
```

**Variantes reutilizables:**
```ts
export const fadeUp = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: SPRING_GENTLE },
}

export const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
}

export const scaleIn = {
  hidden:  { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: SPRING_SNAPPY },
}

export const staggerContainer = {
  hidden:  {},
  visible: { transition: { delayChildren: 0.05, staggerChildren: 0.07 } },
}

export const staggerFast = {
  hidden:  {},
  visible: { transition: { delayChildren: 0, staggerChildren: 0.06 } },
}
```

**Props de tap reutilizables:**
```ts
export const tapProps = {
  whileTap: { scale: 0.96 },
  transition: SPRING_SOFT,
}

export const tapPropsSubtle = {
  whileTap: { scale: 0.98 },
  transition: SPRING_SOFT,
}
```

---

## Componentes a modificar

### 1. `src/components/ticket/TicketEntryCard.tsx`

**Efecto:** La card más importante del Home — debe sentirse inteligente y viva.

- Wrapper `motion.button` con `whileTap={{ scale: 0.97 }}` spring soft
- Orb ✨ con `motion.div` → `animate={{ scale: [1, 1.08, 1] }}` loop infinito, duration 3s ease-in-out
- Borde naranja con `animate={{ opacity: [0.6, 1, 0.6] }}` loop 2.8s (glow pulsante sutil)
- `initial={{ opacity: 0, y: 12 }}` → `animate={{ opacity: 1, y: 0 }}` al montar (entry animation)

### 2. `src/pages/TicketFlow.tsx` — Transiciones entre pasos

**Efecto:** Slide horizontal cinematográfico entre pasos.

- Envolver el contenido de cada paso en `AnimatePresence mode="wait"`
- Cada paso usa `key={step}` para que Framer detecte el cambio
- Variante de entrada: paso avanzando → `x: 40 → 0`, opacity `0 → 1`
- Variante de salida: `x: 0 → -40`, opacity `1 → 0`
- Retroceso: direcciones invertidas (`x: -40 → 0` entrada, `x: 0 → 40` salida)
- Usar `direction` state para saber si avanza o retrocede
- Duración: 280ms, SPRING_GENTLE

### 3. `src/pages/TicketFlow.tsx` — CategoryStep

**Efecto:** Grid con stagger + selección satisfactoria.

- Container con `staggerContainer` variant (visible cuando monta)
- Cada card `motion.button` con variant `scaleIn` staggered
- `whileTap={{ scale: 0.95 }}` spring soft
- Al seleccionar: `animate={{ scale: [1, 1.04, 1] }}` spring snappy (micro-bounce)
- Botón "Continuar →" entra con `fadeUp` delay 400ms

### 4. `src/pages/TicketFlow.tsx` — MediaStep

**Efecto:** El área de upload respira y reacciona.

- Toda la pantalla entra con `staggerContainer` + items `fadeUp`
- Área dashed: `animate={{ borderColor: ['#E8683A88', '#E8683Aff', '#E8683A88'] }}` loop 2s
- Cuando se sube foto: área hace `scale: 0.98 → 1` spring snappy
- Botones Audio/Video/Texto: `whileTap={{ scale: 0.94 }}` spring soft
- Al activar Texto: textarea entra con `scaleIn` + `fadeIn`
- Indicador de audio grabado: entra con `slideIn` desde abajo

### 5. `src/pages/TicketFlow.tsx` — AIProcessingStep

**Efecto:** La pantalla más espectacular — orb multi-layer breathing.

**Orb:**
```
div.orb-outer  → position absolute, scale [1, 1.4, 1] loop 2.8s, opacity .04
div.orb-mid    → position absolute, scale [1, 1.2, 1] loop 2.8s delay .2s, opacity .08  
div.orb-inner  → radial-gradient naranja→rojo oscuro, scale [1, 1.06, 1] loop 2.8s delay .1s
div.orb-core   → ✨, animate rotate [-3deg, 3deg, -3deg] loop 4s ease-in-out
```

**Progress steps:**
- Container: `staggerContainer` con stagger .15s
- Cada step entra con `fadeUp`
- Al completarse: círculo hace `scale: 0 → 1` spring snappy
- Step activo: CSS `@keyframes pulse` en el borde (no Framer — performance)
- Línea conectora: `motion.div` con `scaleY: 0 → 1` cuando el step anterior se completa

### 6. `src/pages/TicketFlow.tsx` — ResultsStep

**Efecto:** Ticket aparece progresivamente, cards entran en stagger.

**Ticket generado:**
- Badge "✨ Generado por IA": `fadeIn` delay 0
- Título: `fadeUp` delay 0.1s
- Descripción: `fadeUp` delay 0.2s
- Tags: `scaleIn` delay 0.35s

**Professional cards:**
- Container: `staggerFast` variant
- Cada card: `fadeUp` variant staggered
- Card top (#1): borde naranja con `animate={{ opacity: [0, 1] }}` delay 0.4s
- `whileTap={{ scale: 0.98 }}` spring soft en cada card
- Círculo de selección: `scale: 0 → 1` spring snappy al seleccionar

**CTA fijo:**
- Entra con `slideUp` desde bottom: `y: 60 → 0`, opacity `0 → 1`, spring gentle delay 0.5s

### 7. `src/pages/TicketConfirm.tsx`

**Efecto:** Submit satisfactorio, success screen memorable.

- Form fields entran con `staggerContainer` + `fadeUp`
- Botón submit: `whileTap={{ scale: 0.97 }}` spring soft
- Loading: botón hace `scale: 0.98` mientras `loading=true`
- **Success screen:**
  - Cross-fade con `AnimatePresence`
  - ✅ icon: `scale: 0 → 1.2 → 1` spring snappy
  - Título: `fadeUp` delay 150ms
  - Subtítulo: `fadeUp` delay 250ms
  - Confetti: 8 `motion.div` partículas, colores naranja/verde, `y: 0 → 80`, `opacity: 1 → 0`, `rotate` random, duración 800ms, stagger 50ms
  - Botones: `fadeUp` delay 350ms y 450ms

### 8. `src/components/professionals/ProfessionalCard.tsx`

**Efecto:** Cards reactivas en toda la app.

- `motion.div` wrapper con `whileTap={{ scale: 0.98, y: 1 }}` spring soft
- Avatar: `initial={{ scale: 0.8 }}` → `animate={{ scale: 1 }}` spring snappy al montar
- En listas: recibir `index` prop para delay staggered manual (`delay: index * 0.06`)

---

## Performance

- Todas las animaciones usan `transform` y `opacity` únicamente (GPU-friendly, sin repaint)
- Orb layers usan `will-change: transform` solo durante animación activa
- Confetti se desmonta del DOM después de completar (no persiste)
- `AnimatePresence` con `mode="wait"` para evitar renders solapados
- Spring configs calibradas para 60fps en iPhone 11+

---

## Archivos a modificar

| Acción | Archivo |
|--------|---------|
| Create | `src/lib/motion.ts` |
| Modify | `src/components/ticket/TicketEntryCard.tsx` |
| Modify | `src/pages/TicketFlow.tsx` |
| Modify | `src/pages/TicketConfirm.tsx` |
| Modify | `src/components/professionals/ProfessionalCard.tsx` |

## Dependencia a instalar

```bash
npm install framer-motion
```

Bundle impact: ~50KB gzip. Aceptable para PWA — la experiencia justifica el costo.
