import { useState } from 'react'
import { Archive } from 'lucide-react'
import archivio from '../data/archivio.json'
import colazioniCorrenti from '../data/colazioni.json'
import stagione from '../data/stagione.json'
import GrigliaSettimanale from '../components/GrigliaSettimanale.jsx'

// Archivio storico: mese in corso + mesi precedenti (ultimi 6), consultabili.
// `archivio.json` contiene le voci passate: { id, etichetta, citta, colazioni }.
export default function Archivio() {
  const corrente = {
    id: 'corrente',
    etichetta: stagione.etichetta,
    colazioni: colazioniCorrenti,
    inCorso: true,
  }
  const mesi = [corrente, ...archivio]
  const [selId, setSelId] = useState('corrente')
  const sel = mesi.find((m) => m.id === selId) ?? corrente

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-salvia-tenue text-salvia-scuro shrink-0">
          <Archive size={20} strokeWidth={2.2} />
        </span>
        <h2 className="font-display text-xl font-bold text-stone-700">Archivio colazioni</h2>
      </div>
      <p className="text-stone-500 text-sm -mt-1">
        Consulta i mesi passati: lo storico di tutto quello che abbiamo mangiato (ultimi 6 mesi).
      </p>

      {/* Selettore del mese */}
      <div className="flex flex-wrap gap-2">
        {mesi.map((m) => {
          const selezionato = m.id === selId
          return (
            <button
              key={m.id}
              onClick={() => setSelId(m.id)}
              className={[
                'rounded-2xl px-4 py-2.5 font-bold transition-colors',
                selezionato ? 'bg-salvia text-white shadow-card' : 'bg-white text-stone-500',
              ].join(' ')}
            >
              {m.etichetta}
              {m.inCorso ? <span className="opacity-80 font-semibold"> · in corso</span> : null}
            </button>
          )
        })}
      </div>

      {archivio.length === 0 ? (
        <p className="text-stone-400 text-sm rounded-2xl bg-white shadow-card p-4">
          Ancora nessun mese archiviato. Il mese in corso ({stagione.etichetta}) entrerà
          nell'archivio quando genereremo il mese successivo. Verranno conservati gli ultimi 6 mesi.
        </p>
      ) : null}

      {/* Griglia delle colazioni del mese selezionato */}
      <GrigliaSettimanale key={sel.id} datiMese={sel.colazioni} />
    </section>
  )
}
