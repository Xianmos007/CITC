// =====================================================================
// Display formatting for opportunities.
//
// An opportunity stores structured fields (event_date, start_time,
// location, is_virtual, is_ongoing). The older free-text labels
// (date_label, time_label) still win when set, as custom overrides such
// as "Every Tuesday".
//
// Works on both mapped DB rows and the static fallback rows in
// src/data/opportunities.js (which only have `date` / `time` text).
// =====================================================================

const DEFAULT_PLACE = 'Titusville, FL';
const TZ = 'America/New_York';

// Today's date in Titusville as YYYY-MM-DD, whatever the visitor's own
// time zone is. en-CA formats as ISO.
export function todayLocalISO(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

// '2026-11-14' -> 'SAT · NOV 14'. Parsed as a calendar date (no time
// zone), so it never shifts a day.
export function formatEventDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
  if (!m) return '';
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  const day = d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
  const mon = d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
  return `${day} · ${mon} ${d.getUTCDate()}`.toUpperCase();
}

// '08:00:00' -> '8:00 AM'
export function formatStartTime(t) {
  const m = /^(\d{1,2}):(\d{2})/.exec(t || '');
  if (!m) return '';
  const h = +m[1];
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${m[2]} ${suffix}`;
}

/**
 * formatWhen(opp) -> { date, time, place }
 *   date:  date label override, else event date, else "Ongoing"
 *   time:  time label override, else start time
 *   place: "Online", else location, else the partner's default location,
 *          else Titusville, FL
 */
export function formatWhen(o = {}) {
  const dateLabel = o.dateLabel ?? o.date ?? '';
  const timeLabel = o.timeLabel ?? o.time ?? '';

  let date = dateLabel || formatEventDate(o.eventDate);
  if (!date && o.isOngoing) date = 'Ongoing';

  const time = timeLabel || formatStartTime(o.startTime);

  const place = o.isVirtual
    ? 'Online'
    : o.location || o.partnerLocation || DEFAULT_PLACE;

  return { date, time, place };
}

// Public visibility rule: ongoing, undated, or today and later.
export function isUpcoming(o, today = todayLocalISO()) {
  if (o.isOngoing || !o.eventDate) return true;
  return o.eventDate >= today;
}

// Featured needs first, even when their date is later. Within each group:
// dated needs first (soonest first), then ongoing / undated ones.
export const isFeatured = (o) => Boolean(o.is_featured ?? o.isFeatured);

export function compareOpportunities(a, b) {
  const af = isFeatured(a);
  const bf = isFeatured(b);
  if (af !== bf) return af ? -1 : 1;
  const ad = a.isOngoing ? null : a.eventDate;
  const bd = b.isOngoing ? null : b.eventDate;
  if (ad && bd) return ad < bd ? -1 : ad > bd ? 1 : 0;
  if (ad) return -1;
  if (bd) return 1;
  return 0;
}
