import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { home } from '../data/home.js';
import { galleryPage } from '../data/gallery.js';
import { saturdayStrip, visionPhoto } from '../data/homePhotos.js';
import { Seo } from '../components/Seo.jsx';
import { HeroScene } from '../components/HeroScene.jsx';
import { useReveal } from '../hooks/useReveal.js';
import { formatWhen, todayLocalISO, compareOpportunities, isUpcoming } from '../lib/format.js';

/* Photos in the strip drift at slightly different speeds as you scroll. */
function useDrift(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const els = [...root.querySelectorAll('.shot-in[data-speed]')];
    let frame = 0;
    const run = () => {
      frame = 0;
      if (window.innerWidth <= 980) return;
      const vh = window.innerHeight;
      els.forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const offset = (r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.speed);
        el.style.setProperty('--py', `${offset.toFixed(1)}px`);
      });
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(run); };
    window.addEventListener('scroll', onScroll, { passive: true });
    run();
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [rootRef]);
}

/* ============ Hero ============ */
function Hero({ partners = [], opportunities = [], loading = false }) {
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

  // Tags in the scene: upcoming needs, soonest first.
  const today = todayLocalISO();
  const upcoming = [...opportunities].filter((o) => isUpcoming(o, today)).sort(compareOpportunities);

  return (
    <section className="hero">
      <div className="hero-copy">
        <span className="pill-label fade-in" style={{ '--d': '.05s' }}>
          <span className="dot" aria-hidden="true"></span>
          {hero.eyebrow}
        </span>
        <h1 className="hero-title" aria-label={hero.headlineWords.join(' ')}>
          {hero.headlineWords.map((w, i) => (
            <span
              key={i}
              aria-hidden="true"
              className={`word ${w === hero.goldWord ? 'gold' : ''}`}
              style={{ animationDelay: `${i * 0.08 + 0.12}s` }}
            >
              {w}
              {i < hero.headlineWords.length - 1 ? ' ' : ''}
            </span>
          ))}
        </h1>
        <p className="hero-scripture fade-in" style={{ '--d': '.75s' }}>
          {hero.scripture}
          <span className="attr">{hero.scriptureAttribution.replace(/^—\s*/, '')}</span>
        </p>
        <div className="hero-ctas fade-in" style={{ '--d': '.9s' }}>
          <Link className="btn btn-primary" to="/volunteer">
            Find a need <span className="arrow">→</span>
          </Link>
          <Link className="btn btn-ghost" to="/who">
            Who we are
          </Link>
        </div>
        {stats.length > 0 && (
          <div className="hero-stats fade-in" style={{ '--d': '1.05s' }}>
            {stats.map((st) => (
              <span key={st.label} className="hero-stat">
                <span className="num">{st.num}</span>
                <span className="lbl">{st.label}</span>
              </span>
            ))}
          </div>
        )}
      </div>
      <HeroScene opportunities={upcoming} />
    </section>
  );
}

/* ============ HowItWorks ============ */
const STEP_ICONS = [
  <svg key="post" viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z" /><path d="M8.5 9.5h7M8.5 12.5h4" /></svg>,
  <svg key="browse" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2" /><path d="M3 19c.6-3.4 3-5 6-5s5.4 1.6 6 5" /><path d="M15.5 10.5l2 2 3.5-4" /></svg>,
  <svg key="serve" viewBox="0 0 24 24"><circle cx="12" cy="13" r="4" /><path d="M12 3.5v2.5M4.5 13H2.5M21.5 13h-2M5.8 6.8l1.5 1.5M18.2 6.8l-1.5 1.5M3 20h18" /></svg>,
];

