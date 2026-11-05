// Shared mailto: links for buttons that don't have a real form yet.
// Phase 6 of SPEC-audit-fixes replaces most of these with inbox forms.

export const teamEmail = 'cristian.m@trinityfla.org';

const encode = (value) => encodeURIComponent(value).replace(/'/g, '%27');

export function mailtoHref(subject, body) {
  const params = [];
  if (subject) params.push(`subject=${encode(subject)}`);
  if (body) params.push(`body=${encode(body)}`);
  return `mailto:${teamEmail}${params.length ? `?${params.join('&')}` : ''}`;
}

export const postNeedHref = mailtoHref(
  'New need for the CITC portal',
  "Ministry:\nWhat's the need:\nDate and time:\nVolunteers needed:\nAnything else:"
);
export const becomePartnerHref = mailtoHref('Becoming a Church in the City partner');
export const emailTeamHref = mailtoHref('Hello from the Church in the City site');
export const contactHref = mailtoHref('Contact from the Church in the City site');
export const submitPhotoHref = mailtoHref('Photo for The Saturdays');
