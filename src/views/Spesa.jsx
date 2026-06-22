import { useState } from 'react'
import {
  Footprints,
  Store,
  Egg,
  Croissant,
  ShoppingBasket,
  Copy,
  Check,
  ExternalLink,
  Clock,
} from 'lucide-react'
import spesa from '../data/spesa.json'
import stagione from '../data/stagione.json'
import EtichettaStagione from '../components/EtichettaStagione.jsx'
import {
  SPESE,
  infoSpesa,
  spesaRaggruppata,
  testoMontagnola,
  MARGINE_PERCENTO,
} from '../lib/spesaSettimanale.js'
import { settimanaDelCiclo, SETTIMANE_UGUALI } from '../lib/settimana.js'

const SETTIMANE = [1, 2, 3, 4]

const FORNITORI_META = {
  montagnola: { icona: Store, nome: 'Mercato della Montagnola', tipo: 'Frutta e verdura freschi' },
  specialita_di_parma: { icona: Egg, nome: 'Specialità di Parma', tipo: 'Uova (anche per gli albumi)' },
  mezza_rosetta: { icona: Croissant, nome: 'Forno Mezza Rosetta', tipo: 'Pane' },
  online: { icona: ShoppingBasket, nome: 'Online', tipo: 'Amazon Fresh · Esselunga' },
}

// ── Bottone "Copia" con feedback ────────────────────────────────────────────
function BottoneCopia({ testo, etichetta }) {
  const [copiato, setCopiato] = useState(false)
  async function copia() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(testo)
      } else {
        const ta = document.createElement('textarea')
        ta.value = testo
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      setCopiato(true)
      setTimeout(() => setCopiato(false), 2000)
    } catch {
      setCopiato(false)
    }
  }
  return (
    <button
      onClick={copia}
      className="inline-flex items-center gap-2 rounded-2xl bg-salvia text-white font-bold px-4 py-3 active:scale-95 transition-transform"
    >
      {copiato ? <Check size={20} /> : <Copy size={20} />}
      {copiato ? 'Copiato!' : etichetta}
    </button>
  )
}

// ── Riga prodotto calcolato ─────────────────────────────────────────────────
function RigaSpesa({ riga, conLink }) {
  return (
    <li className="py-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-semibold text-stone-800">{riga.nome}</span>
        <span
          className={`font-bold text-sm text-right ${
            riga.giaDisponibile ? 'text-stone-400 italic' : 'text-salvia-scuro'
          }`}
        >
          {riga.quantita}
        </span>
      </div>
      {!riga.giaDisponibile ? (
        <div className="flex items-center gap-1.5 text-stone-400 text-xs mt-0.5">
          <Clock size={12} className="shrink-0" />
          <span>{riga.scadenza}</span>
        </div>
      ) : null}
      {conLink && !riga.giaDisponibile ? (
        <div className="flex flex-wrap gap-2 mt-1.5">
          <a
            href={riga.amazon}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-stone-100 text-stone-700 font-semibold text-xs px-2.5 py-1.5"
          >
            Cerca su Amazon <ExternalLink size={13} />
          </a>
          <a
            href={riga.amazonFresh}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-stone-100 text-stone-700 font-semibold text-xs px-2.5 py-1.5"
          >
            Cerca su Amazon Fresh <ExternalLink size={13} />
          </a>
          <a
            href={riga.esselunga}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-stone-100 text-stone-700 font-semibold text-xs px-2.5 py-1.5"
          >
            Cerca su Esselunga <ExternalLink size={13} />
          </a>
        </div>
      ) : null}
    </li>
  )
}

// ── Riga fissa (regola fissa: pane, latte alta qualità, ecc.) ───────────────
function RigaFissa({ testo }) {
  return (
    <li className="py-2.5 flex items-baseline justify-between gap-3">
      <span className="font-semibold text-stone-800">{testo}</span>
      <span className="text-[0.7rem] font-bold text-salvia-scuro bg-salvia-tenue rounded-full px-2 py-0.5 shrink-0">
        fisso
      </span>
    </li>
  )
}

// ── Gruppo fornitore ────────────────────────────────────────────────────────
function GruppoFornitore({ fornitoreKey, righe = [], fissi = [], conLink, children }) {
  if (righe.length === 0 && fissi.length === 0) return null
  const meta = FORNITORI_META[fornitoreKey]
  const Icona = meta.icona
  return (
    <div className="mt-4 first:mt-0">
      <div className="flex items-center gap-2 mb-1">
        <Icona size={18} className="text-salvia-scuro shrink-0" />
        <h4 className="font-bold text-stone-700">{meta.nome}</h4>
        <span className="text-stone-400 text-xs">· {meta.tipo}</span>
      </div>
      <ul className="divide-y divide-stone-100">
        {righe.map((r) => (
          <RigaSpesa key={r.key} riga={r} conLink={conLink} />
        ))}
        {fissi.map((f, i) => (
          <RigaFissa key={`f${i}`} testo={f} />
        ))}
      </ul>
      {children ? <div className="mt-3">{children}</div> : null}
    </div>
  )
}

