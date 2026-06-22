import { createContext, useContext, useEffect, useState } from 'react'
import { Wallet } from 'lucide-react'
import { backendPronto, supabase } from '../supabase.js'

const AuthCtx = createContext({
  user: null,
  pronto: backendPronto,
  caricato: !backendPronto,
  signOut: () => {},
})

export function useAuth() {
  return useContext(AuthCtx)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [caricato, setCaricato] = useState(!backendPronto)

  useEffect(() => {
    if (!backendPronto) return
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setCaricato(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, sessione) => {
      setUser(sessione?.user ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const value = {
    user,
    pronto: backendPronto,
    caricato,
    signOut: () => supabase?.auth.signOut(),
  }
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

function SchermataLogin() {
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')
  const [errore, setErrore] = useState(null)
  const [attesa, setAttesa] = useState(false)

  async function entra(e) {
    e.preventDefault()
    setErrore(null)
    setAttesa(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: pwd,
    })
    if (error) {
      setErrore('Email o password non corretti.')
      setAttesa(false)
    }
    // se ok, onAuthStateChange aggiorna lo stato e mostra l'app
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-crema p-6 safe-top safe-bottom">
      <div className="w-14 h-14 rounded-2xl bg-salvia-tenue text-salvia-scuro flex items-center justify-center mb-4">
        <Wallet size={30} strokeWidth={2.2} />
      </div>
      <h1 className="font-display text-3xl font-bold text-salvia-scuro">Famiglia Dolce</h1>
      <p className="text-stone-500 font-semibold mb-6">Cassa · accedi per continuare</p>
      <form onSubmit={entra} className="w-full max-w-sm space-y-3 bg-white rounded-3xl shadow-card p-5">
        <input
          type="email"
          autoComplete="username"
          inputMode="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-2xl border-2 border-stone-200 px-4 py-3 font-semibold text-stone-800 outline-none focus:border-salvia"
        />
        <input
          type="password"
          autoComplete="current-password"
          placeholder="Password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          className="w-full rounded-2xl border-2 border-stone-200 px-4 py-3 font-semibold text-stone-800 outline-none focus:border-salvia"
        />
        {errore ? <p className="text-red-500 text-sm font-semibold">{errore}</p> : null}
        <button
          disabled={attesa || !email || !pwd}
          className="w-full rounded-2xl bg-salvia text-white font-bold py-3.5 text-lg disabled:opacity-40 active:scale-95 transition-transform"
        >
          {attesa ? 'Accesso…' : 'Accedi'}
        </button>
      </form>
    </div>
  )
}

// Cancello: se il backend non è configurato, niente login (modalità locale).
export function GateLogin({ children }) {
  const { pronto, caricato, user } = useAuth()
  if (!pronto) return children
  if (!caricato)
    return (
      <div className="min-h-screen flex items-center justify-center bg-crema text-stone-400 font-semibold">
        Carico…
      </div>
    )
  if (!user) return <SchermataLogin />
  return children
}
