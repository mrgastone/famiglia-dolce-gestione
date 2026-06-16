import { useState } from 'react'
import { TriangleAlert } from 'lucide-react'
import profili from '../data/profili.json'
import VideoColazione from './VideoColazione.jsx'
import { titoloPreparazione } from './ProfiloColazione.jsx'
import { ordineGiorni, nomeGiorno } from '../lib/settimana.js'

const SETTIMANE = [1, 2, 3, 4]

// Griglia delle 4 settimane × 7 giorni per un dato mese di colazioni.
// `settimanaCorrente`/`giornoCorrente` servono solo a evidenziare "oggi"
// (per l'archivio si passano null).
export default function GrigliaSettimanale({ datiMese, settimanaCorrente = null, giornoCorrente = null }) {
  const [attiva, setAttiva] = useState(settimanaCorrente ?? 1)
  const datiSettimana = datiMese?.[String(attiva)] ?? {}

  return (
    <div className="space-y-4">
      {/* Schede Settimana 1/2/3/4 */}
      <div className="grid grid-cols-4 gap-2">
        {SETTIMANE.map((n) => {
          const selezionata = attiva === n
          return (
            <button
              key={n}
              onClick={() => setAttiva(n)}
              className={[
                'rounded-2xl py-3 font-display font-bold text-2xl transition-colors',
                selezionata
                  ? 'bg-salvia text-white shadow-card'
                  : 'bg-white text-stone-400 hover:text-salvia-scuro',
              ].join(' ')}
            >
              <span className="block text-[0.65rem] font-sans font-bold uppercase tracking-widest opacity-80">
                Sett.
              </span>
              {n}
            </button>
          )
        })}
      </div>

      {attiva === settimanaCorrente ? (
        <p className="text-center text-salvia-scuro font-semibold text-sm -mt-1">
          Questa è la settimana in corso
        </p>
      ) : null}

      {/* Griglia 7 giorni con entrambi i profili */}
      <div className="space-y-3">
        {ordineGiorni.map((g) => {
          const giorno = datiSettimana[g] ?? {}
          const isOggi = attiva === settimanaCorrente && g === giornoCorrente
          return (
            <div
              key={g}
              className={[
                'rounded-3xl bg-white shadow-card p-4 sm:p-5',
                isOggi ? 'ring-2 ring-salvia' : '',
              ].join(' ')}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-xl font-bold text-stone-700">{nomeGiorno(g)}</h3>
                {isOggi ? (
                  <span className="text-xs font-extrabold text-white bg-salvia rounded-full px-2.5 py-1 tracking-wide">
                    OGGI
                  </span>
                ) : null}
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {profili.map((p) => {
                  const c = giorno[p.id]
                  return (
                    <div
                      key={p.id}
                      className="rounded-2xl p-3"
                      style={{ backgroundColor: `${p.colore}14` }}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: p.colore }}
                        />
                        <span className="font-bold text-sm" style={{ color: p.colore }}>
                          {p.nome}
                        </span>
                      </div>
                      {c ? (
                        <>
                          <p className="font-bold text-stone-800 leading-snug">{c.titolo}</p>

                          <div className="mt-1.5 space-y-1.5">
                            {c.preparazioni.map((prep, pi) => (
                              <div
                                key={pi}
                                className="rounded-lg border px-2 py-1.5"
                                style={{
                                  borderColor: `${p.colore}33`,
                                  backgroundColor: `${p.colore}0a`,
                                }}
                              >
                                {c.preparazioni.length > 1 ? (
                                  <p className="text-[0.7rem] font-bold text-stone-600 mb-0.5">
                                    {titoloPreparazione(prep.etichetta)}
                                  </p>
                                ) : null}
                                <p className="text-stone-600 text-xs leading-snug">
                                  {prep.ingredienti
                                    .map(
                                      (ing) =>
                                        `${ing.nome} ${ing.n != null ? `N°${ing.n}` : `${ing.g} g`}`,
                                    )
                                    .join(' · ')}
                                </p>
                                <VideoColazione prep={prep} colore={p.colore} compact />
                              </div>
                            ))}
                          </div>

                          <p className="text-stone-400 text-xs font-semibold mt-1.5">{c.bevanda}</p>
                          {c.sicurezza ? (
                            <p className="text-red-600 text-xs font-semibold mt-1 flex items-start gap-1">
                              <TriangleAlert size={13} className="mt-0.5 shrink-0" />
                              <span>{c.sicurezza}</span>
                            </p>
                          ) : null}
                        </>
                      ) : (
                        <p className="text-stone-400 text-sm">—</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
