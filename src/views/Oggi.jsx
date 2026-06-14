import { CalendarDays } from 'lucide-react'
import profili from '../data/profili.json'
import colazioni from '../data/colazioni.json'
import stagione from '../data/stagione.json'
import ProfiloColazione from '../components/ProfiloColazione.jsx'
import { settimanaDelCiclo, chiaveGiorno, nomeGiorno, dataLeggibile } from '../lib/settimana.js'

export default function Oggi() {
  const oggi = new Date()
  const settimana = settimanaDelCiclo(oggi)
  const giorno = chiaveGiorno(oggi)
  const colazioniOggi = colazioni[String(settimana)]?.[giorno] ?? {}

  return (
    <section className="space-y-5">
      {/* Data odierna + settimana del ciclo */}
      <div className="rounded-3xl bg-white shadow-card p-5 sm:p-6">
        <p className="text-stone-500 font-semibold capitalize">{dataLeggibile(oggi)}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-salvia-scuro">
          <CalendarDays size={24} strokeWidth={2.2} className="shrink-0" />
          <span className="font-display text-2xl sm:text-3xl font-bold">
            Settimana {settimana}
          </span>
          <span className="text-stone-400 font-bold text-2xl sm:text-3xl">·</span>
          <span className="font-display text-2xl sm:text-3xl font-bold">{nomeGiorno(giorno)}</span>
        </div>
        <p className="text-stone-400 text-sm font-semibold mt-1">{stagione.etichetta}</p>
      </div>

      {/* Due card affiancate (in colonna su mobile) */}
      <div className="grid gap-4 sm:grid-cols-2">
        {profili.map((profilo) => (
          <ProfiloColazione
            key={profilo.id}
            profilo={profilo}
            colazione={colazioniOggi[profilo.id]}
          />
        ))}
      </div>
    </section>
  )
}
