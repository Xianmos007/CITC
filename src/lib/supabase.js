// =====================================================================
// Supabase client
//
// Reads the project URL and publishable key from environment variables
// that are baked into the build at compile time by Vite + GitHub Actions.
//
// To run locally, create a .env.local file at the project root with:
//   VITE_SUPABASE_URL=https://xsdnopfsmrabhhqwlmyr.supabase.co
//   VITE_SUPABASE_ANON_KEY=sb_publishable_...
//
// In production, these come from GitHub Actions secrets.
// =====================================================================
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  // This warning shows up in the browser console at runtime if the
  // build was missing its env vars. The site will still render, but
  // database-touching features (signups, etc.) will fail.
  console.warn(
    '[CITC] Supabase env vars are missing. ' +
      'Check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY ' +
      'are set in GitHub repo secrets.'
  );
}

// createClient throws on an empty URL, which would take the whole app down
// at import time. When the env vars are missing we hand it an unreachable
// placeholder instead: the module loads, the static fallback in useContent
// kicks in, and `isSupabaseReady` below keeps real queries from firing.
const PLACEHOLDER_URL = 'https://unconfigured.invalid';
const PLACEHOLDER_KEY = 'unconfigured';

export const supabase = createClient(url || PLACEHOLDER_URL, key || PLACEHOLDER_KEY, {
  auth: {
    // We don't use Supabase Auth for public volunteers — they sign up
    // by email without a password. Stage 3 will add admin auth.
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Convenience: surface whether the client is properly configured,
// so UI code can show a friendly error if not.
export const isSupabaseReady = Boolean(url && key);
