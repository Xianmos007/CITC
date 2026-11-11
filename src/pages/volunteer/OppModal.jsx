import { useState, useEffect } from 'react';
import {
  submitSignup,
  getSignupCount,
  loadSavedVolunteer,
  clearSavedVolunteer,
} from '../../lib/signups.js';
import { formatWhen } from '../../lib/format.js';
import { canAddToCalendar, googleCalendarUrl, downloadIcs } from '../../lib/share.js';
import { isSupabaseReady } from '../../lib/supabase.js';
import { useDialog } from '../../hooks/useDialog.js';

// =====================================================================
// OppModal
//
// Three states:
//   'idle'    — viewing the opportunity, "I'll be there" not clicked
//   'form'    — signup form is showing
//   'done'    — signup confirmed
//   'error'   — something went wrong
// =====================================================================
export function OppModal({ oppId, opportunities = [], loading = false, close }) {
  const [state, setState] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  // Nothing renders while a shared link is still loading its need.
  const dialogRef = useDialog(!loading || opportunities.some((x) => x.id === oppId));


  // Live count of how many people have signed up for this opportunity.
  // We fetch this when the modal opens so the "filled" bar is real,
  // not the hardcoded number from opportunities.js.
  const [liveFilled, setLiveFilled] = useState(null);

  // Form state, pre-filled from this device's last signup (if any).
  const [saved, setSaved] = useState(loadSavedVolunteer);
  const [name, setName] = useState(saved?.name || '');
  const [email, setEmail] = useState(saved?.email || '');
  const [phone, setPhone] = useState(saved?.phone || '');
  const [church, setChurch] = useState(saved?.church || '');
  const [submitting, setSubmitting] = useState(false);
  // 'confirmed' or 'waitlist', as decided by the server.
  const [resultStatus, setResultStatus] = useState(null);

  const forgetMe = () => {
    clearSavedVolunteer();
    setSaved(null);
    setName('');
    setEmail('');
    setPhone('');
    setChurch('');
  };

  const o = opportunities.find((x) => x.id === oppId);
  const oId = o?.id;

  // Fetch live signup count when modal opens
  useEffect(() => {
    if (!oId || !isSupabaseReady) return;
    let cancelled = false;
    getSignupCount(oId).then((n) => {
      if (!cancelled) setLiveFilled(n);
    });
    return () => {
      cancelled = true;
    };
  }, [oId]);

  if (!o) {
    // Still loading: show nothing yet. Loaded and not found: the link is to
    // a need that has passed, filled and closed, or was unpublished.
    if (loading) return null;
    return (
      <div className="modal-scrim" onClick={close}>
        <div
          className="modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="opp-modal-title"
          tabIndex={-1}
          ref={dialogRef}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="modal-close" onClick={close} aria-label="Close">
            ✕
          </button>
          <div className="modal-head">
            <h2 id="opp-modal-title">This need isn&rsquo;t open anymore.</h2>
          </div>
          <div className="modal-body">
            <p className="lede">
              It may have already happened, or the ministry took it down. There
              are other ways to show up this week.
            </p>
          </div>
          <div className="modal-foot">
            <span className="spots"></span>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={close}>
                See open needs <span className="arrow">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Use the live count if we have it, otherwise the static fallback
  const filled = liveFilled !== null ? liveFilled : o.filled;
  const full = filled >= o.total;
  const bring = (o.bring || []).filter((b) => String(b).trim());

  // -------------------------------------------------------------------
  // Submit the signup form.
  // -------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setErrorMessage('');

    try {
      const result = await submitSignup({
        opportunityId: o.id,
        name,
        email,
        phone,
        church,
      });
      setResultStatus(result.status);
      setSaved(loadSavedVolunteer());
      setState('done');
      // Refresh the count
      const newCount = await getSignupCount(o.id);
      setLiveFilled(newCount);
    } catch (err) {
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
      setState('error');
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------
  return (
    <div className="modal-scrim" onClick={close}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="opp-modal-title"
        tabIndex={-1}
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={close} aria-label="Close">
          ✕
        </button>

        <OppModalHead o={o} full={full} titleId="opp-modal-title" />

        <div className="modal-body">
          {/* DONE STATE */}
          {state === 'done' && (
            <>
              <div className="success-banner" style={{ marginBottom: 24 }}>
                {resultStatus === 'waitlist' ? (
                  <>
                    <h4>You&rsquo;re on the waitlist.</h4>
                    <p>
                      This one filled up. We sent a note to <strong>{email}</strong>,
                      and we&rsquo;ll email you if a spot opens.
                    </p>
                  </>
                ) : (
                  <>
                    <h4>You&rsquo;re in.</h4>
                    <p>
                      We just sent a confirmation to <strong>{email}</strong> with the
                      details. Bring what&rsquo;s on the list. Bring a friend if you can.
                    </p>
                  </>
                )}
              </div>
              {resultStatus !== 'waitlist' && canAddToCalendar(o) && (
                <div className="calendar-actions">
                  <span className="calendar-label">Add to calendar</span>
                  <a
                    className="btn btn-ghost btn-sm"
                    href={googleCalendarUrl(o)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Google Calendar
                  </a>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => downloadIcs(o)}>
                    Apple / Outlook (.ics)
                  </button>
                </div>
              )}
              {bring.length > 0 && (
                <>
                  <h4>What to bring</h4>
                  <ul>
                    {bring.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}

          {/* ERROR STATE */}
          {state === 'error' && (
            <>
              <div className="success-banner error" style={{ marginBottom: 24 }}>
                <h4>Hm — something went wrong.</h4>
                <p>{errorMessage}</p>
              </div>
            </>
          )}

          {/* FORM STATE */}
          {state === 'form' && (
            <form id="signup-form" onSubmit={handleSubmit} className="signup-form">
              <p className="lede" style={{ marginBottom: 20 }}>
                {full
                  ? 'This one is full. Join the waitlist and we\u2019ll email you if a spot opens.'
                  : 'Tell us how to reach you. We\u2019ll send a confirmation and the meetup details.'}
              </p>

              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                />
                {saved && (
                  <span className="hint">
                    Filled in from your last signup on this device.{' '}
                    <button type="button" className="text-link" onClick={forgetMe}>
                      Not you? Clear
                    </button>
                  </span>
                )}
              </div>

              <div className="field">
                <label>Your name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  placeholder="First and last"
                />
              </div>

              <div className="form-row">
                <div className="field">
                  <label>Phone (optional)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    placeholder="(321) 555-0142"
                  />
                </div>
                <div className="field">
                  <label>Your church (optional)</label>
                  <input
                    type="text"
                    value={church}
                    onChange={(e) => setChurch(e.target.value)}
                    placeholder="Cypress Community"
                  />
                </div>
              </div>

              <p className="modal-fineprint">
                By signing up, your contact info will be shared with the partner
                ministry so they can coordinate with you. We don’t share it
                beyond that.
              </p>
            </form>
          )}

          {/* IDLE STATE — opportunity details */}
          {state === 'idle' && <OppDetailsBody o={o} />}
        </div>

        <div className="modal-foot">
          <span className="spots">
            <strong>{filled}</strong> of {o.total}{' '}
            {full ? 'spots filled · waitlist open' : 'signed up'}
          </span>
          <div className="modal-actions">
            {/* DONE — show close + calendar button */}
            {state === 'done' && (
              <>
                <button className="btn btn-primary" onClick={close}>
                  Close
                </button>
              </>
            )}

            {/* ERROR — let them try again */}
            {state === 'error' && (
              <>
                <button className="btn btn-ghost" onClick={close}>
                  Close
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setState('form');
                    setErrorMessage('');
                  }}
                >
                  Try again <span className="arrow">→</span>
                </button>
              </>
            )}

            {/* FORM — submit button */}
            {state === 'form' && (
              <>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setState('idle')}
                  disabled={submitting}
                >
                  Back
                </button>
                <button
                  type="submit"
                  form="signup-form"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting
                    ? 'Saving\u2026'
                    : full
                    ? 'Join waitlist'
                    : 'Confirm signup'}{' '}
                  <span className="arrow">→</span>
                </button>
              </>
            )}

            {/* IDLE — show signup CTA */}
            {state === 'idle' && (
              <>
                <button className="btn btn-ghost" onClick={close}>
                  Not this one
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => setState('form')}
                >
                  {full ? 'Join waitlist' : 'I\u2019ll be there'}{' '}
                  <span className="arrow">→</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Pieces shared with the admin editor's live preview.
// ---------------------------------------------------------------------

/** Partner eyebrow, title and the date / time / place line. */
export function OppModalHead({ o, full = false, titleId }) {
  const when = formatWhen(o);
  return (
    <div className="modal-head">
      {o.partner && (
        <span className="eyebrow" style={full ? { color: 'var(--ok-text)' } : undefined}>
          {o.partner}
        </span>
      )}
      <h2 id={titleId}>{o.title}</h2>
      <div className="meta-row">
        {[when.date, when.time, o.dur, when.place, o.type]
          .filter(Boolean)
          .map((item, i) => (
            <span key={i}>{item}</span>
          ))}
      </div>
    </div>
  );
}

/** Photo, description, what to bring, coordinator note. */
export function OppDetailsBody({ o }) {
  // A photo is optional and most opportunities won't have one. If the URL
  // fails to load, drop the element rather than leave a broken-image icon.
  // Storing the failed URL (not a boolean) resets it for a new photo.
  const [failedImageSrc, setFailedImageSrc] = useState(null);
  const bring = (o.bring || []).filter((b) => String(b).trim());
  const notes = String(o.notes || '').trim();
  return (
    <>
      {o.image && failedImageSrc !== o.image && (
        <img
          className="modal-photo"
          src={o.image}
          alt={o.title}
          loading="lazy"
          onError={() => setFailedImageSrc(o.image)}
        />
      )}
      {o.desc && <p className="lede">{o.desc}</p>}
      {bring.length > 0 && (
        <>
          <h4>What to bring</h4>
          <ul>
            {bring.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </>
      )}
      {notes && (
        <>
          <h4>A note from the coordinator</h4>
          <p className="modal-note">
            "{notes}"
          </p>
        </>
      )}
    </>
  );
}
