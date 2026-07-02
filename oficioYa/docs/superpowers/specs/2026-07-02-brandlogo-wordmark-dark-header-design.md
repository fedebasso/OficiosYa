# Logo OFIX como wordmark transparente + header oscuro — Design Spec

## Objetivo

Reemplazar el logo (hoy el tile `/ofix-icon.svg` con fondo negro) por un **wordmark
transparente** con la identidad oficial: **anillo naranja "O"** + **"FIX"**, en la
misma tipografía/proporciones/espaciado del logo de la PWA. Colores oficiales
**naranja + blanco** en toda la app. Para que el "FIX" blanco sea legible, el
**header de la Home pasa a fondo oscuro**.

Aprobado con mockups en el visual companion (wordmark + header oscuro).

## Componente único: BrandLogo (reescritura)

`BrandLogo` deja de renderizar el `<img>` del tile y pasa a renderizar un **SVG
inline transparente** con la geometría exacta del logo oficial (tomada de
`public/ofix-icon.svg`): un anillo (círculo sin relleno, borde naranja) como "O" +
el texto "FIX".

API:
```ts
interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg'
  theme?: 'dark' | 'light'   // controla SOLO el color del "FIX". default 'dark'
  showSubtitle?: boolean
  centered?: boolean
  subtitleColor?: string
}
```

- **"O" (anillo): siempre naranja `#FF6B00`** (nunca cambia).
- **"FIX":** `theme='dark'` → **`#FFFFFF`** (blanco, para fondos oscuros/naranja);
  `theme='light'` → **`#1A1712`** (para fondos claros, por si se necesita).
- Fondo **transparente** (sin tile).
- Tamaños (altura del SVG): `sm` 26, `md` 32, `lg` 52. Subtítulo: 11/13/14.
- Mantiene `showSubtitle` (texto "Profesionales de confianza en Montevideo"),
  `centered`, `subtitleColor`, y una animación de entrada sutil (fade/scale).

Geometría del wordmark (coordenadas del asset oficial, viewBox recortado):
```
viewBox="120 320 800 384"
<circle cx=310 cy=512 r=148 fill=none stroke=#FF6B00 stroke-width=68/>
<text x=665 y=578 font-family="'Arial Black','Helvetica Neue',Arial,sans-serif"
      font-weight=900 font-size=300 letter-spacing=-6 text-anchor=middle
      fill={fixColor}>FIX</text>
```

Código de referencia:
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

## Home: header oscuro

`src/pages/Home.tsx` — el `homeHeader` pasa de fondo blanco a **oscuro**, para que
el logo blanco/naranja sea legible. El resto de la Home mantiene la base crema.

- Fondo del header: `#191410`. Sombra inferior sutil: `0 2px 12px rgba(0,0,0,.25)`
  (o borde `1px solid #2A2018`).
- `BrandLogo` con `theme="dark"` (default) — sin cambios de tamaño (queda `md`).
- Buscador dentro del header en tonos oscuros: fondo `#26201A`, borde
  `1.5px solid #342C24`, placeholder `#9A8F80`, ícono `Search` en `#7D7264`.

## Login / Registro

Ya usan `<BrandLogo size="lg" showSubtitle centered />` sobre el hero naranja.
`theme` default 'dark' → FIX blanco. **Sin cambios de código** (heredan el nuevo
wordmark automáticamente).

## Splash

`src/components/SplashScreen.tsx` hoy muestra el tile `<img src="/ofix-icon.svg">`.
Se reemplaza por `<BrandLogo size="lg" />` (theme dark → blanco) sobre el fondo
negro, manteniendo la animación del contenedor. Así el splash usa el mismo
componente/wordmark.

## Header compartido (layout/Header.tsx)

Los 3 consumidores del componente `Header` pasan `showBack` (muestran back+título,
no el logo), así que la rama del logo no se usa en la práctica. Por seguridad, ese
`<BrandLogo>` (rama `!showBack`) se marca `theme="light"` (por si alguna pantalla
futura lo usa sobre header claro). No se oscurece ningún otro header.

## Fuera de alcance

- **Ícono de la PWA** (`ofix-icon.svg`, manifest, favicon, apple-touch): sigue
  siendo el **tile con fondo** — es el ícono de la app y necesita fondo. No se toca.
- Textos "OFIX" dentro de frases (copy) — no son el logo.

## Verificación

1. `grep -rn "ofix-icon.svg" src/` → solo debe aparecer en referencias del ícono de
   la app (no como logo dentro de pantallas; SplashScreen ya no lo usa).
2. Revisión visual en navegador: Home (header oscuro + logo), Login/Registro (hero
   naranja + logo blanco), Splash (negro + logo blanco). "O" naranja siempre;
   "FIX" blanco; sin tile negro pegado.
3. `npm run lint` y `npm run build` OK.

## Constraints

- Un único componente `BrandLogo`; misma tipografía/proporciones/espaciado siempre.
- "O" siempre `#FF6B00`; "FIX" blanco (o `#1A1712` en theme light).
- No agregar dependencias.
- Correr `npm run lint` y `npm run build` antes del push.
