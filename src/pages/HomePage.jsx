import { Link } from 'react-router-dom';
import { home } from '../data/home.js';
import { Seo } from '../components/Seo.jsx';
import { formatWhen, todayLocalISO, compareOpportunities } from '../lib/format.js';
import hero1600 from '../assets/hero/hero-1600.webp';
import hero900 from '../assets/hero/hero-900.webp';

/* ============ Hero ============ */
function Hero({ partners = [], loading = false }) {
  const { hero } = home;
  // Live counts; a stat with nothing to count yet is hidden.
  const stats = loading
    ? []
    : [
        {
          num: partners.filter((p) => p.kind !== 'church' && p.status === 'Active').length,
          label: hero.statLabels.ministries,
        },
        {
          num: partners.filter((p) => p.kind === 'church').length,
          label: hero.statLabels.congregations,
        },
      ].filter((st) => st.num > 0);
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
              <Link className="btn btn-primary" to="/volunteer">
                Find a need <span className="arrow">→</span>
              </Link>
              <Link className="btn btn-ghost" to="/who">
                Who we are
              </Link>
            </div>
          </div>
          <aside className="hero-aside">
            <div className="hero-photo">
              {/* The photo is cover-cropped from 4:3 into a 4:5 frame, so it
                  needs ~1.67x the frame's width in source pixels. */}
              <img
                src={hero1600}
                srcSet={`${hero900} 900w, ${hero1600} 1600w`}
                sizes="(max-width: 980px) 140vw, 64vw"
                width="1600"
                height="1200"
                fetchPriority="high"
                alt="A smiling boy in a Church in the City T-shirt and work gloves holds a rake while clearing brush in an overgrown lot, another volunteer working behind him."
              />
            </div>
            {stats.length > 0 && (
              <div className="hero-stats">
                {stats.map((st) => (
                  <div key={st.label} className="hero-stat">
                    <div className="num">{st.num}</div>
                    <span className="lbl">{st.label}</span>
                  </div>
                ))}
              </div>
            )}
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
function FeaturedPartners({ partners = [] }) {
  const { featuredPartners } = home;
  // First three active ministry partners, in their display order.
  const cards = partners
    .filter((p) => p.kind !== 'church' && p.status === 'Active')
    .slice(0, 3);
  if (cards.length === 0) return null;
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
          {cards.map((p) => (
            <div key={p.id} className="partner-card has-card-link">
              <span className="status status-active">{p.status}</span>
              <h3>
                <Link className="card-link" to="/partners">
                  {p.name}
                </Link>
              </h3>
              {p.type && <div className="type">{p.type}</div>}
              {p.mission && <p>{p.mission}</p>}
              <span className="link">Read more <span className="arrow">→</span></span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ CurrentOpportunities ============ */
const addDays = (iso, n) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
};

// Next 3 dated needs in the coming two weeks; else the next 3 dated
// needs at all; else ongoing / undated ones.
function pickPreview(opportunities) {
  const today = todayLocalISO();
  const soon = addDays(today, 14);
  const sorted = [...opportunities].sort(compareOpportunities);
  const dated = sorted.filter((o) => !o.isOngoing && o.eventDate && o.eventDate >= today);
  const within = dated.filter((o) => o.eventDate <= soon);
  if (within.length) return within.slice(0, 3);
  if (dated.length) return dated.slice(0, 3);
  return sorted.filter((o) => o.isOngoing || !o.eventDate).slice(0, 3);
}

function CurrentOpportunities({ opportunities = [], loading = false }) {
  const opps = pickPreview(opportunities);
  const isEmpty = !loading && opps.length === 0;
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
            <p>We're lining up Saturdays with our partners now. Check back soon.</p>
          </div>
        ) : (
        <div className="opps opps-rows">
          {opps.map((o) => {
            const { date, time, place } = formatWhen(o);
            const filled = Number(o.filled) || 0;
            const total = Number(o.total) || 1;
            return (
              <div key={o.id} className="opp-row has-card-link">
                <div className="when">
                  {date && <span className="date">{date}</span>}
                  {[time, place].filter(Boolean).join(' · ')}
                </div>
                <div className="what">
                  <h4>
                    <Link className="card-link" to={`/volunteer/${o.id}`} state={{ fromSite: true }}>
                      {o.title}
                    </Link>
                  </h4>
                  <span className="partner">{o.partner}</span>
                </div>
                <div className={`progress ${filled >= total ? 'full' : ''}`}>
                  <div className="bar">
                    <div style={{ width: `${Math.min((filled / total) * 100, 100)}%` }}></div>
                  </div>
                  <div className="lbl">
                    <span className="filled">{filled >= total ? 'Full · waitlist' : `${filled} signed up`}</span>
                    <span>of {total}</span>
                  </div>
                </div>
                <span className="opp-cta">View <span className="arrow">→</span></span>
              </div>
            );
          })}
        </div>
        )}
        <div style={{ marginTop: 40, display: 'flex', justifyContent: 'flex-end' }}>
          <Link className="btn btn-ghost" to="/volunteer">
            See all open needs <span className="arrow">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ============ Vision ============ */
function Vision() {
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
              <Link className="btn btn-gold" to="/volunteer">
                Find a need <span className="arrow">→</span>
              </Link>
              <Link className="btn btn-ghost-light" to="/who">
                Read our story
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ HomePage ============ */
export function HomePage({ opportunities = [], partners = [], loading = false }) {
  return (
    <div className="page">
      <Seo path="/" />
      <Hero partners={partners} loading={loading} />
      <Marquee />
      <HowItWorks />
      <FeaturedPartners partners={partners} />
      <CurrentOpportunities opportunities={opportunities} loading={loading} />
      <Vision />
    </div>
  );
}
