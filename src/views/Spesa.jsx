import { useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Footprints,
  Bus,
  ShoppingCart,
  Store,
  Package,
  MapPin,
  Copy,
  Check,
  ExternalLink,
  Clock,
  AlertTriangle,
  Printer,
} from 'lucide-react'
import spesa from '../data/spesa.json'
import stagione from '../data/stagione.json'
import EtichettaStagione from '../components/EtichettaStagione.jsx'
import {
  GIRI_FRUTTA,
  infoFrutta,
  spesaSupermercato,
  spesaFrutta,
  spesaAlimentari,
  spesaOnline,
  testoFrutta,
  MARGINE_PERCENTO,
} from '../lib/spesaSettimanale.js'
import { settimanaDelCiclo, SETTIMANE_UGUALI } from '../lib/settimana.js'

const SETTIMANE = [1, 2, 3, 4]

// Icona + colore di accesso per ciascun negozio (le chiavi fornitore restano stabili;
// nome/tipo/mappa arrivano da spesa.json e si adattano alla zona del mese).
const NEGOZI = {
  montagnola: { icona: Bus, accessoIcona: Bus },
  specialita_di_parma: { icona: ShoppingCart, accessoIcona: ShoppingCart },
  mezza_rosetta: { icona: Store, accessoIcona: Footprints },
  online: { icona: Package, accessoIcona: Package },
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

// ── Intestazione di un negozio (nome, tipo, accesso, link mappa) ────────────
function IntestazioneNegozio({ fornitoreKey }) {
  const info = spesa[fornitoreKey] ?? {}
  const conf = NEGOZI[fornitoreKey] ?? {}
  const Icona = conf.icona ?? Store
  const AccessoIcona = conf.accessoIcona ?? MapPin
  return (
    <div className="mb-2">
      <div className="flex items-center gap-2 flex-wrap">
        <Icona size={20} className="text-salvia-scuro shrink-0" />
        <h3 className="font-display text-lg font-bold text-stone-800">{info.nome}</h3>
      </div>
      <div className="flex items-center gap-2 flex-wrap mt-1">
        {info.accesso ? (
          <span className="inline-flex items-center gap-1 text-[0.7rem] font-bold text-salvia-scuro bg-salvia-tenue rounded-full px-2 py-0.5">
            <AccessoIcona size={12} /> {info.accesso}
          </span>
        ) : null}
        <span className="text-stone-400 text-xs">{info.tipo}</span>
        {info.mappa ? (
          <a
            href={info.mappa}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-salvia-scuro"
          >
            <MapPin size={13} /> Apri mappa <ExternalLink size={11} />
          </a>
        ) : null}
      </div>
    </div>
  )
}

// ── Riga prodotto calcolato ─────────────────────────────────────────────────
function RigaSpesa({ riga, conAmazon }) {
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
      {conAmazon && !riga.giaDisponibile && riga.amazon ? (
        <div className="mt-1.5">
          <a
            href={riga.amazon}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-stone-100 text-stone-700 font-semibold text-xs px-2.5 py-1.5"
          >
            Cerca su Amazon <ExternalLink size={13} />
          </a>
        </div>
      ) : null}
    </li>
  )
}

// ── Riga fissa (regola fissa: pane, acqua, ecc.) ────────────────────────────
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

// ── Card: Supermercato (una volta a settimana) ──────────────────────────────
function CardSupermercato({ settimana }) {
  const righe = spesaSupermercato(settimana)
  return (
    <div className="rounded-3xl bg-white shadow-card p-5">
      <IntestazioneNegozio fornitoreKey="specialita_di_parma" />
      <p className="text-stone-500 text-sm mb-1">
        Un solo giro a settimana: prendi tutto insieme (uova, yogurt e dispensa).
      </p>
      {righe.length ? (
        <ul className="divide-y divide-stone-100">
          {righe.map((r) => (
            <RigaSpesa key={r.key} riga={r} conAmazon />
          ))}
        </ul>
      ) : (
        <p className="text-stone-400 text-sm">Niente da prendere al supermercato questa settimana.</p>
      )}
    </div>
  )
}

