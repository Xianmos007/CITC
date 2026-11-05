import { useCallback, useEffect, useState } from 'react';
import { adminListRoster, updateSignupStatus } from '../../lib/admin.js';
import { mapOpportunity } from '../../lib/content.js';
import { formatWhen } from '../../lib/format.js';
import { copyText, textMessage } from '../../lib/share.js';
import { Drawer } from './components/Drawer.jsx';

// Everyone signed up for one need: confirmed, then waitlist. Copy emails,
// download a CSV, move people between the lists, or copy a text message
// to send around.

const csvCell = (v) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

function downloadCsv(filename, rows) {
  const lines = [
    ['Status', 'Name', 'Email', 'Phone', 'Church', 'Signed up'],
    ...rows.map((r) => [
      r.status,
      r.volunteer?.name,
      r.volunteer?.email,
      r.volunteer?.phone,
      r.volunteer?.church,
      new Date(r.created_at).toLocaleDateString(),
    ]),
  ].map((cols) => cols.map(csvCell).join(','));
  const blob = new Blob([`${lines.join('\r\n')}\r\n`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const slug = (s) =>
  String(s || 'need')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export function RosterDrawer({ opp, close, onChanged }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [flash, setFlash] = useState('');
  const [moving, setMoving] = useState(null);

  const load = useCallback(async () => {
    try {
      setRows(await adminListRoster(opp.id));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [opp.id]);

  useEffect(() => {
    load();
  }, [load]);

  const confirmed = rows.filter((r) => r.status === 'confirmed');
  const waitlist = rows.filter((r) => r.status === 'waitlist');
  const other = rows.filter((r) => r.status !== 'confirmed' && r.status !== 'waitlist');

  const o = { ...mapOpportunity(opp), filled: confirmed.length };
  const { date, time } = formatWhen(o);

  const say = (msg) => setFlash(msg);
  const copyEmails = async (list, label) => {
    const emails = list.map((r) => r.volunteer?.email).filter(Boolean);
    const what = `${label ? `${label} ` : ''}email${emails.length === 1 ? '' : 's'}`;
    if (!emails.length) return say(`No ${label ? `${label} ` : ''}emails to copy.`);
    say((await copyText(emails.join(', '))) ? `Copied ${emails.length} ${what}.` : 'Couldn’t copy.');
  };

  const move = async (row, status) => {
    setMoving(row.id);
    setError('');
    try {
      await updateSignupStatus(row.id, status);
      await load();
      onChanged?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setMoving(null);
    }
  };

  const section = (title, list, moveTo, moveLabel) => (
    <section className="roster-section">
      <h4>
        {title} <span className="count">{list.length}</span>
      </h4>
      {list.length === 0 ? (
        <p className="admin-hint">Nobody yet.</p>
      ) : (
        <ul className="roster-list">
          {list.map((r) => (
            <li key={r.id}>
              <div className="roster-who">
                <strong>{r.volunteer?.name || '—'}</strong>
                <span>
                  {r.volunteer?.email && <a href={`mailto:${r.volunteer.email}`}>{r.volunteer.email}</a>}
                  {r.volunteer?.phone && <> · <a href={`tel:${r.volunteer.phone}`}>{r.volunteer.phone}</a></>}
                </span>
                <span className="admin-sub">
                  {[r.volunteer?.church, `Signed up ${new Date(r.created_at).toLocaleDateString()}`]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </div>
              {moveTo && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={moving === r.id}
                  onClick={() => move(r, moveTo)}
                >
                  {moving === r.id ? 'Moving…' : moveLabel}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );

  return (
    <Drawer title={`Roster · ${opp.title}`} onClose={close}>
      <p className="admin-hint" style={{ marginTop: -12, marginBottom: 18 }}>
        {[date, time, opp.partner?.name].filter(Boolean).join(' · ')} — {confirmed.length} of {opp.total_spots} confirmed
      </p>

      <div className="roster-actions">
        <button type="button" className="btn btn-primary btn-sm" onClick={() => copyEmails(rows, '')}>
          Copy all emails
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => copyEmails(confirmed, 'confirmed')}>
          Confirmed only
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={!rows.length}
          onClick={() => downloadCsv(`${slug(opp.title)}-${opp.event_date || 'roster'}.csv`, rows)}
        >
          Download CSV
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={async () => say((await copyText(textMessage(o))) ? 'Text message copied.' : 'Couldn’t copy.')}
        >
          Copy text message
        </button>
      </div>
      {flash && (
        <p className="admin-flash" role="status">
          {flash}
        </p>
      )}
      {error && <div className="admin-error">{error}</div>}
      {loading ? (
        <p>Loading…</p>
      ) : (
        <>
          {section('Confirmed', confirmed, 'waitlist', 'Move to waitlist')}
          {section('Waitlist', waitlist, 'confirmed', 'Move to confirmed')}
          {other.length > 0 && section('Other', other, 'confirmed', 'Move to confirmed')}
        </>
      )}
    </Drawer>
  );
}
