import { CakeSlice, Cherry } from 'lucide-react'
import { moduloAttivo } from '../config/moduli.js'

export default function Header() {
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

        <div className="leading-tight">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-salvia-scuro tracking-tight">
            Famiglia Dolce
          </h1>
          <p className="text-stone-500 font-semibold text-sm sm:text-base -mt-0.5">
            {moduloAttivo.nome}
          </p>
        </div>
      </div>
    </header>
  )
}
