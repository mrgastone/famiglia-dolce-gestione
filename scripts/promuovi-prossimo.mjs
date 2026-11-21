// Promuove il "mese dopo" (src/data/prossimo/) a menù IN CORSO, per liberare lo slot e
// preparare il mese successivo ancora (es. ~21/12: dicembre diventa "in corso", gennaio va in prossimo/).
//
// Uso:  node scripts/promuovi-prossimo.mjs            (sui dati veri, src/data)
//       node scripts/promuovi-prossimo.mjs --dati <cartella> [--forza]   (prova su una copia)
//
// Cosa fa:
//  1. Archivia il menù in corso (colazioni.json + stagione.json) in cima ad archivio.json (max 6).
//  2. Copia prossimo/{colazioni,stagione}.json sui file in corso (+ snapshot _staging/<città>-*).
//  3. Svuota prossimo/ (`{}`): l'app torna a un solo menù finché non si genera il mese dopo.
// Rifiuta se il mese dopo non è ancora partito (si vedrebbe il mese sbagliato): --forza per le prove.
// Poi: in scripts/genera-colazioni.py metti LIVE = chiave promossa e PROSSIMO = nuovo mese,
// scrivi src/data/prossimo/stagione.json, rigenera (controlli automatici), build, commit, push.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const iDati = process.argv.indexOf('--dati')
const DATA = iDati > 0
  ? resolve(process.argv[iDati + 1])
  : resolve(dirname(fileURLToPath(import.meta.url)), '../src/data')
const forza = process.argv.includes('--forza')

const leggi = (p) => JSON.parse(readFileSync(p, 'utf8'))
const scrivi = (p, o) => writeFileSync(p, JSON.stringify(o, null, 2) + '\n')
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto',
  'settembre', 'ottobre', 'novembre', 'dicembre']

const prossimo = (f) => resolve(DATA, 'prossimo', `${f}.json`)
const colNuove = existsSync(prossimo('colazioni')) ? leggi(prossimo('colazioni')) : {}
const stagNuova = existsSync(prossimo('stagione')) ? leggi(prossimo('stagione')) : {}
if (!colNuove['1'] || !stagNuova.inizioCiclo) {
  console.error('Niente da promuovere: src/data/prossimo/ è vuoto.')
  process.exit(1)
}

const [y, m, d] = stagNuova.inizioCiclo.split('-').map(Number)
const adesso = new Date()
const oggi = new Date(adesso.getFullYear(), adesso.getMonth(), adesso.getDate())
if (oggi < new Date(y, m - 1, d) && !forza) {
  console.error(`${stagNuova.etichetta} parte il ${stagNuova.inizioCiclo}: promuoverlo prima farebbe ` +
    'vedere il mese sbagliato. Aspetta quella data (o --forza solo per una prova su una copia).')
  process.exit(1)
}

// 1) archivia il menù in corso
const stagVecchia = leggi(resolve(DATA, 'stagione.json'))
const colVecchie = leggi(resolve(DATA, 'colazioni.json'))
const archivio = leggi(resolve(DATA, 'archivio.json'))
const mm = (stagVecchia.mese || '').toLowerCase().match(/^([a-zà]+)\s+(\d{4})/)
const id = mm && MESI.includes(mm[1])
  ? `${mm[2]}-${String(MESI.indexOf(mm[1]) + 1).padStart(2, '0')}`
  : (stagVecchia.scadenza || '').slice(0, 7)
if (archivio.some((a) => a.id === id)) {
  console.log(`Già in archivio: ${stagVecchia.etichetta} (id ${id})`)
} else {
  archivio.unshift({ id, etichetta: stagVecchia.etichetta, citta: stagVecchia.citta, colazioni: colVecchie })
  scrivi(resolve(DATA, 'archivio.json'), archivio.slice(0, 6))
  console.log(`Archiviato: ${stagVecchia.etichetta} (id ${id}) — archivio: ${archivio.slice(0, 6).map((a) => a.id).join(', ')}`)
}

// 2) il mese dopo diventa quello in corso (+ snapshot della città in _staging)
scrivi(resolve(DATA, 'colazioni.json'), colNuove)
scrivi(resolve(DATA, 'stagione.json'), stagNuova)
const citta = slug(stagNuova.citta || 'citta')
scrivi(resolve(DATA, '_staging', `${citta}-colazioni.json`), colNuove)
scrivi(resolve(DATA, '_staging', `${citta}-stagione.json`), stagNuova)
console.log(`In corso ora: ${stagNuova.etichetta} (snapshot _staging/${citta}-*.json)`)

// 3) slot del mese dopo libero
scrivi(prossimo('colazioni'), {})
scrivi(prossimo('stagione'), {})
console.log('src/data/prossimo/ svuotato.')
console.log('\nOra: aggiorna LIVE/PROSSIMO in scripts/genera-colazioni.py, scrivi prossimo/stagione.json,')
console.log('rigenera (python scripts/genera-colazioni.py), npm run build, commit, push e verifica il sito.')
