// Configurazione del backend Supabase (usato dall'app Cassa).
// La "publishable key" è PUBBLICA per design: può stare nel codice perché i dati
// sono protetti dal login + dalle Row Level Security. NON mettere qui la service_role
// né la password del database.
export const SUPABASE_URL = 'https://hrwefkasikedipgpstzp.supabase.co'
export const SUPABASE_ANON_KEY = 'sb_publishable_tpzt2j3uGr18dYtahM3ERg_Puutk26K'
