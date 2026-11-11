import { useEffect, useMemo, useRef, useState } from 'react';
import { createOpportunity, createOpportunities, saveOpportunity } from '../../lib/admin.js';
import { mapOpportunity } from '../../lib/content.js';
import { copyText, textMessage } from '../../lib/share.js';
import { OppCard } from '../../components/OppCard.jsx';
import { OppModalHead, OppDetailsBody } from '../volunteer/OppModal.jsx';
import { Drawer } from './components/Drawer.jsx';
import { ChipInput } from './components/ChipInput.jsx';
import { PhotoDropzone } from './components/PhotoDropzone.jsx';
import { repeatDates, listDates } from './oppDates.js';

// =====================================================================
// Opportunity editor: form on the left, live preview of the public card
// and modal on the right (stacked on narrow screens).
//
// Props:
//   opp        the row being edited, or null for a new one
//   copyFrom   a row to duplicate (opens as new, every field copied
//              except the date)
//   presetPartnerId  preselect a partner on a new need (Phase 5 hook)
//   rows       all opportunities, for kind/tag suggestions and partner defaults
//   partners   all partners
//   counts     { [id]: { confirmed, waitlist } }
// =====================================================================

const DURATIONS = ['1 hour', '2 hours', '3 hours', '4 hours', 'Half day', 'Full day'];
const DEFAULT_KINDS = ['Hands-on', 'Indoor', 'Mentorship'];

function rowToForm(row) {
  const dur = row?.duration_label || '';
  const isPreset = !dur || DURATIONS.includes(dur);
  return {
    partner_id: row?.partner_id || '',
    title: row?.title || '',
    event_date: row?.event_date || '',
    start_time: (row?.start_time || '').slice(0, 5),
    duration: isPreset ? dur || '2 hours' : 'custom',
    duration_custom: isPreset ? '' : dur,
    is_ongoing: Boolean(row?.is_ongoing),
    date_label: row?.date_label || '',
    time_label: row?.time_label || '',
    is_virtual: Boolean(row?.is_virtual),
    location: row?.location || '',
    description: row?.description || '',
    bring_list: Array.isArray(row?.bring_list) ? row.bring_list : [],
    coordinator_note: row?.coordinator_note || '',
    image_url: row?.image_url || '',
    total_spots: row?.total_spots ?? 6,
    kind: row?.kind ?? 'Hands-on',
    skill_tags: Array.isArray(row?.skill_tags) ? row.skill_tags : [],
    is_featured: Boolean(row?.is_featured),
    is_published: row?.is_published ?? true,
  };
}

// What gets saved. The custom date/time text is an override: it's stored
// only when used, otherwise null so the structured fields drive the site.
function formToPayload(f, showOverrides) {
  const ongoing = f.is_ongoing;
  return {
    partner_id: f.partner_id || null,
    title: f.title,
    event_date: ongoing ? null : f.event_date || null,
    start_time: f.start_time || null,
    duration_label: f.duration === 'custom' ? f.duration_custom : f.duration,
    is_ongoing: ongoing,
    date_label: ongoing || showOverrides ? f.date_label.trim() || null : null,
    time_label: showOverrides ? f.time_label.trim() || null : null,
    is_virtual: f.is_virtual,
    location: f.is_virtual ? null : f.location,
    description: f.description,
    bring_list: f.bring_list,
    coordinator_note: f.coordinator_note,
    image_url: f.image_url || null,
    total_spots: Number(f.total_spots) || 1,
    kind: f.kind,
    skill_tags: f.skill_tags,
    is_featured: f.is_featured,
    is_published: f.is_published,
  };
}

const uniqueSorted = (values) =>
  [...new Map(values.filter(Boolean).map((v) => [v.toLowerCase(), v])).values()].sort((a, b) =>
    a.localeCompare(b)
  );

