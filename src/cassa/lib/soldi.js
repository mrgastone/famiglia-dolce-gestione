// Importi gestiti in CENTESIMI (interi) per evitare errori in virgola mobile.

export function parseEuroToCent(valore) {
  if (typeof valore === 'number') return Math.round(valore * 100)
  const pulito = String(valore)
    .replace(/[^0-9,.-]/g, '')
    .replace(/\.(?=\d{3}(\D|$))/g, '') // togli i punti delle migliaia
    .replace(',', '.')
  const n = parseFloat(pulito)
  if (!Number.isFinite(n)) return NaN
  return Math.round(n * 100)
}

const fmtEuro = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' })
export function formattaEuro(cent) {
  return fmtEuro.format((cent || 0) / 100)
}

export function meseCorrente(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function meseDi(iso) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function dataLeggibile(iso) {
  return new Date(iso).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function oraLeggibile(iso) {
  return new Date(iso).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
}

export function nomeMese(meseIso = meseCorrente()) {
  const [a, m] = meseIso.split('-').map(Number)
  return new Date(a, m - 1, 1).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })
}
