# OFIX Rebranding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar completamente el branding anterior por el nuevo logo OFIX (O naranja + FIX blanco sobre fondo negro con degradé sutil) en toda la app PWA.

**Architecture:** Se crea un SVG master del logo y un script Node que genera todos los PNG necesarios. Luego se actualizan manifest, HTML, y componentes React (SplashScreen, Home, Login). Finalmente se limpian assets viejos.

**Tech Stack:** React + Vite + TypeScript + vite-plugin-pwa + framer-motion + sharp (devDep para generación de íconos)

## Global Constraints

- Colores: negro `#000000`, naranja `#FF6B00`, blanco `#FFFFFF`
- `theme_color: #000000`, `background_color: #000000`
- `name: OFIX`, `short_name: OFIX`
- Imagen fuente: `C:\Users\fede8\Documents\logoofix.jpeg`
- No agregar dependencias de producción, solo devDependencies para scripts
- Mantener framer-motion para animaciones (ya instalado)

---

### Task 1: Crear SVG master del logo + script de generación de íconos

**Files:**
- Create: `public/ofix-icon.svg`
- Create: `scripts/generate-icons.mjs`
- Modify: `package.json` (agregar script `gen:icons` y devDep `sharp`)

**Interfaces:**
- Produce: `public/ofix-icon.svg` — SVG 1024x1024 usado por todas las tareas siguientes
- Produce: `public/icon-192.png`, `public/icon-512.png`, `public/icon-1024.png`, `public/apple-touch-icon.png`, `public/favicon.ico`

- [ ] **Step 1: Instalar sharp como devDependency**

```bash
npm install -D sharp
```

Expected: `sharp` aparece en `devDependencies` de `package.json`

- [ ] **Step 2: Crear el SVG master del logo**

Crear `public/ofix-icon.svg` con este contenido exacto:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
      <stop offset="40%" style="stop-color:#000000;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0d0d0d;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="shineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0" />
      <stop offset="30%" style="stop-color:#6060ff;stop-opacity:0.06" />
      <stop offset="50%" style="stop-color:#ff6030;stop-opacity:0.08" />
      <stop offset="70%" style="stop-color:#30ff60;stop-opacity:0.05" />
      <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0" />
    </linearGradient>
    <clipPath id="roundedClip">
      <rect width="1024" height="1024" rx="230" ry="230"/>
    </clipPath>
  </defs>
  <!-- Background -->
  <rect width="1024" height="1024" rx="230" ry="230" fill="url(#bgGrad)"/>
  <!-- Subtle rainbow shine overlay -->
  <rect width="1024" height="1024" rx="230" ry="230" fill="url(#shineGrad)"/>
  <!-- Orange O ring -->
  <circle cx="340" cy="512" r="155" fill="none" stroke="#FF6B00" stroke-width="72"/>
  <!-- FIX text -->
  <text
    x="560" y="570"
    font-family="'Arial Black', 'Helvetica Neue', Arial, sans-serif"
    font-weight="900"
    font-size="310"
    fill="#FFFFFF"
    text-anchor="middle"
    dominant-baseline="auto"
    letter-spacing="-8"
  >FIX</text>
</svg>
```

- [ ] **Step 3: Crear el script de generación**

Crear `scripts/generate-icons.mjs`:

```js
import sharp from 'sharp'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const svgPath = resolve(root, 'public/ofix-icon.svg')
const svgBuffer = readFileSync(svgPath)

const sizes = [
  { name: 'icon-192.png',        size: 192 },
  { name: 'icon-512.png',        size: 512 },
  { name: 'icon-1024.png',       size: 1024 },
  { name: 'apple-touch-icon.png', size: 180 },
]

for (const { name, size } of sizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png({ quality: 100 })
    .toFile(resolve(root, 'public', name))
  console.log(`✓ ${name}`)
}

// favicon.ico como PNG 32x32 (browsers modernos aceptan PNG como favicon)
await sharp(svgBuffer)
  .resize(32, 32)
  .png()
  .toFile(resolve(root, 'public/favicon.png'))
console.log('✓ favicon.png')