export function OppEditor({ opp, copyFrom, presetPartnerId, rows = [], partners = [], counts = {}, close, onSaved }) {
  const isNew = !opp;
  const source = opp || copyFrom || null;
  const [f, setF] = useState(() => {
    const form = rowToForm(source);
    if (copyFrom) form.event_date = ''; // duplicate: pick a new date
    if (!source && presetPartnerId) form.partner_id = presetPartnerId;
    return form;
  });
  const [showOverrides, setShowOverrides] = useState(
    Boolean(!source?.is_ongoing && (source?.date_label || source?.time_label))
  );
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [defaultsHint, setDefaultsHint] = useState('');
  const [repeat, setRepeat] = useState({ mode: 'none', count: 3 });
  const [copied, setCopied] = useState('');
  // Side-by-side on desktop; on phones the preview starts collapsed above the form.
  const [previewOpen, setPreviewOpen] = useState(
    () => typeof window === 'undefined' || window.matchMedia('(min-width: 981px)').matches
  );
  const touched = useRef(new Set());
  const dateRef = useRef(null);

  // Duplicating: the date is the one thing to change, so start there.
  // (An effect rather than autoFocus, so it runs after the drawer's own
  // focus handling.)
  useEffect(() => {
    if (copyFrom) dateRef.current?.focus();
  }, [copyFrom]);

  const set = (k, v) => {
    touched.current.add(k);
    setF((prev) => ({ ...prev, [k]: v }));
  };

  const partner = partners.find((p) => p.id === f.partner_id);
  const kinds = useMemo(() => uniqueSorted([...DEFAULT_KINDS, ...rows.map((r) => r.kind)]), [rows]);
  const tags = useMemo(() => uniqueSorted(rows.flatMap((r) => r.skill_tags || [])), [rows]);

  // 4.3 Partner defaults: on a brand-new need, fill the fields the admin
  // hasn't touched from this partner's most recent need.
  const choosePartner = (id) => {
    set('partner_id', id);
    setErrors((e) => ({ ...e, partner_id: undefined }));
    if (!isNew || copyFrom || !id) return;
    // Most recently created first. Each field comes from the newest of
    // this partner's needs that actually has a value for it.
    const history = rows
      .filter((r) => r.partner_id === id)
      .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    if (!history.length) {
      setDefaultsHint('');
      return;
    }
    const pick = (get) => history.map(get).find((v) => (Array.isArray(v) ? v.length : v)) ?? null;
    const fill = Object.fromEntries(
      Object.entries({
        location: pick((r) => r.location),
        bring_list: pick((r) => r.bring_list),
        kind: pick((r) => r.kind),
        coordinator_note: pick((r) => r.coordinator_note),
        total_spots: pick((r) => r.total_spots),
      }).filter(([, v]) => v !== null)
    );
    setF((prev) => {
      const next = { ...prev, partner_id: id };
      Object.entries(fill).forEach(([k, v]) => {
        if (!touched.current.has(k)) next[k] = v;
      });
      return next;
    });
    const name = partners.find((p) => p.id === id)?.name || 'this partner';
    setDefaultsHint(`Filled in from ${name}’s last need.`);
  };

  // Live preview: the public components, fed the form values.
  const previewRow = {
    ...formToPayload(f, showOverrides),
    id: opp?.id || 'preview',
    title: f.title || 'Title of the need',
    partner: partner || null,
  };
  const preview = {
    ...mapOpportunity(previewRow),
    filled: opp ? counts[opp.id]?.confirmed || 0 : 0,
  };

  const extraDates = isNew && !f.is_ongoing ? repeatDates(f.event_date, repeat.mode, repeat.count) : [];

  const validate = () => {
    const e = {};
    if (!f.title.trim()) e.title = 'A title is required.';
    if (!f.partner_id) e.partner_id = 'Choose the partner ministry.';
    if (!f.is_ongoing && !f.event_date) e.event_date = 'Pick a date, or check “Ongoing / no fixed date”.';
    if (f.duration === 'custom' && !f.duration_custom.trim()) e.duration_custom = 'Describe the duration, or pick one.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (busy || !validate()) return;
    setBusy(true);
    setError('');
    const payload = formToPayload(f, showOverrides);
    try {
      if (!isNew) await saveOpportunity(opp.id, payload);
      else if (extraDates.length) {
        await createOpportunities([payload, ...extraDates.map((d) => ({ ...payload, event_date: d }))]);
      } else await createOpportunity(payload);
      onSaved();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  const copyMessage = async () => {
    const ok = await copyText(textMessage({ ...preview, filled: counts[opp.id]?.confirmed || 0 }));
    setCopied(ok ? 'Text message copied.' : 'Couldn’t copy — select and copy by hand.');
  };

  const title = copyFrom ? 'Duplicate opportunity' : isNew ? 'New opportunity' : 'Edit opportunity';
  const fieldErr = (k) => (errors[k] ? <span className="hint">{errors[k]}</span> : null);

  return (
    <Drawer
      title={title}
      onClose={close}
      wide
      footer={
        <>
          {!isNew && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={copyMessage} style={{ marginRight: 'auto' }}>
              Copy text message
            </button>
          )}
          {copied && <span className="admin-hint" role="status">{copied}</span>}
          <button type="button" className="btn btn-ghost" onClick={close} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={save} disabled={busy}>
            {busy
              ? 'Saving…'
              : !isNew
                ? 'Save changes'
                : extraDates.length
                  ? `Create ${extraDates.length + 1} needs`
                  : 'Create'}{' '}
            <span className="arrow">→</span>
          </button>
        </>
      }
    >
      <div className="opp-editor">
        <div className="opp-editor-form">
          {error && <div className="admin-error">{error}</div>}

          <fieldset>
            <legend>Who</legend>
            <div className={`field ${errors.partner_id ? 'error' : ''}`}>
              <label htmlFor="oe-partner">Partner</label>
              <select id="oe-partner" value={f.partner_id} onChange={(e) => choosePartner(e.target.value)}>
                <option value="">Choose a partner…</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {fieldErr('partner_id')}
              {defaultsHint && (
                <p className="admin-hint admin-hint-row" role="status">
                  {defaultsHint}
                  <button type="button" className="text-link" onClick={() => setDefaultsHint('')}>
                    Dismiss
                  </button>
                </p>
              )}
            </div>
            <div className={`field ${errors.title ? 'error' : ''}`}>
              <label htmlFor="oe-title">Title</label>
              <input
                id="oe-title"
                value={f.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="Yard cleanup on Garden St."
              />
              {fieldErr('title')}
            </div>
          </fieldset>

          <fieldset>
            <legend>When</legend>
            {!f.is_ongoing && (
              <div className="field-row">
                <div className={`field ${errors.event_date ? 'error' : ''}`}>
                  <label htmlFor="oe-date">Date</label>
                  <input
                    id="oe-date"
                    ref={dateRef}
                    type="date"
                    value={f.event_date}
                    onChange={(e) => {
                      set('event_date', e.target.value);
                      setErrors((er) => ({ ...er, event_date: undefined }));
                    }}
                  />
                  {fieldErr('event_date')}
                </div>
                <div className="field">
                  <label htmlFor="oe-time">Start time</label>
                  <input
                    id="oe-time"
                    type="time"
                    value={f.start_time}
                    onChange={(e) => set('start_time', e.target.value)}
                  />
                </div>
              </div>
            )}
            <div className="field-row">
              <div className={`field ${errors.duration_custom ? 'error' : ''}`}>
                <label htmlFor="oe-duration">Duration</label>
                <select id="oe-duration" value={f.duration} onChange={(e) => set('duration', e.target.value)}>
                  {DURATIONS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                  <option value="custom">Custom…</option>
                </select>
                {f.duration === 'custom' && (
                  <input
                    aria-label="Custom duration"
                    style={{ marginTop: 8 }}
                    value={f.duration_custom}
                    onChange={(e) => set('duration_custom', e.target.value)}
                    placeholder="90 minutes"
                  />
                )}
                {fieldErr('duration_custom')}
              </div>
              {f.is_ongoing && (
                <div className="field">
                  <label htmlFor="oe-time">Start time (optional)</label>
                  <input
                    id="oe-time"
                    type="time"
                    value={f.start_time}
                    onChange={(e) => set('start_time', e.target.value)}
                  />
                </div>
              )}
            </div>
            <label className="check">
              <input
                type="checkbox"
                checked={f.is_ongoing}
                onChange={(e) => {
                  set('is_ongoing', e.target.checked);
                  setErrors((er) => ({ ...er, event_date: undefined }));
                }}
              />
              Ongoing / no fixed date
            </label>
            {f.is_ongoing ? (
              <div className="field">
                <label htmlFor="oe-datelabel">Custom date text (optional)</label>
                <input
                  id="oe-datelabel"
                  value={f.date_label}
                  onChange={(e) => set('date_label', e.target.value)}
                  placeholder="Every Tuesday"
                />
                <span className="admin-hint">Shown where the date would be. Leave empty to show “Ongoing”.</span>
              </div>
            ) : (
              <details
                className="admin-disclosure"
                open={showOverrides}
                onToggle={(e) => setShowOverrides(e.currentTarget.open)}
              >
                <summary>Customize how the date reads</summary>
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="oe-datelabel">Date text</label>
                    <input
                      id="oe-datelabel"
                      value={f.date_label}
                      onChange={(e) => set('date_label', e.target.value)}
                      placeholder="Every other Saturday"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="oe-timelabel">Time text</label>
                    <input
                      id="oe-timelabel"
                      value={f.time_label}
                      onChange={(e) => set('time_label', e.target.value)}
                      placeholder="Morning"
                    />
                  </div>
                </div>
                <span className="admin-hint">
                  Replaces the date and time shown on the site. The real date still decides when it
                  disappears.
                </span>
              </details>
            )}

            {isNew && !f.is_ongoing && (
              <div className="field" style={{ marginTop: 14 }}>
                <label htmlFor="oe-repeat">Repeat</label>
                <div className="field-row">
                  <select
                    id="oe-repeat"
                    value={repeat.mode}
                    onChange={(e) => setRepeat((r) => ({ ...r, mode: e.target.value }))}
                  >
                    <option value="none">Don’t repeat</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Every 2 weeks</option>
                    <option value="monthly">Monthly (same weekday)</option>
                  </select>
                  {repeat.mode !== 'none' && (
                    <select
                      aria-label="How many more"
                      value={repeat.count}
                      onChange={(e) => setRepeat((r) => ({ ...r, count: Number(e.target.value) }))}
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          for {n} more
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                {repeat.mode !== 'none' && (
                  <span className="admin-hint" role="status">
                    {f.event_date
                      ? `Creates ${extraDates.length + 1} needs: ${listDates([f.event_date, ...extraDates])}.`
                      : 'Pick the first date to see the schedule.'}
                  </span>
                )}
              </div>
            )}
          </fieldset>

          <fieldset>
            <legend>Where</legend>
            <label className="check">
              <input type="checkbox" checked={f.is_virtual} onChange={(e) => set('is_virtual', e.target.checked)} />
              Online
            </label>
            {!f.is_virtual && (
              <div className="field">
                <label htmlFor="oe-location">Location</label>
                <input
                  id="oe-location"
                  value={f.location}
                  onChange={(e) => set('location', e.target.value)}
                  placeholder={partner?.default_location || 'Titusville, FL'}
                />
                <span className="admin-hint">Leave empty to use the partner’s usual place.</span>
              </div>
            )}
          </fieldset>

          <fieldset>
            <legend>What</legend>
            <div className="field">
              <label htmlFor="oe-desc">Description</label>
              <textarea
                id="oe-desc"
                value={f.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="What people will do, who they’ll meet…"
              />
            </div>
            <div className="field">
              <label htmlFor="oe-bring">What to bring</label>
              <ChipInput
                id="oe-bring"
                value={f.bring_list}
                onChange={(v) => set('bring_list', v)}
                allowComma={false}
                placeholder="Work gloves — press Enter to add"
              />
            </div>
            <div className="field">
              <label htmlFor="oe-note">Coordinator note</label>
              <textarea
                id="oe-note"
                value={f.coordinator_note}
                onChange={(e) => set('coordinator_note', e.target.value)}
                placeholder="Shown in italics when someone opens the need."
              />
            </div>
            <div className="field">
              <label>Photo (optional)</label>
              <PhotoDropzone value={f.image_url} onChange={(v) => set('image_url', v)} onError={setError} />
              <span className="admin-hint">Most needs won’t have one. Leave it empty unless it’s a real photo.</span>
            </div>
          </fieldset>

          <fieldset>
            <legend>Settings</legend>
            <div className="field-row">
              <div className="field">
                <label htmlFor="oe-spots">Total spots</label>
                <input
                  id="oe-spots"
                  type="number"
                  min="1"
                  value={f.total_spots}
                  onChange={(e) => set('total_spots', e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="oe-kind">Kind of work</label>
                <input
                  id="oe-kind"
                  list="oe-kinds"
                  value={f.kind}
                  onChange={(e) => set('kind', e.target.value)}
                  placeholder="Hands-on"
                />
                <datalist id="oe-kinds">
                  {kinds.map((k) => (
                    <option key={k} value={k} />
                  ))}
                </datalist>
              </div>
            </div>
            <div className="field">
              <label htmlFor="oe-tags">Tags</label>
              <ChipInput
                id="oe-tags"
                value={f.skill_tags}
                onChange={(v) => set('skill_tags', v)}
                suggestions={tags}
                placeholder="No skill needed — Enter to add"
              />
            </div>
            <label className="check">
              <input type="checkbox" checked={f.is_featured} onChange={(e) => set('is_featured', e.target.checked)} />
              Featured
            </label>
            <label className="check">
              <input type="checkbox" checked={f.is_published} onChange={(e) => set('is_published', e.target.checked)} />
              Published (visible on the public site)
            </label>
          </fieldset>
        </div>

        <details
          className="opp-editor-preview"
          open={previewOpen}
          onToggle={(e) => setPreviewOpen(e.currentTarget.open)}
        >
          <summary>Preview</summary>
          <div className="opp-editor-preview-inner">
            <span className="admin-preview-label">Card</span>
            <OppCard o={preview} preview />
            <span className="admin-preview-label">When someone opens it</span>
            <div className="modal admin-preview-modal">
              <OppModalHead o={preview} full={preview.filled >= preview.total} />
              <div className="modal-body">
                <OppDetailsBody o={preview} />
              </div>
            </div>
          </div>
        </details>
      </div>
    </Drawer>
  );
}
