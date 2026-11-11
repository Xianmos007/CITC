import { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { home } from '../data/home.js';
import { galleryPage } from '../data/gallery.js';
import { saturdayStrip, visionPhoto } from '../data/homePhotos.js';
import { HeroScene } from '../components/HeroScene.jsx';

/* Fade sections in as they scroll into view, once. */
function useReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const els = root.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      }),
      { rootMargin: '0px 0px -8% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [rootRef]);
}

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
function Hero({ setPage, opportunities }) {
  const { hero } = home;
  return (
    <section className="hero">
      <div className="hero-copy">
        <span className="pill-label fade-in" style={{ '--d': '.05s' }}>
          <span className="dot"></span>
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
          <button className="btn btn-primary" onClick={() => setPage('volunteer')}>
            Find a need <span className="arrow">→</span>
          </button>
          <button className="btn btn-ghost" onClick={() => setPage('who')}>
            Who we are
          </button>
        </div>
        <div className="hero-stats fade-in" style={{ '--d': '1.05s' }}>
          {hero.stats.map((s, i) => (
            <span key={i} className="hero-stat">
              <span className="num">{s.num}</span>
              <span className="lbl">{s.label.toLowerCase()}</span>
            </span>
          ))}
        </div>
      </div>
      <HeroScene opportunities={opportunities} />
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
function Saturdays({ setPage }) {
  const { hero } = galleryPage;
  return (
    <section className="section" style={{ paddingBottom: 'calc(var(--section-pad-y) - 36px)' }}>
      <div className="container">
        <div className="section-head reveal">
          <h2>{hero.headingLine1} <em>{hero.headingEm}</em></h2>
          <div>
            <p>{hero.sub}</p>
            <button className="link" onClick={() => setPage('gallery')}>
              See The Saturdays <span className="arrow">→</span>
            </button>
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
function FeaturedPartners({ setPage }) {
  const { featuredPartners } = home;
  const statusClass = (s) =>
    s === 'Active' ? 'status-active' : s === 'In conversation' ? 'status-conv' : 'status-soon';
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
          {featuredPartners.cards.map((c, i) => (
            <div
              key={i}
              className="partner-card reveal"
              style={{ '--rd': `${i * 0.08}s` }}
              onClick={() => setPage('partners')}
            >
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
const splitDate = (date = '') => {
  const [dow, ...rest] = String(date).split('·').map((s) => s.trim());
  return { dow, day: rest.join(' ') };
};
const titleCase = (s = '') => s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

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
        <div className="section-head center reveal">
          <h2>This week's open hands.</h2>
          <p>A handful of small, specific ways to show up in Titusville this week.</p>
        </div>
        {isEmpty ? (
          <div className="empty-state reveal">
            <h4>The next round is coming together.</h4>
            <p>We're lining up Saturdays with our partners now. Want a nudge when they're posted?</p>
          </div>
        ) : (
          <div className="opp-list">
            {opps.map((o, i) => {
              const { dow, day } = splitDate(o.date);
              const full = o.filled >= o.total;
              return (
                <div
                  key={o.id}
                  className={`opp-row reveal ${o.urgency === 'urgent' ? 'urgent' : ''}`}
                  style={{ '--rd': `${i * 0.06}s` }}
                  onClick={() => openOpp(o.id)}
                >
                  <div className="opp-date">
                    <span className="dow">{dow}</span>
                    {day && <span className="day">{titleCase(day)}</span>}
                  </div>
                  <div className="what">
                    <h4>{o.title}</h4>
                    <div className="meta">
                      {[o.time && o.time.toLowerCase(), o.partner].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                  <div className={`progress ${full ? 'full' : ''}`}>
                    <div className="bar">
                      <div style={{ width: `${Math.min((o.filled / o.total) * 100, 100)}%` }}></div>
                    </div>
                    <div className="lbl">
                      <span className="filled">{o.filled} signed up</span>
                      <span>of {o.total}</span>
                    </div>
                  </div>
                  <span className="link">View <span className="arrow">→</span></span>
                </div>
              );
            })}
          </div>
        )}
        <div className="center-row reveal">
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
              <button className="btn btn-gold" onClick={() => setPage('volunteer')}>
                Find a need <span className="arrow">→</span>
              </button>
              <button className="btn btn-ghost-light" onClick={() => setPage('who')}>
                Read our story
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ============ HomePage ============ */
export function HomePage({ setPage, openOpp, opportunities = [] }) {
  const rootRef = useRef(null);
  useReveal(rootRef);
  useDrift(rootRef);

  return (
    <div className="page" ref={rootRef}>
      <Helmet>
        <title>Church in the City</title>
        <meta name="description" content="A collaborative initiative of churches working together to love and serve our city." />
        <meta property="og:title" content="Church in the City" />
        <meta property="og:description" content="A collaborative initiative of churches working together to love and serve our city." />
        <meta property="og:url" content="https://thechurchinthecity.org" />
        <meta property="og:image" content="https://thechurchinthecity.org/og-default.jpg" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Church in the City" />
        <meta name="twitter:description" content="A collaborative initiative of churches working together to love and serve our city." />
        <meta name="twitter:image" content="https://thechurchinthecity.org/og-default.jpg" />
      </Helmet>
      <Hero setPage={setPage} opportunities={opportunities} />
      <HowItWorks />
      <Saturdays setPage={setPage} />
      <FeaturedPartners setPage={setPage} />
      <CurrentOpportunities setPage={setPage} openOpp={openOpp} opportunities={opportunities} />
      <Vision setPage={setPage} />
    </div>
  );
}
