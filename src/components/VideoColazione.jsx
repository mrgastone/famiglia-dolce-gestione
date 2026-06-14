import { MonitorPlay } from 'lucide-react'

// Pulsante che apre una ricerca YouTube per la ricetta della colazione,
// così la governante può vedere un video su come si prepara.
// (Ricerca anziché video incorporato: link sempre valido, mai "rotto".)
export default function VideoColazione({ titolo, compact = false }) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${titolo} ricetta come si prepara`,
  )}`

  if (compact) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 text-red-600 font-bold text-xs mt-1.5"
      >
        <MonitorPlay size={15} strokeWidth={2.4} /> Video
      </a>
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-50 text-red-600 font-bold px-4 py-3 border border-red-100 active:scale-95 transition-transform"
    >
      <MonitorPlay size={22} strokeWidth={2.2} /> Guarda su YouTube come si prepara
    </a>
  )
}
