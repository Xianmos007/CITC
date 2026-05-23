// =====================================================================
// Signup business logic
//
// The "I'll be there" flow:
//   1. Look up volunteer by email (smart auto-fill)
//   2. If not found, create a new volunteer row
//   3. Create the signup row linking volunteer to opportunity
//   4. Trigger the edge function that sends confirmation + admin emails
//
// All errors bubble up so the UI can show a friendly message.
// =====================================================================
import { supabase } from './supabase.js';

/**
 * Look up a volunteer by email. Returns the volunteer row if found,
 * or null if not. Used to auto-fill the signup form for returning
 * volunteers — they type their email, we fill in name/phone/church.
 */
export async function findVolunteerByEmail(email) {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();

  const { data, error } = await supabase
    .from('volunteers')
    .select('id, email, name, phone, church')
    .eq('email', normalized)
    .maybeSingle();

  if (error) {
    console.error('[CITC] findVolunteerByEmail error:', error);
    return null;
  }
  return data;
}

/**
 * Create a new volunteer row, or update an existing one with new info.
 * The volunteer's email is the unique key.
 */
async function upsertVolunteer({ name, email, phone, church }) {
  const normalized = email.trim().toLowerCase();

  // Try update first (preserves first_seen_at). If no row exists, insert.
  const existing = await findVolunteerByEmail(normalized);

  if (existing) {
    const { data, error } = await supabase
      .from('volunteers')
      .update({
        name: name.trim(),
        phone: phone?.trim() || existing.phone,
        church: church?.trim() || existing.church,
        last_seen_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw new Error('Could not update volunteer: ' + error.message);
    return data;
  }

  const { data, error } = await supabase
    .from('volunteers')
    .insert({
      name: name.trim(),
      email: normalized,
      phone: phone?.trim() || null,
      church: church?.trim() || null,
    })
    .select()
    .single();

  if (error) throw new Error('Could not create volunteer: ' + error.message);
  return data;
}

/**
 * Create a signup row linking the volunteer to an opportunity.
 *
 * IMPORTANT: we do NOT use .select() here. The `signups` table has a
 * public INSERT policy but (by design, for privacy) NO public SELECT
 * policy — volunteers must not be able to read signup rows. Postgres
 * treats an insert-with-RETURNING as also needing SELECT visibility, so
 * calling .select() as an anonymous user fails with an RLS error even
 * though the insert itself is allowed. We avoid that by generating the
 * id client-side and inserting without reading the row back.
 *
 * Returns a minimal signup object (the id is what the email function needs).
 */
async function createSignup({ opportunityId, volunteerId, isWaitlist }) {
  const id =
    (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : undefined; // DB default fills it if crypto is unavailable

  const row = {
    ...(id ? { id } : {}),
    opportunity_id: opportunityId,
    volunteer_id: volunteerId,
    status: isWaitlist ? 'waitlist' : 'confirmed',
  };

  const { error } = await supabase.from('signups').insert(row);

  if (error) {
    // Friendly handling for the duplicate signup case
    if (error.code === '23505') {
      throw new Error('You\u2019re already signed up for this one. Check your email.');
    }
    throw new Error('Could not create signup: ' + error.message);
  }
  return { id, opportunity_id: opportunityId, volunteer_id: volunteerId, status: row.status };
}

/**
 * Trigger the edge function that sends confirmation + admin emails.
 * If the edge function fails, the signup still succeeded — we log
 * the error but don't fail the whole flow. Cristian can chase down
 * any missed emails from the admin panel later.
 *
 * We pass the publishable key explicitly in both the apikey and
 * Authorization headers. New-format Supabase projects (sb_publishable_…)
 * require the gateway to see a valid key on the function call; for an
 * anonymous visitor the client may not auto-attach one, which causes a
 * 401 before the function code runs. The publishable key is safe to
 * expose in the browser (it's already baked into the build).
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

/**
 * The main entry point. Called when a visitor submits the signup form.
 * Returns { signup, volunteer } on success or throws an Error.
 */
export async function submitSignup({
  opportunityId,
  name,
  email,
  phone,
  church,
  isWaitlist = false,
}) {
  if (!opportunityId) throw new Error('Missing opportunity. Try refreshing.');
  if (!name?.trim()) throw new Error('Please enter your name.');
  if (!email?.trim() || !email.includes('@'))
    throw new Error('Please enter a valid email.');

  const volunteer = await upsertVolunteer({ name, email, phone, church });
  const signup = await createSignup({
    opportunityId,
    volunteerId: volunteer.id,
    isWaitlist,
  });

  // Fire and forget — emails will go through but we don't make the
  // user wait on them.
  triggerEmails(signup.id);

  return { signup, volunteer };
}

/**
 * Get the live count of confirmed signups for an opportunity.
 * Uses the SECURITY DEFINER function we set up in RLS so we don't
 * expose actual signup rows to public users.
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

/**
 * Get a volunteer's signup history by email. Uses the SECURITY DEFINER
 * function so we only return rows matching that email.
 */
export async function lookupMySignups(email) {
  if (!email?.trim()) return [];
  const { data, error } = await supabase.rpc('lookup_my_signups', {
    lookup_email: email.trim().toLowerCase(),
  });
  if (error) {
    console.error('[CITC] lookupMySignups error:', error);
    return [];
  }
  return data || [];
}
