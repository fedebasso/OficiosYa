# Logo OFIX wordmark + header oscuro — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el logo por un wordmark transparente (anillo O naranja + FIX), con FIX blanco, y oscurecer el header de la Home para que sea legible; consistente en toda la app.

**Architecture:** Reescribir `BrandLogo` a un SVG inline transparente con prop `theme` (color del FIX). Oscurecer el `homeHeader` en `Home.tsx`. Migrar `SplashScreen` a `BrandLogo`. Marcar el `BrandLogo` (rama sin uso) del `Header` compartido como `theme="light"`.

**Tech Stack:** React + TypeScript + framer-motion

## Global Constraints

- Un único componente `BrandLogo`; misma tipografía/proporciones/espaciado siempre
- "O" siempre `#FF6B00`; "FIX" blanco (`theme='dark'`) o `#1A1712` (`theme='light'`)
- Fondo del logo transparente (sin tile)
- No tocar el ícono de la PWA (`ofix-icon.svg`, manifest, favicon)
- Correr `npm run lint` y `npm run build` antes del push

---

### Task 1: Reescribir BrandLogo como wordmark transparente

**Files:**
- Modify (reescritura completa): `src/components/common/BrandLogo.tsx`

**Interfaces:**
- Produces: `BrandLogo({ size, theme, showSubtitle, centered, subtitleColor })`
  con `theme?: 'dark' | 'light'` (default `'dark'`).

- [ ] **Step 1: Reemplazar el contenido completo de `src/components/common/BrandLogo.tsx`**

```tsx
import { motion } from 'framer-motion'

type BrandLogoSize = 'sm' | 'md' | 'lg'

interface BrandLogoProps {
  size?: BrandLogoSize
  theme?: 'dark' | 'light'
  showSubtitle?: boolean
  centered?: boolean
  subtitleColor?: string
}

const SIZES: Record<BrandLogoSize, { h: number; subtitleSize: number }> = {
  sm: { h: 26, subtitleSize: 11 },
  md: { h: 32, subtitleSize: 13 },
  lg: { h: 52, subtitleSize: 14 },
}

export function BrandLogo({
  size = 'md',
  theme = 'dark',
  showSubtitle = false,
  centered = false,
  subtitleColor = 'rgba(255,255,255,0.8)',
}: BrandLogoProps) {
  const { h, subtitleSize } = SIZES[size]
  const fixColor = theme === 'light' ? '#1A1712' : '#FFFFFF'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: centered ? 'center' : 'flex-start', gap: 8 }}>
      <motion.svg
        viewBox="120 320 800 384"
        height={h}
        style={{ display: 'block', width: 'auto' }}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        role="img"
        aria-label="OFIX"
      >
        <circle cx="310" cy="512" r="148" fill="none" stroke="#FF6B00" strokeWidth="68" />
        <text
          x="665" y="578"
          fontFamily="'Arial Black','Helvetica Neue',Arial,sans-serif"
          fontWeight="900" fontSize="300" letterSpacing="-6"
          textAnchor="middle" fill={fixColor}
        >FIX</text>
      </motion.svg>
      {showSubtitle && (
        <motion.p
          style={{ fontSize: subtitleSize, color: subtitleColor, fontWeight: 500, margin: 0 }}
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

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/common/BrandLogo.tsx
git commit -m "feat: BrandLogo as transparent wordmark (ring O + FIX) with theme prop"
```

---

### Task 2: Header oscuro en la Home

**Files:**
- Modify: `src/pages/Home.tsx`

- [ ] **Step 1: Oscurecer el `<header>` y el buscador**

En `src/pages/Home.tsx`, reemplazar el bloque del `homeHeader`:

```tsx
    <header
      className="sticky top-0 z-50"
      style={{
        background: '#FFFFFF',
        boxShadow: '0 1px 0 #EDE8DE, 0 2px 8px rgba(0,0,0,.04)',
      }}
    >
      <div
        className="flex items-center"
        style={{ padding: 'calc(14px + var(--safe-top)) var(--px-container) 10px' }}
      >
        <BrandLogo size="md" />
      </div>
      <div style={{ padding: '0 var(--px-container) 12px' }}>
        <button
          type="button"
          onClick={() => navigate('/buscar')}
          className="w-full flex items-center gap-2.5 active:opacity-80 transition-opacity"
          style={{
            height: 48,
            background: '#F6F1EA',
            border: '1.5px solid #ECE4D8',
            borderRadius: 15,
            padding: '0 14px',
          }}
        >
          <Search size={19} strokeWidth={2.3} style={{ color: '#C2B8A6' }} />
          <span style={{ fontSize: 15, color: '#B0A594', fontWeight: 500 }}>
            ¿Qué servicio necesitás?
          </span>
        </button>
      </div>
    </header>
```

