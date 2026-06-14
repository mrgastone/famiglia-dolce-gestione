// Genera le icone PNG della PWA a partire dal motivo a foglia.
// Uso: npm run genera-icone
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(__dirname, '../public/icons')

const BG = '#7C9A6B' // verde salvia
const FG = '#FBF7F0' // crema

// rx e scala sono espressi in coordinate viewBox (0..512)
function svgIcona({ size, rx, scala }) {
  const cx = 256
  const cy = 256
  const foglia = `
    <g transform="translate(${cx} ${cy}) scale(${scala}) translate(${-cx} ${-cy})">
      <path d="M256 88 C 152 156, 152 356, 256 424 C 360 356, 360 156, 256 88 Z" fill="${FG}"/>
      <path d="M256 124 L256 400" stroke="${BG}" stroke-width="14" stroke-linecap="round"/>
      <path d="M256 206 C 222 216, 202 234, 190 264" stroke="${BG}" stroke-width="12" stroke-linecap="round" fill="none"/>
      <path d="M256 206 C 290 216, 310 234, 322 264" stroke="${BG}" stroke-width="12" stroke-linecap="round" fill="none"/>
      <path d="M256 274 C 226 284, 208 300, 198 326" stroke="${BG}" stroke-width="12" stroke-linecap="round" fill="none"/>
      <path d="M256 274 C 286 284, 304 300, 314 326" stroke="${BG}" stroke-width="12" stroke-linecap="round" fill="none"/>
    </g>`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
    <rect width="512" height="512" rx="${rx}" fill="${BG}"/>
    ${foglia}
  </svg>`
}

const icone = [
  { file: 'icon-192.png', size: 192, rx: 96, scala: 0.78 },
  { file: 'icon-512.png', size: 512, rx: 96, scala: 0.78 },
  // maskable: motivo nella "safe zone" (margine ampio), fondo a tutto campo
  { file: 'icon-maskable-512.png', size: 512, rx: 0, scala: 0.66 },
  // apple-touch-icon: iOS arrotonda da sé, fondo a tutto campo
  { file: 'apple-touch-icon.png', size: 180, rx: 0, scala: 0.8 },
]

await mkdir(outDir, { recursive: true })

for (const i of icone) {
  const svg = svgIcona(i)
  await sharp(Buffer.from(svg)).png().toFile(resolve(outDir, i.file))
  console.log('✓', i.file)
}

console.log('Icone generate in', outDir)
