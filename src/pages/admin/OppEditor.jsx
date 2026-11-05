import { useState } from 'react';
import {
  createOpportunity,
  updateOpportunity,
} from '../../lib/admin.js';
import { uploadGalleryImage } from '../../lib/galleryUpload.js';

export function OppEditor({ opp, partners, close, onSaved }) {
  const isNew = !opp;
  const [f, setF] = useState({
    title: opp?.title || '',
    partner_id: opp?.partner_id || '',
    date_label: opp?.date_label || '',
    event_date: opp?.event_date || '',
    time_label: opp?.time_label || '',
    duration_label: opp?.duration_label || '',
    kind: opp?.kind || 'Hands-on',
    is_featured: opp?.is_featured ?? false,
    total_spots: opp?.total_spots ?? 6,
    description: opp?.description || '',
    coordinator_note: opp?.coordinator_note || '',
    bring_text: (opp?.bring_list || []).join('\n'),
    skills_text: (opp?.skill_tags || []).join(', '),
    is_published: opp?.is_published ?? true,
    image_url: opp?.image_url || '',
  });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // adminListOpportunities selects `*`, so the key is present on a loaded row
  // exactly when the column exists. That lets us clear a photo by sending null
  // post-migration without breaking saves pre-migration.
  const imageColumnExists =
    !!opp && Object.prototype.hasOwnProperty.call(opp, 'image_url');

  const set = (k, v) => setF((prev) => ({ ...prev, [k]: v }));

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const { url } = await uploadGalleryImage(file);
      set('image_url', url);
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (busy) return;
    if (!f.title.trim()) {
      setError('A title is required.');
      return;
    }
    setBusy(true);
    setError('');
    const payload = {
      title: f.title,
      partner_id: f.partner_id || null,
      date_label: f.date_label,
      event_date: f.event_date || null,
      time_label: f.time_label,
      duration_label: f.duration_label,
      kind: f.kind,
      is_featured: f.is_featured,
      total_spots: Number(f.total_spots) || 1,
      description: f.description,
      coordinator_note: f.coordinator_note,
      bring_list: f.bring_text.split('\n').map((s) => s.trim()).filter(Boolean),
      skill_tags: f.skills_text.split(',').map((s) => s.trim()).filter(Boolean),
      is_published: f.is_published,
    };
    // A photo is optional: send the key only when there's a URL to store, or
    // when the column is known to exist and we're clearing an existing photo.
    if (f.image_url) payload.image_url = f.image_url;
    else if (imageColumnExists) payload.image_url = null;
    try {
      if (isNew) await createOpportunity(payload);
      else await updateOpportunity(opp.id, payload);
      onSaved();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  return (
    <div className="admin-drawer-scrim" onClick={close}>
      <div className="admin-drawer" onClick={(e) => e.stopPropagation()}>
        <h3>{isNew ? 'New opportunity' : 'Edit opportunity'}</h3>
        {error && <div className="admin-error">{error}</div>}

        <div className="field">
          <label>Title</label>
          <input value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="Yard cleanup for Ms. Dorothy" />
        </div>

        <div className="field">
          <label>Partner</label>
          <select value={f.partner_id} onChange={(e) => set('partner_id', e.target.value)}>
            <option value="">— none —</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Date label (shown on site)</label>
            <input value={f.date_label} onChange={(e) => set('date_label', e.target.value)} placeholder="SAT · JUN 14" />
          </div>
          <div className="field">
            <label>Event date (real date)</label>
            <input type="date" value={f.event_date} onChange={(e) => set('event_date', e.target.value)} />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Time label</label>
            <input value={f.time_label} onChange={(e) => set('time_label', e.target.value)} placeholder="8:00AM" />
          </div>
          <div className="field">
            <label>Duration</label>
            <input value={f.duration_label} onChange={(e) => set('duration_label', e.target.value)} placeholder="4 hours" />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Kind of work</label>
            <select value={f.kind} onChange={(e) => set('kind', e.target.value)}>
              <option>Hands-on</option>
              <option>Indoor</option>
              <option>Mentorship</option>
            </select>
          </div>
          <div className="field">
            <label>Total spots</label>
            <input type="number" min="1" value={f.total_spots} onChange={(e) => set('total_spots', e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label>
            <input
              type="checkbox"
              checked={f.is_featured}
              onChange={(e) => set('is_featured', e.target.checked)}
              style={{ width: 'auto', marginRight: 8 }}
            />
            Featured (shows the urgent accent on the site)
          </label>
        </div>

        <div className="field">
          <label>Description</label>
          <textarea value={f.description} onChange={(e) => set('description', e.target.value)} placeholder="What people will do, who they'll meet…" />
        </div>

        <div className="field">
          <label>Photo (optional)</label>
          <div
            className="admin-dropzone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFile(e.dataTransfer?.files?.[0]);
            }}
            onClick={() => document.getElementById('opp-file-input').click()}
          >
            {f.image_url ? (
              <img src={f.image_url} alt="preview" className="admin-dropzone-preview" />
            ) : (
              <div className="admin-dropzone-empty">
                {uploading ? 'Uploading…' : 'Drag a photo here, or click to choose'}
              </div>
            )}
            {uploading && f.image_url && <div className="admin-dropzone-overlay">Uploading…</div>}
          </div>
          <input
            id="opp-file-input"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <span className="hint">
            Shown only when someone opens this opportunity. Leave it empty if there
            isn&rsquo;t a real photo &mdash; most won&rsquo;t have one.
          </span>
          {f.image_url && (
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => document.getElementById('opp-file-input').click()}
              >
                Replace photo
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => set('image_url', '')}>
                Remove photo
              </button>
            </div>
          )}
        </div>

        <div className="field">
          <label>Coordinator note</label>
          <textarea value={f.coordinator_note} onChange={(e) => set('coordinator_note', e.target.value)} placeholder="Shown in italics in the popup." />
        </div>

        <div className="field">
          <label>What to bring (one per line)</label>
          <textarea value={f.bring_text} onChange={(e) => set('bring_text', e.target.value)} placeholder={'Work gloves\nClosed-toe shoes\nA water bottle'} />
        </div>

        <div className="field">
          <label>Skills / tags (comma-separated)</label>
          <input value={f.skills_text} onChange={(e) => set('skills_text', e.target.value)} placeholder="No skill needed, Outdoor work, Bring kids" />
        </div>

        <div className="field">
          <label>
            <input
              type="checkbox"
              checked={f.is_published}
              onChange={(e) => set('is_published', e.target.checked)}
              style={{ width: 'auto', marginRight: 8 }}
            />
            Published (visible on the public site)
          </label>
        </div>

        <div className="admin-drawer-foot">
          <button className="btn btn-ghost" onClick={close} disabled={busy}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={busy}>
            {busy ? 'Saving…' : isNew ? 'Create' : 'Save changes'} <span className="arrow">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
