// =====================================================================
// Content access layer
//
// Reads opportunities and partners from the database, returning them in
// the SAME shape the UI components already expect.
//
// IMPORTANT: column names below match the EXISTING Stage 1 schema:
//   opportunities: kind, skill_tags (jsonb), bring_list (jsonb),
//                  is_featured, event_date, total_spots, partner_id,
//                  program_id, is_published   (no slug, no urgency,
//                  no sort_order)
//   partners:      since_text, volunteers_text, display_order,
//                  status, type, mission       (no slug, no needs,
//                  no is_published)
//
// The UI's `urgency` concept is derived from is_featured; the "full"
// state is computed at render time from live signup count vs total.
// =====================================================================
import { supabase, isSupabaseReady } from './supabase.js';

// jsonb columns come back as parsed arrays already, but guard anyway.
const asArray = (v) => (Array.isArray(v) ? v : []);

// ---- Row mappers: DB shape -> the shape the components already use ----

function mapOpportunity(row) {
  return {
    id: row.id, // UUID — this is what signups.opportunity_id references
    date: row.date_label,
    time: row.time_label,
    dur: row.duration_label,
    title: row.title,
    partner: row.partner?.name || '',
    partnerId: row.partner_id,
    // `filled` is a static fallback; OppModal overlays the live count.
    filled: 0,
    total: row.total_spots,
    // The site styles an "urgent" accent; we map featured -> urgent.
    urgency: row.is_featured ? 'urgent' : 'open',
    isFeatured: row.is_featured,
    type: row.kind,
    desc: row.description,
    bring: asArray(row.bring_list),
    notes: row.coordinator_note,
    skills: asArray(row.skill_tags),
    eventDate: row.event_date,
  };
}

function mapPartner(row) {
  return {
    id: row.id,
    status: row.status,
    name: row.name,
    type: row.type,
    since: row.since_text,
    vols: row.volunteers_text,
    mission: row.mission,
    // The partners page renders a `needs` list. The Stage 1 schema has
    // no needs column, so derive it from this partner's opportunities
    // (filled in by fetchPartners below). Defaults to empty.
    needs: row._needs || [],
  };
}

// ---- Fetchers ----

/**
 * Fetch published opportunities with their partner name joined in.
 * Ordered by event date so the soonest needs show first.
 * Returns [] on any failure (caller decides whether to use fallback).
 */
export async function fetchOpportunities() {
  if (!isSupabaseReady) return [];
  const { data, error } = await supabase
    .from('opportunities')
    .select(
      `
      id, partner_id, program_id, title, description, event_date,
      date_label, time_label, duration_label, total_spots, bring_list,
      coordinator_note, kind, skill_tags, is_published, is_featured,
      partner:partners ( id, name )
    `
    )
    .eq('is_published', true)
    .order('event_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[CITC] fetchOpportunities error:', error);
    return [];
  }
  return (data || []).map(mapOpportunity);
}

/**
 * Fetch partners, ordered for display. The Stage 1 partners table has no
 * is_published column, so all partners are shown. We also derive each
 * partner's `needs` list from its currently-published opportunities so
 * the Partners page's "How we serve together" section stays populated.
 */
export async function fetchPartners() {
  if (!isSupabaseReady) return [];

  const [{ data: partnerRows, error: pErr }, { data: oppRows }] =
    await Promise.all([
      supabase
        .from('partners')
        .select(
          `id, status, name, type, since_text, volunteers_text, mission, display_order`
        )
        .order('display_order', { ascending: true }),
      supabase
        .from('opportunities')
        .select(`partner_id, title, date_label, is_published`)
        .eq('is_published', true),
    ]);

  if (pErr) {
    console.error('[CITC] fetchPartners error:', pErr);
    return [];
  }

  // Group opportunity titles under each partner to synthesize `needs`.
  const needsByPartner = {};
  (oppRows || []).forEach((o) => {
    if (!o.partner_id) return;
    (needsByPartner[o.partner_id] ||= []).push({
      title: o.title,
      cadence: o.date_label || '',
    });
  });

  return (partnerRows || []).map((row) =>
    mapPartner({ ...row, _needs: needsByPartner[row.id] || [] })
  );
}

// ---- Derived filter options (replaces the hand-maintained list) ----

export function deriveFilterOptions(opps) {
  const partners = [...new Set(opps.map((o) => o.partner).filter(Boolean))];
  const types = [...new Set(opps.map((o) => o.type).filter(Boolean))];
  const skills = [...new Set(opps.flatMap((o) => o.skills || []))];
  return { partners, types, skills };
}
