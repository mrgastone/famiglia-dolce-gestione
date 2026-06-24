import { formattaEuro } from '../lib/soldi.js'

// Grafico a ciambella delle spese del mese, diviso per categoria.
// `dati`: [{ nome, colore, valore (in centesimi) }]
export default function GraficoCategorie({ dati, totaleCent, etichetta = 'Spese del mese' }) {
  const totale = dati.reduce((s, d) => s + d.valore, 0)
  const R = 70
  const C = 2 * Math.PI * R
  const sw = 26

  let acc = 0
  const segmenti =
    totale > 0
      ? dati
          .filter((d) => d.valore > 0)
          .map((d) => {
            const len = (d.valore / totale) * C
            const seg = { colore: d.colore, len, off: acc }
            acc += len
            return seg
          })
      : []

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: 180, height: 180 }}>
        <svg width="180" height="180" viewBox="0 0 180 180">
          <circle cx="90" cy="90" r={R} fill="none" stroke="#EAE3D8" strokeWidth={sw} />
          {segmenti.map((s, i) => (
            <circle
              key={i}
              cx="90"
              cy="90"
              r={R}
              fill="none"
              stroke={s.colore}
              strokeWidth={sw}
              strokeDasharray={`${s.len} ${C}`}
              strokeDashoffset={-s.off}
              transform="rotate(-90 90 90)"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-stone-400 text-xs font-semibold">{etichetta}</span>
          <span className="font-display font-bold text-2xl text-stone-800">
            {formattaEuro(totaleCent)}
          </span>
        </div>
      </div>

      <ul className="mt-4 w-full space-y-1.5">
        {dati.map((d) => (
          <li key={d.nome} className="flex items-center gap-2 text-sm">
            <span className="w-3.5 h-3.5 rounded-sm shrink-0" style={{ backgroundColor: d.colore }} />
            <span className="font-semibold text-stone-700">{d.nome}</span>
            <span className="ml-auto font-bold text-stone-600">{formattaEuro(d.valore)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
