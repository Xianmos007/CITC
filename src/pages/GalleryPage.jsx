import { useState, useEffect } from 'react';
import { galleryPage, photos as staticPhotos, galleryCategories } from '../data/gallery.js';

export function GalleryPage({ setPage, photos: dbPhotos }) {
  const [filter, setFilter] = useState('all');
  const [active, setActive] = useState(null);

  // Use DB photos when present; fall back to the bundled set otherwise so
  // the page is never blank (e.g. before any photos are uploaded, or if
  // the DB is unreachable).
  const photos = dbPhotos && dbPhotos.length ? dbPhotos : staticPhotos;

  const counts = Object.fromEntries(
    galleryCategories.map((c) => [
      c.key,
      c.key === 'all' ? photos.length : photos.filter((p) => p.cat === c.key).length,
    ])
  );
  const filtered = filter === 'all' ? photos : photos.filter((p) => p.cat === filter);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setActive(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = active ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [active]);

  const { hero, cta } = galleryPage;

  return (
    <div className="page">
      <section className="page-hero">
        <div className="container">
          <span className="label">{hero.label}</span>
          <h1>{hero.headingLine1} <em>{hero.headingEm}</em></h1>
          <p className="sub">{hero.sub}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="gallery-index">
            <div className="gi-row">
              <span className="eyebrow">— Index</span>
              <span className="gi-count">{filtered.length} · of {photos.length} frames</span>
            </div>
            <div className="chips">
              {galleryCategories.map((c) => (
                <button
                  key={c.key}
                  className={`chip ${filter === c.key ? 'active' : ''}`}
                  onClick={() => setFilter(c.key)}
                >
                  {c.label} <span className="count">{counts[c.key]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mosaic">
            {filtered.map((p) => (
              <figure key={p.id} className={`tile tile-${p.shape}`} onClick={() => setActive(p)}>
                <div className="tile-photo">
                  {p.image ? (
                    <img src={p.image} alt={p.caption || 'Church in the City'} loading="lazy" />
                  ) : (
                    <>
                      <span className="ph-tag">PHOTO · {String(p.id).slice(0, 2).toUpperCase()}</span>
                      <span className="ph-mark" aria-hidden="true"></span>
                    </>
                  )}
                </div>
                <figcaption>
                  <span className="cap-when">{p.when} · {p.place}</span>
                  <span className="cap-text">{p.caption}</span>
                </figcaption>
              </figure>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="empty-state">
              <h4>Nothing in the archive yet.</h4>
              <p>We haven&rsquo;t filed anything under this one. Try another.</p>
            </div>
          )}
        </div>
      </section>

      {/* Submit a photo */}
      <section className="cta-band">
        <div className="container">
          <div className="grid">
            <div>
              <h3>{cta.headingLine1} <em>{cta.headingEm}</em></h3>
              <p>{cta.body}</p>
            </div>
            <div className="actions">
              <button className="btn btn-primary">Submit a frame <span className="arrow">→</span></button>
              <button className="btn btn-ghost" onClick={() => setPage('volunteer')}>Be there next Saturday</button>
            </div>
          </div>
        </div>
      </section>

      {active && (
        <div className="modal-scrim" onClick={() => setActive(null)}>
          <div className="modal lightbox" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActive(null)} aria-label="Close">✕</button>
            <div className="lb-photo">
              {active.image ? (
                <img src={active.image} alt={active.caption || 'Church in the City'} />
              ) : (
                <>
                  <span className="ph-tag big">PHOTO · {String(active.id).slice(0, 2).toUpperCase()}</span>
                  <span className="ph-mark" aria-hidden="true"></span>
                </>
              )}
            </div>
            <div className="lb-foot">
              <div>
                <span className="eyebrow">— {galleryCategories.find((c) => c.key === active.cat)?.label}</span>
                <h3>{active.caption}</h3>
                <div className="lb-meta">{active.when} · {active.place}</div>
              </div>
              <div className="lb-nav">
                <button onClick={() => {
                  const i = filtered.findIndex((x) => x.id === active.id);
                  setActive(filtered[(i - 1 + filtered.length) % filtered.length]);
                }}>← Prev</button>
                <button onClick={() => {
                  const i = filtered.findIndex((x) => x.id === active.id);
                  setActive(filtered[(i + 1) % filtered.length]);
                }}>Next →</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
