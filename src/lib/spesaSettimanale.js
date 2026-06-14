import colazioni from '../data/colazioni.json'
import prodotti from '../data/prodotti.json'

// Margine di sicurezza sulle quantità: +10% per non rischiare che non bastino.
export const MARGINE = 1.1

// Somma i grammi usati per ogni prodotto in una settimana
// (entrambi i profili, tutti i 7 giorni).
export function totaliSettimana(settimana) {
  const giorni = colazioni[String(settimana)] ?? {}
  const somma = {}
  for (const giorno of Object.values(giorni)) {
    for (const profilo of Object.values(giorno)) {
      for (const ing of profilo.ingredienti ?? []) {
        if (!ing.prodotto || !ing.g) continue
        somma[ing.prodotto] = (somma[ing.prodotto] ?? 0) + ing.g
      }
    }
  }
  return somma
}

function formattaMisura(valore, unita) {
  if (unita === 'ml') {
    return valore >= 1000 ? `${(valore / 1000).toFixed(valore % 1000 ? 1 : 0)} L` : `${valore} ml`
  }
  return valore >= 1000 ? `${(valore / 1000).toFixed(valore % 1000 ? 1 : 0)} kg` : `${valore} g`
}

function linkAmazon(query) {
  return `https://www.amazon.it/s?k=${encodeURIComponent(query)}`
}

function linkEsselunga(query) {
  return `https://www.esselunga.it/it/cms/ricerca.html?q=${encodeURIComponent(query)}`
}

// Riga della lista della spesa per un prodotto, con quantità da acquistare
// (grammi usati + 10%) arrotondata alle confezioni.
function rigaProdotto(key, gUsati) {
  const p = prodotti[key] ?? {
    nome: key,
    fornitore: 'online',
    confezione: null,
    unita: 'g',
    scadenza: '',
    ricerca: key,
  }
  // +10% con aritmetica intera, per evitare imprecisioni in virgola mobile
  // (es. 100 * 1.1 = 110.00000000000001 in JavaScript)
  const gConMargine = Math.ceil((gUsati * 11) / 10)

  let quantita
  let confezioni = null
  if (p.unita === 'uova') {
    const uova = Math.ceil(gConMargine / (p.gPerUnita ?? 50))
    confezioni = Math.max(1, Math.ceil(uova / (p.confezione ?? 6)))
    quantita = `${uova} uova · ${confezioni} confezione${confezioni > 1 ? 'i' : ''} da ${p.confezione}`
  } else if (p.confezione) {
    confezioni = Math.max(1, Math.ceil(gConMargine / p.confezione))
    quantita = `${confezioni} × ${formattaMisura(p.confezione, p.unita)} (servono ~${formattaMisura(gConMargine, p.unita)})`
  } else {
    quantita = formattaMisura(gConMargine, p.unita)
  }

  return {
    key,
    nome: p.nome,
    fornitore: p.fornitore,
    scadenza: p.scadenza,
    unita: p.unita,
    gUsati,
    gAcquisto: gConMargine,
    usatoLeggibile: formattaMisura(gUsati, p.unita),
    quantita,
    confezioni,
    amazon: linkAmazon(p.ricerca ?? p.nome),
    esselunga: linkEsselunga(p.ricerca ?? p.nome),
  }
}

// Lista completa della spesa di una settimana, ordinata.
export function listaSpesaSettimana(settimana) {
  const somma = totaliSettimana(settimana)
  return Object.entries(somma)
    .map(([key, g]) => rigaProdotto(key, g))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'it'))
}

// La stessa lista, raggruppata per fornitore.
export function spesaRaggruppata(settimana) {
  const gruppi = { montagnola: [], specialita_di_parma: [], mezza_rosetta: [], online: [] }
  for (const riga of listaSpesaSettimana(settimana)) {
    ;(gruppi[riga.fornitore] ??= []).push(riga)
  }
  return gruppi
}

// Messaggio (WhatsApp) per la Montagnola, costruito dai prodotti freschi
// effettivamente necessari nella settimana.
export function messaggioMontagnola(settimana) {
  const righe = spesaRaggruppata(settimana).montagnola
  if (!righe.length) return ''
  const elenco = righe.map((r) => `- ${r.nome}: ${r.quantita}`).join('\n')
  return `Buongiorno! Per la settimana ${settimana} vorrei ordinare (frutta e verdura freschi):\n${elenco}\nPasso a ritirare in mattinata, grazie! 🍒`
}
