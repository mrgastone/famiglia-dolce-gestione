// Tipologie di spesa (con colore per il grafico) e persone che possono pagare.
export const CATEGORIE = [
  { id: 'cibo', nome: 'Cibo', colore: '#7C9A6B' },
  { id: 'tintoria', nome: 'Tintoria', colore: '#4A90C9' },
  { id: 'animali', nome: 'Animali', colore: '#C97B4A' },
  { id: 'altro', nome: 'Altro', colore: '#A8A29E' },
]

export const PERSONE = ['Natasha', 'Lena', 'Flavio']

export function categoriaById(id) {
  return CATEGORIE.find((c) => c.id === id) ?? { id, nome: id, colore: '#A8A29E' }
}

// Mappa email → nome (per mostrare chi è loggato e proporre "chi ha pagato").
export const UTENTI = {
  'gastone@gmail.com': 'Flavio',
  'kostiuchenko91@gmail.com': 'Lena',
  'natasha@gmail.com': 'Natasha',
}

export function nomeUtente(email) {
  if (!email) return null
  return UTENTI[email.toLowerCase()] ?? email
}

// Chi può aprire il "Controllo scontrini" (galleria delle foto con l'importo dichiarato
// accanto, per verificare al volo che coincidano).
// NB: è un filtro di sola INTERFACCIA. Le regole RLS su Supabase permettono a ogni utente
// autenticato di leggere movimenti e foto: qui si nasconde il menù, non si blocca l'accesso.
export const EMAIL_CONTROLLO = ['gastone@gmail.com']

export function puoControllareScontrini(email) {
  if (!email) return false
  return EMAIL_CONTROLLO.includes(email.toLowerCase())
}
