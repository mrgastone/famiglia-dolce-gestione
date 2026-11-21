import { useState } from 'react'
import GrigliaSettimanale from '../components/GrigliaSettimanale.jsx'
import EtichettaStagione from '../components/EtichettaStagione.jsx'
import { settimanaDelCiclo, chiaveGiorno, dataBreve } from '../lib/settimana.js'
import { menuAttivo } from '../lib/menuAttivo.js'
import { dataLocale } from '../lib/sceltaMenu.js'

export default function Settimane() {
  const oggi = new Date()
  const menu = menuAttivo(oggi)
  const [vista, setVista] = useState('corrente')
  // Se il mese dopo è già pronto (src/data/prossimo/), si può vedere in anteprima.
  const anteprima = vista === 'prossimo' && menu.prossimo ? menu.prossimo : null
  const dalGiorno = menu.prossimo ? dataBreve(dataLocale(menu.prossimo.stagione.inizioCiclo)) : ''

  const schede = menu.prossimo
    ? [
        { id: 'corrente', testo: menu.stagione.etichetta, nota: 'in corso' },
        { id: 'prossimo', testo: menu.prossimo.stagione.etichetta, nota: `dal ${dalGiorno}` },
      ]
    : []

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="font-display text-xl font-bold text-stone-700">Le 4 settimane</h2>
        <EtichettaStagione testo={anteprima?.stagione.etichetta} />
      </div>

      {schede.length ? (
        <div className="flex flex-wrap gap-2">
          {schede.map((s) => {
            const selezionata = vista === s.id
            return (
              <button
                key={s.id}
                onClick={() => setVista(s.id)}
                className={[
                  'rounded-2xl px-4 py-2.5 font-bold transition-colors',
                  selezionata ? 'bg-salvia text-white shadow-card' : 'bg-white text-stone-500',
                ].join(' ')}
              >
                {s.testo}
                <span className="opacity-80 font-semibold"> · {s.nota}</span>
              </button>
            )
          })}
        </div>
      ) : null}

      {anteprima ? (
        <p className="text-stone-500 text-sm rounded-2xl bg-salvia-tenue px-4 py-3 leading-snug">
          <span className="font-bold text-salvia-scuro">Anteprima.</span> Queste colazioni partono da sole{' '}
          <span className="font-semibold">lunedì {dalGiorno}</span>: da quel giorno «Oggi» e la spesa
          useranno questo menù.
        </p>
      ) : null}

      <GrigliaSettimanale
        key={anteprima ? 'prossimo' : 'corrente'}
        datiMese={anteprima ? anteprima.colazioni : menu.colazioni}
        settimanaCorrente={anteprima ? null : settimanaDelCiclo(oggi)}
        giornoCorrente={anteprima ? null : chiaveGiorno(oggi)}
        inizioCiclo={anteprima ? anteprima.stagione.inizioCiclo : menu.stagione.inizioCiclo}
      />
    </section>
  )
}
