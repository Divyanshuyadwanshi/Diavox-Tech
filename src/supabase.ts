import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * HARD FAIL if env is missing
 */
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "❌ Missing Supabase environment variables. Check .env file."
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Robust Supabase connection check
 */
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    // safer system table check (avoids RLS issues)
    const { error } = await supabase.from("profiles").select("*").limit(1);

    if (error) {
      console.warn("Supabase check failed:", error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.warn("Supabase connection failed:", err);
    return false;
  }
}