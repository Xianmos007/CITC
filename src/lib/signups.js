// =====================================================================
// Signup business logic
//
// The "I'll be there" flow:
//   1. Call submit_signup() (0010_audit.sql). The database finds or
//      creates the volunteer, decides confirmed vs waitlist, and records
//      the signup. The browser never reads or writes `volunteers`.
//   2. Trigger the edge function that sends confirmation + admin emails.
//   3. Remember the visitor's details on this device so the form is
//      pre-filled next time (replaces the old email lookup).
//
// All errors bubble up so the UI can show a friendly message.
// =====================================================================
import { supabase } from './supabase.js';

// ---- This-device memory ---------------------------------------------

const DEVICE_KEY = 'citc:volunteer';

/** The details saved after this device's last successful signup, or null. */
export function loadSavedVolunteer() {
  try {
    const raw = window.localStorage.getItem(DEVICE_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw);
    return v && typeof v.email === 'string' ? v : null;
  } catch {
    return null;
  }
}

function saveVolunteer({ name, email, phone, church }) {
  try {
    window.localStorage.setItem(
      DEVICE_KEY,
      JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone?.trim() || '', church: church?.trim() || '' })
    );
  } catch {
    // Private mode or storage blocked: the form just won't be pre-filled.
  }
}

export function clearSavedVolunteer() {
  try {
    window.localStorage.removeItem(DEVICE_KEY);
  } catch {
    // Nothing to clear.
  }
}

// ---- Emails ---------------------------------------------------------

/**
 * Trigger the edge function that sends confirmation + admin emails.
 * If the edge function fails, the signup still succeeded — we log
 * the error but don't fail the whole flow.
 *
 * We pass the publishable key explicitly in both the apikey and
 * Authorization headers. New-format Supabase projects (sb_publishable_…)
 * require the gateway to see a valid key on the function call; for an
 * anonymous visitor the client may not auto-attach one, which causes a
 * 401 before the function code runs.
 */
async function triggerEmails(signupId) {
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  try {
    const { error } = await supabase.functions.invoke('send-signup-emails', {
      body: { signup_id: signupId },
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });
    if (error) {
      console.warn('[CITC] Email send failed (signup still saved):', error);
    }
  } catch (e) {
    console.warn('[CITC] Email function unreachable (signup still saved):', e);
  }
}

// ---- Submit ---------------------------------------------------------

/**
 * Called when a visitor submits the signup form.
 * Returns { signupId, status } where status is 'confirmed' or 'waitlist',
 * or throws an Error with a message fit to show the visitor.
 */
export async function submitSignup({ opportunityId, name, email, phone, church }) {
  if (!opportunityId) throw new Error('Missing opportunity. Try refreshing.');
  if (!name?.trim()) throw new Error('Please enter your name.');
  if (!email?.trim() || !email.includes('@')) throw new Error('Please enter a valid email.');

  const { data, error } = await supabase.rpc('submit_signup', {
    p_opportunity_id: opportunityId,
    p_name: name,
    p_email: email,
    p_phone: phone || null,
    p_church: church || null,
  });

  if (error) {
    if (error.code === '23505') {
      throw new Error('You’re already signed up for this one. Check your email.');
    }
    // Messages raised inside submit_signup() (P0001) are written for
    // visitors ("Please enter your name.") — pass them straight through.
    if (error.code === 'P0001' && error.message) throw new Error(error.message);
    console.error('[CITC] submit_signup error:', error);
    throw new Error('We couldn’t save your signup. Please try again in a minute.');
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.signup_id) throw new Error('We couldn’t save your signup. Please try again in a minute.');

  saveVolunteer({ name, email, phone, church });

  // Fire and forget — emails go out without making the visitor wait.
  triggerEmails(row.signup_id);

  return { signupId: row.signup_id, status: row.status };
}

/**
 * Live count of confirmed signups for one opportunity, via the existing
 * SECURITY DEFINER function, so signup rows stay private.
 */
export async function getSignupCount(opportunityId) {
  const { data, error } = await supabase.rpc('get_opportunity_signup_count', {
    opp_id: opportunityId,
  });
  if (error) {
    console.error('[CITC] getSignupCount error:', error);
    return 0;
  }
  return data || 0;
}
