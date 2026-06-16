import colazioni from '../data/colazioni.json'
import GrigliaSettimanale from '../components/GrigliaSettimanale.jsx'
import EtichettaStagione from '../components/EtichettaStagione.jsx'
import { settimanaDelCiclo, chiaveGiorno } from '../lib/settimana.js'

export default function Settimane() {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="font-display text-xl font-bold text-stone-700">Le 4 settimane</h2>
        <EtichettaStagione />
      </div>

      <GrigliaSettimanale
        datiMese={colazioni}
        settimanaCorrente={settimanaDelCiclo()}
        giornoCorrente={chiaveGiorno()}
      />
    </section>
  )
}