function HowItWorks() {
  const { howItWorks } = home;
  return (
    <section className="section">
      <div className="container">
        <div className="section-head center reveal">
          <h2>
            {howItWorks.headingLine1} <em>{howItWorks.headingLine2Em}</em>
          </h2>
          <p>{howItWorks.sub}</p>
        </div>
        <div className="how-grid">
          {howItWorks.steps.map((s, i) => (
            <div key={i} className="how-step reveal" style={{ '--rd': `${i * 0.08}s` }}>
              <div className="step-top">
                <div className="icon-wire" aria-hidden="true">{STEP_ICONS[i % STEP_ICONS.length]}</div>
                <span className="num">{s.num} · {s.label}</span>
              </div>
              <h3>{s.heading}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ The Saturdays (photos from the gallery) ============ */
function Saturdays() {
  const { hero } = galleryPage;
  return (
    <section className="section" style={{ paddingBottom: 'calc(var(--section-pad-y) - 36px)' }}>
      <div className="container">
        <div className="section-head reveal">
          <h2>{hero.headingLine1} <em>{hero.headingEm}</em></h2>
          <div>
            <p>{hero.sub}</p>
            <Link className="link" to="/gallery">
              See The Saturdays <span className="arrow">→</span>
            </Link>
          </div>
        </div>
        <div className="shots">
          {saturdayStrip.map((p, i) => (
            <figure
              key={i}
              className="shot reveal"
              style={{ '--off': `${p.off}px`, '--rd': `${i * 0.06}s` }}
            >
              <div className="shot-in grain" data-speed={p.speed} style={{ '--ar': p.ar, '--pos': p.pos }}>
                <img src={p.src} alt={p.alt} loading="lazy" />
              </div>
            </figure>
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
        <div className="section-head reveal">
          <h2>
            {featuredPartners.headingLine1} {featuredPartners.headingLine2}{' '}
            <em>{featuredPartners.headingLine2Em}</em> {featuredPartners.headingLine2End}
          </h2>
          <p>{featuredPartners.sub}</p>
        </div>
        <div className="partners-preview">
          {cards.map((p, i) => (
            <div key={p.id} className="partner-card has-card-link reveal" style={{ '--rd': `${i * 0.08}s` }}>
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

// 'SAT · NOV 14' -> { top: 'SAT', day: 'Nov 14' }; labels like
// 'Every Tuesday' or 'Ongoing' stay whole.
const dateChip = (date = '') => {
  const [top, ...rest] = String(date).split('·').map((s) => s.trim());
  const day = rest.join(' ').replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  return { top, day };
};

function CurrentOpportunities({ opportunities = [], loading = false }) {
  const opps = pickPreview(opportunities);
  const isEmpty = !loading && opps.length === 0;
  return (
    <section className="section">
      <div className="container">
        <div className="section-head center reveal">
          <h2>This week's open hands.</h2>
          <p>A handful of small, specific ways to show up in Titusville this week.</p>
        </div>
        {isEmpty ? (
          <div className="empty-state">
            <h3>The next round is coming together.</h3>
            <p>We're lining up Saturdays with our partners now. Check back soon.</p>
          </div>
        ) : (
          <div className="opp-list">
            {opps.map((o, i) => {
              const { date, time, place } = formatWhen(o);
              const { top, day } = dateChip(date);
              const filled = Number(o.filled) || 0;
              const total = Number(o.total) || 1;
              const featured = Boolean(o.is_featured ?? o.isFeatured);
              return (
                <div
                  key={o.id}
                  className={`opp-row has-card-link reveal ${featured ? 'urgent' : ''}`}
                  style={{ '--rd': `${i * 0.06}s` }}
                >
                  <div className="opp-date">
                    {top && <span className="dow">{top}</span>}
                    {day && <span className="day">{day}</span>}
                  </div>
                  <div className="what">
                    <h3>
                      <Link className="card-link" to={`/volunteer/${o.id}`} state={{ fromSite: true }}>
                        {o.title}
                      </Link>
                    </h3>
                    <div className="meta">{[time, place, o.partner].filter(Boolean).join(' · ')}</div>
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
                  <span className="link">View <span className="arrow">→</span></span>
                </div>
              );
            })}
          </div>
        )}
        <div className="center-row">
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
    <div className="vision-wrap">
      <section className="vision reveal">
        <div className="vision-photo grain" aria-hidden="true">
          <img src={visionPhoto} alt="" loading="lazy" />
        </div>
        <div className="vision-grid">
          <h2>
            {vision.headingLine1} <em>{vision.headingLine1Em}</em> {vision.headingLine1End} <em>{vision.headingLine2Em}</em>
          </h2>
          <div>
            <p>{vision.body}</p>
            <div className="vision-bridge">
              <div className="stage">
                <span className="lbl">{vision.fromLabel}</span>
                <span className="name">{vision.fromText}</span>
              </div>
              <span className="arrow-big" aria-hidden="true">→</span>
              <div className="stage to">
                <span className="lbl">{vision.toLabel}</span>
                <span className="name">{vision.toText}</span>
              </div>
            </div>
            <div className="row">
              <Link className="btn btn-gold" to="/volunteer">
                Find a need <span className="arrow">→</span>
              </Link>
              <Link className="btn btn-ghost-light" to="/who">
                Read our story
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ============ HomePage ============ */
export function HomePage({ opportunities = [], partners = [], loading = false }) {
  const rootRef = useRef(null);
  useReveal(rootRef);
  useDrift(rootRef);

  return (
    <div className="page" ref={rootRef}>
      <Seo path="/" />
      <Hero partners={partners} opportunities={opportunities} loading={loading} />
      <HowItWorks />
      <Saturdays />
      <FeaturedPartners partners={partners} />
      <CurrentOpportunities opportunities={opportunities} loading={loading} />
      <Vision />
    </div>
  );
}
