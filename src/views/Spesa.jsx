import { useState } from 'react'
import {
  MapPin,
  Footprints,
  Store,
  Egg,
  Croissant,
  ShoppingBasket,
  Copy,
  Check,
  ExternalLink,
  Apple,
  Carrot,
} from 'lucide-react'
import spesa from '../data/spesa.json'
import stagione from '../data/stagione.json'

// ── Etichetta/chip riutilizzabile ──────────────────────────────────────────
function Chip({ children, className = '' }) {
  return (
    <span
      className={`inline-block rounded-full bg-salvia-tenue text-salvia-scuro font-semibold text-sm px-3 py-1 ${className}`}
    >
      {children}
    </span>
  )
}

// ── Bottone "Copia messaggio" con feedback ──────────────────────────────────
function BottoneCopia({ testo, etichetta }) {
  const [copiato, setCopiato] = useState(false)

  async function copia() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(testo)
      } else {
        // Fallback per browser/contesti senza Clipboard API
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

// ── Sezione fornitore generica ──────────────────────────────────────────────
function SezioneFornitore({ icona: Icona, fornitore, children }) {
  return (
    <div className="rounded-3xl bg-white shadow-card p-5">
      <div className="flex items-center gap-3 mb-3">
        <span className="flex items-center justify-center w-11 h-11 rounded-2xl bg-salvia-tenue text-salvia-scuro shrink-0">
          <Icona size={24} strokeWidth={2.2} />
        </span>
        <div className="leading-tight">
          <h3 className="font-display text-xl font-bold text-stone-800">{fornitore.nome}</h3>
          <p className="text-stone-400 text-sm font-semibold">{fornitore.tipo}</p>
        </div>
        {fornitore.modalita && (
          <span className="ml-auto text-xs font-bold text-stone-500 bg-stone-100 rounded-full px-3 py-1 text-right">
            {fornitore.modalita}
          </span>
        )}
      </div>

      <ul className="flex flex-wrap gap-2 mb-1">
        {fornitore.articoli.map((a, i) => (
          <li key={i}>
            <Chip>{a}</Chip>
          </li>
        ))}
      </ul>

      {children}
    </div>
  )
}

// ── Card prodotto online ────────────────────────────────────────────────────
function ProdottoOnline({ prodotto }) {
  const linkValido = prodotto.link && prodotto.link !== '#'
  return (
    <div className="rounded-2xl border border-stone-100 bg-white p-4 flex gap-4">
      <div className="w-20 h-20 rounded-xl bg-salvia-tenue flex items-center justify-center shrink-0 overflow-hidden">
        {prodotto.immagine ? (
          <img
            src={prodotto.immagine}
            alt={prodotto.nome}
            className="w-full h-full object-cover"
          />
        ) : (
          <ShoppingBasket className="text-salvia" size={28} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-bold text-stone-800 leading-snug">{prodotto.nome}</p>
        <p className="text-stone-400 text-sm">
          {prodotto.marca} · {prodotto.fornitore}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5 text-sm text-stone-600 font-semibold">
          {prodotto.zuccheri && <span>Zuccheri: {prodotto.zuccheri}</span>}
          {prodotto.energia && <span>Energia: {prodotto.energia}</span>}
        </div>
        {prodotto.note && <p className="text-stone-500 text-xs mt-1.5 italic">{prodotto.note}</p>}

        {linkValido ? (
          <a
            href={prodotto.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 mt-2 text-salvia-scuro font-bold text-sm"
          >
            Apri prodotto <ExternalLink size={16} />
          </a>
        ) : (
          <span className="inline-block mt-2 text-stone-400 font-semibold text-sm">
            Link da inserire
          </span>
        )}
      </div>
    </div>
  )
}

export default function Spesa() {
  const { giroUnico, montagnola, specialita_di_parma, mezza_rosetta, online } = spesa

  return (
    <section className="space-y-5">
      {/* Suggerimento: GIRO UNICO in zona Montagnola */}
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

      {/* Frutta e verdura di stagione */}
      <div className="rounded-3xl bg-white shadow-card p-5">
        <h3 className="font-display text-lg font-bold text-stone-700 mb-3">
          Di stagione adesso · {stagione.etichetta}
        </h3>
        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-1.5 text-terracotta font-bold text-sm mb-1.5">
              <Apple size={16} /> Frutta
            </div>
            <div className="flex flex-wrap gap-2">
              {stagione.fruttaDiStagione.map((f, i) => (
                <Chip key={i} className="!bg-terracotta-tenue !text-terracotta">
                  {f}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-salvia-scuro font-bold text-sm mb-1.5">
              <Carrot size={16} /> Verdura
            </div>
            <div className="flex flex-wrap gap-2">
              {stagione.verduraDiStagione.map((v, i) => (
                <Chip key={i}>{v}</Chip>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Montagnola — fresco */}
      <SezioneFornitore icona={Store} fornitore={montagnola}>
        {montagnola.messaggioWhatsapp && (
          <div className="mt-4">
            <BottoneCopia testo={montagnola.messaggioTesto} etichetta="Copia messaggio Montagnola" />
            <p className="text-stone-400 text-xs mt-2">
              Il testo del messaggio è un segnaposto: lo personalizzeremo con le quantità.
            </p>
          </div>
        )}
      </SezioneFornitore>

      {/* Specialità di Parma — uova, di persona */}
      <SezioneFornitore icona={Egg} fornitore={specialita_di_parma} />

      {/* Mezza Rosetta — pane, di persona */}
      <SezioneFornitore icona={Croissant} fornitore={mezza_rosetta} />

      {/* Online */}
      <div className="rounded-3xl bg-white shadow-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <span className="flex items-center justify-center w-11 h-11 rounded-2xl bg-salvia-tenue text-salvia-scuro shrink-0">
            <ShoppingBasket size={24} strokeWidth={2.2} />
          </span>
          <div className="leading-tight">
            <h3 className="font-display text-xl font-bold text-stone-800">Online</h3>
            <p className="text-stone-400 text-sm font-semibold">Amazon Fresh · Esselunga</p>
          </div>
        </div>
        <div className="space-y-3">
          {online.map((p, i) => (
            <ProdottoOnline key={i} prodotto={p} />
          ))}
        </div>
      </div>
    </section>
  )
}
