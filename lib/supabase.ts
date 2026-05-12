import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// TEST: Schau in dein Terminal/Konsole beim Starten
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("ACHTUNG: Supabase Variablen fehlen! Prüfe deine .env.local Datei.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)