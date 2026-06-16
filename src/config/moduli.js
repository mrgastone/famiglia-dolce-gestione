import { Sun, CalendarDays, ShoppingBasket, Archive, Coffee, Wallet, Sparkles } from 'lucide-react'

// ───────────────────────────────────────────────────────────────────────────
// Architettura modulare.
// Ogni "modulo" è un'area dell'app. Per ora è attivo SOLO il modulo "Colazioni".
// Per aggiungere in futuro un nuovo modulo (es. Cassa, Pulizie) SENZA
// rifattorizzare: porta il modulo a { attivo: true }, definisci le sue "viste"
// con i relativi path e aggiungi le rotte corrispondenti in App.jsx.
// La navigazione in basso viene generata automaticamente dalle viste del
// modulo attivo.
// ───────────────────────────────────────────────────────────────────────────
export const moduli = [
  {
    id: 'colazioni',
    nome: 'Colazioni',
    icona: Coffee,
    attivo: true,
    viste: [
      { id: 'oggi', nome: 'Oggi', icona: Sun, path: '/' },
      { id: 'settimane', nome: 'Settimane', icona: CalendarDays, path: '/settimane' },
      { id: 'spesa', nome: 'Spesa', icona: ShoppingBasket, path: '/spesa' },
      { id: 'archivio', nome: 'Archivio', icona: Archive, path: '/archivio' },
    ],
  },
  {
    id: 'cassa',
    nome: 'Cassa',
    icona: Wallet,
    attivo: false,
    viste: [],
  },
  {
    id: 'pulizie',
    nome: 'Pulizie',
    icona: Sparkles,
    attivo: false,
    viste: [],
  },
]

// Modulo attualmente attivo (in futuro potrà essere selezionabile).
export const moduloAttivo = moduli.find((m) => m.attivo) ?? moduli[0]

// Viste mostrate nella navigazione in basso.
export const vistePrincipali = moduloAttivo.viste
