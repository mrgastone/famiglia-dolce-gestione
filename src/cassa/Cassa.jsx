import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Wallet,
  Plus,
  Minus,
  Camera,
  Trash2,
  X,
  Download,
  Receipt,
  Coffee,
  LogOut,
  Image as IconaGalleria,
} from 'lucide-react'
import { CATEGORIE, PERSONE, categoriaById, nomeUtente } from './costanti.js'
import { parseEuroToCent, formattaEuro, meseCorrente, meseDi, dataLeggibile, oraLeggibile, nomeMese } from './lib/soldi.js'
import { listaMovimenti, aggiungi, elimina, urlScontrino, pulisciVecchie, sottoscrivi, cloud } from './dati.js'
import { useAuth } from './Auth.jsx'
import GraficoCategorie from './components/GraficoCategorie.jsx'

const BASE = import.meta.env.BASE_URL

// ── Campi del modulo ────────────────────────────────────────────────────────
function CampoImporto({ valore, onChange }) {
  return (
    <div>
      <label className="block font-semibold text-stone-700 mb-1.5">Importo (€)</label>
      <input
        inputMode="decimal"
        type="text"
        value={valore}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0,00"
        className="w-full rounded-2xl border-2 border-stone-200 bg-white px-4 py-3 text-2xl font-bold text-stone-800 focus:border-salvia outline-none"
      />
    </div>
  )
}

