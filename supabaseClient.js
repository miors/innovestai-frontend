import { createClient } from "@supabase/supabase-js";

// Pull public credentials from your Vite local runtime configuration maps
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase environment variable configurations.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
