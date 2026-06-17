import { createClient } from "@supabase/supabase-js";

// Supabase URL and Publishable Client API Key provided by user
export const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL || "https://ranvmnmombkzsmzpiniu.supabase.co";
export const SUPABASE_ANON_KEY = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhbnZtbm1vbWJrenNtenBpbml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNDkwNzEsImV4cCI6MjA5NjcyNTA3MX0.zs-VsTceeR1IxXrrk6pN_PFv7TBSwD0mqAUPqET4gjk";

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

/**
 * Upload any File or Blob to a public Supabase Storage bucket and return its public URL
 */
export async function uploadFileToBucket(
  bucketName: string,
  filePath: string,
  file: File | Blob
): Promise<string> {
  if (!file) throw new Error("No file provided for storage upload.");
  
  // Clean file path to prevent any special characters causing issues with URL paths
  const cleanPath = filePath.replace(/[^a-zA-Z0-9.\-_/]/g, "_");
  
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(cleanPath, file, {
      cacheControl: "3600",
      upsert: true,
    });
    
  if (error) {
    console.error(`Supabase storage upload error in bucket ${bucketName}:`, error);
    throw error;
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from(bucketName)
    .getPublicUrl(cleanPath);
    
  return publicUrl;
}