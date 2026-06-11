/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from "@supabase/supabase-js";

// Supabase URL and Publishable Client API Key provided by user
const SUPABASE_URL = "https://ranvmnmombkzsmzpiniu.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_tnMAA_KZfo_Fsfn8eOeAow_oCOO9tv5";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Helper to check if database tables exist or connection is active.
 * We can perform a lightweight probe to see if our custom tables are ready.
 */
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from("projects").select("id").limit(1);
    if (error && error.code === "PGRST116" || (error && error.message.includes("does not exist"))) {
      // Table doesn't exist, we'll gracefully use state persistence engine
      return false;
    }
    return !error;
  } catch (err) {
    console.warn("Supabase check failed, utilizing resilient client-side fallback:", err);
    return false;
  }
}