// ── Card: Frutta e verdura (fruttivendolo, due giri) ────────────────────────
function CardFrutta({ settimana }) {
  return (
    <div className="rounded-3xl bg-white shadow-card p-5">
      <IntestazioneNegozio fornitoreKey="montagnola" />
      <p className="text-stone-500 text-sm mb-3">
        Frutta fresca in <span className="font-semibold text-stone-600">due giri</span> per non tenerla
        troppo a lungo. Facile in bus 165, anche più spesso se serve.
      </p>
      <div className="space-y-4">
        {GIRI_FRUTTA.map((giro) => {
          const info = infoFrutta(giro)
          const righe = spesaFrutta(settimana, giro)
          if (!righe.length) return null
          return (
            <div key={giro} className="rounded-2xl bg-crema/60 p-4">
              <div className="flex items-baseline gap-2 flex-wrap mb-1">
                <h4 className="font-bold text-stone-700">{info.nome}</h4>
                <span className="text-stone-400 text-xs">· colazioni di {info.copre}</span>
              </div>
              <ul className="divide-y divide-stone-100">
                {righe.map((r) => (
                  <RigaSpesa key={r.key} riga={r} />
                ))}
              </ul>
              <div className="mt-3">
                <BottoneCopia testo={testoFrutta(settimana, giro)} etichetta={`Copia lista · ${info.nome}`} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Giorno di oggi in italiano (per evidenziarlo nella tabella orari)
const OGGI = new Date().toLocaleDateString('it-IT', { weekday: 'long' })

// ── Card: Alimentari sotto casa (a piedi) ───────────────────────────────────
function CardAlimentari({ settimana }) {
  const righe = spesaAlimentari(settimana)
  const info = spesa.mezza_rosetta
  return (
    <div className="rounded-3xl bg-white shadow-card p-5">
      <IntestazioneNegozio fornitoreKey="mezza_rosetta" />
      {info.orari ? (
        <div className="flex items-start gap-2 text-amber-700 bg-amber-50 rounded-2xl px-3 py-2 mb-3 text-sm">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <span>{info.orari}</span>
        </div>
      ) : null}
      {info.orariGiorni?.length ? (
        <details className="mb-3">
          <summary className="cursor-pointer text-salvia-scuro font-semibold text-sm select-none inline-flex items-center gap-1.5">
            <Clock size={14} /> Orari di apertura
          </summary>
          <ul className="mt-2 rounded-2xl bg-crema/60 divide-y divide-stone-100 px-3">
            {info.orariGiorni.map((r) => {
              const oggi = r.g.toLowerCase() === OGGI
              const chiuso = /chius/i.test(r.o)
              return (
                <li
                  key={r.g}
                  className={`flex items-baseline justify-between gap-3 py-1.5 ${oggi ? 'font-bold' : ''}`}
                >
                  <span className={oggi ? 'text-salvia-scuro' : 'text-stone-600'}>
                    {r.g}
                    {oggi ? ' · oggi' : ''}
                  </span>
                  <span className={chiuso ? 'text-red-400' : oggi ? 'text-salvia-scuro' : 'text-stone-500'}>
                    {r.o}
                  </span>
                </li>
              )
            })}
          </ul>
        </details>
      ) : null}
      <ul className="divide-y divide-stone-100">
        {righe.map((r) => (
          <RigaSpesa key={r.key} riga={r} conAmazon />
        ))}
        {(info.fissi ?? []).map((f, i) => (
          <RigaFissa key={`f${i}`} testo={f} />
        ))}
      </ul>
    </div>
  )
}

// ── Card: Online / Amazon (prodotti difficili) ──────────────────────────────
function CardOnline({ settimana }) {
  const righe = spesaOnline(settimana)
  if (!righe.length) return null
  return (
    <div className="rounded-3xl bg-white shadow-card p-5">
      <IntestazioneNegozio fornitoreKey="online" />
      <p className="text-stone-500 text-sm mb-1">
        Se non li trovi al supermercato di zona, ordinali online.
      </p>
      <ul className="divide-y divide-stone-100">
        {righe.map((r) => (
          <RigaSpesa key={r.key} riga={r} conAmazon />
        ))}
      </ul>
    </div>
  )
}

// ── Lista stampabile (bianco/nero, con caselle da spuntare) ─────────────────
// Nascosta a schermo (.area-stampa); compare solo in stampa (vedi index.css).
// Stili inline: in stampa sono più affidabili delle classi con colori di sfondo.
function SezioneStampa({ titolo, nota, voci }) {
  if (!voci.length) return null
  return (
    <div style={{ marginBottom: '12px' }}>
      <h2 style={{ fontSize: '14px', fontWeight: 700, borderBottom: '1.5px solid #000', paddingBottom: '2px', margin: '0 0 5px' }}>
        {titolo}
      </h2>
      {nota ? <p style={{ fontSize: '10.5px', color: '#333', margin: '0 0 5px' }}>{nota}</p> : null}
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {voci.map((v, i) => (
          <li
            key={i}
            style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12.5px', padding: '2.5px 0', breakInside: 'avoid' }}
          >
            <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.2px solid #000', flexShrink: 0, marginTop: '2px' }} />
            <span style={{ flex: 1 }}>{v.nome}</span>
            {v.qta ? <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{v.qta}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  )
}

function ListaStampabile({ settimana }) {
  const superm = spesaSupermercato(settimana).map((r) => ({ nome: r.nome, qta: r.quantita }))
  const alimentari = [
    ...spesaAlimentari(settimana).map((r) => ({ nome: r.nome, qta: r.quantita })),
    ...(spesa.mezza_rosetta.fissi ?? []).map((f) => ({ nome: f, qta: '' })),
  ]
  const online = spesaOnline(settimana)
    .filter((r) => !r.giaDisponibile)
    .map((r) => ({ nome: r.nome, qta: r.quantita }))
  const oggi = new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })

  // Resa fuori da #root (portale su <body>) così in stampa basta nascondere #root.
  return createPortal(
    <div className="area-stampa" style={{ color: '#000', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ borderBottom: '2px solid #000', paddingBottom: '6px', marginBottom: '12px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Lista della spesa · Settimana {settimana}</h1>
        <p style={{ fontSize: '12px', margin: '2px 0 0' }}>
          {stagione.etichetta} — stampata il {oggi}
        </p>
      </div>

      <SezioneStampa
        titolo={`🛒 ${spesa.specialita_di_parma.nome}`}
        nota="Una volta a settimana."
        voci={superm}
      />
      {GIRI_FRUTTA.map((giro) => {
        const info = infoFrutta(giro)
        const voci = spesaFrutta(settimana, giro).map((r) => ({ nome: r.nome, qta: r.quantita }))
        return (
          <SezioneStampa
            key={giro}
            titolo={`🍑 Frutta e verdura · ${info.nome}`}
            nota={`${spesa.montagnola.nome} (bus 165) — colazioni di ${info.copre}.`}
            voci={voci}
          />
        )
      })}
      <SezioneStampa
        titolo={`🏠 ${spesa.mezza_rosetta.nome}`}
        nota={spesa.mezza_rosetta.orari}
        voci={alimentari}
      />
      <SezioneStampa titolo="📦 Da ordinare online (Amazon)" voci={online} />

      <p style={{ fontSize: '10.5px', color: '#333', marginTop: '14px', borderTop: '1px solid #999', paddingTop: '6px' }}>
        Quantità con +{MARGINE_PERCENTO}%. Questa lista non contiene gli ingredienti per pranzo e cena.
      </p>
    </div>,
    document.body,
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
          Supermercato <span className="font-semibold text-stone-500">una volta a settimana</span>,
          frutta fresca <span className="font-semibold text-stone-500">quando serve</span> (bus 165),
          alimentari sotto casa <span className="font-semibold text-stone-500">a piedi</span> per le
          emergenze. Quantità con <span className="font-semibold text-stone-500">+{MARGINE_PERCENTO}%</span>.
          Prodotti di stagione per {stagione.etichetta}.
        </p>
        {SETTIMANE_UGUALI[settimana] ? (
          <p className="text-salvia-scuro text-sm font-semibold mt-1">
            ≡ La spesa della Settimana {settimana} è uguale a quella della Settimana{' '}
            {SETTIMANE_UGUALI[settimana]}.
          </p>
        ) : null}
      </div>

      {/* Come funziona la spesa in zona (i tre punti) */}
      <div className="rounded-3xl bg-salvia text-white shadow-card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-2">
          <MapPin size={24} strokeWidth={2.3} />
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

      {/* Le liste della settimana selezionata */}
      <CardSupermercato settimana={settimana} />
      <CardFrutta settimana={settimana} />
      <CardAlimentari settimana={settimana} />
      <CardOnline settimana={settimana} />

      {/* Pulsante stampa (in fondo alla lista settimanale) */}
      <button
        onClick={() => window.print()}
        className="no-print w-full rounded-3xl bg-salvia text-white shadow-card p-4 flex items-center justify-center gap-2 font-bold text-lg active:scale-95 transition-transform"
      >
        <Printer size={22} /> Stampa la lista della Settimana {settimana}
      </button>
      <p className="no-print text-stone-400 text-xs text-center -mt-2">
        Stampa solo la lista della settimana selezionata, in bianco e nero con le caselle da spuntare.
      </p>

      {/* Versione stampabile (nascosta a schermo, compare solo in stampa) */}
      <ListaStampabile settimana={settimana} />

      {/* Prodotti difficili da reperire (nota) */}
      <div className="rounded-3xl bg-salvia-scuro text-white shadow-card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-2">
          <Package size={24} strokeWidth={2.3} />
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
    </section>
  )
}