console.log('Done.')
```

- [ ] **Step 4: Agregar script en package.json**

En `package.json`, dentro de `"scripts"`, agregar:
```json
"gen:icons": "node scripts/generate-icons.mjs"
```

- [ ] **Step 5: Ejecutar el script**

```bash
npm run gen:icons
```

Expected output:
```
✓ icon-192.png
✓ icon-512.png
✓ icon-1024.png
✓ apple-touch-icon.png
✓ favicon.png
Done.
```

- [ ] **Step 6: Commit**

```bash
git add public/ofix-icon.svg public/icon-192.png public/icon-512.png public/icon-1024.png public/apple-touch-icon.png public/favicon.png scripts/generate-icons.mjs package.json
git commit -m "feat: add OFIX master SVG and generate all icon sizes"
```

---

### Task 2: Actualizar PWA manifest y HTML meta tags

**Files:**
- Modify: `vite.config.ts`
- Modify: `index.html`

**Interfaces:**
- Consumes: `public/icon-192.png`, `public/icon-512.png`, `public/apple-touch-icon.png`, `public/favicon.png` (de Task 1)

- [ ] **Step 1: Actualizar vite.config.ts**

Reemplazar el bloque `manifest` dentro de `VitePWA({...})` con:

```ts
manifest: {
  name: 'OFIX',
  short_name: 'OFIX',
  description: 'Encontrá profesionales de confianza en Montevideo',
  theme_color: '#000000',
  background_color: '#000000',
  display: 'standalone',
  orientation: 'portrait',
  start_url: '/',
  icons: [
    { src: '/icon-192.png',        sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/icon-512.png',        sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    { src: '/icon-1024.png',       sizes: '1024x1024', type: 'image/png', purpose: 'any' },
    { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png', purpose: 'any' },
    { src: '/ofix-icon.svg',       sizes: 'any',    type: 'image/svg+xml', purpose: 'any' },
  ],
},
```

- [ ] **Step 2: Actualizar index.html**

Reemplazar el contenido de `<head>` para agregar todos los meta tags de PWA/iOS:

```html
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/png" href="/favicon.png" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black" />
  <meta name="apple-mobile-web-app-title" content="OFIX" />
  <meta name="theme-color" content="#000000" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>OFIX</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet">
</head>
```

- [ ] **Step 3: Verificar que el dev server no muestra errores en consola**

Correr `npm run dev` y abrir `http://localhost:5173`. Verificar en DevTools → Application → Manifest que aparece `name: OFIX` y `theme_color: #000000`.

- [ ] **Step 4: Commit**

```bash
git add vite.config.ts index.html
git commit -m "feat: update PWA manifest and HTML meta tags to OFIX branding"
```

---

### Task 3: Crear SplashScreen component

**Files:**
- Create: `src/components/SplashScreen.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces: `<SplashScreen />` — se monta sobre toda la app durante ~1s al primer render, luego desaparece con fade out

- [ ] **Step 1: Crear SplashScreen.tsx**

```tsx
// src/components/SplashScreen.tsx
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function SplashScreen() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 1200)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            background: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <img
              src="/ofix-icon.svg"
              alt="OFIX"
              width={120}
              height={120}
              style={{ borderRadius: 26 }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 2: Montar SplashScreen en App.tsx**

En `src/App.tsx`, importar el componente:

```tsx
import { SplashScreen } from './components/SplashScreen'
```

Y en la función `App`, agregar `<SplashScreen />` como primer hijo del `BrowserRouter`:

```tsx
return (
  <BrowserRouter>
    <SplashScreen />
    <AppInner />
    {/* resto igual */}
  </BrowserRouter>
)
```

- [ ] **Step 3: Verificar en el navegador**

Abrir `http://localhost:5173`, recargar la página. Debe aparecer el splash negro con el logo centrado por ~1.2s y luego desvanecerse.

- [ ] **Step 4: Commit**

```bash
git add src/components/SplashScreen.tsx src/App.tsx
git commit -m "feat: add OFIX splash screen with fade+scale animation"
```

---

### Task 4: Actualizar Home — header con nuevo logo

**Files:**
- Modify: `src/pages/Home.tsx`

**Interfaces:**
- Consumes: `public/ofix-icon.svg` (de Task 1)

- [ ] **Step 1: Reemplazar el header en Home.tsx**

Reemplazar el bloque `const homeHeader = (...)` completo por:

```tsx
const homeHeader = (
  <header
    className="sticky top-0 z-50"
    style={{
      background: '#000000',
      boxShadow: '0 1px 0 rgba(255,255,255,0.08)',
    }}
  >
    <div
      className="flex items-center gap-3"
      style={{ padding: 'calc(14px + var(--safe-top)) var(--px-container) 10px' }}
    >
      <motion.img
        src="/ofix-icon.svg"
        alt="OFIX"
        width={36}
        height={36}
        style={{ borderRadius: 8 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      />
      <motion.span
        className="font-black"
        style={{
          fontSize: 28,
          letterSpacing: '-1px',
          color: '#FFFFFF',
          lineHeight: 1,
        }}
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        OFIX
      </motion.span>
    </div>
    <div style={{ padding: '0 var(--px-container) 12px' }}>
      <button
        type="button"
        onClick={() => navigate('/buscar')}
        className="w-full flex items-center gap-3 active:opacity-80 transition-opacity"
        style={{
          height: 44,
          background: '#1a1a1a',
          border: '1.5px solid #333333',
          borderRadius: 14,
          padding: '0 14px',
        }}
      >
        <span style={{ fontSize: 15 }}>🔍</span>
        <span style={{ fontSize: 'var(--text-sm)', color: '#888888' }}>
          ¿Qué servicio necesitás?
        </span>
      </button>
    </div>
  </header>
)
```

- [ ] **Step 2: Verificar en el navegador**

Abrir `http://localhost:5173`. El header debe mostrar el ícono OFIX + texto "OFIX" en blanco sobre fondo negro, con la barra de búsqueda en tono oscuro.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Home.tsx
git commit -m "feat: update Home header with OFIX logo and dark branding"
```

---

### Task 5: Actualizar Login con nuevo logo

**Files:**
- Modify: `src/pages/Login.tsx`

- [ ] **Step 1: Leer el bloque de logo actual en Login.tsx**

Buscar en `Login.tsx` cualquier referencia a "Ofix", logo, o imagen en el encabezado del formulario.

- [ ] **Step 2: Agregar el logo OFIX arriba del formulario**

Después del `<PageShell showBottomNav={false}>` y antes del formulario, insertar:

```tsx
<div
  style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 32,
    gap: 12,
  }}
