import { GlassWater, TriangleAlert, Baby, User } from 'lucide-react'
import VideoColazione from './VideoColazione.jsx'

// "il frullato di fragole e lamponi" → "Frullato di fragole e lamponi"
export function titoloPreparazione(etichetta) {
  const senza = etichetta.replace(/^(l'|lo |la |le |gli |il |i )/i, '')
  return senza.charAt(0).toUpperCase() + senza.slice(1)
}

// Card della colazione di un profilo (vista "Oggi").
export default function ProfiloColazione({ profilo, colazione }) {
  const Icona = profilo.tipo === 'Bambino' ? Baby : User
  const colore = profilo.colore
  const preparazioni = colazione?.preparazioni ?? []
  const piuPreparazioni = preparazioni.length > 1

  return (
    <article className="rounded-3xl bg-white shadow-card overflow-hidden flex flex-col">
      {/* Intestazione profilo */}
      <header className="flex items-center gap-3 p-5 pb-3">
        <span
          className="flex items-center justify-center w-12 h-12 rounded-2xl shrink-0 text-white"
          style={{ backgroundColor: colore }}
        >
          <Icona size={26} strokeWidth={2.2} />
        </span>
        <div className="leading-tight">
          <h2 className="font-display text-2xl font-bold" style={{ color: colore }}>
            {profilo.nome}
          </h2>
          <p className="text-stone-400 text-sm font-semibold">{profilo.eta}</p>
        </div>
      </header>

      <div className="px-5 pb-5 flex-1 flex flex-col gap-4">
        {colazione ? (
          <>
            <h3 className="text-xl font-bold text-stone-800 leading-snug">{colazione.titolo}</h3>

            {/* Un riquadro per ogni cosa da preparare */}
            <div className="space-y-3">
              {preparazioni.map((prep, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border-2 p-3.5 flex flex-col"
                  style={{ borderColor: `${colore}33`, backgroundColor: `${colore}0a` }}
                >
                  {piuPreparazioni ? (
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="flex items-center justify-center w-6 h-6 rounded-lg text-white text-sm font-bold shrink-0"
                        style={{ backgroundColor: colore }}
                      >
                        {idx + 1}
                      </span>
                      <h4 className="font-bold text-stone-700">
                        {titoloPreparazione(prep.etichetta)}
                      </h4>
                    </div>
                  ) : null}

                  <ul className="divide-y divide-stone-200/70">
                    {prep.ingredienti.map((ing, i) => (
                      <li key={i} className="flex items-start justify-between gap-3 py-1.5">
                        <span className="flex items-start gap-2.5 text-lg text-stone-700">
                          <span
                            className="mt-2.5 w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: colore }}
                          />
                          <span>{ing.nome}</span>
                        </span>
                        <span className="text-stone-500 font-bold whitespace-nowrap pt-0.5">
                          {ing.n != null ? `N°${ing.n}` : `${ing.g} g`}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Video alla fine della SUA preparazione */}
                  <div className="mt-3">
                    <VideoColazione prep={prep} colore={colore} />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-stone-600">
              <GlassWater size={20} className="text-salvia shrink-0" />
              <span className="font-semibold text-lg">{colazione.bevanda}</span>
            </div>

            {/* Avviso sicurezza: solo se la colazione del giorno ha cibi a rischio */}
            {colazione.sicurezza ? (
              <div className="rounded-2xl bg-red-50 border-2 border-red-300 p-4 flex gap-3">
                <TriangleAlert size={26} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold text-red-700 uppercase text-sm tracking-wide">
                    Sicurezza · anti-soffocamento
                  </p>
                  <p className="text-red-700 mt-1 leading-snug font-medium">{colazione.sicurezza}</p>
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <p className="text-stone-400">Nessuna colazione prevista per oggi.</p>
        )}
      </div>
    </article>
  )
}
