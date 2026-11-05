import { Link } from 'react-router-dom';
import { who } from '../data/who.js';
import { Seo } from '../components/Seo.jsx';

const encodeMailto = (value) => encodeURIComponent(value).replace(/'/g, '%27');
const churchInterestHref = `mailto:cristian.m@trinityfla.org?subject=${encodeMailto('Our church is interested in Church in the City')}&body=${encodeMailto('Church name:\nPastor:\nBest contact:\nAnything else:')}`;

export function WhoPage({ partners = [] }) {
  const { hero, foundation, mission, origin, values, weAreNot, cta } = who;
  const churches = partners.filter((p) => p.kind === 'church');

  return (
    <div className="page">
      <Seo path="/who" />
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
          <div className="who-split">
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
      <section className="section">
        <div className="container">
          <div className="who-split">
            <div>
              <span className="eyebrow">{mission.eyebrow}</span>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: '44px', lineHeight: 1.05, letterSpacing: '-0.015em', fontWeight: 500, marginTop: 20 }}>
                {mission.heading}
              </h2>
            </div>
            <div>
              <p style={{ fontFamily: 'var(--serif)', fontSize: '21px', lineHeight: 1.55, color: 'var(--citc-ink)', marginBottom: 24, maxWidth: 620 }}>
                {mission.lede}
              </p>
              {mission.paragraphs.map((p, i) => (
                <p key={i} style={{ fontSize: 15.5, lineHeight: 1.7, color: 'var(--citc-ink-soft)', maxWidth: 620, marginTop: 14 }}>
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Origin */}
      <section className="section">
        <div className="container">
          <div className="who-split">
            <div>
              <span className="eyebrow">{origin.eyebrow}</span>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: '44px', lineHeight: 1.05, letterSpacing: '-0.015em', fontWeight: 500, marginTop: 20 }}>
                {origin.heading}
              </h2>
            </div>
            <div>
              <p style={{ fontFamily: 'var(--serif)', fontSize: '21px', lineHeight: 1.55, color: 'var(--citc-ink)', marginBottom: 24, maxWidth: 620 }}>
                {origin.lede}
              </p>
              {origin.paragraphs.map((p, i) => (
                <p key={i} style={{ fontSize: 15.5, lineHeight: 1.7, color: 'var(--citc-ink-soft)', maxWidth: 620, marginTop: 14 }}>
                  {p}
                </p>
              ))}
            </div>
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

      <section className="section partner-churches">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">— Partner churches</span>
              <h2>The churches who keep <em>showing</em> up.</h2>
            </div>
            <p>Local congregations learning to seek Titusville's welfare together, one ordinary act of faithfulness at a time.</p>
          </div>

          {churches.length > 0 ? (
            <div className="church-grid">
              {churches.map((church) => (
                <article key={church.id} className="church-card">
                  {church.logo && <img src={church.logo} alt="" />}
                  <h3>{church.name}</h3>
                  {church.location && <span>{church.location}</span>}
                  {church.mission && <p>{church.mission}</p>}
                </article>
              ))}
            </div>
          ) : (
            <p className="small church-empty">We're just getting started. Your church could be the first.</p>
          )}

          <div className="church-cta">
            <a className="btn btn-primary" href={churchInterestHref}>
              Is your church interested? Join now <span className="arrow">→</span>
            </a>
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
              <Link className="btn btn-primary" to="/volunteer">
                Find a need <span className="arrow">→</span>
              </Link>
              <Link className="btn btn-ghost" to="/partners">
                Meet the partners
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
