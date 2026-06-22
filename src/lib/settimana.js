import stagione from '../data/stagione.json'

// Regola fissa: per semplificare preparazioni e spesa, le colazioni si ripetono a coppie.
// Settimana 2 = Settimana 1, Settimana 4 = Settimana 3 (così ogni colazione si fa 2 volte).
export const SETTIMANE_UGUALI = { 2: 1, 4: 3 }

// Chiavi giorno usate nei dati (lun..dom), indicizzate per Date.getDay() (0 = domenica)
const GIORNI_DA_GETDAY = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab']

const NOMI_GIORNI = {
  lun: 'Lunedì',
  mar: 'Martedì',
  mer: 'Mercoledì',
  gio: 'Giovedì',
  ven: 'Venerdì',
  sab: 'Sabato',
  dom: 'Domenica',
}

// Ordine di visualizzazione (lunedì → domenica)
export const ordineGiorni = ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom']

function aMezzanotte(data) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate())
}

// Numero di settimana del ciclo (1..4), a rotazione a partire da stagione.inizioCiclo.
export function settimanaDelCiclo(oggi = new Date()) {
  const inizio = aMezzanotte(new Date(stagione.inizioCiclo))
  const giorno = aMezzanotte(oggi)
  const giorniTrascorsi = Math.floor((giorno - inizio) / 86400000)
  const settimaneTrascorse = Math.floor(giorniTrascorsi / 7)
  // modulo "positivo" così funziona anche prima della data di inizio
  const indice = ((settimaneTrascorse % 4) + 4) % 4
  return indice + 1
}

// Chiave del giorno corrente (es. "dom")
export function chiaveGiorno(oggi = new Date()) {
  return GIORNI_DA_GETDAY[oggi.getDay()]
}

// Nome esteso del giorno (es. "Domenica")
export function nomeGiorno(chiave) {
  return NOMI_GIORNI[chiave] ?? chiave
}

// Data leggibile in italiano (es. "domenica 14 giugno 2026")
export function dataLeggibile(oggi = new Date()) {
  return oggi.toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
