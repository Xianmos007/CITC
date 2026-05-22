import { home } from '../data/home.js';
import heroPhoto from '../assets/church in the city home.JPG';

/* ============ Hero ============ */
function Hero({ setPage }) {
  const { hero } = home;
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-grid">
          <div>
            <div className="hero-eyebrow">
              <span className="dot"></span>
              <span className="eyebrow">{hero.eyebrow}</span>
            </div>
            <h1 className="hero-title">
              {hero.headlineWords.map((w, i) => (
                <span
                  key={i}
                  className={`word ${w === hero.goldWord ? 'gold' : ''}`}
                  style={{ animationDelay: `${i * 0.09}s` }}
                >
                  {w}
                  {i < hero.headlineWords.length - 1 ? '\u00A0' : ''}
                </span>
              ))}
            </h1>
            <div className="hero-scripture">
              {hero.scripture}
              <span className="attr">{hero.scriptureAttribution}</span>
            </div>
            <div className="hero-ctas">
              <button className="btn btn-primary" onClick={() => setPage('volunteer')}>
                Find a need <span className="arrow">→</span>
              </button>
              <button className="btn btn-ghost" onClick={() => setPage('who')}>
                Who we are
              </button>
            </div>
          </div>
          <aside className="hero-aside">
            <div className="hero-photo">
  <img src={heroPhoto} alt="church in the city home." />
</div>
            <div className="hero-stats">
              {hero.stats.map((s, i) => (
                <div key={i} className="hero-stat">
                  <div className="num">{s.num}</div>
                  <span className="lbl">{s.label}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

/* ============ Marquee ============ */
function Marquee() {
  // Repeat the words twice for the seamless scroll effect
  const items = [...home.marqueeWords, ...home.marqueeWords];
  return (
    <div className="marquee">
      <div className="marquee-track">
        {items.map((t, i) => <span key={i} className="marquee-item">{t}</span>)}
        {items.map((t, i) => <span key={'b' + i} className="marquee-item">{t}</span>)}
      </div>
    </div>
  );
}

/* ============ HowItWorks ============ */
function HowItWorks() {
  const { howItWorks } = home;
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <h2>
            {howItWorks.headingLine1}<br />
            <em style={{ color: 'var(--accent)', fontStyle: 'italic', fontWeight: 400 }}>
              {howItWorks.headingLine2Em}
            </em>
          </h2>
          <p>{howItWorks.sub}</p>
        </div>
        <div className="how-grid">
          {howItWorks.steps.map((s, i) => (
            <div key={i} className="how-step">
              <span className="num">{s.num} / {s.label}</span>
              <div className="icon-wire">{s.tag}</div>
              <h3>{s.heading}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ FeaturedPartners ============ */
function FeaturedPartners({ setPage }) {
  const { featuredPartners } = home;
  const statusClass = (s) =>
    s === 'Active' ? 'status-active' : s === 'In conversation' ? 'status-conv' : 'status-soon';
  return (
    <section className="section section-alt">
      <div className="container">
        <div className="section-head">
          <h2>
            {featuredPartners.headingLine1}<br />
            {featuredPartners.headingLine2}{' '}
            <em style={{ color: 'var(--accent)', fontStyle: 'italic', fontWeight: 400 }}>
              {featuredPartners.headingLine2Em}
            </em>{' '}
            {featuredPartners.headingLine2End}
          </h2>
          <p>{featuredPartners.sub}</p>
        </div>
        <div className="partners-preview">
          {featuredPartners.cards.map((c, i) => (
            <div key={i} className="partner-card" onClick={() => setPage('partners')}>
              <span className={`status ${statusClass(c.status)}`}>{c.status}</span>
              <h3>{c.name}</h3>
              <div className="type">{c.type}</div>
              <p>{c.body}</p>
              <span className="link">Read more <span className="arrow">→</span></span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ CurrentOpportunities ============ */
function CurrentOpportunities({ setPage, openOpp, opportunities = [] }) {
  // Pull the opportunities marked for the home preview. DB rows carry the
  // human id in `slug`; static fallback rows carry it in `id`. Match either.
  // If none of the named previews are present (e.g. they were replaced in
  // the admin panel), fall back to the soonest few so this never goes empty.
  const wanted = home.homeOppPreviewIds;
  let opps = wanted
    .map((key) => opportunities.find((o) => o.slug === key || o.id === key))
    .filter(Boolean);
  if (opps.length === 0) opps = opportunities.slice(0, 3);

  const isEmpty = opps.length === 0;
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <h2>This week's<br />open hands.</h2>
          <p>A handful of small, specific ways to show up in Titusville this week.</p>
        </div>
        {isEmpty ? (
          <div className="empty-state">
            <h4>The next round is coming together.</h4>
            <p>We're lining up Saturdays with our partners now. Want a nudge when they're posted?</p>
          </div>
        ) : (
        <div className="opps">
          {opps.map((o) => (
            <div key={o.id} className="opp-row" onClick={() => openOpp(o.id)}>
              <div className="when">
                <span className="date">{o.date}</span>
                {o.time} · TITUSVILLE
              </div>
              <div className="what">
                <h4>{o.title}</h4>
                <span className="partner">{o.partner}</span>
              </div>
              <div className={`progress ${o.filled >= o.total ? 'full' : ''}`}>
                <div className="bar">
                  <div style={{ width: `${(o.filled / o.total) * 100}%` }}></div>
                </div>
                <div className="lbl">
                  <span className="filled">{o.filled} signed up</span>
                  <span>of {o.total}</span>
                </div>
              </div>
              <span className="opp-cta">View <span className="arrow">→</span></span>
            </div>
          ))}
        </div>
        )}
        <div style={{ marginTop: 40, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={() => setPage('volunteer')}>
            See all open needs <span className="arrow">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}

/* ============ Vision ============ */
function Vision({ setPage }) {
  const { vision } = home;
  return (
    <section className="vision">
      <div className="container">
        <div className="vision-grid">
          <div>
            <h2>
              {vision.headingLine1} <em>{vision.headingLine1Em}</em> {vision.headingLine1End} <em>{vision.headingLine2Em}</em>
            </h2>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--serif)', fontSize: '21px', lineHeight: 1.55, color: 'rgba(255,255,255,0.82)', marginBottom: 16 }}>
              {vision.body}
            </p>
            <div className="vision-bridge">
              <div className="stage">
                <div className="lbl">{vision.fromLabel}</div>
                <div className="name">{vision.fromText}</div>
              </div>
              <div className="arrow-big">→</div>
              <div className="stage">
                <div className="lbl">{vision.toLabel}</div>
                <div className="name">{vision.toText}</div>
              </div>
            </div>
            <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button className="btn btn-gold" onClick={() => setPage('volunteer')}>
                Find a need <span className="arrow">→</span>
              </button>
              <button className="btn btn-ghost-light" onClick={() => setPage('who')}>
                Read our story
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ HomePage ============ */
export function HomePage({ setPage, openOpp, opportunities = [] }) {
  return (
    <div className="page">
      <Hero setPage={setPage} />
      <Marquee />
      <HowItWorks />
      <FeaturedPartners setPage={setPage} />
      <CurrentOpportunities setPage={setPage} openOpp={openOpp} opportunities={opportunities} />
      <Vision setPage={setPage} />
    </div>
  );
}
