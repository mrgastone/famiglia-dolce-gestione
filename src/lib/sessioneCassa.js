import { useEffect, useState } from 'react'
import { SUPABASE_URL } from '../backendConfig.js'

// Le Colazioni sono aperte (nessun login) ma condividono il dominio con la Cassa, e quindi
// la STESSA sessione Supabase. Questo hook serve solo all'header: mostra il tasto "Esci"
// quando c'è una sessione Cassa attiva e permette di chiuderla senza entrare nella Cassa.
//
// IMPORTANTE — perché non importiamo @supabase/supabase-js qui sopra:
// sarebbe finito nel chunk condiviso dalle due pagine, portando le Colazioni da ~70 a ~125 KB
// gzip per tutti, anche per chi non fa mai il login (la governante). Quindi:
//  1. per SAPERE se c'è una sessione basta guardare in localStorage (nessun codice extra);
//  2. il client vero si carica con un import dinamico solo quando si preme "Esci".
// Se un giorno Supabase cambiasse il nome della chiave, l'unico effetto è che il tasto non
// compare: il login della Cassa continua a funzionare normalmente.
const RIFERIMENTO = new URL(SUPABASE_URL).hostname.split('.')[0]
const CHIAVE_SESSIONE = `sb-${RIFERIMENTO}-auth-token`

function sessionePresente() {
  try {
    return Boolean(window.localStorage.getItem(CHIAVE_SESSIONE))
  } catch {
    // Safari in navigazione privata può negare l'accesso a localStorage
    return false
  }
}

export function useSessioneCassa() {
  const [attiva, setAttiva] = useState(sessionePresente)

  useEffect(() => {
    const controlla = () => setAttiva(sessionePresente())
    // "storage" scatta quando la Cassa fa login/logout in un'altra scheda;
    // "focus" copre il rientro nell'app dopo essere passati dall'altra icona.
    window.addEventListener('storage', controlla)
    window.addEventListener('focus', controlla)
    return () => {
      window.removeEventListener('storage', controlla)
      window.removeEventListener('focus', controlla)
    }
  }, [])

  async function esci() {
    const { supabase } = await import('../supabase.js')
    await supabase?.auth.signOut()
    setAttiva(false)
  }

  return { attiva, esci }
}
