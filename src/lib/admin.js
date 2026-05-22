// =====================================================================
// Admin data layer
//
// Auth: Supabase email+password. Only accounts you create in the
// Supabase dashboard (Authentication → Users) can sign in; there is no
// public sign-up. All writes require an authenticated session, enforced
// at the database level by RLS.
//
// Column names match the EXISTING Stage 1 schema (see content.js header).
// =====================================================================
import { supabase } from './supabase.js';

// ---- Auth ----

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data?.session || null;
}

export function onAuthChange(cb) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session));
  return () => data?.subscription?.unsubscribe();
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw new Error(error.message);
  return data.session;
}

export async function signOut() {
  await supabase.auth.signOut();
}

// ---- Opportunities CRUD (admin) ----
// Reads ALL rows (including unpublished), which the public layer does
// not — works because an authenticated admin passes the RLS admin policy.

export async function adminListOpportunities() {
  const { data, error } = await supabase
    .from('opportunities')
    .select(`*, partner:partners ( id, name )`)
    .order('event_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function adminListPartners() {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .order('display_order', { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function createOpportunity(fields) {
  const payload = {
    partner_id: fields.partner_id || null,
    title: fields.title?.trim(),
    description: fields.description?.trim() || null,
    event_date: fields.event_date || null,
    date_label: fields.date_label?.trim() || null,
    time_label: fields.time_label?.trim() || null,
    duration_label: fields.duration_label?.trim() || null,
    kind: fields.kind?.trim() || null,
    is_featured: fields.is_featured ?? false,
    total_spots: Number(fields.total_spots) || 1,
    bring_list: fields.bring_list || [],       // jsonb
    coordinator_note: fields.coordinator_note?.trim() || null,
    skill_tags: fields.skill_tags || [],       // jsonb
    is_published: fields.is_published ?? true,
  };
  const { data, error } = await supabase
    .from('opportunities')
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateOpportunity(id, fields) {
  const payload = { ...fields };
  delete payload.id;
  delete payload.partner;     // joined object, not a column
  delete payload.created_at;
  delete payload.updated_at;  // DB trigger / default handles this
  const { data, error } = await supabase
    .from('opportunities')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// Soft-delete: unpublish so it leaves the public site but the row and
// its signup history survive.
export async function unpublishOpportunity(id) {
  return updateOpportunity(id, { is_published: false });
}

export async function updatePartner(id, fields) {
  const payload = { ...fields };
  delete payload.id;
  delete payload.created_at;
  delete payload.updated_at;
  const { data, error } = await supabase
    .from('partners')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// ---- Signups (read-only admin view) ----
export async function adminListSignups() {
  const { data, error } = await supabase
    .from('signups')
    .select(
      `id, status, created_at,
       volunteer:volunteers ( name, email, phone, church ),
       opportunity:opportunities ( title, date_label )`
    )
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}
