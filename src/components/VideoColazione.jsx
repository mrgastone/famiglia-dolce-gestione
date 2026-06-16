import { MonitorPlay } from 'lucide-react'

// Link video per UNA preparazione, allineato a sinistra, nel colore della persona.
// Apre la ricerca YouTube della ricetta (link sempre valido, mai "rotto").
export default function VideoColazione({ prep, colore, compact = false }) {
  if (!prep) return null

  const verbo = prep.plurale ? 'preparano' : 'prepara'
  const testo = `Guarda come si ${verbo} ${prep.etichetta}`
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `come si ${verbo} ${prep.etichetta} ricetta`,
  )}`

  if (compact) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 font-bold text-xs text-left"
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
      className="inline-flex items-center gap-2 self-start rounded-xl px-3 py-2 font-bold text-sm border text-left active:scale-95 transition-transform"
      style={{ color: colore, borderColor: `${colore}55`, backgroundColor: `${colore}14` }}
    >
      <MonitorPlay size={18} strokeWidth={2.2} className="shrink-0" />
      <span>{testo}</span>
    </a>
  )
}
