import { NavLink } from 'react-router-dom'
import { vistePrincipali } from '../config/moduli.js'

// Navigazione in basso, grande e tappabile (pensata per iPad/iPhone).
// Le voci sono generate dalle viste del modulo attivo (vedi config/moduli.js).
export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-20 bg-white/95 backdrop-blur border-t border-stone-200/70 shadow-nav safe-bottom">
      <ul className="max-w-5xl mx-auto flex">
        {vistePrincipali.map((vista) => {
          const Icona = vista.icona
          return (
            <li key={vista.id} className="flex-1">
              <NavLink
                to={vista.path}
                end={vista.path === '/'}
                className="flex flex-col items-center justify-center gap-1 pt-2.5 pb-1.5 select-none"
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={[
                        'flex items-center justify-center rounded-2xl transition-all duration-200 w-16 h-9',
                        isActive ? 'bg-salvia-tenue text-salvia-scuro' : 'text-stone-400',
                      ].join(' ')}
                    >
                      <Icona size={26} strokeWidth={2.2} />
                    </span>
                    <span
                      className={[
                        'text-[0.8rem] font-bold leading-none',
                        isActive ? 'text-salvia-scuro' : 'text-stone-400',
                      ].join(' ')}
                    >
                      {vista.nome}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
