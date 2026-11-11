// Three overlapping, gently drifting photos for an inner page's header.
// Decorative framing around real photos: each keeps its alt text.
export function PhotoCollage({ photos = [] }) {
  if (!photos.length) return null;
  return (
    <div className="collage">
      {photos.slice(0, 3).map((p, i) => (
        <figure key={i} className={`collage-photo c${i + 1}`}>
          <div className="collage-in grain" style={{ '--pos': p.pos || '50% 50%' }}>
            <img src={p.src} alt={p.alt} loading={i === 0 ? 'eager' : 'lazy'} />
          </div>
        </figure>
      ))}
      <span className="collage-dot" aria-hidden="true" />
    </div>
  );
}

// One wide photo with a short caption chip.
export function PhotoBand({ photo }) {
  if (!photo) return null;
  return (
    <section className="photo-band-wrap">
      <figure className="photo-band grain reveal">
        <img src={photo.src} alt={photo.alt} loading="lazy" />
        {photo.caption && <figcaption>{photo.caption}</figcaption>}
      </figure>
    </section>
  );
}
