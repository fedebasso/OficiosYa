# Onboarding Flow — Design Spec

## Objetivo

Mostrar a los usuarios nuevos (clientes y profesionales) las funcionalidades clave de OFIX la primera vez que ingresan tras registrarse. El onboarding es distinto según el rol y aparece una sola vez.

---

## Comportamiento

- Se muestra **solo una vez** por usuario, inmediatamente después del registro
- Se detecta con `localStorage.getItem('onboarding_done_<userId>')`
- Al completar el último slide o presionar "Saltar": `localStorage.setItem('onboarding_done_<userId>', '1')`
- El flujo se monta **sobre toda la app** (fixed overlay z-50) en `App.tsx`
- Si el usuario ya tiene la key en localStorage, no se muestra nada

---

## Estilo visual

- **Slide 1:** fondo gradiente naranja `linear-gradient(160deg, #E8683A 0%, #c44d1f 100%)`, texto blanco
- **Slides 2+:** fondo blanco `#FFFFFF`, texto oscuro `#111111`
- Tipografía: DM Sans (ya cargada en la app)
- Animación: slide horizontal con framer-motion (`x: 100% → 0 → -100%`)
- Indicadores de progreso: dots en la parte inferior
- Botón "Siguiente" naranja, botón "Saltar" gris discreto arriba a la derecha

---

## Flujo Cliente (3 slides)

### Slide 1 — Bienvenido
- Fondo: gradiente naranja
- Ícono: 🏠 (64px)
- Título: "Bienvenido a OFIX"
- Descripción: "Encontrá profesionales de confianza en Montevideo para cualquier trabajo del hogar"
- Botón: "Empezar" (blanco)

### Slide 2 — Servicios y Urgencias
- Fondo: blanco
- Ícono: ⚡ (64px)
- Título: "Servicios y Urgencias"
- Descripción: "Pedí un electricista, plomero, pintor y más. ¿Es urgente? Activá el modo urgencia y recibís respuesta en minutos"
- Botón: "Siguiente"

### Slide 3 — Chateá y coordiná
- Fondo: blanco
- Ícono: 💬 (64px)
- Título: "Chateá y coordiná"
- Descripción: "Hablá directo con el profesional, revisá sus reseñas y coordiná todo sin salir de la app"
- Botón: "¡Empezar!" (finaliza el onboarding)

---

## Flujo Profesional (4 slides)

### Slide 1 — Bienvenido
- Fondo: gradiente naranja
- Ícono: 👷 (64px)
- Título: "Bienvenido a OFIX"
- Descripción: "Tu plataforma para conseguir más clientes en Montevideo"
- Botón: "Empezar"

### Slide 2 — Recibí solicitudes
- Fondo: blanco
- Ícono: 📋 (64px)
- Título: "Recibí solicitudes"
- Descripción: "Los clientes te contactan directamente según tu categoría y zona de trabajo"
- Botón: "Siguiente"

### Slide 3 — Urgencias y disponibilidad
- Fondo: blanco
- Ícono: ⚡ (64px)
- Título: "Urgencias y disponibilidad"
- Descripción: "Activá tu disponibilidad y aparecé primero cuando hay urgencias cerca tuyo"
- Botón: "Siguiente"

### Slide 4 — Construí tu reputación
- Fondo: blanco
- Ícono: ⭐ (64px)
- Título: "Construí tu reputación"
- Descripción: "Acumulá reseñas reales, subí fotos de tus trabajos y destacate del resto"
- Botón: "¡Empezar!" (finaliza el onboarding)

---

## Componentes

### `OnboardingSlide.tsx`
Props:
```ts
interface OnboardingSlideProps {
  icon: string
  title: string
  description: string
  gradient?: boolean   // true = fondo naranja, false = blanco
}
```

### `OnboardingFlow.tsx`
Props:
```ts
interface OnboardingFlowProps {
  role: 'client' | 'professional'
  userId: string
  onDone: () => void
}
```
- Gestiona el índice del slide actual
- Renderiza `OnboardingSlide` con AnimatePresence
- Muestra dots de progreso
- Botón "Saltar" en la esquina superior derecha
- Al llamar `onDone()`: guarda localStorage y desmonta el overlay

### Integración en `App.tsx`
```tsx
const [showOnboarding, setShowOnboarding] = useState(() => {
  if (!user) return false
  return !localStorage.getItem(`onboarding_done_${user.id}`)
})

// En el JSX, antes de las rutas:
{showOnboarding && user && (
  <OnboardingFlow
    role={user.role}
    userId={user.id}
    onDone={() => setShowOnboarding(false)}
  />
)}
```

---

## Constraints

- No agregar dependencias nuevas
- framer-motion ya instalado — usar para animaciones de slide
- El overlay tiene `z-index: 9999` para estar sobre todo (incluyendo el SplashScreen que ya existe con z-9999 — el onboarding solo aparece después de que el splash desaparece)
- El botón "Saltar" guarda localStorage igual que "Finalizar" — no se puede ver el onboarding dos veces
- No bloquear la navegación si localStorage falla
