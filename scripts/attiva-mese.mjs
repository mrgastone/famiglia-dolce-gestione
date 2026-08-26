// Attiva un menù messo in staging (es. Roma settembre) come menù LIVE.
// Uso:  node scripts/attiva-mese.mjs roma
//
// Cosa fa:
//  1. Fa uno snapshot della città uscente in src/data/_staging/<citta>-*.json
//     (così si può tornare indietro con lo stesso comando).
//  2. Archivia il mese uscente in archivio.json (in cima, max 6 voci).
//  3. Copia _staging/<prefix>-{colazioni,stagione,spesa,prodotti}.json sui file live.
// Poi ricordati di:  npm run build  →  commit  →  push (deploy automatico).
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const DATA = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data')
const STAGE = resolve(DATA, '_staging')
const prefix = process.argv[2]
if (!prefix) {
  console.error('Uso: node scripts/attiva-mese.mjs <prefix>   (es. roma)')
  process.exit(1)
}
const leggi = (p) => JSON.parse(readFileSync(p, 'utf8'))
const scrivi = (p, o) => writeFileSync(p, JSON.stringify(o, null, 2) + '\n')
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const FILES = ['colazioni', 'stagione', 'spesa', 'prodotti']
for (const f of FILES) {
  const src = resolve(STAGE, `${prefix}-${f}.json`)
  if (!existsSync(src)) {
    console.error(`Manca ${src}`)
    process.exit(1)
  }
}

// 1) snapshot città uscente
const stagioneVecchia = leggi(resolve(DATA, 'stagione.json'))
const cittaVecchia = slug(stagioneVecchia.citta || 'mese-precedente')
for (const f of FILES) {
  const live = resolve(DATA, `${f}.json`)
  scrivi(resolve(STAGE, `${cittaVecchia}-${f}.json`), leggi(live))
}
console.log(`Snapshot uscente salvato come _staging/${cittaVecchia}-*.json`)

// 2) archivia il mese uscente
const archivio = leggi(resolve(DATA, 'archivio.json'))
const colVecchie = leggi(resolve(DATA, 'colazioni.json'))
const id = (stagioneVecchia.scadenza || '').slice(0, 7) || cittaVecchia
if (!archivio.find((a) => a.id === id)) {
  archivio.unshift({
    id,
    etichetta: stagioneVecchia.etichetta,
    citta: stagioneVecchia.citta,
    colazioni: colVecchie,
  })
  scrivi(resolve(DATA, 'archivio.json'), archivio.slice(0, 6))
  console.log(`Archiviato: ${stagioneVecchia.etichetta} (id ${id})`)
}

// 3) attiva staging -> live
for (const f of FILES) {
  scrivi(resolve(DATA, `${f}.json`), leggi(resolve(STAGE, `${prefix}-${f}.json`)))
}
const nuova = leggi(resolve(DATA, 'stagione.json'))
console.log(`\nAttivato: ${nuova.etichetta}`)
console.log('Ora esegui:  npm run build  →  commit  →  push')
