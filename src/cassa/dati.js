import { backendPronto, supabase } from '../supabase.js'
import {
  caricaStato,
  salvaStato,
  salvaFoto,
  leggiFoto,
  eliminaFoto,
  nuovoId,
} from './lib/storage.js'

const BUCKET = 'scontrini'
const GIORNI_FOTO = 90 // le foto si cancellano dopo ~3 mesi

export const cloud = backendPronto

// riga del database → forma usata dall'app
function daRiga(r) {
  return {
    id: r.id,
    tipo: r.tipo,
    importoCent: r.importo_cent,
    categoria: r.categoria,
    persona: r.persona,
    nota: r.nota,
    scontrino: r.scontrino_path,
    data: r.creato_il,
  }
}

export async function listaMovimenti() {
  if (!backendPronto) return caricaStato().movimenti
  const { data, error } = await supabase
    .from('movimenti')
    .select('*')
    .order('creato_il', { ascending: false })
  if (error) throw error
  return data.map(daRiga)
}

export async function aggiungi(mov, fotoFile) {
  if (!backendPronto) {
    let scontrino = null
    if (fotoFile) {
      scontrino = nuovoId()
      await salvaFoto(scontrino, fotoFile)
    }
    const stato = caricaStato()
    stato.movimenti = [
      { ...mov, id: nuovoId(), scontrino, data: new Date().toISOString() },
      ...stato.movimenti,
    ]
    salvaStato(stato)
    return
  }

  let scontrino_path = null
  if (fotoFile) {
    const ext = (fotoFile.name?.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
    scontrino_path = `${nuovoId()}.${ext || 'jpg'}`
    const { error: eUp } = await supabase.storage
      .from(BUCKET)
      .upload(scontrino_path, fotoFile, { contentType: fotoFile.type || 'image/jpeg' })
    if (eUp) throw eUp
  }
  const { error } = await supabase.from('movimenti').insert({
    tipo: mov.tipo,
    importo_cent: mov.importoCent,
    categoria: mov.categoria ?? null,
    persona: mov.persona ?? null,
    nota: mov.nota ?? null,
    scontrino_path,
  })
  if (error) throw error
}

export async function elimina(mov) {
  if (!backendPronto) {
    if (mov.scontrino) await eliminaFoto(mov.scontrino).catch(() => {})
    const stato = caricaStato()
    stato.movimenti = stato.movimenti.filter((x) => x.id !== mov.id)
    salvaStato(stato)
    return
  }
  if (mov.scontrino) await supabase.storage.from(BUCKET).remove([mov.scontrino]).catch(() => {})
  const { error } = await supabase.from('movimenti').delete().eq('id', mov.id)
  if (error) throw error
}

export async function urlScontrino(mov) {
  if (!mov.scontrino) return null
  if (!backendPronto) {
    const blob = await leggiFoto(mov.scontrino)
    return blob ? URL.createObjectURL(blob) : null
  }
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(mov.scontrino, 600)
  if (error) return null
  return data.signedUrl
}

// Cancella le foto più vecchie di 3 mesi (mantiene il movimento, libera spazio).
export async function pulisciVecchie() {
  if (!backendPronto) return
  const limite = new Date(Date.now() - GIORNI_FOTO * 86400000).toISOString()
  const { data, error } = await supabase
    .from('movimenti')
    .select('id,scontrino_path')
    .not('scontrino_path', 'is', null)
    .lt('creato_il', limite)
  if (error || !data?.length) return
  await supabase.storage
    .from(BUCKET)
    .remove(data.map((r) => r.scontrino_path))
    .catch(() => {})
  await supabase
    .from('movimenti')
    .update({ scontrino_path: null })
    .in(
      'id',
      data.map((r) => r.id),
    )
}

// Aggiornamento tra dispositivi: realtime se attivo, altrimenti si ricarica
// all'apertura/refocus (gestito in Cassa.jsx).
export function sottoscrivi(callback) {
  if (!backendPronto) return () => {}
  const ch = supabase
    .channel('movimenti-rt')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'movimenti' }, () => callback())
    .subscribe()
  return () => {
    supabase.removeChannel(ch)
  }
}
