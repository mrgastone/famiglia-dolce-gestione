import { CakeSlice, Cherry, Wallet, LogOut } from 'lucide-react'
import { moduloAttivo } from '../config/moduli.js'
import { useSessioneCassa } from '../lib/sessioneCassa.js'

const BASE = import.meta.env.BASE_URL

export default function Header() {
  const { attiva, esci } = useSessioneCassa()

  return (
    <header className="safe-top sticky top-0 z-10 bg-crema/90 backdrop-blur border-b border-stone-200/60">
      <div className="max-w-5xl mx-auto px-4 py-3 sm:py-4 flex items-center gap-3">
        {/* Logo: un dolce */}
        <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-terracotta-tenue text-terracotta shrink-0">
          <CakeSlice size={26} strokeWidth={2.2} />
          <Cherry
            size={16}
            strokeWidth={2.2}
            className="absolute -bottom-1 -right-1 text-salvia bg-crema rounded-full p-0.5 box-content"
          />
        </div>

        <div className="leading-tight min-w-0">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-salvia-scuro tracking-tight truncate">
            Famiglia Dolce
          </h1>
          <p className="text-stone-500 font-semibold text-sm sm:text-base -mt-0.5 truncate">
            {moduloAttivo.nome}
          </p>
        </div>

        {/* Stessa posizione e stesso stile dell'header della Cassa */}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <a
            href={`${BASE}cassa.html`}
            className="inline-flex items-center gap-1.5 text-stone-500 font-semibold text-sm bg-white rounded-full px-3 py-1.5 shadow-card"
          >
            <Wallet size={16} /> <span className="hidden sm:inline">Cassa</span>
          </a>
          {/* "Esci" chiude la sessione della Cassa (condivisa): compare solo se c'è */}
          {attiva ? (
            <button
              onClick={esci}
              className="inline-flex items-center gap-1.5 text-stone-500 font-semibold text-sm bg-white rounded-full px-3 py-1.5 shadow-card"
              aria-label="Esci"
            >
              <LogOut size={16} /> <span className="hidden sm:inline">Esci</span>
            </button>
          ) : null}
        </div>
      </div>
    </header>
  )
}
