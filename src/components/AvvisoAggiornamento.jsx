import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Leaf, ShoppingBasket } from 'lucide-react'
import avviso from '../data/avviso.json'

// Pop-up informativo all'apertura dell'app, attivo solo tra `dal` e `fino` (date locali,
// estremi inclusi) definiti in src/data/avviso.json. Si mostra una volta al giorno per
// dispositivo: chiuso con un bottone, ricompare solo il giorno dopo (se ancora nel periodo).
// Per un nuovo avviso basta cambiare `id`, date e testi nel JSON.

function oggiLocale() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

const chiave = (giorno) => `famigliaDolce.avviso.${avviso.id}.${giorno}`

function giaVistoOggi(giorno) {
  try {
    return window.localStorage.getItem(chiave(giorno)) === '1'
  } catch {
    return false
  }
}

function segnaVisto(giorno) {
  try {
    window.localStorage.setItem(chiave(giorno), '1')
  } catch {
    // Safari privato può negare localStorage: l'avviso riapparirà, pazienza
  }
}

export default function AvvisoAggiornamento() {
  const navigate = useNavigate()
  const okRef = useRef(null)
  const [aperto, setAperto] = useState(() => {
    const g = oggiLocale()
    return Boolean(avviso.attivo) && g >= avviso.dal && g <= avviso.fino && !giaVistoOggi(g)
  })

  function chiudi() {
    segnaVisto(oggiLocale())
    setAperto(false)
  }

  useEffect(() => {
    if (!aperto) return
    okRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') chiudi()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [aperto])

  if (!aperto) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="avviso-titolo"
    >
      <div className="w-full max-w-md rounded-3xl bg-crema shadow-card overflow-hidden">
        <div className="bg-salvia text-white px-5 py-4 flex items-center gap-3">
          <span className="flex items-center justify-center w-11 h-11 rounded-2xl bg-white/20 shrink-0">
            <Leaf size={24} strokeWidth={2.2} />
          </span>
          <h2 id="avviso-titolo" className="font-display text-xl font-bold leading-tight">
            {avviso.titolo}
          </h2>
        </div>

        <div className="px-5 py-4 space-y-3">
          <p className="text-stone-700 leading-snug">{avviso.testo}</p>
          <p className="text-stone-800 font-bold leading-snug bg-salvia-tenue rounded-2xl px-3 py-2">
            {avviso.invito}
          </p>
        </div>

        <div className="px-5 pb-5 flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => {
              chiudi()
              navigate('/spesa')
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-salvia-scuro font-bold px-4 py-3 border-2 border-salvia/40 active:scale-95 transition-transform"
          >
            <ShoppingBasket size={20} /> {avviso.bottoneSpesa}
          </button>
          <button
            ref={okRef}
            onClick={chiudi}
            className="flex-1 rounded-2xl bg-salvia text-white font-bold px-4 py-3 active:scale-95 transition-transform"
          >
            {avviso.bottoneOk}
          </button>
        </div>
      </div>
    </div>
  )
}