por:

```tsx
    <header
      className="sticky top-0 z-50"
      style={{
        background: '#191410',
        boxShadow: '0 2px 12px rgba(0,0,0,.25)',
      }}
    >
      <div
        className="flex items-center"
        style={{ padding: 'calc(14px + var(--safe-top)) var(--px-container) 10px' }}
      >
        <BrandLogo size="md" />
      </div>
      <div style={{ padding: '0 var(--px-container) 12px' }}>
        <button
          type="button"
          onClick={() => navigate('/buscar')}
          className="w-full flex items-center gap-2.5 active:opacity-80 transition-opacity"
          style={{
            height: 48,
            background: '#26201A',
            border: '1.5px solid #342C24',
            borderRadius: 15,
            padding: '0 14px',
          }}
        >
          <Search size={19} strokeWidth={2.3} style={{ color: '#7D7264' }} />
          <span style={{ fontSize: 15, color: '#9A8F80', fontWeight: 500 }}>
            ¿Qué servicio necesitás?
          </span>
        </button>
      </div>
    </header>
```

- [ ] **Step 2: Verificar en browser**

Correr `npm run dev`, abrir `http://localhost:5173`. El header debe verse oscuro
con el logo O naranja + FIX blanco legible, y el buscador en tono oscuro. El resto
de la Home queda en base crema.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Home.tsx
git commit -m "feat: dark Home header for legible white OFIX wordmark"
```

---

### Task 3: SplashScreen usa BrandLogo

**Files:**
- Modify: `src/components/SplashScreen.tsx`

**Interfaces:**
- Consumes: `BrandLogo` de Task 1

- [ ] **Step 1: Reemplazar el `<motion.img>` del tile por `BrandLogo`**

En `src/components/SplashScreen.tsx`, agregar el import:
```tsx
import { BrandLogo } from './common/BrandLogo'
```

Reemplazar el bloque:
```tsx
          <motion.img
            src="/ofix-icon.svg"
            alt="OFIX"
            width={120}
            height={120}
            style={{ borderRadius: 26 }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          />
```
por:
```tsx
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <BrandLogo size="lg" />
          </motion.div>
```

- [ ] **Step 2: Verificar TypeScript**

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/SplashScreen.tsx
git commit -m "feat: SplashScreen uses BrandLogo wordmark on black"
```

---

### Task 4: Header compartido — logo en theme light

**Files:**
- Modify: `src/components/layout/Header.tsx`

- [ ] **Step 1: Marcar el BrandLogo (rama sin back) como theme light**

En `src/components/layout/Header.tsx`, la rama `{!showBack && <BrandLogo size="sm" />}`
se cambia a:
```tsx
      {!showBack && <BrandLogo size="sm" theme="light" />}
```
(Este header tiene fondo blanco; los consumidores actuales pasan `showBack`, así que
no se renderiza en la práctica, pero queda correcto por si se usa.)

- [ ] **Step 2: Verificar TypeScript**

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Header.tsx
git commit -m "chore: shared Header logo uses light theme for white bar"
```

---

### Task 5: Verificación, lint, build, deploy

- [ ] **Step 1: Confirmar que el splash ya no usa el tile como logo**

Run: `grep -rn "ofix-icon.svg" src/`
Expected: sin resultados en `src/` (el asset solo se referencia desde manifest/HTML,
no como logo dentro de componentes).

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: sin errores.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: `✓ built` sin errores.

- [ ] **Step 4: Push y deploy**

```bash
git push origin main
vercel --prod
```
Expected: deployment `Ready` en `https://oficios-ya-8112.vercel.app`.

- [ ] **Step 5: Verificación visual (opcional, navegador)**

Home (header oscuro + logo O naranja/FIX blanco), Login/Registro (hero naranja +
logo blanco), Splash (negro + logo blanco). "O" naranja siempre; sin tile negro.
