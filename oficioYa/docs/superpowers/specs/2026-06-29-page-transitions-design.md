# Page Transitions — Design Spec

## Objetivo

Agregar transiciones de slide horizontal estilo iOS entre páginas de la app, sin modificar cada página individualmente.

---

## Arquitectura

### Componentes nuevos

**`src/hooks/useNavDirection.ts`**
- Rastrea `window.history.state?.idx` en cada cambio de ubicación
- Devuelve `'forward' | 'back'`
- Compara el índice actual con el previo: mayor = forward, menor = back

**`src/components/layout/AnimatedRoutes.tsx`**
- Usa `useLocation()` y `useNavDirection()`
- Envuelve `<Routes>` con `<AnimatePresence mode="wait">`
- `motion.div` con `key={location.key}` — dispara animación en cada ruta

### Archivo modificado

**`src/App.tsx`**
- Reemplaza el bloque `<Routes>...</Routes>` por `<AnimatedRoutes />`
- Mueve todas las definiciones de `<Route>` dentro de `AnimatedRoutes`

---

## Animación

### Variantes

```ts
// Forward: nueva página entra desde derecha, anterior sale hacia la izquierda parcial
forward: {
  initial:  { x: '100%', opacity: 0 },
  animate:  { x: 0,      opacity: 1 },
  exit:     { x: '-30%', opacity: 0 },
}

// Back: nueva página entra desde izquierda parcial, anterior sale hacia derecha
back: {
  initial:  { x: '-30%', opacity: 0 },
  animate:  { x: 0,      opacity: 1 },
  exit:     { x: '100%', opacity: 0 },
}
```

### Timing

- Transition: `{ type: 'tween', duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }` (ease-out-quad)
- `AnimatePresence mode="wait"` — espera que la página anterior termine de salir antes de mostrar la nueva

---

## Detección de dirección

```ts
// window.history.state?.idx aumenta al navegar forward, disminuye al hacer back
const prevIdx = useRef(window.history.state?.idx ?? 0)
const [direction, setDirection] = useState<'forward' | 'back'>('forward')

useEffect(() => {
  const currentIdx = window.history.state?.idx ?? 0
  setDirection(currentIdx >= prevIdx.current ? 'forward' : 'back')
  prevIdx.current = currentIdx
}, [location.key])
```

---

## Constraints

- No agregar dependencias nuevas — framer-motion ya instalado
- `AnimatePresence mode="wait"` — no `mode="sync"` (evita flicker)
- El `motion.div` wrapper tiene `position: fixed, inset: 0` para no afectar el layout del scroll
- `overflow: hidden` en el wrapper para cortar el slide fuera del viewport
- No animar rutas de Login ni Register (el overlay naranja ya tiene su propia animación)
- La transición NO se aplica a modales/sheets (ReviewSheet, etc.) — solo a cambios de ruta completos
