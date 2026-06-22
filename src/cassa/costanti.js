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
