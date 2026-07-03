# BrandLogo Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Crear un único componente `BrandLogo` que centralice la identidad visual de OFIX y reemplazar todas las apariciones del texto de marca en la app.

**Architecture:** Se crea `src/components/common/BrandLogo.tsx` con props `size`, `showSubtitle` y `centered`. Luego se reemplaza cada aparición visual del nombre OFIX en Home, Login, Register y Header con este componente.

**Tech Stack:** React + TypeScript + framer-motion (ya instalado)

## Global Constraints

- Gradiente oficial: `#E8683A` → `#F28C4A` → `#2A2A2A` (siempre, sin excepciones)
- Subtítulo oficial: `"Profesionales de confianza en Montevideo"` (exacto, sin variantes)
- Nombre de marca: `OFIX` (mayúsculas, siempre)
- No agregar dependencias nuevas
- Strings en textos compartidos (WhatsApp, share) NO se tocan — no son UI visual

---

### Task 1: Crear componente BrandLogo

**Files:**
- Create: `src/components/common/BrandLogo.tsx`

**Interfaces:**
- Produces: `<BrandLogo size="sm|md|lg" showSubtitle={bool} centered={bool} />`
  - `size` default: `"md"`
  - `showSubtitle` default: `false`
  - `centered` default: `false`

- [ ] **Step 1: Crear el archivo**

Crear `src/components/common/BrandLogo.tsx` con este contenido exacto:

```tsx
import { motion } from 'framer-motion'

type BrandLogoSize = 'sm' | 'md' | 'lg'

interface BrandLogoProps {
  size?: BrandLogoSize
  showSubtitle?: boolean
  centered?: boolean
}

const SIZES: Record<BrandLogoSize, { fontSize: number; letterSpacing: string; subtitleSize: number }> = {
  sm: { fontSize: 22, letterSpacing: '-1px',   subtitleSize: 11 },
  md: { fontSize: 32, letterSpacing: '-1.5px', subtitleSize: 13 },
  lg: { fontSize: 40, letterSpacing: '-2px',   subtitleSize: 14 },
}

const GRADIENT = 'linear-gradient(90deg, #E8683A 0%, #F28C4A 50%, #2A2A2A 100%)'

export function BrandLogo({ size = 'md', showSubtitle = false, centered = false }: BrandLogoProps) {
  const { fontSize, letterSpacing, subtitleSize } = SIZES[size]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: centered ? 'center' : 'flex-start', gap: 4 }}>
      <motion.span
        className="font-black"
        style={{
          fontSize,
          letterSpacing,
          lineHeight: 1,
          background: GRADIENT,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
        initial={{ opacity: 0, x: centered ? 0 : -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        OFIX
      </motion.span>
      {showSubtitle && (
        <motion.p
          style={{
            fontSize: subtitleSize,
            color: 'rgba(255,255,255,0.8)',
            fontWeight: 500,
            margin: 0,
          }}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          Profesionales de confianza en Montevideo
        </motion.p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verificar que TypeScript no da errores**

```bash
npx tsc --noEmit
```

Expected: sin errores relacionados a `BrandLogo.tsx`

- [ ] **Step 3: Commit**

```bash
git add src/components/common/BrandLogo.tsx
git commit -m "feat: create BrandLogo component with gradient and subtitle"
```

---

### Task 2: Reemplazar logo en Home

**Files:**
- Modify: `src/pages/Home.tsx`

**Interfaces:**
- Consumes: `BrandLogo` de `../../components/common/BrandLogo`

- [ ] **Step 1: Agregar el import en Home.tsx**

Al inicio de `src/pages/Home.tsx`, agregar:

```tsx
import { BrandLogo } from '../components/common/BrandLogo'
```

- [ ] **Step 2: Reemplazar el bloque del título en el header**

Buscar y reemplazar el bloque `<motion.span>` que contiene "OFIX" dentro de `homeHeader`:

Reemplazar:
```tsx
        <motion.span
          className="font-black"
          style={{
            fontSize: 32,
            letterSpacing: '-1.5px',
            background: 'linear-gradient(90deg, #FF6B00 0%, #cc5500 60%, #1a1a1a 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1,
          }}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          OFIX
        </motion.span>
```

Por:
```tsx
        <BrandLogo size="md" />
```

- [ ] **Step 3: Eliminar el import de `motion` si ya no se usa en ese archivo**

Verificar si `motion` se sigue usando en Home.tsx para otras cosas. Si no, eliminar `motion` del import de `framer-motion`.

- [ ] **Step 4: Verificar en el browser**

Abrir `http://localhost:5173`. El header de Home debe mostrar "OFIX" con gradiente `#E8683A → #F28C4A → #2A2A2A`.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Home.tsx
git commit -m "feat: use BrandLogo component in Home header"
```

---

### Task 3: Reemplazar logo en Login

**Files:**
- Modify: `src/pages/Login.tsx`

**Interfaces:**
- Consumes: `BrandLogo` de `../../components/common/BrandLogo`

- [ ] **Step 1: Agregar el import**

```tsx
import { BrandLogo } from '../components/common/BrandLogo'
```

- [ ] **Step 2: Reemplazar el bloque del título**

Buscar el bloque `<motion.h1>` que contiene "OFIX" y reemplazarlo por:

```tsx
          <BrandLogo size="lg" showSubtitle centered />
