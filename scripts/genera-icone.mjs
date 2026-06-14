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
const TERRA = '#C97B4A' // terracotta (ciliegina)

// rx e scala sono espressi in coordinate viewBox (0..512)
function svgIcona({ size, rx, scala }) {
  const cx = 256
  const cy = 256
  const dolce = `
    <g transform="translate(${cx} ${cy}) scale(${scala}) translate(${-cx} ${-cy})">
      <path d="M150 300 Q150 200 256 200 Q362 200 362 300 Z" fill="${FG}"/>
      <path d="M182 300 L330 300 L312 430 Q310 442 298 442 L214 442 Q202 442 200 430 Z" fill="${FG}"/>
      <path d="M150 300 H362" stroke="${BG}" stroke-width="10" stroke-linecap="round"/>
      <g stroke="${BG}" stroke-width="8" stroke-linecap="round" fill="none">
        <path d="M222 312 L222 428"/>
        <path d="M256 312 L256 430"/>
        <path d="M290 312 L290 428"/>
      </g>
      <circle cx="256" cy="184" r="22" fill="${TERRA}"/>
    </g>`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
    <rect width="512" height="512" rx="${rx}" fill="${BG}"/>
    ${dolce}
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
