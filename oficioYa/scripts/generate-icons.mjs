import sharp from 'sharp'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const svgPath = resolve(root, 'public/ofix-icon.svg')
const svgBuffer = readFileSync(svgPath)

const sizes = [
  { name: 'icon-192.png',         size: 192 },
  { name: 'icon-512.png',         size: 512 },
  { name: 'icon-1024.png',        size: 1024 },
  { name: 'apple-touch-icon.png', size: 180 },
]

for (const { name, size } of sizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png({ quality: 100 })
    .toFile(resolve(root, 'public', name))
  console.log(`✓ ${name}`)
}

await sharp(svgBuffer)
  .resize(32, 32)
  .png()
  .toFile(resolve(root, 'public/favicon.png'))
console.log('✓ favicon.png')

console.log('Done.')
