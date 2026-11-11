// Pure date helpers for the admin opportunities screens.
import { todayLocalISO } from '../../lib/format.js';

const parse = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};
const toISO = (date) => date.toISOString().slice(0, 10);

/** Which list a row belongs in: 'draft' | 'ongoing' | 'past' | 'upcoming'. */
export function classifyOpp(row, today = todayLocalISO()) {
  if (!row.is_published) return 'draft';
  if (row.is_ongoing || !row.event_date) return 'ongoing';
  return row.event_date < today ? 'past' : 'upcoming';
}

// Same weekday as `date`, in the month `monthsAhead` later: the 2nd
// Saturday stays the 2nd Saturday. A 5th weekday that doesn't exist in
// that month falls back to the month's last one.
function sameWeekdayMonthsLater(date, monthsAhead) {
  const weekday = date.getUTCDay();
  const nth = Math.ceil(date.getUTCDate() / 7); // 1..5
  const first = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + monthsAhead, 1));
  const offset = (weekday - first.getUTCDay() + 7) % 7;
  let day = 1 + offset + (nth - 1) * 7;
  const daysInMonth = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  while (day > daysInMonth) day -= 7;
  return new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), day));
}

/**
 * The extra dates a repeat creates after `startISO`.
 * mode: 'none' | 'weekly' | 'biweekly' | 'monthly'; count: 1–12.
 */
export function repeatDates(startISO, mode, count) {
  if (!startISO || mode === 'none' || !count) return [];
  const start = parse(startISO);
  const out = [];
  for (let i = 1; i <= count; i++) {
    let d;
    if (mode === 'weekly') d = new Date(start.getTime() + i * 7 * 864e5);
    else if (mode === 'biweekly') d = new Date(start.getTime() + i * 14 * 864e5);
    else d = sameWeekdayMonthsLater(start, i);
    out.push(toISO(d));
  }
  return out;
}

/** "Nov 14, 21, 28, Dec 5" — month named only when it changes. */
export function listDates(isoDates) {
  let lastMonth = '';
  return isoDates
    .map((iso) => {
      const d = parse(iso);
      const mon = d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
      const label = mon === lastMonth ? String(d.getUTCDate()) : `${mon} ${d.getUTCDate()}`;
      lastMonth = mon;
      return label;
    })
    .join(', ');
}
