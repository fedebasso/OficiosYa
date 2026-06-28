/**
 * Genera icon-192.png e icon-512.png desde logo-icon.svg
 * Requiere: npm install --save-dev @resvg/resvg-js
 * Uso: node scripts/generate-icons.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

let Resvg
try {
  const mod = await import('@resvg/resvg-js')
  Resvg = mod.Resvg
} catch {
  console.error('Instalá el paquete primero: npm install --save-dev @resvg/resvg-js')
  process.exit(1)
}

const svgPath = join(root, 'public', 'logo-icon.svg')
const svg = readFileSync(svgPath, 'utf8')

for (const size of [192, 512]) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
    background: 'transparent',
  })
  const png = resvg.render().asPng()
  const outPath = join(root, 'public', `icon-${size}.png`)
  writeFileSync(outPath, png)
  console.log(`✓ icon-${size}.png generado`)
}

console.log('Iconos listos en public/')
