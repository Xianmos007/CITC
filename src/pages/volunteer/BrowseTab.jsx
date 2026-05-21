import { useState, useMemo } from 'react';
import { opportunities, filterOptions } from '../../data/opportunities.js';

export function BrowseTab({ openOpp }) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    partner: new Set(),
    type: new Set(),
    skill: new Set(),
  });

  const toggle = (group, value) => {
    setFilters((prev) => {
      const next = new Set(prev[group]);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return { ...prev, [group]: next };
    });
  };

  const filtered = useMemo(
    () =>
      opportunities.filter((o) => {
        if (search) {
          const s = search.toLowerCase();
          if (!(o.title.toLowerCase().includes(s) || o.partner.toLowerCase().includes(s))) return false;
        }
        if (filters.partner.size && !filters.partner.has(o.partner)) return false;
        if (filters.type.size && !filters.type.has(o.type)) return false;
        if (filters.skill.size && !o.skills.some((s) => filters.skill.has(s))) return false;
        return true;
      }),
    [search, filters]
  );

  return (
    <div className="container">
      <div className="browse-grid">
        <aside className="filters">
          <div className="search-bar" style={{ borderBottom: '1px solid var(--rule)', marginBottom: 0 }}>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search needs…" />
            <span className="meta">{filtered.length}</span>
          </div>
          <div className="filter-group">
            <h5>Partner</h5>
            {filterOptions.partners.map((p) => {
              const ct = opportunities.filter((o) => o.partner === p).length;
              return (
                <label key={p} className="filter-check">
                  <input
                    type="checkbox"
                    checked={filters.partner.has(p)}
                    onChange={() => toggle('partner', p)}
                  />
                  {p}
                  <span className="ct">{ct}</span>
                </label>
              );
            })}
          </div>
          <div className="filter-group">
            <h5>Kind of work</h5>
            {filterOptions.types.map((t) => {
              const ct = opportunities.filter((o) => o.type === t).length;
              return (
                <label key={t} className="filter-check">
                  <input
                    type="checkbox"
                    checked={filters.type.has(t)}
                    onChange={() => toggle('type', t)}
                  />
                  {t}
                  <span className="ct">{ct}</span>
                </label>
              );
            })}
          </div>
          <div className="filter-group">
            <h5>Good fit</h5>
            {filterOptions.skills.map((s) => (
              <label key={s} className="filter-check">
                <input
                  type="checkbox"
                  checked={filters.skill.has(s)}
                  onChange={() => toggle('skill', s)}
                />
                {s}
              </label>
            ))}
          </div>
        </aside>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8, paddingBottom: 18, borderBottom: '1px solid var(--rule)' }}>
            <h3 style={{ fontFamily: 'var(--serif)', fontSize: 30, fontWeight: 500, letterSpacing: '-0.015em' }}>
              Open this week & next
            </h3>
            <span className="meta" style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>
              Sort · Date ↓
            </span>
          </div>
          <div className="opps">
            {filtered.length === 0 && (
              <div className="empty-state" style={{ marginTop: 24 }}>
                <h4>Nothing matches.</h4>
                <p>Try fewer filters — or come to a Saturday and we'll find something.</p>
              </div>
            )}
            {filtered.map((o) => (
              <div
                key={o.id}
                className={`opp-row ${o.urgency === 'urgent' ? 'urgent' : ''}`}
                onClick={() => openOpp(o.id)}
              >
                <div className="when">
                  <span className="date">{o.date}</span>
                  {o.time} · {o.dur.toUpperCase()}
                </div>
                <div className="what">
                  <h4>{o.title}</h4>
                  <span className="partner">{o.partner}</span>
                </div>
                <div className={`progress ${o.filled >= o.total ? 'full' : ''}`}>
                  <div className="bar">
                    <div style={{ width: `${Math.min((o.filled / o.total) * 100, 100)}%` }}></div>
                  </div>
                  <div className="lbl">
                    <span className="filled">
                      {o.filled >= o.total ? 'Full · waitlist' : `${o.filled} signed up`}
                    </span>
                    <span>of {o.total}</span>
                  </div>
                </div>
                <span className="opp-cta">
                  {o.filled >= o.total ? 'Waitlist' : 'Sign up'} <span className="arrow">→</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