>
  <motion.img
    src="/ofix-icon.svg"
    alt="OFIX"
    width={72}
    height={72}
    style={{ borderRadius: 16 }}
    initial={{ opacity: 0, scale: 0.7 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
  />
  <motion.span
    style={{ fontSize: 22, fontWeight: 900, color: '#111111', letterSpacing: '-0.5px' }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.15, duration: 0.3 }}
  >
    OFIX
  </motion.span>
</div>
```

- [ ] **Step 3: Verificar en el navegador**

Abrir `http://localhost:5173/login`. El logo debe aparecer centrado arriba del formulario con animación suave.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Login.tsx
git commit -m "feat: add OFIX logo to Login page"
```

---

### Task 6: Limpiar assets viejos y referencias al branding anterior

**Files:**
- Delete: `public/logo.svg`, `public/favicon.svg`, `public/icons.svg`, `public/icon-7a.svg`, `public/icon-7b.svg`, `public/logo-icon.svg`
- Grep: todo el proyecto por referencias a estos archivos

- [ ] **Step 1: Buscar referencias a assets viejos**

Correr en la raíz del proyecto:
```bash
grep -r "logo\.svg\|favicon\.svg\|icons\.svg\|icon-7a\|icon-7b\|logo-icon\|Ofix\b" src/ --include="*.tsx" --include="*.ts" --include="*.css" -l
```

Listar todos los archivos que aparezcan.

- [ ] **Step 2: Eliminar los SVGs viejos de public/**

```bash
rm public/logo.svg public/favicon.svg public/icons.svg public/icon-7a.svg public/icon-7b.svg public/logo-icon.svg
```

- [ ] **Step 3: Reemplazar referencias "Ofix" → "OFIX" en todo el código**

En cualquier archivo que aparezca `Ofix` (con minúscula), reemplazarlo por `OFIX`. Verificar especialmente:
- Títulos visibles al usuario
- Textos en `<title>`, `<meta>`, `alt=`
- Strings de marca en pantallas de onboarding o perfil

- [ ] **Step 4: Verificar que el build no falla**

```bash
npm run build
```

Expected: build exitoso sin errores de assets faltantes.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove old brand assets and replace Ofix references with OFIX"
```

---

### Task 7: Verificación final PWA

- [ ] **Step 1: Build y preview**

```bash
npm run build && npm run preview
```

Abrir `http://localhost:4173`.

- [ ] **Step 2: Verificar en Chrome DevTools**

Abrir DevTools → Application → Manifest:
- `name: OFIX` ✓
- `theme_color: #000000` ✓
- Todos los íconos cargan sin 404 ✓

- [ ] **Step 3: Verificar favicon en pestaña del browser**

La pestaña del navegador debe mostrar el ícono OFIX (negro con O naranja).

- [ ] **Step 4: Simular instalación PWA**

En Chrome, hacer clic en el ícono de instalación en la barra de dirección. Verificar que el ícono de la app que se va a instalar es el nuevo logo OFIX.

- [ ] **Step 5: Commit final**

```bash
git add -A
git commit -m "feat: complete OFIX rebranding - PWA icons, manifest, splash, home, login"
```
