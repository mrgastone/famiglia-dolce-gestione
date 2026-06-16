import { CalendarDays } from 'lucide-react'
import stagione from '../data/stagione.json'

// Etichetta del mese e città (es. "Giugno 2026 · Roma"), mostrata nelle pagine.
export default function EtichettaStagione({ testo }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-salvia-tenue text-salvia-scuro font-bold text-sm px-3 py-1">
      <CalendarDays size={15} className="shrink-0" />
      {testo ?? stagione.etichetta}
    </span>
  )
}
