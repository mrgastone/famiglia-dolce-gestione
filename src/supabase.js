import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './backendConfig.js'

// Se mancano le chiavi, il backend è "non pronto" e le app restano in modalità locale.
export const backendPronto = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

export const supabase = backendPronto
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null
