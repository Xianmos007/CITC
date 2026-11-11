import { useEffect, useState } from 'react';
import { site } from '../data/site.js';
import flameUrl from '../assets/flame.png';

/* ============ SiteNav ============ */
export function SiteNav({ page, setPage }) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Navigating always closes the panel, so the next page isn't hidden behind it.
  const go = (key) => {
    setPage(key);
    setMenuOpen(false);
  };

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <nav className="site-nav">
      <div className="site-nav-inner">
        <button className="logo-mark" onClick={() => go('home')} aria-label="Home">
          <img src={flameUrl} alt="" />
          <div className="logo-text">{site.brand.name}</div>
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
        <button className="nav-cta" onClick={() => go('volunteer')}>
          Find a need <span className="arrow">→</span>
        </button>
        <button
          className="nav-toggle"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className={`nav-toggle-bars ${menuOpen ? 'open' : ''}`} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </button>
      </div>
      {menuOpen && (
        <div className="mobile-nav" id="mobile-nav">
          {site.navLinks.map(({ key, label }) => (
            <button
              key={key}
              className={`mobile-nav-link ${page === key ? 'active' : ''}`}
              onClick={() => go(key)}
            >
              {label}
            </button>
          ))}
          <button className="mobile-nav-cta" onClick={() => go('volunteer')}>
            Find a need <span className="arrow">→</span>
          </button>
        </div>
      )}
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
              <img src={flameUrl} alt="" />
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
