// Test del passaggio automatico di mese e dell'età di David (moduli puri, senza Vite).
// Uso:  node scripts/test-passaggio-mese.mjs
import { readFileSync } from 'node:fs'
import { scegliMenu, prossimoLunedi, dataLocale } from '../src/lib/sceltaMenu.js'
import { etaDa } from '../src/lib/profilo.js'

const leggi = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'))
const base = { colazioni: leggi('../src/data/colazioni.json'), stagione: leggi('../src/data/stagione.json') }
const prossimo = {
  colazioni: leggi('../src/data/prossimo/colazioni.json'),
  stagione: leggi('../src/data/prossimo/stagione.json'),
}

let falliti = 0
function atteso(descr, valore, previsto) {
  const ok = JSON.stringify(valore) === JSON.stringify(previsto)
  if (!ok) falliti++
  console.log(`${ok ? 'OK    ' : 'FALLITO'} ${descr} → ${JSON.stringify(valore)}${ok ? '' : `  (atteso ${JSON.stringify(previsto)})`}`)
}
const giorno = (iso, ora = 12) => { const d = dataLocale(iso); d.setHours(ora); return d }
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

// Settimana del ciclo come in src/lib/settimana.js
function settimana(oggi) {
  const m = scegliMenu(oggi, base, prossimo)
  const inizio = dataLocale(m.stagione.inizioCiclo)
  const g = new Date(oggi.getFullYear(), oggi.getMonth(), oggi.getDate())
  return ((Math.floor(Math.floor((g - inizio) / 86400000) / 7) % 4) + 4) % 4 + 1
}

const casi = [
  ['2026-11-21', 'Novembre 2026 · Roma', 4],
  ['2026-11-27', 'Novembre 2026 · Roma', 1],
  ['2026-11-29', 'Novembre 2026 · Roma', 1],
  ['2026-11-30', 'Dicembre 2026 · Roma', 1],
  ['2026-12-01', 'Dicembre 2026 · Roma', 1],
  ['2026-12-07', 'Dicembre 2026 · Roma', 2],
  ['2026-12-14', 'Dicembre 2026 · Roma', 3],
  ['2026-12-21', 'Dicembre 2026 · Roma', 4],
  ['2026-12-25', 'Dicembre 2026 · Roma', 4],
  ['2026-12-28', 'Dicembre 2026 · Roma', 1],
  ['2027-01-03', 'Dicembre 2026 · Roma', 1],
]
for (const [d, etichetta, sett] of casi) {
  const m = scegliMenu(giorno(d), base, prossimo)
  atteso(`${d}: menù e settimana`, [m.stagione.etichetta, settimana(giorno(d))], [etichetta, sett])
}
// A cavallo della mezzanotte del cambio
atteso('29/11 ore 23:59 → ancora novembre', scegliMenu(giorno('2026-11-29', 23), base, prossimo).stagione.mese, 'Novembre 2026')
atteso('30/11 ore 00:00 → dicembre', scegliMenu(giorno('2026-11-30', 0), base, prossimo).stagione.mese, 'Dicembre 2026')
// Prima del cambio: anteprima disponibile; dopo: novembre come "precedente" per l'archivio
atteso('21/11: anteprima di dicembre disponibile', scegliMenu(giorno('2026-11-21'), base, prossimo).prossimo?.stagione.mese, 'Dicembre 2026')
atteso('01/12: novembre in archivio come mese appena finito', scegliMenu(giorno('2026-12-01'), base, prossimo).precedente?.stagione.mese, 'Novembre 2026')
// Slot vuoto ({}): resta il menù base
atteso('prossimo vuoto → sempre base', scegliMenu(giorno('2026-12-15'), base, { colazioni: {}, stagione: {} }).stagione.mese, 'Novembre 2026')
// Giro frutta del venerdì: il lunedì dopo
atteso('venerdì 27/11 → lunedì dopo', iso(prossimoLunedi(giorno('2026-11-27'))), '2026-11-30')
atteso('domenica 29/11 → lunedì dopo', iso(prossimoLunedi(giorno('2026-11-29'))), '2026-11-30')
atteso('lunedì 30/11 → lunedì dopo', iso(prossimoLunedi(giorno('2026-11-30'))), '2026-12-07')
// Età di David (nato il 30/11/2022)
atteso('età 21/11/2026', etaDa('2022-11-30', giorno('2026-11-21')), '3 anni e 11 mesi')
atteso('età 30/11/2026 (compleanno)', etaDa('2022-11-30', giorno('2026-11-30')), '4 anni')
atteso('età 30/12/2026', etaDa('2022-11-30', giorno('2026-12-30')), '4 anni e 1 mese')
atteso('età 15/02/2027', etaDa('2022-11-30', giorno('2027-02-15')), '4 anni e 2 mesi')

console.log(falliti ? `\n${falliti} TEST FALLITI` : '\nTutti i test superati')
process.exit(falliti ? 1 : 0)
