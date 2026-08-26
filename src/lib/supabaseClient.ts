import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Secure server-side credential loading (never exposed to client browser)
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseServiceKey);

let _supabase: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  _supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

export const supabase = _supabase;
