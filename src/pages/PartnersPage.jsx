import { useState } from 'react';
import { partnersPage } from '../data/partners.js';

const statusClass = (s) =>
  s === 'Active' ? 'status-active' : s === 'In conversation' ? 'status-conv' : 'status-soon';

export function PartnersPage({ partners = [], loading = false }) {
  const [filter, setFilter] = useState('all');

  const filtered = partners.filter(
    (p) => filter === 'all' || p.status.toLowerCase().includes(filter)
  );

  const counts = {
    all: partners.length,
    active: partners.filter((p) => p.status === 'Active').length,
    conversation: partners.filter((p) => p.status === 'In conversation').length,
    horizon: partners.filter((p) => p.status === 'On the horizon').length,
  };

  const { hero, cta } = partnersPage;

  return (
    <div className="page">
      <section className="page-hero">
        <div className="container">
          <span className="label">{hero.label}</span>
          <h1>{hero.headingLine1} <em>{hero.headingEm}</em> {hero.headingLine2}</h1>
          <p className="sub">{hero.sub}</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="chips">
            <button className={`chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
              All <span className="count">{counts.all}</span>
            </button>
            <button className={`chip ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>
              Active <span className="count">{counts.active}</span>
            </button>
            <button className={`chip ${filter === 'conversation' ? 'active' : ''}`} onClick={() => setFilter('conversation')}>
              In conversation <span className="count">{counts.conversation}</span>
            </button>
            <button className={`chip ${filter === 'horizon' ? 'active' : ''}`} onClick={() => setFilter('horizon')}>
              On the horizon <span className="count">{counts.horizon}</span>
            </button>
          </div>
          <div className="partners-grid">
            {loading && (
              <div className="empty-state">
                <h4>Loading partners…</h4>
                <p>One moment while we pull the latest from the city.</p>
              </div>
            )}
            {!loading && filtered.map((p) => (
              <div key={p.id} className="partner-full">
                <div>
                  <span className={`status ${statusClass(p.status)}`}>{p.status}</span>
                  <h3 style={{ marginTop: 18 }}>{p.name}</h3>
                  <div className="type-line">{p.type}</div>
                  <p className="mission">{p.mission}</p>
                  <div className="meta">
                    <div className="m">Partnership<strong>{p.since}</strong></div>
                    <div className="m">Volunteers<strong>{p.vols}</strong></div>
                  </div>
                </div>
                <div className="right">
                  <h4>How we serve together</h4>
                  {p.needs.map((n, j) => (
                    <div key={j} className="need">
                      <span className="tt">{n.title}</span>
                      <span className="ct">{n.cadence}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="cta-band">
        <div className="container">
          <div className="grid">
            <div>
              <h3>{cta.headingLine1} <em>{cta.headingEm}</em></h3>
              <p>{cta.body}</p>
            </div>
            <div className="actions">
              <button className="btn btn-primary">Become a partner <span className="arrow">→</span></button>
              <button className="btn btn-ghost">Email the team</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
