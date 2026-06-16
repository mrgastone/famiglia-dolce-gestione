import { MonitorPlay } from 'lucide-react'

// Un link per ogni "cosa da preparare" della colazione (es. il frullato, gli albumi).
// Apre la ricerca YouTube della ricetta (link sempre valido, mai "rotto").
// Il testo usa il colore assegnato alla persona (Flavio terracotta, David azzurro).
export default function VideoColazione({ preparazioni, colore, compact = false }) {
  if (!preparazioni?.length) return null

  const link = (prep) => {
    const verbo = prep.plurale ? 'preparano' : 'prepara'
    return {
      testo: `Guarda come si ${verbo} ${prep.etichetta}`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(
        `come si ${verbo} ${prep.etichetta} ricetta`,
      )}`,
    }
  }

  if (compact) {
    return (
      <div className="mt-1.5 flex flex-col gap-1">
        {preparazioni.map((prep, i) => {
          const { testo, url } = link(prep)
          return (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-bold text-xs"
              style={{ color: colore }}
            >
              <MonitorPlay size={14} strokeWidth={2.4} className="shrink-0" />
              <span>{testo}</span>
            </a>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {preparazioni.map((prep, i) => {
        const { testo, url } = link(prep)
        return (
          <a
            key={i}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 font-bold border active:scale-95 transition-transform"
            style={{ color: colore, borderColor: `${colore}55`, backgroundColor: `${colore}14` }}
          >
            <MonitorPlay size={20} strokeWidth={2.2} className="shrink-0" />
            <span>{testo}</span>
          </a>
        )
      })}
    </div>
  )
}
