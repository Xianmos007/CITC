import { who } from '../data/who.js';

const encodeMailto = (value) => encodeURIComponent(value).replace(/'/g, '%27');
const churchInterestHref = `mailto:cristian.m@trinityfla.org?subject=${encodeMailto('Our church is interested in Church in the City')}&body=${encodeMailto('Church name:\nPastor:\nBest contact:\nAnything else:')}`;

export function WhoPage({ setPage, partners = [] }) {
  const { hero, foundation, mission, origin, values, weAreNot, cta } = who;
  const churches = partners.filter((p) => p.kind === 'church');

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
          <div className="who-split">
            <div>
              <span className="eyebrow">{foundation.eyebrow.replace(/^—\s*/, "")}</span>
              <h2>
                {foundation.heading}
              </h2>
            </div>
            <div>
              <blockquote className="who-quote">
                {foundation.quote}
                <span className="attr">
                  {foundation.quoteAttribution}
                </span>
              </blockquote>
              {foundation.paragraphs.map((p, i) => (
                <p key={i} className="who-body">
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
              <span className="eyebrow">{mission.eyebrow.replace(/^—\s*/, "")}</span>
              <h2>
                {mission.heading}
              </h2>
            </div>
            <div>
              <p className="who-lede">
                {mission.lede}
              </p>
              {mission.paragraphs.map((p, i) => (
                <p key={i} className="who-body">
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
              <span className="eyebrow">{origin.eyebrow.replace(/^—\s*/, "")}</span>
              <h2>
                {origin.heading}
              </h2>
            </div>
            <div>
              <p className="who-lede">
                {origin.lede}
              </p>
              {origin.paragraphs.map((p, i) => (
                <p key={i} className="who-body">
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
              <em>{weAreNot.headingEm}</em>{' '}
              {weAreNot.headingLine2}
            </h2>
            <p>{weAreNot.sub}</p>
          </div>
          <div className="isnt">
            <div className="isnt-col we">
              <h4>We are</h4>
              <ul>
                {weAreNot.weAre.map((l, i) => <li key={i}>{l}</li>)}
              </ul>
            </div>
            <div className="isnt-col not">
              <h4>We are not</h4>
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
              <span className="eyebrow">Partner churches</span>
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
