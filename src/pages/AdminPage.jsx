import { useState, useEffect, useCallback } from 'react';
import '../styles/admin.css';
import {
  getSession,
  onAuthChange,
  signIn,
  signOut,
  adminListOpportunities,
  adminListPartners,
  adminListSignups,
  createOpportunity,
  updateOpportunity,
  unpublishOpportunity,
  updatePartner,
  adminListGalleryPhotos,
  createGalleryPhoto,
  updateGalleryPhoto,
  deleteGalleryPhoto,
} from '../lib/admin.js';
import { uploadGalleryImage, deleteGalleryImageByUrl } from '../lib/galleryUpload.js';
import { isSupabaseReady } from '../lib/supabase.js';

// =====================================================================
// AdminPage — reachable at #admin. Not linked in the public nav.
// =====================================================================
export function AdminPage() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let unsub = () => {};
    getSession().then((s) => {
      setSession(s);
      setChecking(false);
    });
    unsub = onAuthChange((s) => setSession(s));
    return () => unsub();
  }, []);

  if (!isSupabaseReady) {
    return (
      <div className="admin-login">
        <div className="admin-login-card">
          <span className="eyebrow">Admin</span>
          <h1>Not configured</h1>
          <p className="lede">
            Supabase isn't connected in this build. Check the environment
            variables and reload.
          </p>
        </div>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="admin-login">
        <div className="admin-login-card">
          <span className="eyebrow">Admin</span>
          <h1>One moment…</h1>
        </div>
      </div>
    );
  }

  if (!session) return <LoginScreen />;
  return <Dashboard />;
}

