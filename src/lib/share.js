// =====================================================================
// Share + calendar helpers for an opportunity (public modal and admin).
//
// All take the mapped opportunity shape from content.js (mapOpportunity):
// { id, title, partner, eventDate, startTime, isOngoing, dur, total,
//   filled, ... }.
// =====================================================================
import { siteUrl } from '../data/pageMeta.js';
import { formatWhen } from './format.js';

const TZ = 'America/New_York';

export const oppLink = (id) => `${siteUrl}/volunteer/${id}`;

/** "Serve with us — Yard cleanup with NBC, SAT · NOV 14 at 8:00 AM. 3 spots left: <link>" */
export function textMessage(o) {
  const { date, time } = formatWhen(o);
  const left = Math.max((Number(o.total) || 0) - (Number(o.filled) || 0), 0);
  let msg = `Serve with us — ${o.title}`;
  if (o.partner) msg += ` with ${o.partner}`;
  if (date) msg += `, ${date}`;
  if (time) msg += ` at ${time}`;
  msg += '. ';
  msg += left === 0 ? 'Waitlist open' : `${left} ${left === 1 ? 'spot' : 'spots'} left`;
  return `${msg}: ${oppLink(o.id)}`;
}

/** Copy text; resolves true on success. Falls back for older browsers. */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

// ---- Calendar -------------------------------------------------------

// Hours from a duration label: "2 hours", "2.5 hours", "90 minutes",
// "Half day", "Full day". 2 when it can't tell.
export function durationHours(label) {
  const s = String(label || '').toLowerCase();
  if (s.includes('half day')) return 4;
  if (s.includes('full day')) return 8;
  const n = parseFloat(s);
  if (!Number.isFinite(n) || n <= 0) return 2;
  return /min/.test(s) ? n / 60 : n;
}

/** True when a need has a real date to put on a calendar. */
export const canAddToCalendar = (o) => Boolean(o && !o.isOngoing && o.eventDate);

// Local Titusville wall-clock start/end as UTC Date objects whose UTC
// fields hold the *local* time (no zone math), or null for all-day.
function localTimes(o) {
  const [y, m, d] = o.eventDate.split('-').map(Number);
  const t = /^(\d{1,2}):(\d{2})/.exec(o.startTime || '');
  if (!t) return null;
  const start = new Date(Date.UTC(y, m - 1, d, +t[1], +t[2]));
  const end = new Date(start.getTime() + durationHours(o.dur) * 3600 * 1000);
  return { start, end };
}

const stamp = (d) => d.toISOString().replace(/[-:]/g, '').slice(0, 15); // YYYYMMDDTHHMMSS
const ymd = (iso) => iso.replace(/-/g, '');
const nextDay = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
};

const details = (o) =>
  `${o.partner ? `With ${o.partner}. ` : ''}Details and signups: ${oppLink(o.id)}`;

/** Google Calendar "add event" link. Times are Titusville-local via ctz. */
export function googleCalendarUrl(o) {
  if (!canAddToCalendar(o)) return '';
  const lt = localTimes(o);
  const dates = lt
    ? `${stamp(lt.start)}/${stamp(lt.end)}`
    : `${ymd(o.eventDate)}/${ymd(nextDay(o.eventDate))}`;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: o.title,
    dates,
    ctz: TZ,
    details: details(o),
    location: formatWhen(o).place,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// Offset of Titusville from UTC, in minutes, at a given UTC instant
// (-300 in winter, -240 in summer).
function tzOffsetMinutes(utcDate) {
  const part = new Intl.DateTimeFormat('en-US', { timeZone: TZ, timeZoneName: 'shortOffset' })
    .formatToParts(utcDate)
    .find((p) => p.type === 'timeZoneName')?.value;
  const m = /GMT([+-]\d{1,2})(?::(\d{2}))?/.exec(part || '');
  if (!m) return -300;
  const h = Number(m[1]);
  return h * 60 + Math.sign(h || 1) * Number(m[2] || 0);
}

// Local wall-clock (stored in UTC fields) -> the real UTC instant.
function localToUtc(local) {
  const guess = new Date(local.getTime() - tzOffsetMinutes(local) * 60000);
  return new Date(local.getTime() - tzOffsetMinutes(guess) * 60000);
}

const icsEscape = (s) => String(s || '').replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');

/** An .ics calendar file for the need (UTC times, so every app agrees). */
export function buildIcs(o) {
  if (!canAddToCalendar(o)) return '';
  const lt = localTimes(o);
  const when = lt
    ? [`DTSTART:${stamp(localToUtc(lt.start))}Z`, `DTEND:${stamp(localToUtc(lt.end))}Z`]
    : [`DTSTART;VALUE=DATE:${ymd(o.eventDate)}`, `DTEND;VALUE=DATE:${ymd(nextDay(o.eventDate))}`];
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Church in the City//Volunteer//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${o.id}@thechurchinthecity.org`,
    `DTSTAMP:${stamp(new Date())}Z`,
    ...when,
    `SUMMARY:${icsEscape(o.title)}`,
    `DESCRIPTION:${icsEscape(details(o))}`,
    `LOCATION:${icsEscape(formatWhen(o).place)}`,
    `URL:${oppLink(o.id)}`,
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}

/** Start a download of the .ics file in the browser. */
export function downloadIcs(o) {
  const ics = buildIcs(o);
  if (!ics) return;
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${String(o.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'need'}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
