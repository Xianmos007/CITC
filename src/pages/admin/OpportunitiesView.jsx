import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  adminListOpportunities,
  adminListPartners,
  adminSignupCounts,
  unpublishOpportunity,
} from '../../lib/admin.js';
import { formatWhen, todayLocalISO } from '../../lib/format.js';
import { mapOpportunity } from '../../lib/content.js';
import { copyText, oppLink } from '../../lib/share.js';
import { OppEditor } from './OppEditor.jsx';
import { RosterDrawer } from './RosterDrawer.jsx';
import { classifyOpp } from './oppDates.js';

const FILTERS = [
  ['upcoming', 'Upcoming'],
  ['ongoing', 'Ongoing'],
  ['past', 'Past'],
  ['draft', 'Drafts'],
];

const EMPTY = {
  upcoming: 'Nothing dated is coming up. Post the next Saturday with “New opportunity”.',
  ongoing: 'No ongoing opportunities. Check “Ongoing / no fixed date” in the editor for weekly shifts.',
  past: 'Nothing has happened yet.',
  draft: 'No drafts. Unpublished opportunities land here.',
};

// Upcoming soonest first; past most recent first; the rest by title.
function sortFor(filter) {
  if (filter === 'upcoming') return (a, b) => a.event_date.localeCompare(b.event_date);
  if (filter === 'past') return (a, b) => b.event_date.localeCompare(a.event_date);
  return (a, b) => (a.title || '').localeCompare(b.title || '');
}

export function OpportunitiesView({ presetPartnerId, onPresetUsed }) {
  const [rows, setRows] = useState([]);
  const [partners, setPartners] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('upcoming');
  // { mode: 'new' | 'edit' | 'duplicate', row?, partnerId? } or null
  const [editing, setEditing] = useState(
    presetPartnerId ? { mode: 'new', partnerId: presetPartnerId } : null
  );
  const [roster, setRoster] = useState(null);
  const [flash, setFlash] = useState('');

  const load = useCallback(async () => {
    try {
      const [opps, prts, cts] = await Promise.all([
        adminListOpportunities(),
        adminListPartners(),
        adminSignupCounts().catch(() => ({})),
      ]);
      setRows(opps);
      setPartners(prts);
      setCounts(cts);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, [load]);

  const refresh = async () => {
    setError('');
    setLoading(true);
    await load();
  };

  const today = todayLocalISO();
  const groups = useMemo(() => {
    const g = { upcoming: [], ongoing: [], past: [], draft: [] };
    rows.forEach((r) => g[classifyOpp(r, today)].push(r));
    Object.keys(g).forEach((k) => g[k].sort(sortFor(k)));
    return g;
  }, [rows, today]);
  const visible = groups[filter];

  const say = (msg) => {
    setFlash(msg);
    window.setTimeout(() => setFlash((m) => (m === msg ? '' : m)), 2500);
  };

  const closeEditor = () => {
    setEditing(null);
    onPresetUsed?.();
  };

  return (
    <>
      <div className="admin-head">
        <h2>Opportunities</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setEditing({ mode: 'new' })}>
          New opportunity <span className="arrow">→</span>
        </button>
      </div>

      <div className="admin-segmented" role="tablist" aria-label="Show">
        {FILTERS.map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={filter === key}
            className={filter === key ? 'active' : ''}
            onClick={() => setFilter(key)}
          >
            {label} <span className="count">{groups[key].length}</span>
          </button>
        ))}
      </div>

      {error && <div className="admin-error">{error}</div>}
      {flash && (
        <div className="admin-flash" role="status">
          {flash}
        </div>
      )}
      {loading && <p>Loading…</p>}

      {!loading && visible.length === 0 && (
        <div className="empty-state">
          <p>{EMPTY[filter]}</p>
        </div>
      )}

      {!loading && visible.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Title</th>
                <th>Partner</th>
                <th>Signups</th>
                <th>Status</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => {
                const o = mapOpportunity(r);
                const { date, time } = formatWhen(o);
                const c = counts[r.id] || { confirmed: 0, waitlist: 0 };
                const isPast = filter === 'past';
                return (
                  <tr key={r.id} className={isPast ? 'muted' : ''}>
                    <td>
                      {date || '—'}
                      {time && (
                        <>
                          <br />
                          <span className="admin-sub">{time}</span>
                        </>
                      )}
                    </td>
                    <td className="row-title">{r.title}</td>
                    <td>{r.partner?.name || '—'}</td>
                    <td>
                      {c.confirmed} / {r.total_spots}
                      {c.waitlist > 0 && <span className="admin-sub"> +{c.waitlist} waitlist</span>}
                    </td>
                    <td>
                      {!r.is_published ? (
                        <span className="admin-pill unpublished">Draft</span>
                      ) : isPast ? (
                        <span className="admin-pill">Past</span>
                      ) : r.is_featured ? (
                        <span className="admin-pill urgent">Featured</span>
                      ) : (
                        <span className="admin-pill">Open</span>
                      )}
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <button type="button" onClick={() => setEditing({ mode: 'edit', row: r })}>
                          Edit
                        </button>
                        <button type="button" onClick={() => setEditing({ mode: 'duplicate', row: r })}>
                          Duplicate
                        </button>
                        <button type="button" onClick={() => setRoster(r)}>
                          Roster
                        </button>
                        <button
                          type="button"
                          onClick={async () =>
                            say((await copyText(oppLink(r.id))) ? 'Link copied.' : 'Couldn’t copy the link.')
                          }
                        >
                          Copy link
                        </button>
                        {r.is_published && !isPast && (
                          <button
                            type="button"
                            className="danger"
                            onClick={async () => {
                              if (
                                window.confirm(
                                  `Unpublish "${r.title}"? It will leave the public site but keep its signups.`
                                )
                              ) {
                                try {
                                  await unpublishOpportunity(r.id);
                                  refresh();
                                } catch (e) {
                                  setError(e.message);
                                }
                              }
                            }}
                          >
                            Unpublish
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <OppEditor
          key={`${editing.mode}-${editing.row?.id || 'new'}`}
          opp={editing.mode === 'edit' ? editing.row : null}
          copyFrom={editing.mode === 'duplicate' ? editing.row : null}
          presetPartnerId={editing.partnerId}
          rows={rows}
          partners={partners}
          counts={counts}
          close={closeEditor}
          onSaved={() => {
            closeEditor();
            refresh();
          }}
        />
      )}

      {roster && (
        <RosterDrawer
          opp={roster}
          counts={counts}
          close={() => setRoster(null)}
          onChanged={() => adminSignupCounts().then(setCounts).catch(() => {})}
        />
      )}
    </>
  );
}
