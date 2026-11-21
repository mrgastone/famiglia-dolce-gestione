// Scelta PURA del menù attivo (nessun import di dati: si testa con node,
// vedi scripts/test-passaggio-mese.mjs).
//
// Ci sono due "slot":
//  - base     = src/data/colazioni.json + stagione.json (il mese in corso)
//  - prossimo = src/data/prossimo/colazioni.json + stagione.json (il mese dopo, già pronto)
// Il prossimo diventa attivo DA SOLO dal suo `inizioCiclo` (un lunedì, mezzanotte locale):
// così il passaggio di mese è diretto, senza dover pubblicare nulla quel giorno.

// "2026-11-30" → mezzanotte LOCALE (new Date("2026-11-30") sarebbe mezzanotte UTC).
export function dataLocale(iso) {
  const [y, m, d] = String(iso).split('-').map(Number)
  return new Date(y, m - 1, d)
}

function aMezzanotte(data) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate())
}

// Un menù è utilizzabile se ha la data di partenza e almeno la settimana 1.
export function menuValido(menu) {
  return Boolean(menu?.stagione?.inizioCiclo && menu?.colazioni?.['1'])
}

// Restituisce { colazioni, stagione, precedente, prossimo }:
//  - prima dell'inizio del prossimo → base, con `prossimo` disponibile per l'anteprima
//  - dall'inizio del prossimo      → prossimo, con `precedente` = base (per l'archivio)
export function scegliMenu(oggi, base, prossimo) {
  if (menuValido(prossimo)) {
    if (aMezzanotte(oggi) >= dataLocale(prossimo.stagione.inizioCiclo)) {
      return { colazioni: prossimo.colazioni, stagione: prossimo.stagione, precedente: base, prossimo: null }
    }
    return { colazioni: base.colazioni, stagione: base.stagione, precedente: null, prossimo }
  }
  return { colazioni: base.colazioni, stagione: base.stagione, precedente: null, prossimo: null }
}

// Lunedì della settimana DOPO quella che contiene `oggi` (settimane lun→dom).
export function prossimoLunedi(oggi) {
  const d = aMezzanotte(oggi)
  const avanti = (8 - d.getDay()) % 7 || 7
  d.setDate(d.getDate() + avanti)
  return d
}
