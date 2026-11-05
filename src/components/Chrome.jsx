import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { site } from '../data/site.js';
import flameUrl from '../assets/flame.png';

/* ============ MetaBar ============ */
export function MetaBar() {
  return (
    <div className="meta-bar">
      <div className="meta-bar-inner">
        <span className="meta-bar-label">{site.metaBar.label}</span>
        <div className="meta-bar-right">
          <span>{site.metaBar.scripture}</span>
        </div>
      </div>
    </div>
  );
}

/* ============ SiteNav ============ */
const linkClass = (base) => ({ isActive }) => `${base} ${isActive ? 'active' : ''}`;

export function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  // Navigating always closes the panel, so the next page isn't hidden behind it.
  // Adjusting state during render (not in an effect) when the path changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

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
        <Link className="logo-mark" to="/" aria-label="Church in the City, home">
          <img src={flameUrl} alt="" />
          <div>
            <div className="logo-text">{site.brand.name}</div>
            <div className="logo-sub">{site.brand.location}</div>
          </div>
        </Link>
        <div className="nav-links">
          {site.navLinks.map(({ to, label }) => (
            <NavLink key={to} to={to} className={linkClass('nav-link')}>
              {label}
            </NavLink>
          ))}
        </div>
        {/* "Find a need" is the only nav entry for the volunteer page, so it
            carries the active state there (NavLink adds .active and
            aria-current, including on /volunteer/<id>). */}
        <NavLink to="/volunteer" className={linkClass('nav-cta')}>
          Find a need <span className="arrow">→</span>
        </NavLink>
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
          {site.navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={linkClass('mobile-nav-link')}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </NavLink>
          ))}
          <NavLink
            to="/volunteer"
            className={linkClass('mobile-nav-cta')}
            onClick={() => setMenuOpen(false)}
          >
            Find a need <span className="arrow">→</span>
          </NavLink>
        </div>
      )}
    </nav>
  );
}

/* ============ Footer ============ */
export function Footer() {
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
              <h2>{col.heading}</h2>
              <ul>
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.to ? <Link to={l.to}>{l.label}</Link> : <a href={l.href}>{l.label}</a>}
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