function CampoSelect({ label, valore, onChange, opzioni, vuoto }) {
  const items = opzioni.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))
  return (
    <div>
      <label className="block font-semibold text-stone-700 mb-1.5">{label}</label>
      <select
        value={valore}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border-2 border-stone-200 bg-white px-4 py-3 font-semibold text-stone-800 focus:border-salvia outline-none"
      >
        {vuoto ? <option value="">{vuoto}</option> : null}
        {items.map((it) => (
          <option key={it.value} value={it.value}>
            {it.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function CampoTesto({ label, valore, onChange }) {
  return (
    <div>
      <label className="block font-semibold text-stone-700 mb-1.5">{label}</label>
      <input
        type="text"
        value={valore}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border-2 border-stone-200 bg-white px-4 py-3 font-semibold text-stone-800 focus:border-salvia outline-none"
      />
    </div>
  )
}

function Modale({ titolo, onChiudi, children }) {
  return (
    <div className="fixed inset-0 z-30 flex items-end sm:items-center justify-center bg-black/40" onClick={onChiudi}>
      <div
        className="bg-crema w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto safe-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 pb-2 sticky top-0 bg-crema z-10">
          <h3 className="font-display text-xl font-bold text-stone-800">{titolo}</h3>
          <button onClick={onChiudi} className="text-stone-400 p-1" aria-label="Chiudi">
            <X size={24} />
          </button>
        </div>
        <div className="p-5 pt-2">{children}</div>
      </div>
    </div>
  )
}

function ModaleEntrata({ onChiudi, onConferma, personaDefault }) {
  const [importo, setImporto] = useState('')
  const [persona, setPersona] = useState(PERSONE.includes(personaDefault) ? personaDefault : '')
  const [nota, setNota] = useState('')
  const [attesa, setAttesa] = useState(false)
  const cent = parseEuroToCent(importo)
  const valido = Number.isFinite(cent) && cent > 0

  return (
    <Modale titolo="Aggiungi soldi alla cassa" onChiudi={onChiudi}>
      <div className="space-y-4">
        <CampoImporto valore={importo} onChange={setImporto} />
        <CampoSelect label="Chi aggiunge (facoltativo)" valore={persona} onChange={setPersona} opzioni={PERSONE} vuoto="—" />
        <CampoTesto label="Nota (facoltativa)" valore={nota} onChange={setNota} />
        <button
          disabled={!valido || attesa}
          onClick={async () => {
            setAttesa(true)
            await onConferma({ importoCent: cent, persona: persona || null, nota: nota || null })
          }}
          className="w-full rounded-2xl bg-salvia text-white font-bold py-4 text-lg disabled:opacity-40 active:scale-95 transition-transform"
        >
          {attesa ? 'Salvo…' : `Aggiungi ${valido ? formattaEuro(cent) : ''}`}
        </button>
      </div>
    </Modale>
  )
}

function ModaleSpesa({ onChiudi, onConferma, personaDefault }) {
  const [importo, setImporto] = useState('')
  const [categoria, setCategoria] = useState('cibo')
  const [persona, setPersona] = useState(PERSONE.includes(personaDefault) ? personaDefault : PERSONE[0])
  const [nota, setNota] = useState('')
  const [foto, setFoto] = useState(null)
  const [anteprima, setAnteprima] = useState(null)
  const [attesa, setAttesa] = useState(false)
  const cent = parseEuroToCent(importo)
  const valido = Number.isFinite(cent) && cent > 0 && !!foto

  function scegliFoto(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFoto(f)
    setAnteprima((vecchia) => {
      if (vecchia) URL.revokeObjectURL(vecchia)
      return URL.createObjectURL(f)
    })
  }

  return (
    <Modale titolo="Registra una spesa" onChiudi={onChiudi}>
      <div className="space-y-4">
        <CampoImporto valore={importo} onChange={setImporto} />
        <CampoSelect
          label="Tipologia di spesa"
          valore={categoria}
          onChange={setCategoria}
          opzioni={CATEGORIE.map((c) => ({ value: c.id, label: c.nome }))}
        />
        <CampoSelect label="Chi ha pagato" valore={persona} onChange={setPersona} opzioni={PERSONE} />
        <CampoTesto label="Nota (facoltativa)" valore={nota} onChange={setNota} />

        <div>
          <label className="block font-semibold text-stone-700 mb-1.5">
            Foto dello scontrino <span className="text-red-500">*</span>
          </label>
          {anteprima ? (
            <div className="relative">
              <img src={anteprima} alt="scontrino" className="w-full max-h-56 object-contain rounded-2xl border border-stone-200 bg-white" />
              <label className="absolute bottom-2 right-2 bg-white/90 rounded-full px-3 py-1.5 text-sm font-semibold text-stone-600 shadow cursor-pointer">
                Rifai foto
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={scegliFoto} />
              </label>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {/* "capture=environment": su telefono/tablet apre la fotocamera (posteriore) */}
              <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-salvia/40 bg-salvia-tenue py-6 cursor-pointer text-salvia-scuro font-bold">
                <Camera size={30} strokeWidth={2.2} />
                <span>Scatta foto</span>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={scegliFoto} />
              </label>
              <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-stone-300 bg-white py-6 cursor-pointer text-stone-500 font-semibold">
                <IconaGalleria size={28} strokeWidth={2.2} />
                <span>Dalla galleria</span>
                <input type="file" accept="image/*" className="hidden" onChange={scegliFoto} />
              </label>
            </div>
          )}
          <p className="text-stone-400 text-xs mt-1.5">
            Su telefono e tablet, “Scatta foto” apre direttamente la fotocamera.
          </p>
        </div>

        <button
          disabled={!valido || attesa}
          onClick={async () => {
            setAttesa(true)
            await onConferma({ importoCent: cent, categoria, persona, nota: nota || null, foto })
          }}
          className="w-full rounded-2xl bg-terracotta text-white font-bold py-4 text-lg disabled:opacity-40 active:scale-95 transition-transform"
        >
          {attesa ? 'Salvo…' : `Registra spesa ${valido ? formattaEuro(cent) : ''}`}
        </button>
        {!foto ? <p className="text-stone-400 text-xs text-center">La foto dello scontrino è obbligatoria.</p> : null}
      </div>
    </Modale>
  )
}

function VisoreScontrino({ url, onChiudi }) {
  return (
    <div className="fixed inset-0 z-40 bg-black/90 flex items-center justify-center p-4" onClick={onChiudi}>
      <button className="absolute top-4 right-4 text-white p-2" onClick={onChiudi} aria-label="Chiudi">
        <X size={28} />
      </button>
      <img src={url} alt="scontrino" className="max-w-full max-h-full object-contain rounded-xl" />
    </div>
  )
}

function RigaMovimento({ m, onScontrino, onElimina }) {
  const entrata = m.tipo === 'entrata'
  const cat = !entrata ? categoriaById(m.categoria) : null
  return (
    <li className="py-2.5 flex items-center gap-3">
      <span
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white"
        style={{ backgroundColor: entrata ? '#7C9A6B' : cat?.colore || '#C97B4A' }}
      >
        {entrata ? <Plus size={18} /> : <Minus size={18} />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-stone-800 leading-tight truncate">
          {entrata ? 'Aggiunta in cassa' : cat?.nome}
          {m.persona ? <span className="text-stone-400 font-semibold"> · {m.persona}</span> : null}
        </p>
        <p className="text-stone-400 text-xs truncate">
          {dataLeggibile(m.data)} · {oraLeggibile(m.data)}
          {m.nota ? ` · ${m.nota}` : ''}
        </p>
      </div>
      {m.scontrino ? (
        <button onClick={() => onScontrino(m)} className="text-salvia-scuro shrink-0 p-1.5" aria-label="Vedi scontrino">
          <Receipt size={20} />
        </button>
      ) : null}
      <span className={`font-bold whitespace-nowrap ${entrata ? 'text-salvia-scuro' : 'text-terracotta'}`}>
        {entrata ? '+' : '−'}
        {formattaEuro(m.importoCent)}
      </span>
      <button onClick={() => onElimina(m)} className="text-stone-300 hover:text-red-400 shrink-0 p-1" aria-label="Elimina">
        <Trash2 size={16} />
      </button>
    </li>
  )
}

export default function Cassa() {
  const { user, pronto, signOut } = useAuth()
  const nomeLoggato = nomeUtente(user?.email)
  const [movimenti, setMovimenti] = useState([])
  const [caricato, setCaricato] = useState(false)
  const [modale, setModale] = useState(null)
  const [scontrinoAperto, setScontrinoAperto] = useState(null)

  const ricarica = useCallback(async () => {
    try {
      setMovimenti(await listaMovimenti())
    } catch {
      // rete assente: mantieni i dati già mostrati
    } finally {
      setCaricato(true)
    }
  }, [])

  useEffect(() => {
    ricarica()
    pulisciVecchie().catch(() => {})
    const unsub = sottoscrivi(ricarica)
    const onVis = () => {
      if (document.visibilityState === 'visible') ricarica()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      unsub()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [ricarica])

  const saldoCent = useMemo(
    () => movimenti.reduce((s, m) => s + (m.tipo === 'entrata' ? m.importoCent : -m.importoCent), 0),
    [movimenti],
  )
  const mese = meseCorrente()
  const usciteMese = useMemo(
    () => movimenti.filter((m) => m.tipo === 'uscita' && meseDi(m.data) === mese),
    [movimenti, mese],
  )
  const speseMeseCent = usciteMese.reduce((s, m) => s + m.importoCent, 0)
  const datiCategorie = CATEGORIE.map((c) => ({
    nome: c.nome,
    colore: c.colore,
    valore: usciteMese.filter((m) => m.categoria === c.id).reduce((s, m) => s + m.importoCent, 0),
  }))

  async function aggiungiEntrata(dati) {
    try {
      await aggiungi({ tipo: 'entrata', ...dati })
      setModale(null)
      ricarica()
    } catch {
      window.alert('Non riesco a salvare: controlla la connessione.')
    }
  }
  async function aggiungiSpesa({ foto, ...dati }) {
    try {
      await aggiungi({ tipo: 'uscita', ...dati }, foto)
      setModale(null)
      ricarica()
    } catch {
      window.alert('Non riesco a salvare la spesa: controlla la connessione.')
    }
  }
  async function rimuovi(m) {
    if (!window.confirm('Eliminare questo movimento? L’operazione non si può annullare.')) return
    try {
      await elimina(m)
      ricarica()
    } catch {
      window.alert('Non riesco a eliminare: controlla la connessione.')
    }
  }
  async function apriScontrino(m) {
    const url = await urlScontrino(m)
    if (url) setScontrinoAperto(url)
    else window.alert('Foto non disponibile (forse è stata cancellata dopo 3 mesi).')
  }
  function esporta() {
    const blob = new Blob([JSON.stringify({ esportato: new Date().toISOString(), movimenti }, null, 2)], {
      type: 'application/json',
    })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `cassa-${mese}.json`
    a.click()
  }

  const saldoBasso = saldoCent <= 0

  return (
    <div className="min-h-screen flex flex-col bg-crema">
      <header className="safe-top sticky top-0 z-10 bg-crema/90 backdrop-blur border-b border-stone-200/60">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-salvia-tenue text-salvia-scuro shrink-0">
            <Wallet size={26} strokeWidth={2.2} />
          </div>
          <div className="leading-tight min-w-0">
            <h1 className="font-display text-2xl font-bold text-salvia-scuro truncate">Famiglia Dolce</h1>
            <p className="text-stone-500 font-semibold text-sm -mt-0.5 truncate">
              Cassa{nomeLoggato ? ` · ${nomeLoggato}` : ''}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <a
              href={`${BASE}index.html`}
              className="inline-flex items-center gap-1.5 text-stone-500 font-semibold text-sm bg-white rounded-full px-3 py-1.5 shadow-card"
            >
              <Coffee size={16} /> <span className="hidden sm:inline">Colazioni</span>
            </a>
            {pronto ? (
              <button
                onClick={signOut}
                className="inline-flex items-center gap-1.5 text-stone-500 font-semibold text-sm bg-white rounded-full px-3 py-1.5 shadow-card"
                aria-label="Esci"
              >
                <LogOut size={16} /> <span className="hidden sm:inline">Esci</span>
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 pt-4 pb-10 space-y-5">
        <div className="rounded-3xl bg-white shadow-card p-5 sm:p-6 text-center">
          <p className="text-stone-400 font-semibold uppercase text-xs tracking-wide">In cassa</p>
          <p className={`font-display font-bold text-5xl mt-1 ${saldoBasso ? 'text-red-500' : 'text-salvia-scuro'}`}>
            {formattaEuro(saldoCent)}
          </p>
          <p className="text-stone-500 text-sm mt-2">
            Spese di <span className="capitalize">{nomeMese(mese)}</span>: <span className="font-bold">{formattaEuro(speseMeseCent)}</span>
          </p>
          {saldoBasso ? (
            <p className="text-red-500 text-sm font-semibold mt-1">Attenzione: la cassa è a zero o in negativo.</p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setModale('aggiungi')}
            className="rounded-3xl bg-salvia text-white shadow-card py-5 flex flex-col items-center gap-1 active:scale-95 transition-transform"
          >
            <Plus size={30} strokeWidth={2.5} />
            <span className="font-bold text-lg">Aggiungi soldi</span>
          </button>
          <button
            onClick={() => setModale('spesa')}
            className="rounded-3xl bg-terracotta text-white shadow-card py-5 flex flex-col items-center gap-1 active:scale-95 transition-transform"
          >
            <Minus size={30} strokeWidth={2.5} />
            <span className="font-bold text-lg">Registra spesa</span>
          </button>
        </div>

        <div className="rounded-3xl bg-white shadow-card p-5">
          <h2 className="font-display text-xl font-bold text-stone-700 mb-3">Spese per tipologia</h2>
          <GraficoCategorie dati={datiCategorie} totaleCent={speseMeseCent} />
        </div>

        <div className="rounded-3xl bg-white shadow-card p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display text-xl font-bold text-stone-700">Movimenti e scontrini</h2>
            {movimenti.length ? (
              <button onClick={esporta} className="inline-flex items-center gap-1.5 text-stone-500 font-semibold text-sm">
                <Download size={16} /> Esporta
              </button>
            ) : null}
          </div>
          {!caricato ? (
            <p className="text-stone-400 text-sm">Carico…</p>
          ) : movimenti.length === 0 ? (
            <p className="text-stone-400 text-sm">Ancora nessun movimento. Aggiungi soldi o registra una spesa.</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {movimenti.map((m) => (
                <RigaMovimento key={m.id} m={m} onScontrino={apriScontrino} onElimina={rimuovi} />
              ))}
            </ul>
          )}
        </div>

        <p className="text-stone-400 text-xs text-center px-4 leading-relaxed">
          {cloud
            ? 'Cassa condivisa: i dati e gli scontrini sono nel cloud (Supabase) e visibili a tutti gli utenti. Le foto si cancellano da sole dopo 3 mesi.'
            : 'I dati sono salvati solo su questo dispositivo. Usa “Esporta” per una copia.'}
        </p>
      </main>

      {modale === 'aggiungi' ? (
        <ModaleEntrata onChiudi={() => setModale(null)} onConferma={aggiungiEntrata} personaDefault={nomeLoggato} />
      ) : null}
      {modale === 'spesa' ? (
        <ModaleSpesa onChiudi={() => setModale(null)} onConferma={aggiungiSpesa} personaDefault={nomeLoggato} />
      ) : null}
      {scontrinoAperto ? (
        <VisoreScontrino
          url={scontrinoAperto}
          onChiudi={() => {
            if (scontrinoAperto.startsWith('blob:')) URL.revokeObjectURL(scontrinoAperto)
            setScontrinoAperto(null)
          }}
        />
      ) : null}
    </div>
  )
}
