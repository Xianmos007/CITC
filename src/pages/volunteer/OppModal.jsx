import { useState, useEffect } from 'react';
import { opportunities } from '../../data/opportunities.js';
import {
  findVolunteerByEmail,
  submitSignup,
  getSignupCount,
} from '../../lib/signups.js';
import { isSupabaseReady } from '../../lib/supabase.js';

// =====================================================================
// OppModal
//
// Three states:
//   'idle'    — viewing the opportunity, "I'll be there" not clicked
//   'form'    — signup form is showing
//   'done'    — signup confirmed
//   'error'   — something went wrong
// =====================================================================
export function OppModal({ oppId, close }) {
  const [state, setState] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Live count of how many people have signed up for this opportunity.
  // We fetch this when the modal opens so the "filled" bar is real,
  // not the hardcoded number from opportunities.js.
  const [liveFilled, setLiveFilled] = useState(null);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [church, setChurch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [knownReturning, setKnownReturning] = useState(false);

  const o = opportunities.find((x) => x.id === oppId);

  // Fetch live signup count when modal opens
  useEffect(() => {
    if (!o || !isSupabaseReady) return;
    let cancelled = false;
    getSignupCount(o.id).then((n) => {
      if (!cancelled) setLiveFilled(n);
    });
    return () => {
      cancelled = true;
    };
  }, [o?.id]);

  if (!o) return null;

  // Use the live count if we have it, otherwise the static fallback
  const filled = liveFilled !== null ? liveFilled : o.filled;
  const full = filled >= o.total;

  // -------------------------------------------------------------------
  // When the email changes, look up the volunteer to auto-fill the form.
  // We do this on blur (when the user tabs out of the field) to avoid
  // hammering the database on every keystroke.
  // -------------------------------------------------------------------
  const handleEmailBlur = async () => {
    if (!email || !email.includes('@')) return;
    setLookingUp(true);
    try {
      const v = await findVolunteerByEmail(email);
      if (v) {
        if (!name) setName(v.name || '');
        if (!phone) setPhone(v.phone || '');
        if (!church) setChurch(v.church || '');
        setKnownReturning(true);
      } else {
        setKnownReturning(false);
      }
    } finally {
      setLookingUp(false);
    }
  };

  // -------------------------------------------------------------------
  // Submit the signup form.
  // -------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setErrorMessage('');

    try {
      await submitSignup({
        opportunityId: o.id,
        name,
        email,
        phone,
        church,
        isWaitlist: full,
      });
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
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={close} aria-label="Close">
          ✕
        </button>

        <div className="modal-head">
          <span
            className="eyebrow"
            style={{ color: full ? 'var(--citc-sage)' : 'var(--accent)' }}
          >
            — {o.partner}
          </span>
          <h2>{o.title}</h2>
          <div className="meta-row">
            <span>{o.date}</span>
            <span>{o.time}</span>
            <span>{o.dur}</span>
            <span>Titusville, FL</span>
            <span>{o.type}</span>
          </div>
        </div>

        <div className="modal-body">
          {/* DONE STATE */}
          {state === 'done' && (
            <>
              <div className="success-banner" style={{ marginBottom: 24 }}>
                <h4>You\u2019re in.</h4>
                <p>
                  We just sent a confirmation to <strong>{email}</strong> with the
                  details. Bring what\u2019s on the list. Bring a friend if you can.
                </p>
              </div>
              <h4>What to bring</h4>
              <ul>
                {o.bring.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </>
          )}

          {/* ERROR STATE */}
          {state === 'error' && (
            <>
              <div
                className="success-banner"
                style={{
                  marginBottom: 24,
                  borderColor: '#c5443c',
                  background: 'rgba(197,68,60,0.06)',
                }}
              >
                <h4 style={{ color: '#a83a32' }}>Hm — something went wrong.</h4>
                <p>{errorMessage}</p>
              </div>
            </>
          )}

          {/* FORM STATE */}
          {state === 'form' && (
            <form onSubmit={handleSubmit} className="signup-form">
              <p className="lede" style={{ marginBottom: 20 }}>
                {full
                  ? 'This one is full. Join the waitlist and we\u2019ll text if a spot opens.'
                  : 'Tell us how to reach you. We\u2019ll send a confirmation and the meetup details.'}
              </p>

              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={handleEmailBlur}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                />
                {lookingUp && (
                  <span className="hint">Checking if we\u2019ve met before\u2026</span>
                )}
                {knownReturning && !lookingUp && (
                  <span
                    className="hint"
                    style={{ color: 'var(--accent)' }}
                  >
                    Welcome back. We filled in what we knew.
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

              <p
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 11,
                  letterSpacing: '0.04em',
                  color: 'var(--fg-3)',
                  lineHeight: 1.5,
                  marginTop: 16,
                  maxWidth: 580,
                }}
              >
                By signing up, your contact info will be shared with the partner
                ministry so they can coordinate with you. We don\u2019t share it
                beyond that.
              </p>
            </form>
          )}

          {/* IDLE STATE — opportunity details */}
          {state === 'idle' && (
            <>
              <p className="lede">{o.desc}</p>
              <h4>What to bring</h4>
              <ul>
                {o.bring.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
              <h4>A note from the coordinator</h4>
              <p
                style={{
                  fontFamily: 'var(--serif)',
                  fontStyle: 'italic',
                  fontSize: 18,
                  lineHeight: 1.5,
                  color: 'var(--citc-ink)',
                  maxWidth: 580,
                }}
              >
                "{o.notes}"
              </p>
            </>
          )}
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
                <button className="btn btn-ghost" onClick={close}>
                  Close
                </button>
                <button className="btn btn-gold">
                  Add to calendar <span className="arrow">→</span>
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
                  className="btn btn-primary"
                  onClick={handleSubmit}
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
