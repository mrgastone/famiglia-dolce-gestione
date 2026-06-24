import { meseDi, nomeMese } from './soldi.js'
import { CATEGORIE } from '../costanti.js'

// Raggruppa i movimenti per mese e calcola, per ciascun mese:
// - aggiunto (entrate), speso (uscite)
// - saldoFine = saldo cumulato a fine mese (= riporto al mese successivo)
// - datiCategorie per il grafico a ciambella
// Restituisce i mesi dal più recente al più vecchio.
export function riepilogoMesi(movimenti) {
  const perMese = {}
  for (const m of movimenti) {
    const k = meseDi(m.data)
    ;(perMese[k] ??= []).push(m)
  }
  const mesiAsc = Object.keys(perMese).sort()
  let cumulato = 0
  const out = []
  for (const k of mesiAsc) {
    const movs = perMese[k]
    const aggiunto = movs
      .filter((x) => x.tipo === 'entrata')
      .reduce((s, x) => s + x.importoCent, 0)
    const speso = movs.filter((x) => x.tipo === 'uscita').reduce((s, x) => s + x.importoCent, 0)
    cumulato += aggiunto - speso
    const datiCategorie = CATEGORIE.map((c) => ({
      nome: c.nome,
      colore: c.colore,
      valore: movs
        .filter((x) => x.tipo === 'uscita' && x.categoria === c.id)
        .reduce((s, x) => s + x.importoCent, 0),
    }))
    out.push({ mese: k, label: nomeMese(k), aggiunto, speso, saldoFine: cumulato, datiCategorie, movimenti: movs })
  }
  return out.reverse()
}
