# Unificar el logo OFIX al asset oficial de la PWA — Design Spec

## Objetivo

Eliminar el logo de texto con degradado naranja→negro y hacer que TODA la app use
un único recurso oficial: el asset `/ofix-icon.svg` (el mismo de la PWA y el
Splash). Un solo componente/asset compartido, sin variantes ni degradados.

## Contexto

- El logo oficial de la PWA es `public/ofix-icon.svg` (tile negro, "O" naranja
  `#FF6B00`, "FIX" blanco). Ya lo usan el manifest, favicon, apple-touch y el
  `SplashScreen`.
- `src/components/common/BrandLogo.tsx` hoy renderiza el texto "OFIX" con
  `linear-gradient(90deg, #E8683A 0%, #F28C4A 50%, #2A2A2A 100%)` (degradado a
  eliminar). Lo usan: `Home.tsx`, `Login.tsx`, `Register.tsx`, `layout/Header.tsx`.

## Cambio principal: reescribir BrandLogo

`BrandLogo` pasa a renderizar el asset `/ofix-icon.svg` como `<img>`, manteniendo
la misma API para que los consumidores no cambien.

API (sin cambios):
```ts
interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showSubtitle?: boolean
  centered?: boolean
  subtitleColor?: string
}
```

Tamaños del ícono (px):
```
sm: 34   // Header
md: 40   // Home
lg: 72   // hero Login/Registro
```

Comportamiento:
- Renderiza `<motion.img src="/ofix-icon.svg" alt="OFIX" width={size} height={size} style={{ borderRadius }}/>`.
  `borderRadius`: sm/md → 9, lg → 16 (acorde a la proporción del tile 1024/230 ≈ rx 22%).
- Animación de entrada sutil: `initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: [0.34,1.56,0.64,1] }}`.
- Si `showSubtitle`: debajo, el `<motion.p>` con "Profesionales de confianza en
  Montevideo" (color `subtitleColor`, default `rgba(255,255,255,0.8)`), igual que hoy.
- `centered`: controla `alignItems` del contenedor (center vs flex-start).
- Se elimina toda referencia al degradado, `WebkitBackgroundClip`, `fontSize`,
  `letterSpacing`.

Implementación de referencia:
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

## Consumidores (sin cambios de código)

`Home.tsx`, `Login.tsx`, `Register.tsx`, `layout/Header.tsx` siguen usando
`<BrandLogo ... />` con las mismas props. Al reescribir el componente, todos pasan
a mostrar el ícono oficial automáticamente.

Nota: en Login/Registro, `BrandLogo` está sobre el hero naranja con `showSubtitle`
y `centered` — el tile del logo (fondo negro) sobre naranja se ve como el logo
oficial; correcto y consistente.

## SplashScreen

Ya usa `/ofix-icon.svg` directamente (mismo asset). No requiere cambios. (Opcional
futuro: refactor a `<BrandLogo size="lg" />`, no en este alcance para no tocar su
animación propia.)

## Verificación final

1. `grep -rn "linear-gradient(90deg, #E8683A\|WebkitTextFillColor" src/` → sin
   resultados (ningún logo con degradado).
2. Confirmar que no exista otro "OFIX" estilizado como logo (font-black + gradiente)
   fuera de `BrandLogo`.
3. `npm run lint` y `npm run build` OK.
4. (Opcional) Verificación visual en navegador: Home, Login, Registro muestran el
   ícono oficial, sin degradado.

## Fuera de alcance

- Textos que dicen "OFIX" como parte de una frase (ej. "Bienvenido a OFIX" en el
  onboarding) — son copy, no el logo. No se tocan.

## Constraints

- No agregar dependencias.
- Un único recurso compartido: `/ofix-icon.svg` vía `BrandLogo`.
- Sin degradados, sombras extra, ni variantes de color/tamaño fuera de los 3 sizes.
- Correr `npm run lint` y `npm run build` antes del push.
