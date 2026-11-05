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
// Admin panel only: uses the admin client, which keeps the session.
import { supabaseAdmin as supabase } from './supabaseAdmin.js';

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
    .select(`*, partner:partners ( * )`)
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

// Columns an opportunity save writes. The editor builds this shape;
// see OppEditor.formToPayload.
function oppPayload(fields) {
  const payload = {
    partner_id: fields.partner_id || null,
    title: fields.title?.trim(),
    description: fields.description?.trim() || null,
    event_date: fields.event_date || null,
    start_time: fields.start_time || null,
    date_label: fields.date_label?.trim() || null,
    time_label: fields.time_label?.trim() || null,
    duration_label: fields.duration_label?.trim() || null,
    location: fields.location?.trim() || null,
    is_virtual: Boolean(fields.is_virtual),
    is_ongoing: Boolean(fields.is_ongoing),
    kind: fields.kind?.trim() || null,
    is_featured: fields.is_featured ?? false,
    total_spots: Number(fields.total_spots) || 1,
    bring_list: fields.bring_list || [], // jsonb
    coordinator_note: fields.coordinator_note?.trim() || null,
    skill_tags: fields.skill_tags || [], // jsonb
    is_published: fields.is_published ?? true,
  };
  if ('image_url' in fields) payload.image_url = fields.image_url || null;
  return payload;
}

export async function createOpportunity(fields) {
  const { data, error } = await supabase
    .from('opportunities')
    .insert(oppPayload(fields))
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

/** Insert several opportunities at once (the editor's "Repeat" option). */
export async function createOpportunities(list) {
  const { data, error } = await supabase
    .from('opportunities')
    .insert(list.map(oppPayload))
    .select();
  if (error) throw new Error(error.message);
  return data || [];
}

export async function createPartner(fields) {
  const payload = {
    kind: fields.kind || 'ministry',
    name: fields.name?.trim(),
    status: fields.status || 'On the horizon',
    type: fields.type?.trim() || null,
    since_text: fields.since_text?.trim() || null,
    volunteers_text: fields.volunteers_text?.trim() || null,
    mission: fields.mission?.trim() || null,
    contact_name: fields.contact_name?.trim() || null,
    contact_email: fields.contact_email?.trim() || null,
    auto_notify: fields.auto_notify ?? false,
    display_order: Number(fields.display_order) || 0,
  };
  const { data, error } = await supabase
    .from('partners')
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function saveOpportunity(id, fields) {
  return updateOpportunity(id, oppPayload(fields));
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
  delete payload.needs;
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

/**
 * Signup counts for every opportunity (published or not, past or not):
 * { [opportunity_id]: { confirmed, waitlist } }. Admins can read signups
 * directly through the signups_admin_all policy.
 */
export async function adminSignupCounts() {
  const { data, error } = await supabase.from('signups').select('opportunity_id, status');
  if (error) throw new Error(error.message);
  const counts = {};
  (data || []).forEach(({ opportunity_id: id, status }) => {
    const c = (counts[id] ||= { confirmed: 0, waitlist: 0 });
    if (status === 'confirmed') c.confirmed++;
    else if (status === 'waitlist') c.waitlist++;
  });
  return counts;
}

/** Everyone signed up for one opportunity, oldest first. */
export async function adminListRoster(opportunityId) {
  const { data, error } = await supabase
    .from('signups')
    .select('id, status, created_at, volunteer:volunteers ( name, email, phone, church )')
    .eq('opportunity_id', opportunityId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function updateSignupStatus(signupId, status) {
  const { error } = await supabase.from('signups').update({ status }).eq('id', signupId);
  if (error) throw new Error(error.message);
}

// ---- Gallery CRUD (admin) ------------------------------------------

export async function adminListGalleryPhotos() {
  const { data, error } = await supabase
    .from('gallery_photos')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function createGalleryPhoto(fields) {
  const payload = {
    image_url: fields.image_url,
    caption: fields.caption?.trim() || null,
    place: fields.place?.trim() || null,
    date_label: fields.date_label?.trim() || null,
    category: fields.category || 'saturday',
    shape: fields.shape || 'square',
    is_published: fields.is_published ?? true,
    sort_order: Number(fields.sort_order) || 0,
  };
  const { data, error } = await supabase
    .from('gallery_photos')
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateGalleryPhoto(id, fields) {
  const payload = { ...fields };
  delete payload.id;
  delete payload.created_at;
  delete payload.updated_at;
  const { data, error } = await supabase
    .from('gallery_photos')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteGalleryPhoto(id) {
  const { error } = await supabase.from('gallery_photos').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ---- Gallery categories CRUD (admin) -------------------------------

function slugifyCategory(label) {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30)
    .replace(/-+$/g, '');
}

export async function adminListGalleryCategories() {
  const { data, error } = await supabase
    .from('gallery_categories')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function createGalleryCategory(label) {
  const cleanLabel = label?.trim();
  if (!cleanLabel) throw new Error('A category name is required.');

  const key = slugifyCategory(cleanLabel);
  if (!key) throw new Error('Please use at least one letter or number.');

  const existing = await adminListGalleryCategories();
  const maxSort = existing.reduce((max, row) => Math.max(max, Number(row.sort_order) || 0), -1);
  const { data, error } = await supabase
    .from('gallery_categories')
    .insert({ key, label: cleanLabel, sort_order: maxSort + 1 })
    .select()
    .single();
  if (error?.code === '23505') throw new Error('That category already exists.');
  if (error) throw new Error(error.message);
  return data;
}

export async function updateGalleryCategory(id, fields) {
  const payload = { ...fields };
  delete payload.id;
  delete payload.created_at;
  const { data, error } = await supabase
    .from('gallery_categories')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteGalleryCategory(id) {
  const { error } = await supabase.from('gallery_categories').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
