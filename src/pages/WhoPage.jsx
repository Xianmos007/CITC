import { who } from '../data/who.js';

export function WhoPage({ setPage }) {
  const { hero, foundation, mission, origin, values, weAreNot, cta } = who;
  return (
    <div className="page">
      <section className="page-hero">
        <div className="container">
          <span className="label">{hero.label}</span>
          <h1>{hero.headingLine1} <em>{hero.headingEm}</em> {hero.headingLine2}</h1>
          <p className="sub">{hero.sub}</p>
        </div>
      </section>

      {/* Jer 29:7 Foundation */}
      <section className="section section-alt">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 80, alignItems: 'start' }}>
            <div>
              <span className="eyebrow">{foundation.eyebrow}</span>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: '44px', lineHeight: 1.05, letterSpacing: '-0.015em', fontWeight: 500, marginTop: 20 }}>
                {foundation.heading}
              </h2>
            </div>
            <div>
              <blockquote style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '30px', lineHeight: 1.4, borderLeft: '2px solid var(--accent)', paddingLeft: 32, color: 'var(--citc-ink)', marginBottom: 32 }}>
                {foundation.quote}
                <span style={{ display: 'block', fontStyle: 'normal', fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg-3)', marginTop: 24 }}>
                  {foundation.quoteAttribution}
                </span>
              </blockquote>
              {foundation.paragraphs.map((p, i) => (
                <p key={i} style={{ fontSize: 15.5, lineHeight: 1.7, color: 'var(--citc-ink-soft)', maxWidth: 620, marginTop: i === 0 ? 0 : 14 }}>
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="twocol">
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 80 }}>
          <div>
            <span className="eyebrow">{mission.eyebrow}</span>
            <h3 style={{ marginTop: 20 }}>{mission.heading}</h3>
          </div>
          <div className="twocol-body">
            <p className="lede">{mission.lede}</p>
            {mission.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      </section>

      {/* Origin */}
      <section className="twocol">
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 80 }}>
          <div>
            <span className="eyebrow">{origin.eyebrow}</span>
            <h3 style={{ marginTop: 20 }}>{origin.heading}</h3>
          </div>
          <div className="twocol-body">
            <p className="lede">{origin.lede}</p>
            {origin.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      </section>

      {/* Six Core Values */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>{values.heading}</h2>
            <p>{values.sub}</p>
          </div>
          <div className="values">
            {values.items.map((v, i) => (
              <div key={i} className="value">
                <div className="vnum">{v.roman}</div>
                <h4>{v.title}</h4>
                <p>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we are / what we are not */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <h2>
              {weAreNot.headingLine1}{' '}
              <em style={{ color: 'var(--accent)', fontStyle: 'italic', fontWeight: 400 }}>
                {weAreNot.headingEm}
              </em>{' '}
              {weAreNot.headingLine2}
            </h2>
            <p>{weAreNot.sub}</p>
          </div>
          <div className="isnt">
            <div className="isnt-col we">
              <h4>+ We are</h4>
              <ul>
                {weAreNot.weAre.map((l, i) => <li key={i}>{l}</li>)}
              </ul>
            </div>
            <div className="isnt-col not">
              <h4>− We are not</h4>
              <ul>
                {weAreNot.weAreNot.map((l, i) => <li key={i}>{l}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container">
          <div className="grid">
            <div>
              <h3>{cta.headingLine1} <em>{cta.headingEm}</em>{cta.headingLine2}</h3>
              <p>{cta.body}</p>
            </div>
            <div className="actions">
              <button className="btn btn-primary" onClick={() => setPage('volunteer')}>
                Find a need <span className="arrow">→</span>
              </button>
              <button className="btn btn-ghost" onClick={() => setPage('partners')}>
                Meet the partners
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
