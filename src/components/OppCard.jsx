import { Link } from 'react-router-dom';
import { formatWhen } from '../lib/format.js';

// One opportunity card, as shown on the volunteer page. Also rendered by
// the admin editor's live preview (`preview` = no link, not clickable).
export function OppCard({ o, preview = false }) {
  const filled = Number(o.filled) || 0;
  const total = Number(o.total) || 1;
  const isFull = filled >= total;
  const isFeatured = Boolean(o.is_featured ?? o.isFeatured);
  const { date, time, place } = formatWhen(o);
  const when = [date, time, o.dur, place].filter(Boolean).join(' · ');

  return (
    <article className={`opp-card ${preview ? '' : 'has-card-link'} ${isFeatured ? 'featured' : ''}`}>
      {isFeatured && <span className="opp-card-badge">Featured</span>}
      <div className="opp-card-when">{when}</div>
      <h3>
        {preview ? (
          o.title
        ) : (
          <Link className="card-link" to={`/volunteer/${o.id}`} state={{ fromSite: true }}>
            {o.title}
          </Link>
        )}
      </h3>
      <span className="opp-card-partner">{o.partner}</span>
      {o.desc && <p>{o.desc}</p>}
      <div className={`progress ${isFull ? 'full' : ''}`}>
        <div className="bar">
          <div style={{ width: `${Math.min((filled / total) * 100, 100)}%` }}></div>
        </div>
        <div className="lbl">
          <span className="filled">{isFull ? 'Full · waitlist' : `${filled} signed up`}</span>
          <span>of {total}</span>
        </div>
      </div>
      <span className="opp-cta">
        {isFull ? 'Waitlist' : 'Sign up'} <span className="arrow">→</span>
      </span>
    </article>
  );
}
