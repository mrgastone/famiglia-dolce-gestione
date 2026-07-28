// Un profilo di colazione può essere CONDIVISO da più persone che mangiano le
// stesse identiche cose (es. David + Lena). Non si duplicano i dati del menu:
// il campo `condivisoCon` in profili.json elenca le persone in più, e da qui si
// ricavano il nome visualizzato, il sottotitolo e il numero di porzioni.
// Regola generale, valida anche per i mesi futuri.

// Numero di porzioni da preparare / da contare nella spesa (1 + persone in più).
export function porzioniProfilo(profilo) {
  return 1 + (profilo?.condivisoCon?.length ?? 0)
}

// Nome mostrato in intestazione: "David" → "David e Lena" se condiviso.
export function nomeProfilo(profilo) {
  if (!profilo?.condivisoCon?.length) return profilo?.nome ?? ''
  return [profilo.nome, ...profilo.condivisoCon.map((p) => p.nome)].join(' e ')
}

// Sottotitolo con l'età/tipo di ciascuno: "David 3 anni e 9 mesi · Lena adulta".
export function sottotitoloProfilo(profilo) {
  if (!profilo?.condivisoCon?.length) return profilo?.eta ?? ''
  const extra = profilo.condivisoCon.map((p) =>
    [p.nome, p.eta ? p.eta.toLowerCase() : null].filter(Boolean).join(' '),
  )
  return [`${profilo.nome} ${profilo.eta}`, ...extra].join(' · ')
}

// Etichetta breve delle porzioni, es. "2 porzioni · David e Lena" (null se singola).
export function etichettaPorzioni(profilo) {
  const n = porzioniProfilo(profilo)
  if (n <= 1) return null
  return `${n} porzioni · ${nomeProfilo(profilo)}`
}

// Suffisso quantità per una porzione condivisa, es. " ×2" (stringa vuota se singola).
export function suffissoPorzioni(profilo) {
  const n = porzioniProfilo(profilo)
  return n > 1 ? ` ×${n}` : ''
}
