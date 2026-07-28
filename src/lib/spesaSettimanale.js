import colazioni from '../data/colazioni.json'
import prodotti from '../data/prodotti.json'
import profili from '../data/profili.json'
import { porzioniProfilo } from './profilo.js'

// Quante porzioni preparare per ogni profilo (David è condiviso con Lena → 2).
// La spesa conta le quantità di quel profilo moltiplicate per queste porzioni.
const PORZIONI = Object.fromEntries(profili.map((p) => [p.id, porzioniProfilo(p)]))

// Margine di sicurezza sulle quantità: +20%, perché lo stesso cibo viene usato
// anche durante il giorno o per altre preparazioni.
export const MARGINE_PERCENTO = 20

// A Longostagno (agosto 2026) la spesa si fa in tre punti con ritmi diversi:
//  - Supermercato MPREIS (Soprabolzano): UNA VOLTA a settimana → un'unica lista su 7 giorni.
//  - Fruttivendolo Obst & Gemüse Prader (bus 165): frutta/verdura FRESCA → due giri (freschezza).
//  - Alimentari sotto casa (a piedi): pane, latte, acqua ed emergenze → lista breve.
// I prodotti sono instradati al negozio giusto dal campo "fornitore" in prodotti.json:
//   montagnola = fruttivendolo · specialita_di_parma = supermercato · mezza_rosetta = alimentari.
const TUTTI_GIORNI = ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom']

// La frutta è deperibile: due giri dal fruttivendolo (facile in bus 165) per non tenerla troppo.
export const GIRI_FRUTTA = ['inizio', 'fine']
const INFO_FRUTTA = {
  inizio: { nome: 'Inizio settimana', giorni: ['lun', 'mar', 'mer', 'gio'], copre: 'lunedì → giovedì' },
  fine: { nome: 'Fine settimana', giorni: ['ven', 'sab', 'dom'], copre: 'venerdì → domenica' },
}
export function infoFrutta(giro) {
  return INFO_FRUTTA[giro]
}

// Somma le quantità usate per prodotto, nei giorni indicati, per entrambi i profili.
// Gli ingredienti sono annidati dentro le preparazioni.
function totaliPerGiorni(settimana, giorni) {
  const dati = colazioni[String(settimana)] ?? {}
  const somma = {}
  for (const g of giorni) {
    const giorno = dati[g]
    if (!giorno) continue
    // Itera per chiave profilo (flavio/david) per applicare le porzioni: David è
    // condiviso con Lena → le sue quantità contano doppio nella spesa.
    for (const [pid, colazione] of Object.entries(giorno)) {
      const porzioni = PORZIONI[pid] ?? 1
      for (const prep of colazione.preparazioni ?? []) {
        for (const ing of prep.ingredienti ?? []) {
          if (!ing.prodotto) continue
          const q = ing.g ?? ing.n
          if (!q) continue
          somma[ing.prodotto] = (somma[ing.prodotto] ?? 0) + q * porzioni
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
    }
  }

  const qConMargine = conMargine(qUsata)
  const aNumero = p.unita === 'uova' || p.unita === 'pezzi'

  let quantita
  if (aNumero) {
    const confezioni = p.confezione ? Math.max(1, Math.ceil(qConMargine / p.confezione)) : null
    quantita = confezioni
      ? `N°${qConMargine} · ${confezioni} ${confezioni > 1 ? 'confezioni' : 'confezione'} da ${p.confezione}`
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
  }
}

function righeDa(somma, filtro) {
  return Object.entries(somma)
    .map(([key, q]) => rigaProdotto(key, q))
    .filter(filtro)
    .sort((a, b) => a.nome.localeCompare(b.nome, 'it'))
}

// Supermercato MPREIS (una volta a settimana): fornitore specialita_di_parma, su tutti i 7 giorni.
export function spesaSupermercato(settimana) {
  const somma = totaliPerGiorni(settimana, TUTTI_GIORNI)
  return righeDa(somma, (r) => r.fornitore === 'specialita_di_parma')
}

// Prodotti difficili da reperire → Amazon: fornitore online, su tutti i 7 giorni.
export function spesaOnline(settimana) {
  const somma = totaliPerGiorni(settimana, TUTTI_GIORNI)
  return righeDa(somma, (r) => r.fornitore === 'online')
}

// Alimentari sotto casa (a piedi): fornitore mezza_rosetta ESCLUSO il pane (regola fissa),
// su tutti i 7 giorni → tipicamente il latte fresco.
export function spesaAlimentari(settimana) {
  const somma = totaliPerGiorni(settimana, TUTTI_GIORNI)
  return righeDa(somma, (r) => r.fornitore === 'mezza_rosetta' && !r.key.startsWith('pane'))
}

// Frutta e verdura dal fruttivendolo (bus 165): fornitore montagnola, per giro (inizio/fine).
export function spesaFrutta(settimana, giro) {
  const giorni = INFO_FRUTTA[giro]?.giorni ?? []
  const somma = totaliPerGiorni(settimana, giorni)
  return righeDa(somma, (r) => r.fornitore === 'montagnola')
}

// Testo pronto per WhatsApp con la lista frutta/verdura di un giro, da inviare a chi ci va.
export function testoFrutta(settimana, giro) {
  const info = INFO_FRUTTA[giro]
  const righe = spesaFrutta(settimana, giro)
  if (!righe.length) return ''
  const lista = righe.map((r) => `- ${r.nome}: ${r.quantita}`).join('\n')
  return `🍑 Frutta e verdura — ${info.nome} (Settimana ${settimana})\n(Obst & Gemüse Prader, bus 165. Per le colazioni di ${info.copre}. Quantità con +${MARGINE_PERCENTO}%.)\n\n${lista}\n\nGrazie! 🙂`
}
