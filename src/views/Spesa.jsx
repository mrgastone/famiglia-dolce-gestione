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
import { spesaRaggruppata, messaggioMontagnola } from '../lib/spesaSettimanale.js'
import { settimanaDelCiclo } from '../lib/settimana.js'

const SETTIMANE = [1, 2, 3, 4]

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

// ── Riga prodotto nella lista della spesa ───────────────────────────────────
function RigaSpesa({ riga, conLink }) {
  return (
    <li className="py-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-bold text-stone-800">{riga.nome}</span>
        <span className="text-salvia-scuro font-bold text-sm text-right">{riga.quantita}</span>
      </div>
      <div className="flex items-center gap-1.5 text-stone-400 text-xs mt-1">
        <Clock size={13} className="shrink-0" />
        <span>{riga.scadenza}</span>
      </div>
      {conLink ? (
        <div className="flex flex-wrap gap-2 mt-2">
          <a
            href={riga.amazon}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-stone-100 text-stone-700 font-semibold text-sm px-3 py-1.5"
          >
            Cerca su Amazon <ExternalLink size={14} />
          </a>
          <a
            href={riga.esselunga}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-stone-100 text-stone-700 font-semibold text-sm px-3 py-1.5"
          >
            Cerca su Esselunga <ExternalLink size={14} />
          </a>
        </div>
      ) : null}
    </li>
  )
}

// ── Sezione fornitore ───────────────────────────────────────────────────────
function SezioneSpesa({ icona: Icona, titolo, sottotitolo, modalita, righe, conLink, children }) {
  if (!righe || righe.length === 0) return null
  return (
    <div className="rounded-3xl bg-white shadow-card p-5">
      <div className="flex items-center gap-3 mb-2">
        <span className="flex items-center justify-center w-11 h-11 rounded-2xl bg-salvia-tenue text-salvia-scuro shrink-0">
          <Icona size={24} strokeWidth={2.2} />
        </span>
        <div className="leading-tight">
          <h3 className="font-display text-xl font-bold text-stone-800">{titolo}</h3>
          <p className="text-stone-400 text-sm font-semibold">{sottotitolo}</p>
        </div>
        {modalita ? (
          <span className="ml-auto text-xs font-bold text-stone-500 bg-stone-100 rounded-full px-3 py-1 text-right">
            {modalita}
          </span>
        ) : null}
      </div>

      <ul className="divide-y divide-stone-100">
        {righe.map((r) => (
          <RigaSpesa key={r.key} riga={r} conLink={conLink} />
        ))}
      </ul>

      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  )
}

export default function Spesa() {
  const [settimana, setSettimana] = useState(settimanaDelCiclo())
  const gruppi = spesaRaggruppata(settimana)
  const msgMontagnola = messaggioMontagnola(settimana)
  const { giroUnico, montagnola, specialita_di_parma, mezza_rosetta } = spesa

  return (
    <section className="space-y-5">
      {/* Selettore settimana */}
      <div>
        <h2 className="font-display text-xl font-bold text-stone-700 mb-2">
          Spesa della settimana
        </h2>
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
          Quantità per <span className="font-semibold text-stone-500">1 settimana</span>, scorte già
          aumentate del 10%. Stagione: {stagione.etichetta}.
        </p>
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

      {/* Montagnola — frutta e verdura freschi della settimana */}
      <SezioneSpesa
        icona={Store}
        titolo={montagnola.nome}
        sottotitolo="Frutta e verdura freschi della settimana"
        modalita={montagnola.modalita}
        righe={gruppi.montagnola}
      >
        <BottoneCopia testo={msgMontagnola} etichetta="Copia messaggio Montagnola" />
      </SezioneSpesa>

      {/* Specialità di Parma — uova */}
      <SezioneSpesa
        icona={Egg}
        titolo={specialita_di_parma.nome}
        sottotitolo="Uova"
        modalita={specialita_di_parma.modalita}
        righe={gruppi.specialita_di_parma}
      />

      {/* Mezza Rosetta — pane */}
      <SezioneSpesa
        icona={Croissant}
        titolo={mezza_rosetta.nome}
        sottotitolo="Pane"
        modalita={mezza_rosetta.modalita}
        righe={gruppi.mezza_rosetta}
      />

      {/* Online — Amazon Fresh / Esselunga */}
      <SezioneSpesa
        icona={ShoppingBasket}
        titolo="Online"
        sottotitolo="Amazon Fresh · Esselunga"
        righe={gruppi.online}
        conLink
      />
    </section>
  )
}
