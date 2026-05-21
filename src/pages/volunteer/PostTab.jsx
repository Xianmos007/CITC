import { useState } from 'react';

const emptyForm = {
  org: '', need: '', desc: '', date: '', time: '', dur: '', spots: '',
  kind: 'Hands-on', contact: '',
};

export function PostTab() {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.org) errs.org = 'Which ministry is this?';
    if (!form.need) errs.need = 'Give it a specific title — like "Yard cleanup for Ms. Dorothy."';
    if (!form.desc) errs.desc = 'A short note helps people show up ready.';
    if (!form.date) errs.date = 'When?';
    if (!form.spots) errs.spots = 'How many hands do you need?';
    setErrors(errs);
    if (Object.keys(errs).length === 0) setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="container">
        <div className="form-grid">
          <div className="form-side">
            <h4>— Submitted</h4>
            <h3>Thank you. Your need is in.</h3>
            <p>Pastor Ana will review it within 48 hours — she'll text or call if anything is unclear.</p>
            <ol className="flow-steps">
              <li>
                <span className="n">1.</span>
                <div>
                  <div className="tt" style={{ textDecoration: 'line-through', color: 'var(--fg-3)' }}>Submitted</div>
                  <div className="dd">Just now</div>
                </div>
              </li>
              <li>
                <span className="n">2.</span>
                <div><div className="tt">Pastoral review</div><div className="dd">Within 48 hours — Pastor Ana</div></div>
              </li>
              <li>
                <span className="n">3.</span>
                <div><div className="tt">Partner confirmation</div><div className="dd">A quick call to confirm contact + logistics</div></div>
              </li>
              <li>
                <span className="n">4.</span>
                <div><div className="tt">Live on the portal</div><div className="dd">Signups open within a week</div></div>
              </li>
            </ol>
          </div>
          <div>
            <div className="success-banner">
              <h4>Your need is on the way to the pastors.</h4>
              <p>You posted: <em>"{form.need}"</em> for <em>{form.org}</em>, scheduled <em>{form.date}</em>.</p>
            </div>
            <div style={{ marginTop: 24 }}>
              <button className="btn btn-ghost" onClick={() => { setSubmitted(false); setForm(emptyForm); }}>
                Post another <span className="arrow">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="form-grid">
        <div className="form-side">
          <h4>— Post a need</h4>
          <h3>Tell us what would actually help.</h3>
          <p>If you serve a Titusville ministry, this is where you ask for a few hands. We don't auto-publish — every post is reviewed by a pastor before it goes live, so the people of our churches can trust what they sign up for.</p>
          <ol className="flow-steps">
            <li><span className="n">01</span><div><div className="tt">Submit</div><div className="dd">Tell us the what, when, and who to bring.</div></div></li>
            <li><span className="n">02</span><div><div className="tt">Pastoral review</div><div className="dd">Within 48 hours, a pastor reads it.</div></div></li>
            <li><span className="n">03</span><div><div className="tt">Partner confirmation</div><div className="dd">A short call to confirm contact and logistics.</div></div></li>
            <li><span className="n">04</span><div><div className="tt">Live on the portal</div><div className="dd">Signups open. We'll text when they fill.</div></div></li>
          </ol>
        </div>
        <form className="form" onSubmit={submit}>
          <div className="form-row">
            <div className={`field ${errors.org ? 'error' : ''}`}>
              <label>Your ministry</label>
              <input value={form.org} onChange={(e) => set('org', e.target.value)} placeholder="e.g. North Brevard Charities" />
              {errors.org && <span className="hint">{errors.org}</span>}
            </div>
            <div className="field">
              <label>Your name &amp; role</label>
              <input value={form.contact} onChange={(e) => set('contact', e.target.value)} placeholder="Walter — Pantry coordinator" />
            </div>
          </div>
          <div className={`field ${errors.need ? 'error' : ''}`}>
            <label>
              What do you need?{' '}
              <span style={{ color: 'var(--accent)', textTransform: 'none', letterSpacing: 0, fontStyle: 'italic', fontFamily: 'var(--serif)' }}>
                Be specific.
              </span>
            </label>
            <input value={form.need} onChange={(e) => set('need', e.target.value)} placeholder="Yard cleanup for Ms. Dorothy on Garden St." />
            {errors.need ? (
              <span className="hint">{errors.need}</span>
            ) : (
              <span className="hint">Specific beats general. "Yard cleanup for Ms. Dorothy" — not "helping the elderly."</span>
            )}
          </div>
          <div className={`field ${errors.desc ? 'error' : ''}`}>
            <label>Short description</label>
            <textarea
              value={form.desc}
              onChange={(e) => set('desc', e.target.value)}
              placeholder="A few sentences. What we'll actually do, what to bring, who'll be there, why it matters."
            ></textarea>
            {errors.desc && <span className="hint">{errors.desc}</span>}
          </div>
          <div className="form-row">
            <div className={`field ${errors.date ? 'error' : ''}`}>
              <label>Date</label>
              <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
              {errors.date && <span className="hint">{errors.date}</span>}
            </div>
            <div className="field">
              <label>Start time</label>
              <input type="time" value={form.time} onChange={(e) => set('time', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label>Duration</label>
              <input value={form.dur} onChange={(e) => set('dur', e.target.value)} placeholder="2 hours" />
            </div>
            <div className={`field ${errors.spots ? 'error' : ''}`}>
              <label>Spots needed</label>
              <input type="number" min="1" value={form.spots} onChange={(e) => set('spots', e.target.value)} placeholder="6" />
              {errors.spots && <span className="hint">{errors.spots}</span>}
            </div>
          </div>
          <div className="field">
            <label>Kind of work</label>
            <select value={form.kind} onChange={(e) => set('kind', e.target.value)}>
              <option>Hands-on</option>
              <option>Indoor</option>
              <option>Mentorship</option>
              <option>Conversation</option>
              <option>Skilled trade</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Submit for review <span className="arrow">→</span></button>
            <button type="button" className="btn btn-ghost" onClick={() => setForm(emptyForm)}>Reset</button>
          </div>
        </form>
      </div>
    </div>
  );
}
