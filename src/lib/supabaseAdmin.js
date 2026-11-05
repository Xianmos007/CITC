// =====================================================================
// Admin-only Supabase client
//
// The public client (supabase.js) keeps no session, which is right for
// visitors but logged admins out on every refresh. This client persists
// the admin's session in localStorage under its own key and refreshes the
// token, so the admin panel stays signed in.
//
// Only the admin panel (lazy-loaded at #admin) imports this, so public
// visitors never create a second auth client.
// =====================================================================
import { createClient } from '@supabase/supabase-js';
import { isSupabaseReady } from './supabase.js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseAdmin = createClient(
  isSupabaseReady ? url : 'https://unconfigured.invalid',
  isSupabaseReady ? key : 'unconfigured',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'citc-admin',
    },
  }
);
