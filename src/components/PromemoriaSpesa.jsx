import { useState } from 'react'
import { ShoppingBasket, X } from 'lucide-react'
import { chiaveGiorno } from '../lib/settimana.js'
import { infoFrutta } from '../lib/spesaSettimanale.js'

// Promemoria in-app: nei giorni di spesa (martedì e venerdì) ricorda di comprare
// frutta e verdura fresca. È un banner mostrato quando l'app è aperta: affidabile
// ovunque, senza permessi. Per una notifica vera anche ad app CHIUSA serve il push
// (vedi nota per Flavio: richiede iOS 16.4+, app installata e un piccolo server).
const GIORNO_GIRO = { mar: 'martedi', ven: 'venerdi' }

export default function PromemoriaSpesa() {
  const giro = GIORNO_GIRO[chiaveGiorno()]
  const [chiuso, setChiuso] = useState(false)
  if (!giro || chiuso) return null
  const info = infoFrutta(giro)

  return (
    <div className="rounded-3xl bg-terracotta text-white shadow-card p-4 flex items-start gap-3">
      <ShoppingBasket size={24} strokeWidth={2.3} className="shrink-0 mt-0.5" />
      <div className="flex-1 leading-snug">
        <p className="font-bold">Oggi è {info.nome.toLowerCase()}: giorno di spesa!</p>
        <p className="text-white/90 text-sm mt-0.5">
          Prendi frutta e verdura fresca (Obst &amp; Gemüse Prader, bus 165) per le colazioni di{' '}
          {info.copre}.
        </p>
      </div>
      <button onClick={() => setChiuso(true)} className="shrink-0 text-white/80 p-1" aria-label="Chiudi promemoria">
        <X size={18} />
      </button>
    </div>
  )
}
