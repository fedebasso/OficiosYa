# Unificar BrandLogo al asset oficial de la PWA — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que `BrandLogo` renderice el asset oficial `/ofix-icon.svg` (sin degradado), unificando el logo en Home, Login, Registro y Header con la PWA.

**Architecture:** Un único cambio de fondo: reescribir `BrandLogo.tsx` para mostrar `<img src="/ofix-icon.svg">` manteniendo la misma API. Los consumidores no cambian. Verificación por grep.

**Tech Stack:** React + TypeScript + framer-motion

## Global Constraints

- Un único recurso compartido: `/ofix-icon.svg` vía `BrandLogo`
- Sin degradados, sin variantes de texto
- API de `BrandLogo` sin cambios (`size`, `showSubtitle`, `centered`, `subtitleColor`)
- Correr `npm run lint` y `npm run build` antes del push

---

### Task 1: Reescribir BrandLogo para usar el asset oficial

**Files:**
- Modify (reescritura completa): `src/components/common/BrandLogo.tsx`

**Interfaces:**
- Produces: `BrandLogo({ size, showSubtitle, centered, subtitleColor })` (misma firma)

- [ ] **Step 1: Reemplazar el contenido completo de `src/components/common/BrandLogo.tsx`**

```tsx
import { motion } from 'framer-motion'

type BrandLogoSize = 'sm' | 'md' | 'lg'

interface BrandLogoProps {
  size?: BrandLogoSize
  showSubtitle?: boolean
  centered?: boolean
  subtitleColor?: string
}

const SIZES: Record<BrandLogoSize, { px: number; radius: number; subtitleSize: number }> = {
  sm: { px: 34, radius: 9,  subtitleSize: 11 },
  md: { px: 40, radius: 9,  subtitleSize: 13 },
  lg: { px: 72, radius: 16, subtitleSize: 14 },
}

export function BrandLogo({
  size = 'md',
  showSubtitle = false,
  centered = false,
  subtitleColor = 'rgba(255,255,255,0.8)',
}: BrandLogoProps) {
  const { px, radius, subtitleSize } = SIZES[size]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: centered ? 'center' : 'flex-start', gap: 8 }}>
      <motion.img
        src="/ofix-icon.svg"
        alt="OFIX"
        width={px}
        height={px}
        style={{ borderRadius: radius, display: 'block' }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      />
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
git commit -m "feat: BrandLogo renders official PWA icon asset (no gradient wordmark)"
```

---

### Task 2: Verificación de consistencia, build y deploy

**Files:** (ninguno nuevo — verificación)

- [ ] **Step 1: Confirmar que no queda ningún logo con degradado**

Run: `grep -rn "linear-gradient(90deg, #E8683A\|WebkitTextFillColor" src/`
Expected: sin resultados. (Si aparece alguno, es un logo con degradado fuera de
BrandLogo — reemplazarlo por `<BrandLogo />` con el size adecuado.)

- [ ] **Step 2: Confirmar consumidores de BrandLogo intactos**

Run: `grep -rn "BrandLogo" src/pages/Home.tsx src/pages/Login.tsx src/pages/Register.tsx src/components/layout/Header.tsx`
Expected: cada archivo sigue usando `<BrandLogo ... />` (Home `md`, Header `sm`,
Login/Register `lg showSubtitle centered`). No requieren cambios.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: sin errores.

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: `✓ built` sin errores.

- [ ] **Step 5: Push y deploy**

```bash
git push origin main
vercel --prod
```
Expected: deployment `Ready` en `https://oficios-ya-8112.vercel.app`.
