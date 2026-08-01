import { MonitorPlay } from 'lucide-react'

// Toglie l'articolo iniziale: "lo yogurt con frutta" → "yogurt con frutta"
function senzaArticolo(etichetta) {
  return etichetta.replace(/^(l'|lo |la |le |gli |il |i )/i, '').trim()
}

// Query YouTube più pertinente: base (senza articolo) + ingredienti DISTINTIVI non
// già citati nel titolo (es. "yogurt con frutta e avena" → aggiunge "more, mirtilli")
// + "ricetta colazione". Così i video sono più mirati anche coi titoli generici.
function queryVideo(prep) {
  const base = senzaArticolo(prep.etichetta)
  const baseLow = base.toLowerCase()
  const extra = (prep.ingredienti ?? [])
    .map((i) => i.nome.replace(/\(.*?\)/g, '').trim()) // toglie le note tra parentesi
    // scarta acqua/olio (non definiscono la ricetta) e ciò che è già nel titolo
    .filter((n) => n && !/^(acqua|olio)/i.test(n) && !baseLow.includes(n.toLowerCase().split(' ')[0]))
    .slice(0, 2)
    .join(' ')
  return `${base}${extra ? ' ' + extra : ''} ricetta colazione`.replace(/\s+/g, ' ').trim()
}

// Link video per UNA preparazione, allineato a sinistra, nel colore della persona.
// Apre la ricerca YouTube della ricetta (link sempre valido, mai "rotto").
export default function VideoColazione({ prep, colore, compact = false }) {
  if (!prep) return null

  const verbo = prep.plurale ? 'preparano' : 'prepara'
  const testo = `Guarda come si ${verbo} ${prep.etichetta}`
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(queryVideo(prep))}`

  if (compact) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-start gap-1 font-bold text-xs text-left max-w-full"
        style={{ color: colore }}
      >
        <MonitorPlay size={14} strokeWidth={2.4} className="shrink-0" />
        <span>{testo}</span>
      </a>
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 self-start max-w-full rounded-xl px-3 py-2 font-bold text-sm border text-left leading-snug active:scale-95 transition-transform"
      style={{ color: colore, borderColor: `${colore}55`, backgroundColor: `${colore}14` }}
    >
      <MonitorPlay size={18} strokeWidth={2.2} className="shrink-0" />
      <span>{testo}</span>
    </a>
  )
}
