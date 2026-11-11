import { useState, useEffect } from 'react';
import {
  adminListSignups,
} from '../../lib/admin.js';

export function SignupsView() {
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
