import { useState, useEffect, useCallback } from 'react';
import {
  adminListOpportunities,
  adminListPartners,
  unpublishOpportunity,
} from '../../lib/admin.js';
import { OppEditor } from './OppEditor.jsx';

export function OpportunitiesView() {
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
