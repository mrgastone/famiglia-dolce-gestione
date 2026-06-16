import colazioni from '../data/colazioni.json'
import prodotti from '../data/prodotti.json'

// Margine di sicurezza sulle quantità: +20%, perché lo stesso cibo viene usato
// anche durante il giorno o per altre preparazioni.
export const MARGINE_PERCENTO = 20

// Si va al mercato il MARTEDÌ e il VENERDÌ. Ogni settimana → due liste della spesa.
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

export const ORDINE_FORNITORI = ['montagnola', 'specialita_di_parma', 'mezza_rosetta', 'online']

// Somma le quantità usate per prodotto, nei giorni indicati, per entrambi i profili.
// Gli ingredienti sono annidati dentro le preparazioni.
function totaliPerGiorni(settimana, giorni) {
  const dati = colazioni[String(settimana)] ?? {}
  const somma = {}
  for (const g of giorni) {
    const giorno = dati[g]
    if (!giorno) continue
    for (const profilo of Object.values(giorno)) {
      for (const prep of profilo.preparazioni ?? []) {
        for (const ing of prep.ingredienti ?? []) {
          if (!ing.prodotto) continue
          const q = ing.g ?? ing.n
          if (!q) continue
          somma[ing.prodotto] = (somma[ing.prodotto] ?? 0) + q
        }
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

// La ricerca interna di Esselunga rimanda a una pagina generica; per avere
// risultati mirati al prodotto usiamo una ricerca sul loro sito via motore.
function linkEsselunga(query) {
  return `https://www.google.com/search?q=${encodeURIComponent(`${query} site:esselunga.it`)}`
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

  // Prodotti già disponibili (es. olio EVO in cantina): non si comprano.
  if (p.giaDisponibile) {
    return {
      key,
      nome: p.nome,
      fornitore: p.fornitore,
      scadenza: p.scadenza,
      unita: p.unita,
      quantita: 'Già in cantina',
      giaDisponibile: true,
      amazon: null,
      esselunga: null,
    }
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
    quantita,
    giaDisponibile: false,
    amazon: linkAmazon(p.ricerca ?? p.nome),
    esselunga: linkEsselunga(p.ricerca ?? p.nome),
  }
}

export function listaSpesa(settimana, spesaKey) {
  const giorni = INFO_SPESA[spesaKey]?.giorni ?? []
  const somma = totaliPerGiorni(settimana, giorni)
  return Object.entries(somma)
    .map(([key, q]) => rigaProdotto(key, q))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'it'))
}

export function spesaRaggruppata(settimana, spesaKey) {
  const gruppi = { montagnola: [], specialita_di_parma: [], mezza_rosetta: [], online: [] }
  for (const riga of listaSpesa(settimana, spesaKey)) {
    ;(gruppi[riga.fornitore] ??= []).push(riga)
  }
  return gruppi
}

// Testo pronto per WhatsApp con la SOLA lista del mercato (Montagnola),
// da inviare alla persona del mercato.
export function testoMontagnola(settimana, spesaKey) {
  const info = INFO_SPESA[spesaKey]
  const righe = spesaRaggruppata(settimana, spesaKey).montagnola
  if (!righe.length) return ''
  const lista = righe.map((r) => `- ${r.nome}: ${r.quantita}`).join('\n')
  return `🥬 Mercato Montagnola — ${info.giorno} (Settimana ${settimana})\n(Frutta e verdura per le colazioni di ${info.copre}. Quantità con +${MARGINE_PERCENTO}%.)\n\n${lista}\n\nGrazie! 🙂`
}
