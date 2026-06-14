import { GlassWater, TriangleAlert, Baby, User } from 'lucide-react'
import VideoColazione from './VideoColazione.jsx'

// Card della colazione di un profilo (usata nella vista "Oggi").
export default function ProfiloColazione({ profilo, colazione }) {
  const Icona = profilo.tipo === 'Bambino' ? Baby : User
  const colore = profilo.colore

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

            {/* Ingredienti con i grammi a fianco */}
            <ul className="divide-y divide-stone-100">
              {colazione.ingredienti.map((ing, i) => (
                <li key={i} className="flex items-start justify-between gap-3 py-1.5">
                  <span className="flex items-start gap-2.5 text-lg text-stone-700">
                    <span
                      className="mt-2.5 w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: colore }}
                    />
                    <span>{ing.nome}</span>
                  </span>
                  <span className="text-stone-500 font-bold whitespace-nowrap pt-0.5">
                    {ing.g} g
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2 text-stone-600">
              <GlassWater size={20} className="text-salvia shrink-0" />
              <span className="font-semibold text-lg">{colazione.bevanda}</span>
            </div>

            {/* Avviso sicurezza: SOLO se la colazione del giorno ha cibi a rischio */}
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

            <div className="mt-auto pt-1">
              <VideoColazione titolo={colazione.titolo} />
            </div>
          </>
        ) : (
          <p className="text-stone-400">Nessuna colazione prevista per oggi.</p>
        )}
      </div>
    </article>
  )
}