```

Eliminar también el `<motion.p>` con el subtítulo que sigue al `<motion.h1>`, ya que `showSubtitle` lo incluye.

- [ ] **Step 3: Verificar en el browser**

Abrir `http://localhost:5173/login`. El hero naranja debe mostrar "OFIX" con gradiente y subtítulo "Profesionales de confianza en Montevideo".

- [ ] **Step 4: Commit**

```bash
git add src/pages/Login.tsx
git commit -m "feat: use BrandLogo component in Login"
```

---

### Task 4: Reemplazar logo en Register

**Files:**
- Modify: `src/pages/Register.tsx`

**Interfaces:**
- Consumes: `BrandLogo` de `../../components/common/BrandLogo`

- [ ] **Step 1: Agregar el import**

```tsx
import { BrandLogo } from '../components/common/BrandLogo'
```

- [ ] **Step 2: Reemplazar el bloque del título**

Buscar el `<motion.h1>` con "OFIX" y el `<motion.p>` con el subtítulo y reemplazarlos por:

```tsx
          <BrandLogo size="lg" showSubtitle centered />
```

- [ ] **Step 3: Verificar en el browser**

Abrir `http://localhost:5173/registro`. El hero debe mostrar "OFIX" con gradiente y subtítulo.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Register.tsx
git commit -m "feat: use BrandLogo component in Register"
```

---

### Task 5: Reemplazar logo en Header

**Files:**
- Modify: `src/components/layout/Header.tsx`

**Interfaces:**
- Consumes: `BrandLogo` de `../../components/common/BrandLogo`

- [ ] **Step 1: Agregar el import**

```tsx
import { BrandLogo } from '../common/BrandLogo'
```

- [ ] **Step 2: Reemplazar el bloque del span OFIX**

Reemplazar:
```tsx
      {!showBack && (
        <span
          className="font-black"
          style={{
            fontSize: 22,
            letterSpacing: '-1px',
            lineHeight: 1,
            background: 'linear-gradient(90deg, #FF6B00 0%, #cc5500 60%, #1a1a1a 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >OFIX</span>
      )}
```

Por:
```tsx
      {!showBack && <BrandLogo size="sm" />}
```

- [ ] **Step 3: Verificar en el browser**

Navegar a cualquier pantalla que use el Header component (ej: perfil de cliente). El OFIX debe verse igual que en Home.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Header.tsx
git commit -m "feat: use BrandLogo component in Header"
```

---

### Task 6: Corregir subtítulo del Login (color sobre fondo naranja)

El subtítulo dentro de `BrandLogo` usa `color: 'rgba(255,255,255,0.8)'` que funciona bien sobre el hero naranja del Login y Register, pero si en el futuro se usa `showSubtitle` sobre fondo claro, el texto sería invisible.

**Files:**
- Modify: `src/components/common/BrandLogo.tsx`

- [ ] **Step 1: Agregar prop `subtitleColor` opcional**

Actualizar `BrandLogo.tsx` para aceptar un color de subtítulo configurable:

```tsx
interface BrandLogoProps {
  size?: BrandLogoSize
  showSubtitle?: boolean
  centered?: boolean
  subtitleColor?: string
}

export function BrandLogo({ size = 'md', showSubtitle = false, centered = false, subtitleColor = 'rgba(255,255,255,0.8)' }: BrandLogoProps) {
  const { fontSize, letterSpacing, subtitleSize } = SIZES[size]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: centered ? 'center' : 'flex-start', gap: 4 }}>
      <motion.span
        className="font-black"
        style={{
          fontSize,
          letterSpacing,
          lineHeight: 1,
          background: GRADIENT,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
        initial={{ opacity: 0, x: centered ? 0 : -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        OFIX
      </motion.span>
      {showSubtitle && (
        <motion.p
          style={{
            fontSize: subtitleSize,
            color: subtitleColor,
            fontWeight: 500,
            margin: 0,
          }}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          Profesionales de confianza en Montevideo
        </motion.p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/common/BrandLogo.tsx
git commit -m "feat: add subtitleColor prop to BrandLogo for theme flexibility"
```

---

### Task 7: Verificación final y build

- [ ] **Step 1: Grep final — confirmar que no quedan instancias hardcoded**

```bash
grep -r "font-black.*OFIX\|WebkitTextFillColor.*transparent\|FF6B00\|cc5500" src/ --include="*.tsx" -l
```

Expected: solo `src/components/common/BrandLogo.tsx` (el componente oficial).

- [ ] **Step 2: Build de producción**

```bash
npm run build
```

Expected: build exitoso sin errores de TypeScript.

- [ ] **Step 3: Commit final si hay cambios pendientes**

```bash
git add -A
git commit -m "refactor: unify OFIX brand identity via BrandLogo component"
```
