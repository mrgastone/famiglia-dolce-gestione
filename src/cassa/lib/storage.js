// Persistenza locale dell'app Cassa:
// - i movimenti (entrate/uscite) in localStorage
// - le foto degli scontrini in IndexedDB (i blob possono essere grandi)
// I dati restano SUL DISPOSITIVO (questo browser): non si sincronizzano tra telefoni.

const LS_KEY = 'famigliaDolce.cassa.v1'

export function caricaStato() {
  try {
    const s = JSON.parse(localStorage.getItem(LS_KEY))
    if (s && Array.isArray(s.movimenti)) return s
  } catch {
    // ignora dati corrotti
  }
  return { movimenti: [] }
}

export function salvaStato(stato) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(stato))
  } catch {
    // quota piena o storage non disponibile
  }
}

// ── IndexedDB per le foto degli scontrini ───────────────────────────────────
const DB_NAME = 'famigliaDolceCassa'
const STORE = 'scontrini'

function apriDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function salvaFoto(id, blob) {
  const db = await apriDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(blob, id)
    tx.oncomplete = () => resolve(id)
    tx.onerror = () => reject(tx.error)
  })
}

export async function leggiFoto(id) {
  const db = await apriDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const rq = tx.objectStore(STORE).get(id)
    rq.onsuccess = () => resolve(rq.result || null)
    rq.onerror = () => reject(rq.error)
  })
}

export async function eliminaFoto(id) {
  const db = await apriDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// id univoco (con fallback se crypto.randomUUID non c'è)
export function nuovoId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8)
}
