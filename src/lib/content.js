// =====================================================================
// Content access layer
//
// Reads opportunities and partners from the database, returning them in
// the SAME shape the UI components already expect.
//
// Opportunities: published, upcoming (see fetchOpportunities), with real
// confirmed-signup counts. Partners: visible ones only. New columns from
// 0010_audit.sql are optional: queries fall back if they don't exist yet.
// =====================================================================
import { supabase, isSupabaseReady } from './supabase.js';
import { todayLocalISO, isUpcoming, compareOpportunities } from './format.js';

// jsonb columns come back as parsed arrays already, but guard anyway.
const asArray = (v) => (Array.isArray(v) ? v : []);

// ---- Row mappers: DB shape -> the shape the components already use ----

// Exported for the admin editor's live preview, which renders the public
// card from form values.
export function mapOpportunity(row) {
  const partner = row.partner || {};
  return {
    id: row.id, // UUID — this is what signups.opportunity_id references
    // Raw fields; display text comes from formatWhen() in lib/format.js.
    dateLabel: row.date_label || '',
    eventDate: row.event_date || null,
    isOngoing: Boolean(row.is_ongoing),
    timeLabel: row.time_label || '',
    startTime: row.start_time || null,
    location: row.location || '',
    isVirtual: Boolean(row.is_virtual),
    partnerLocation: partner.default_location || '',
    dur: row.duration_label,
    title: row.title,
    partner: partner.name || '',
    partnerId: row.partner_id,
    // Confirmed signups, filled in from get_signup_counts() in fetchOpportunities.
    filled: 0,
    total: row.total_spots,
    // The site styles an "urgent" accent; we map featured -> urgent.
    urgency: row.is_featured ? 'urgent' : 'open',
    is_featured: row.is_featured,
    isFeatured: row.is_featured,
    type: row.kind,
    desc: row.description,
    bring: asArray(row.bring_list),
    notes: row.coordinator_note,
    skills: asArray(row.skill_tags),
    // Absent column (pre-0009) and null both land here as null.
    image: row.image_url || null,
  };
}

function mapPartner(row) {
  return {
    id: row.id,
    status: row.status,
    kind: row.kind || 'ministry',
    name: row.name,
    type: row.type,
    location: row.default_location || '',
    logo: row.logo_url || '',
    website: row.website_url || '',
    since: row.since_text,
    vols: row.volunteers_text,
    mission: row.mission,
    displayOrder: row.display_order ?? 0,
    // Filled in by useContent from this partner's upcoming opportunities.
    needs: [],
  };
}

// A query that names a column added by 0010_audit.sql fails with 42703
// until that migration has run. Callers retry without the new filter so
// the site keeps working either way.
const isMissingColumn = (error) => error?.code === '42703' || /column .* does not exist/i.test(error?.message || '');

// ---- Fetchers ----

/**
 * Confirmed signup counts for every published opportunity, as a map of
 * opportunity id -> count. One call (get_signup_counts, 0010_audit.sql).
 * Returns {} on failure, so counts read 0 rather than breaking the page.
 */
async function fetchSignupCounts() {
  const { data, error } = await supabase.rpc('get_signup_counts');
  if (error) {
    console.error('[CITC] get_signup_counts error:', error);
    return {};
  }
  return Object.fromEntries((data || []).map((r) => [r.opportunity_id, r.confirmed]));
}

/**
 * Fetch upcoming published opportunities with their partner joined in.
 * Public rule: published AND (ongoing OR undated OR on/after today in
 * Titusville). Sorted: dated needs soonest first, then ongoing/undated.
 * Returns [] on any failure (caller decides whether to use fallback).
 */
export async function fetchOpportunities() {
  if (!isSupabaseReady) return [];
  const today = todayLocalISO();

  // `*` rather than an explicit column list: naming a column that doesn't
  // exist yet would make PostgREST 400 the whole query. A wildcard simply
  // omits it. Mirrors adminListOpportunities.
  const base = () =>
    supabase
      .from('opportunities')
      .select(`*, partner:partners ( * )`)
      .eq('is_published', true)
      .order('event_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true });

  const [first, counts] = await Promise.all([
    base().or(`is_ongoing.eq.true,event_date.is.null,event_date.gte.${today}`),
    fetchSignupCounts(),
  ]);
  let { data, error } = first;
  if (error && isMissingColumn(error)) ({ data, error } = await base());

  if (error) {
    console.error('[CITC] fetchOpportunities error:', error);
    return [];
  }
  return (data || [])
    .map(mapOpportunity)
    .filter((o) => isUpcoming(o, today))
    .map((o) => ({ ...o, filled: counts[o.id] || 0 }))
    .sort(compareOpportunities);
}

/**
 * Fetch visible partners, ordered for display.
 */
export async function fetchPartners() {
  if (!isSupabaseReady) return [];
  const base = () =>
    supabase.from('partners').select('*').order('display_order', { ascending: true });

  let { data, error } = await base().eq('is_visible', true);
  if (error && isMissingColumn(error)) ({ data, error } = await base());

  if (error) {
    console.error('[CITC] fetchPartners error:', error);
    return [];
  }
  return (data || []).map(mapPartner);
}

// ---- Derived filter options (replaces the hand-maintained list) ----

export function deriveFilterOptions(opps) {
  const partners = [...new Set(opps.map((o) => o.partner).filter(Boolean))];
  const types = [...new Set(opps.map((o) => o.type).filter(Boolean))];
  const skills = [...new Set(opps.flatMap((o) => o.skills || []))];
  return { partners, types, skills };
}

// ---- Gallery -------------------------------------------------------

function mapGalleryPhoto(row) {
  return {
    id: row.id,
    image: row.image_url,
    caption: row.caption || '',
    place: row.place || '',
    when: row.date_label || '',
    cat: row.category || 'saturday',
    shape: row.shape || 'square',
  };
}

/**
 * Fetch published gallery photos, ordered for display.
 * Returns [] on failure (caller falls back to static).
 */
export async function fetchGalleryPhotos() {
  if (!isSupabaseReady) return [];
  const { data, error } = await supabase
    .from('gallery_photos')
    .select('id, image_url, caption, place, date_label, category, shape, sort_order')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[CITC] fetchGalleryPhotos error:', error);
    return [];
  }
  return (data || []).map(mapGalleryPhoto);
}

export async function fetchGalleryCategories() {
  if (!isSupabaseReady) return [];
  const { data, error } = await supabase
    .from('gallery_categories')
    .select('key, label, sort_order')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[CITC] fetchGalleryCategories error:', error);
    return [];
  }
  return (data || []).map((row) => ({ key: row.key, label: row.label }));
}
