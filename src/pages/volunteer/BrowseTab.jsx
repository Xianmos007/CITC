import { useState, useMemo } from 'react';
import { deriveFilterOptions } from '../../lib/content.js';
import { OppCard } from '../../components/OppCard.jsx';

export function BrowseTab({ opportunities = [], loading = false }) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    partner: new Set(),
    type: new Set(),
    skill: new Set(),
  });

  const filterOptions = useMemo(
    () => deriveFilterOptions(opportunities),
    [opportunities]
  );
  const openCount = opportunities.filter((o) => o.filled < o.total).length;
  const isLowCount = openCount <= 4;

  const toggle = (group, value) => {
    setFilters((prev) => {
      const next = new Set(prev[group]);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return { ...prev, [group]: next };
    });
  };
  const setPartnerFilter = (value) => {
    setFilters((prev) => ({ ...prev, partner: value ? new Set([value]) : new Set() }));
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
    [search, filters, opportunities]
  );

  return (
    <div className="container">
      {isLowCount && (
        <div className="compact-filters">
          <div className="search-bar">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search needs…" />
            <span className="meta">{filtered.length}</span>
          </div>
          <select
            value={filters.partner.size === 1 ? [...filters.partner][0] : ''}
            onChange={(e) => setPartnerFilter(e.target.value)}
          >
            <option value="">All partners</option>
            {filterOptions.partners
              .filter((p) => opportunities.some((o) => o.partner === p))
              .map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      )}
      <div className={`browse-grid ${isLowCount ? 'low-count' : ''}`}>
        {!isLowCount && (
        <aside className="filters">
          <div className="search-bar" style={{ borderBottom: '1px solid var(--rule)', marginBottom: 0 }}>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search needs…" />
            <span className="meta">{filtered.length}</span>
          </div>
          <div className="filter-group">
            <h5>Partner</h5>
            {filterOptions.partners.map((p) => {
              const ct = opportunities.filter((o) => o.partner === p).length;
              if (ct === 0) return null;
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
              if (ct === 0) return null;
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
            {filterOptions.skills.map((s) => {
              const ct = opportunities.filter((o) => o.skills?.includes(s)).length;
              if (ct === 0) return null;
              return (
                <label key={s} className="filter-check">
                  <input
                    type="checkbox"
                    checked={filters.skill.has(s)}
                    onChange={() => toggle('skill', s)}
                  />
                  {s}
                  <span className="ct">{ct}</span>
                </label>
              );
            })}
          </div>
        </aside>
        )}
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
            {loading && (
              <div className="empty-state" style={{ marginTop: 24 }}>
                <h4>Loading needs…</h4>
                <p>One moment while we pull the latest from the city.</p>
              </div>
            )}
            {!loading && filtered.length === 0 && (
              <div className="empty-state" style={{ marginTop: 24 }}>
                {opportunities.length === 0 ? (
                  <>
                    <h4>No needs posted just yet.</h4>
                    <p>We're lining up the next round of Saturdays. Check back soon — or come to a Sunday and we'll point you to something.</p>
                  </>
                ) : (
                  <>
                    <h4>Nothing matches.</h4>
                    <p>Try fewer filters — or come to a Saturday and we'll find something.</p>
                  </>
                )}
              </div>
            )}
            {!loading && filtered.map((o) => <OppCard key={o.id} o={o} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
