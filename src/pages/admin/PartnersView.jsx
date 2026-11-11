import { useState, useEffect, useCallback } from 'react';
import {
  adminListPartners,
  createPartner,
  updatePartner,
} from '../../lib/admin.js';

export function PartnersView() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setError('');
    try {
      setRows(await adminListPartners());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      await load();
      if (!active) return;
    })();
    return () => {
      active = false;
    };
  }, [load]);

  const refresh = async () => {
    setLoading(true);
    await load();
  };

  return (
    <>
      <div className="admin-head">
        <h2>Partners</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setEditing('new')}>
          New partner <span className="arrow">→</span>
        </button>
      </div>
      {error && <div className="admin-error">{error}</div>}
      {loading && <p>Loading…</p>}
      {!loading && (
        <table className="admin-table">
          <thead>
            <tr><th>Name</th><th>Status</th><th>Type</th><th></th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="row-title">{r.name}</td>
                <td><span className="admin-pill">{r.status}</span></td>
                <td>{r.type}</td>
                <td>
                  <div className="admin-row-actions">
                    <a onClick={() => setEditing(r)}>Edit</a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {editing && (
        <PartnerEditor
          partner={editing === 'new' ? null : editing}
          close={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh(); }}
        />
      )}
    </>
  );
}

function PartnerEditor({ partner, close, onSaved }) {
  const isNew = !partner;
  const [f, setF] = useState({
    name: partner?.name || '',
    kind: partner?.kind || 'ministry',
    status: partner?.status || 'On the horizon',
    type: partner?.type || '',
    since_text: partner?.since_text || '',
    volunteers_text: partner?.volunteers_text || '',
    mission: partner?.mission || '',
    contact_name: partner?.contact_name || '',
    contact_email: partner?.contact_email || '',
    auto_notify: partner?.auto_notify ?? false,
    display_order: partner?.display_order ?? 0,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const set = (k, v) => setF((prev) => ({ ...prev, [k]: v }));

  const save = async () => {
    if (busy) return;
    const nextErrors = {};
    if (!f.name.trim()) nextErrors.name = 'A partner name is required.';
    if (!f.kind) nextErrors.kind = 'Choose where this should appear.';
    if (!f.status) nextErrors.status = 'A status is required.';
    if (!f.since_text.trim()) nextErrors.since_text = 'A partnership label is required.';
    if (!f.mission.trim()) nextErrors.mission = 'A short description is required.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setBusy(true);
    setError('');
    try {
      if (isNew) await createPartner(f);
      else await updatePartner(partner.id, f);
      onSaved();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  return (
    <div className="admin-drawer-scrim" onClick={close}>
      <div className="admin-drawer" onClick={(e) => e.stopPropagation()}>
        <h3>{isNew ? 'New partner' : 'Edit partner'}</h3>
        {error && <div className="admin-error">{error}</div>}
        <div className={`field ${errors.name ? 'error' : ''}`}>
          <label>Name</label>
          <input value={f.name} onChange={(e) => set('name', e.target.value)} />
          {errors.name && <span className="hint">{errors.name}</span>}
        </div>
        <div className={`field ${errors.kind ? 'error' : ''}`}>
          <label>Where should this appear?</label>
          <select value={f.kind} onChange={(e) => set('kind', e.target.value)}>
            <option value="ministry">Ministry</option>
            <option value="church">Church</option>
          </select>
          {errors.kind && <span className="hint">{errors.kind}</span>}
        </div>
        <div className="field-row">
          <div className={`field ${errors.status ? 'error' : ''}`}>
            <label>Status</label>
            <select value={f.status} onChange={(e) => set('status', e.target.value)}>
              <option>Active</option>
              <option>In conversation</option>
              <option>On the horizon</option>
            </select>
            {errors.status && <span className="hint">{errors.status}</span>}
          </div>
          <div className="field">
            <label>Type or location</label>
            <input value={f.type} onChange={(e) => set('type', e.target.value)} />
          </div>
        </div>
        <div className="field-row">
          <div className={`field ${errors.since_text ? 'error' : ''}`}>
            <label>Partnership label</label>
            <input value={f.since_text} onChange={(e) => set('since_text', e.target.value)} />
            {errors.since_text && <span className="hint">{errors.since_text}</span>}
          </div>
          <div className="field">
            <label>Volunteers label</label>
            <input value={f.volunteers_text} onChange={(e) => set('volunteers_text', e.target.value)} />
          </div>
        </div>
        <div className={`field ${errors.mission ? 'error' : ''}`}>
          <label>Description</label>
          <textarea value={f.mission} onChange={(e) => set('mission', e.target.value)} />
          {errors.mission && <span className="hint">{errors.mission}</span>}
        </div>
        <div className="field-row">
          <div className="field">
            <label>Contact name</label>
            <input value={f.contact_name} onChange={(e) => set('contact_name', e.target.value)} />
          </div>
          <div className="field">
            <label>Contact email</label>
            <input type="email" value={f.contact_email} onChange={(e) => set('contact_email', e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>Display order</label>
          <input type="number" value={f.display_order} onChange={(e) => set('display_order', e.target.value)} />
        </div>
        <div className="field">
          <label>
            <input
              type="checkbox"
              checked={f.auto_notify}
              onChange={(e) => set('auto_notify', e.target.checked)}
              style={{ width: 'auto', marginRight: 8 }}
            />
            Auto-notify this partner on new signups (Stage 3+ email)
          </label>
          <p className="admin-hint">Note: the partner-notify email itself is wired in a later step. This just stores the preference.</p>
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
