import { site } from '../data/site.js';
import flameUrl from '../assets/flame.png';

/* ============ MetaBar ============ */
export function MetaBar() {
  return (
    <div className="meta-bar">
      <div className="meta-bar-inner">
        <span className="meta-bar-label">{site.metaBar.label}</span>
        <div className="meta-bar-right">
          <span className="live"><span className="ldot"></span>{site.metaBar.nextEvent}</span>
          <span>{site.metaBar.scripture}</span>
        </div>
      </div>
    </div>
  );
}

/* ============ SiteNav ============ */
export function SiteNav({ page, setPage }) {
  return (
    <nav className="site-nav">
      <div className="site-nav-inner">
        <button className="logo-mark" onClick={() => setPage('home')} aria-label="Home">
          <img src={flameUrl} alt="" />
          <div>
            <div className="logo-text">{site.brand.name}</div>
            <div className="logo-sub">{site.brand.location}</div>
          </div>
        </button>
        <div className="nav-links">
          {site.navLinks.map(({ key, label }) => (
            <button
              key={key}
              className={`nav-link ${page === key ? 'active' : ''}`}
              onClick={() => setPage(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <button className="nav-cta" onClick={() => setPage('volunteer')}>
          Find a need <span className="arrow">→</span>
        </button>
      </div>
    </nav>
  );
}

/* ============ Footer ============ */
export function Footer({ setPage }) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo-mark">
              <img src={flameUrl} alt="" style={{ width: 32, height: 'auto' }} />
              <div>
                <div className="logo-text">{site.brand.name}</div>
                <div className="logo-sub">{site.brand.locationLong}</div>
              </div>
            </div>
            <p className="footer-tagline">
              {site.footer.benediction}
              <span className="attr">{site.footer.benedictionAttribution}</span>
            </p>
          </div>
          {site.footer.columns.map((col) => (
            <div key={col.heading} className="footer-col">
              <h4>{col.heading}</h4>
              <ul>
                {col.links.map((l, i) => (
                  <li key={i}>
                    <a onClick={l.page ? () => setPage(l.page) : undefined}>{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span>{site.footer.copyright}</span>
          <span>{site.footer.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
