import colazioni from '../data/colazioni.json'
import prodotti from '../data/prodotti.json'

// Margine di sicurezza sulle quantità: +20%, perché lo stesso cibo viene usato
// anche durante il giorno o per altre preparazioni.
export const MARGINE_PERCENTO = 20

// Si va al mercato il MARTEDÌ e il VENERDÌ. Ogni settimana → due liste della spesa.
// - Spesa del Martedì: copre le colazioni di mercoledì, giovedì e venerdì.
// - Spesa del Venerdì: copre le colazioni di sabato, domenica, lunedì e martedì.
export const SPESE = ['martedi', 'venerdi']

const INFO_SPESA = {
  martedi: {
    giorno: 'Martedì',
    giorni: ['mer', 'gio', 'ven'],
    copre: 'mercoledì, giovedì e venerdì',
  },
  venerdi: {
    giorno: 'Venerdì',
    giorni: ['sab', 'dom', 'lun', 'mar'],
    copre: 'sabato, domenica, lunedì e martedì',
  },
}

export function infoSpesa(spesaKey) {
  return INFO_SPESA[spesaKey]
}

// Ordine e intestazioni dei fornitori
export const ORDINE_FORNITORI = ['montagnola', 'specialita_di_parma', 'mezza_rosetta', 'online']

const ETICHETTA_FORNITORE = {
  montagnola: '🥬 Mercato della Montagnola',
  specialita_di_parma: '🥚 Specialità di Parma',
  mezza_rosetta: '🥖 Forno Mezza Rosetta',
  online: '🛍️ Online (Amazon Fresh / Esselunga)',
}

// Somma le quantità usate per prodotto, nei giorni indicati, per entrambi i profili.
// Gli ingredienti contati a numero usano `n` (uova/albumi), gli altri i grammi `g`.
function totaliPerGiorni(settimana, giorni) {
  const dati = colazioni[String(settimana)] ?? {}
  const somma = {}
  for (const g of giorni) {
    const giorno = dati[g]
    if (!giorno) continue
    for (const profilo of Object.values(giorno)) {
      for (const ing of profilo.ingredienti ?? []) {
        if (!ing.prodotto) continue
        const q = ing.g ?? ing.n
        if (!q) continue
        somma[ing.prodotto] = (somma[ing.prodotto] ?? 0) + q
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

// +20% con aritmetica intera (evita imprecisioni tipo 100*1.2 = 120.00000000000001)
function conMargine(q) {
  return Math.ceil((q * (100 + MARGINE_PERCENTO)) / 100)
}

function rigaProdotto(key, qUsata) {
  const p = prodotti[key] ?? {
    nome: key,
    fornitore: 'online',
    confezione: null,
    unita: 'g',
    scadenza: '',
    ricerca: key,
  }
  const qConMargine = conMargine(qUsata)
  const aNumero = p.unita === 'uova' || p.unita === 'pezzi'

  let quantita
  if (aNumero) {
    const confezioni = p.confezione ? Math.max(1, Math.ceil(qConMargine / p.confezione)) : null
    quantita = confezioni
      ? `N°${qConMargine} · ${confezioni} confezione${confezioni > 1 ? 'i' : ''} da ${p.confezione}`
      : `N°${qConMargine}`
  } else if (p.confezione) {
    const confezioni = Math.max(1, Math.ceil(qConMargine / p.confezione))
    quantita = `${confezioni} × ${formattaMisura(p.confezione, p.unita)} (servono ~${formattaMisura(qConMargine, p.unita)})`
  } else {
    quantita = formattaMisura(qConMargine, p.unita)
  }

  return {
    key,
    nome: p.nome,
    fornitore: p.fornitore,
    scadenza: p.scadenza,
    unita: p.unita,
    aNumero,
    quantita,
    amazon: linkAmazon(p.ricerca ?? p.nome),
    esselunga: linkEsselunga(p.ricerca ?? p.nome),
  }
}

// Righe della spesa per una settimana + un giro (martedì/venerdì), ordinate.
export function listaSpesa(settimana, spesaKey) {
  const giorni = INFO_SPESA[spesaKey]?.giorni ?? []
  const somma = totaliPerGiorni(settimana, giorni)
  return Object.entries(somma)
    .map(([key, q]) => rigaProdotto(key, q))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'it'))
}

// Le stesse righe raggruppate per fornitore (nell'ordine ORDINE_FORNITORI).
export function spesaRaggruppata(settimana, spesaKey) {
  const gruppi = { montagnola: [], specialita_di_parma: [], mezza_rosetta: [], online: [] }
  for (const riga of listaSpesa(settimana, spesaKey)) {
    ;(gruppi[riga.fornitore] ??= []).push(riga)
  }
  return gruppi
}

// Testo pronto da copiare e inviare su WhatsApp alla persona del mercato.
export function testoWhatsapp(settimana, spesaKey) {
  const info = INFO_SPESA[spesaKey]
  const gruppi = spesaRaggruppata(settimana, spesaKey)
  const righe = [
    `🛒 Spesa di ${info.giorno} — Settimana ${settimana}`,
    `(Serve per le colazioni di ${info.copre}. Quantità con +${MARGINE_PERCENTO}%.)`,
    '',
  ]
  for (const fornitore of ORDINE_FORNITORI) {
    const items = gruppi[fornitore]
    if (!items || items.length === 0) continue
    righe.push(ETICHETTA_FORNITORE[fornitore])
    for (const it of items) righe.push(`- ${it.nome}: ${it.quantita}`)
    righe.push('')
  }
  righe.push('Grazie! 🙂')
  return righe.join('\n')
}
