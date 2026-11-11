import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo.jsx';
import { galleryPage, photos as staticPhotos, galleryCategories } from '../data/gallery.js';
import { submitPhotoHref } from '../lib/mailto.js';
import { useDialog } from '../hooks/useDialog.js';

// "Saturday, Nov 8 · Titusville" — skip whichever half is missing.
const whenWhere = (p) => [p.when, p.place].filter(Boolean).join(' · ');

export function GalleryPage({ photos: dbPhotos, categories: dbCategories }) {
  const [filter, setFilter] = useState('all');
  const [active, setActive] = useState(null);

  // Use DB photos when present; fall back to the bundled set otherwise so
  // the page is never blank (e.g. before any photos are uploaded, or if
  // the DB is unreachable).
  const photos = dbPhotos && dbPhotos.length ? dbPhotos : staticPhotos;
  const categoryList =
    dbCategories && dbCategories.length
      ? [{ key: 'all', label: 'All' }, ...dbCategories]
      : galleryCategories;

  const counts = Object.fromEntries(
    categoryList.map((c) => [
      c.key,
      c.key === 'all' ? photos.length : photos.filter((p) => p.cat === c.key).length,
    ])
  );
  const filtered = filter === 'all' ? photos : photos.filter((p) => p.cat === filter);
  const categoryLabel = (key) => categoryList.find((c) => c.key === key)?.label || '';
  // Caption first; otherwise describe the frame by category and date.
  // Never the site name — that tells a screen reader nothing.
  const altFor = (p) => p.caption || [categoryLabel(p.cat), p.when].filter(Boolean).join(' · ');

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
      <Seo path="/gallery" />
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
              <span className="eyebrow">Browse by</span>
              <span className="gi-count">{filtered.length} of {photos.length} photos</span>
            </div>
            <div className="chips">
              {categoryList.filter((c) => c.key === 'all' || counts[c.key] > 0).map((c) => (
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
              <figure key={p.id} className={`tile tile-${p.shape} has-card-link`}>
                <div className="tile-photo">
                  {p.image ? (
                    <img src={p.image} alt={altFor(p)} loading="lazy" />
                  ) : (
                    <>
                      <span className="ph-tag">PHOTO · {String(p.id).slice(0, 2).toUpperCase()}</span>
                      <span className="ph-mark" aria-hidden="true"></span>
                    </>
                  )}
                </div>
                <figcaption>
                  <span className="cap-when">{whenWhere(p)}</span>
                  <span className="cap-text">{p.caption}</span>
                </figcaption>
                <button
                  type="button"
                  className="card-link"
                  aria-label={`Open photo: ${altFor(p)}`}
                  onClick={() => setActive(p)}
                />
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
              <a className="btn btn-primary" href={submitPhotoHref}>Submit a frame <span className="arrow">→</span></a>
              <Link className="btn btn-ghost" to="/volunteer">Be there next Saturday</Link>
            </div>
          </div>
        </div>
      </section>

      {active && (
        <Lightbox
          photo={active}
          label={categoryLabel(active.cat)}
          alt={altFor(active)}
          onClose={() => setActive(null)}
          onStep={(delta) => {
            const i = filtered.findIndex((x) => x.id === active.id);
            setActive(filtered[(i + delta + filtered.length) % filtered.length]);
          }}
        />
      )}
    </div>
  );
}

// Mounted only while a photo is open, so useDialog can move focus in on
// open and hand it back to the tile that opened it on close.
function Lightbox({ photo, label, alt, onClose, onStep }) {
  const dialogRef = useDialog();
  return (
    <div className="modal-scrim" onClick={onClose}>
      <div
        className="modal lightbox"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lightbox-title"
        tabIndex={-1}
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="lb-photo">
          {photo.image ? (
            <img src={photo.image} alt={alt} />
          ) : (
            <>
              <span className="ph-tag big">PHOTO · {String(photo.id).slice(0, 2).toUpperCase()}</span>
              <span className="ph-mark" aria-hidden="true"></span>
            </>
          )}
        </div>
        <div className="lb-foot">
          <div>
            {label && <span className="eyebrow">{label}</span>}
            <h3 id="lightbox-title">{photo.caption || alt}</h3>
            {whenWhere(photo) && <div className="lb-meta">{whenWhere(photo)}</div>}
          </div>
          <div className="lb-nav">
            <button onClick={() => onStep(-1)}>← Prev</button>
            <button onClick={() => onStep(1)}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