// ── Una lista della spesa (Martedì o Venerdì) ───────────────────────────────
function ListaSpesa({ settimana, spesaKey }) {
  const info = infoSpesa(spesaKey)
  const gruppi = spesaRaggruppata(settimana, spesaKey)
  return (
    <div className="rounded-3xl bg-white shadow-card p-5">
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-salvia text-white font-display font-bold shrink-0">
          {info.giorno[0]}
        </span>
        <h3 className="font-display text-xl font-bold text-stone-800">Spesa di {info.giorno}</h3>
      </div>
      <p className="text-stone-500 text-sm mt-1">
        Serve per le colazioni di <span className="font-semibold text-stone-600">{info.copre}</span>.
      </p>

      {/* Mercato: con il pulsante "Copia" subito sotto (da inviare al mercato) */}
      <GruppoFornitore fornitoreKey="montagnola" righe={gruppi.montagnola}>
        <BottoneCopia
          testo={testoMontagnola(settimana, spesaKey)}
          etichetta={`Copia lista mercato di ${info.giorno}`}
        />
      </GruppoFornitore>

      {/* Specialità di Parma: uova calcolate + prodotti fissi */}
      <GruppoFornitore
        fornitoreKey="specialita_di_parma"
        righe={gruppi.specialita_di_parma}
        fissi={spesa.specialita_di_parma.fissi}
      />

      {/* Mezza Rosetta: regola fissa (pane integrale + ai cereali + pizzetta) */}
      <GruppoFornitore fornitoreKey="mezza_rosetta" fissi={spesa.mezza_rosetta.fissi} />

      {/* Online: con i link "Cerca su…" */}
      <GruppoFornitore fornitoreKey="online" righe={gruppi.online} conLink />
    </div>
  )
}

export default function Spesa() {
  const [settimana, setSettimana] = useState(settimanaDelCiclo())
  const { giroUnico, raccomandazioniOnline } = spesa

  return (
    <section className="space-y-5">
      {/* Selettore settimana */}
      <div>
        <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
          <h2 className="font-display text-xl font-bold text-stone-700">Spesa della settimana</h2>
          <EtichettaStagione />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {SETTIMANE.map((n) => (
            <button
              key={n}
              onClick={() => setSettimana(n)}
              className={[
                'rounded-2xl py-3 font-display font-bold text-2xl transition-colors',
                settimana === n
                  ? 'bg-salvia text-white shadow-card'
                  : 'bg-white text-stone-400 hover:text-salvia-scuro',
              ].join(' ')}
            >
              <span className="block text-[0.65rem] font-sans font-bold uppercase tracking-widest opacity-80">
                Sett.
              </span>
              {n}
            </button>
          ))}
        </div>
        <p className="text-stone-400 text-sm mt-2">
          Si va al mercato <span className="font-semibold text-stone-500">martedì e venerdì</span> →
          due liste a settimana, con quantità <span className="font-semibold text-stone-500">+{MARGINE_PERCENTO}%</span>.
          Sono stati scelti tutti i prodotti di stagione in base al mese {stagione.etichetta}.
        </p>
        {SETTIMANE_UGUALI[settimana] ? (
          <p className="text-salvia-scuro text-sm font-semibold mt-1">
            ≡ La spesa della Settimana {settimana} è uguale a quella della Settimana{' '}
            {SETTIMANE_UGUALI[settimana]}.
          </p>
        ) : null}
      </div>

      {/* Giro unico in zona Montagnola */}
      <div className="rounded-3xl bg-salvia text-white shadow-card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-2">
          <Footprints size={24} strokeWidth={2.3} />
          <h2 className="font-display text-2xl font-bold">{giroUnico.titolo}</h2>
        </div>
        <p className="text-white/90 leading-snug mb-4">{giroUnico.descrizione}</p>
        <ol className="space-y-2">
          {giroUnico.tappe.map((t, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/20 font-bold text-sm shrink-0">
                {i + 1}
              </span>
              <span className="leading-snug pt-0.5">
                <span className="font-bold">{t.nome}</span>
                <span className="text-white/85"> — {t.cosa}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* Consigli per la spesa online (verde diverso) */}
      <div className="rounded-3xl bg-salvia-scuro text-white shadow-card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-2">
          <Clock size={24} strokeWidth={2.3} />
          <h2 className="font-display text-2xl font-bold">{raccomandazioniOnline.titolo}</h2>
        </div>
        <p className="text-white/90 leading-snug mb-3">{raccomandazioniOnline.descrizione}</p>
        <ul className="space-y-2">
          {raccomandazioniOnline.punti.map((p, i) => (
            <li key={i} className="flex items-start gap-2 leading-snug">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-white/70 shrink-0" />
              <span className="text-white/90">{p}</span>
            </li>
          ))}
        </ul>
        {raccomandazioniOnline.nota ? (
          <p className="mt-3 font-bold bg-white/15 rounded-xl px-3 py-2 leading-snug">
            {raccomandazioniOnline.nota}
          </p>
        ) : null}
      </div>

      {/* Le due liste della settimana selezionata */}
      {SPESE.map((k) => (
        <ListaSpesa key={k} settimana={settimana} spesaKey={k} />
      ))}
    </section>
  )
}