// ---------------------------------------------------------------------
function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await signIn(email, password);
      // onAuthChange in AdminPage will pick up the session.
    } catch (e) {
      setError(e.message || 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <span className="eyebrow">Church in the City</span>
        <h1>Admin sign-in</h1>
        <p className="lede">Manage opportunities, partners, and signups.</p>
        {error && <div className="admin-error">{error}</div>}
        <div className="field">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            autoComplete="username"
            placeholder="you@thechurchinthecity.org"
          />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            autoComplete="current-password"
            placeholder="••••••••"
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={submit}
          disabled={busy}
          style={{ width: '100%', marginTop: 8 }}
        >
          {busy ? 'Signing in…' : 'Sign in'} <span className="arrow">→</span>
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
function Dashboard() {
  const [tab, setTab] = useState('opportunities');

  return (
    <div className="admin-shell">
      <div className="admin-bar">
        <div className="brand">
          Church in the <span>City</span> · Admin
        </div>
        <div className="admin-tabs">
          {[
            ['opportunities', 'Opportunities'],
            ['partners', 'Partners'],
            ['gallery', 'Gallery'],
            ['signups', 'Signups'],
          ].map(([key, label]) => (
            <button
              key={key}
              className={`admin-tab ${tab === key ? 'active' : ''}`}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => signOut()}>
          Sign out
        </button>
      </div>

      <div className="admin-main">
        {tab === 'opportunities' && <OpportunitiesView />}
        {tab === 'partners' && <PartnersView />}
        {tab === 'gallery' && <GalleryAdminView />}
        {tab === 'signups' && <SignupsView />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
function OpportunitiesView() {
  const [rows, setRows] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // row or 'new' or null

  const load = useCallback(async () => {
    setError('');
    try {
      const [opps, prts] = await Promise.all([
        adminListOpportunities(),
        adminListPartners(),
      ]);
      setRows(opps);
      setPartners(prts);
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

  const onSaved = () => {
    setEditing(null);
    refresh();
  };

  return (
    <>
      <div className="admin-head">
        <h2>Opportunities</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setEditing('new')}>
          New opportunity <span className="arrow">→</span>
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}
      {loading && <p>Loading…</p>}

      {!loading && rows.length === 0 && (
        <div className="empty-state">
          <h4>No opportunities yet.</h4>
          <p>Click "New opportunity" to post the first real Saturday.</p>
        </div>
      )}

      {!loading && rows.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>When</th>
              <th>Partner</th>
              <th>Spots</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="row-title">{r.title}</td>
                <td>{r.date_label || '—'}<br /><span style={{ color: 'var(--fg-3)' }}>{r.time_label || ''}</span></td>
                <td>{r.partner?.name || '—'}</td>
                <td>{r.total_spots}</td>
                <td>
                  {r.is_published ? (
                    <span className={`admin-pill ${r.is_featured ? 'urgent' : ''}`}>
                      {r.is_featured ? 'featured' : 'open'}
                    </span>
                  ) : (
                    <span className="admin-pill unpublished">unpublished</span>
                  )}
                </td>
                <td>
                  <div className="admin-row-actions">
                    <a onClick={() => setEditing(r)}>Edit</a>
                    {r.is_published && (
                      <a
                        className="danger"
                        onClick={async () => {
                          if (confirm(`Unpublish "${r.title}"? It will leave the public site but keep its signups.`)) {
                            await unpublishOpportunity(r.id);
                            refresh();
                          }
                        }}
                      >
                        Unpublish
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editing && (
        <OppEditor
          opp={editing === 'new' ? null : editing}
          partners={partners}
          close={() => setEditing(null)}
          onSaved={onSaved}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------
function OppEditor({ opp, partners, close, onSaved }) {
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
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setF((prev) => ({ ...prev, [k]: v }));

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

// ---------------------------------------------------------------------
function PartnersView() {
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
      <div className="admin-head"><h2>Partners</h2></div>
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
          partner={editing}
          close={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh(); }}
        />
      )}
    </>
  );
}

function PartnerEditor({ partner, close, onSaved }) {
  const [f, setF] = useState({
    name: partner.name || '',
    status: partner.status || 'On the horizon',
    type: partner.type || '',
    since_text: partner.since_text || '',
    volunteers_text: partner.volunteers_text || '',
    mission: partner.mission || '',
    contact_name: partner.contact_name || '',
    contact_email: partner.contact_email || '',
    auto_notify: partner.auto_notify ?? false,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setF((prev) => ({ ...prev, [k]: v }));

  const save = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await updatePartner(partner.id, f);
      onSaved();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  return (
    <div className="admin-drawer-scrim" onClick={close}>
      <div className="admin-drawer" onClick={(e) => e.stopPropagation()}>
        <h3>Edit partner</h3>
        {error && <div className="admin-error">{error}</div>}
        <div className="field">
          <label>Name</label>
          <input value={f.name} onChange={(e) => set('name', e.target.value)} />
        </div>
        <div className="field-row">
          <div className="field">
            <label>Status</label>
            <select value={f.status} onChange={(e) => set('status', e.target.value)}>
              <option>Active</option>
              <option>In conversation</option>
              <option>On the horizon</option>
            </select>
          </div>
          <div className="field">
            <label>Type</label>
            <input value={f.type} onChange={(e) => set('type', e.target.value)} />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label>Partnership label</label>
            <input value={f.since_text} onChange={(e) => set('since_text', e.target.value)} />
          </div>
          <div className="field">
            <label>Volunteers label</label>
            <input value={f.volunteers_text} onChange={(e) => set('volunteers_text', e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>Mission</label>
          <textarea value={f.mission} onChange={(e) => set('mission', e.target.value)} />
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
            {busy ? 'Saving…' : 'Save changes'} <span className="arrow">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
function SignupsView() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setRows(await adminListSignups());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <div className="admin-head"><h2>Signups</h2></div>
      {error && (
        <div className="admin-error">
          {error}
          <div className="admin-hint" style={{ marginTop: 8 }}>
            If this mentions a missing policy or permission, the signups
            admin-read policy from migration 0004 may not have run yet.
          </div>
        </div>
      )}
      {loading && <p>Loading…</p>}
      {!loading && !error && rows.length === 0 && (
        <div className="empty-state">
          <h4>No signups yet.</h4>
          <p>They'll appear here as people register for opportunities.</p>
        </div>
      )}
      {!loading && rows.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Opportunity</th><th>Status</th><th>When</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="row-title">{r.volunteer?.name || '—'}</td>
                <td>{r.volunteer?.email || '—'}</td>
                <td>{r.opportunity?.title || '—'}<br /><span style={{ color: 'var(--fg-3)' }}>{r.opportunity?.date_label || ''}</span></td>
                <td><span className={`admin-pill ${r.status === 'waitlist' ? '' : ''}`}>{r.status}</span></td>
                <td>{new Date(r.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

// ---------------------------------------------------------------------
const GALLERY_CATS = [
  { key: 'saturday', label: 'Saturdays' },
  { key: 'pantry', label: 'Pantry' },
  { key: 'yard', label: 'Yard work' },
  { key: 'tutoring', label: 'Tutoring' },
  { key: 'bridge', label: 'Under the bridge' },
  { key: 'sunday', label: 'Sunday' },
];
const GALLERY_SHAPES = ['square', 'tall', 'wide', 'big'];

function GalleryAdminView() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // row | 'new' | null

  const load = useCallback(async () => {
    setError('');
    try {
      setRows(await adminListGalleryPhotos());
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
    return () => { active = false; };
  }, [load]);

  const refresh = async () => {
    setLoading(true);
    await load();
  };

  const onDelete = async (row) => {
    if (!confirm(`Delete this photo permanently? This removes it from the site and storage.`)) return;
    try {
      await deleteGalleryPhoto(row.id);
      if (row.image_url) await deleteGalleryImageByUrl(row.image_url);
      refresh();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <div className="admin-head">
        <h2>Gallery</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setEditing('new')}>
          Add photo <span className="arrow">→</span>
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}
      {loading && <p>Loading…</p>}

      {!loading && rows.length === 0 && (
        <div className="empty-state">
          <h4>No photos yet.</h4>
          <p>Click "Add photo" to upload the first Saturday frame.</p>
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div className="admin-photo-grid">
          {rows.map((r) => (
            <div key={r.id} className="admin-photo-card">
              <div className="admin-photo-thumb" onClick={() => setEditing(r)}>
                {r.image_url ? <img src={r.image_url} alt={r.caption || ''} loading="lazy" /> : <span>no image</span>}
                {!r.is_published && <span className="admin-photo-badge">hidden</span>}
              </div>
              <div className="admin-photo-meta">
                <span className="admin-photo-cap">{r.caption || '(no caption)'}</span>
                <span className="admin-photo-sub">{r.date_label || ''} · {r.place || ''}</span>
                <div className="admin-row-actions">
                  <a onClick={() => setEditing(r)}>Edit</a>
                  <a className="danger" onClick={() => onDelete(r)}>Delete</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <GalleryEditor
          photo={editing === 'new' ? null : editing}
          close={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh(); }}
        />
      )}
    </>
  );
}

function GalleryEditor({ photo, close, onSaved }) {
  const isNew = !photo;
  const [f, setF] = useState({
    image_url: photo?.image_url || '',
    caption: photo?.caption || '',
    place: photo?.place || '',
    date_label: photo?.date_label || '',
    category: photo?.category || 'saturday',
    shape: photo?.shape || 'square',
    is_published: photo?.is_published ?? true,
    sort_order: photo?.sort_order ?? 0,
  });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
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

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  };

  const save = async () => {
    if (busy) return;
    if (!f.image_url) {
      setError('Please upload an image first.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      if (isNew) await createGalleryPhoto(f);
      else await updateGalleryPhoto(photo.id, f);
      onSaved();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  return (
    <div className="admin-drawer-scrim" onClick={close}>
      <div className="admin-drawer" onClick={(e) => e.stopPropagation()}>
        <h3>{isNew ? 'Add photo' : 'Edit photo'}</h3>
        {error && <div className="admin-error">{error}</div>}

        <div
          className="admin-dropzone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => document.getElementById('gallery-file-input').click()}
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
          id="gallery-file-input"
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {f.image_url && (
          <button
            className="btn btn-ghost btn-sm"
            style={{ marginBottom: 16 }}
            onClick={() => document.getElementById('gallery-file-input').click()}
          >
            Replace image
          </button>
        )}

        <div className="field">
          <label>Caption</label>
          <textarea value={f.caption} onChange={(e) => set('caption', e.target.value)} placeholder="A short, true sentence about this frame." />
        </div>
        <div className="field-row">
          <div className="field">
            <label>Place</label>
            <input value={f.place} onChange={(e) => set('place', e.target.value)} placeholder="Garden St., Titusville" />
          </div>
          <div className="field">
            <label>Date label</label>
            <input value={f.date_label} onChange={(e) => set('date_label', e.target.value)} placeholder="APR 13, 2026" />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label>Category</label>
            <select value={f.category} onChange={(e) => set('category', e.target.value)}>
              {GALLERY_CATS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Tile shape</label>
            <select value={f.shape} onChange={(e) => set('shape', e.target.value)}>
              {GALLERY_SHAPES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="field">
          <label>
            <input type="checkbox" checked={f.is_published} onChange={(e) => set('is_published', e.target.checked)} style={{ width: 'auto', marginRight: 8 }} />
            Published (visible in the public gallery)
          </label>
        </div>

        <div className="admin-drawer-foot">
          <button className="btn btn-ghost" onClick={close} disabled={busy}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={busy || uploading}>
            {busy ? 'Saving…' : isNew ? 'Add to gallery' : 'Save changes'} <span className="arrow">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
