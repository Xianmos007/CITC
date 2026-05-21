import { useState } from 'react';
import { blogPage, blogCategories, featuredPost, blogPosts } from '../data/blog.js';

export function BlogPage() {
  const [filter, setFilter] = useState('all');

  const counts = {
    all: blogPosts.length + 1,
    saturdays: 1 + blogPosts.filter((p) => p.cat === 'saturdays').length,
    partners: blogPosts.filter((p) => p.cat === 'partners').length,
    pastoral: blogPosts.filter((p) => p.cat === 'pastoral').length,
    letters: blogPosts.filter((p) => p.cat === 'letters').length,
  };

  const visible = filter === 'all' ? blogPosts : blogPosts.filter((p) => p.cat === filter);
  const showFeatured = filter === 'all' || filter === featuredPost.cat;

  const { hero, letter } = blogPage;

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
          <div className="chips">
            {blogCategories.map((c) => (
              <button
                key={c.key}
                className={`chip ${filter === c.key ? 'active' : ''}`}
                onClick={() => setFilter(c.key)}
              >
                {c.label} <span className="count">{counts[c.key]}</span>
              </button>
            ))}
            <div style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-3)', alignSelf: 'center' }}>
              {visible.length + (showFeatured ? 1 : 0)} pieces
            </div>
          </div>

          {showFeatured && (
            <article className="blog-feature">
              <div className="bf-photo">
                <span className="ph-label">{featuredPost.photoLabel}</span>
              </div>
              <div className="bf-body">
                <div className="bf-meta">
                  <span className="eyebrow">— {featuredPost.category}</span>
                  <span className="dot-sep">·</span>
                  <span className="bf-date">{featuredPost.date}</span>
                  <span className="dot-sep">·</span>
                  <span className="bf-read">{featuredPost.readtime} READ</span>
                </div>
                <h2>{featuredPost.title}</h2>
                <p className="bf-dek">{featuredPost.dek}</p>
                <div className="bf-byline">
                  <div className="bf-avatar">{featuredPost.author.split(' ').slice(-1)[0][0]}</div>
                  <div>
                    <div className="bf-author">{featuredPost.author}</div>
                    <div className="bf-church">{featuredPost.church}</div>
                  </div>
                  <button className="bf-read-link" onClick={() => alert('Article would open here.')}>
                    Read the piece <span className="arrow">→</span>
                  </button>
                </div>
              </div>
            </article>
          )}

          <div className="blog-list">
            {visible.map((p) => (
              <article key={p.id} className="blog-row" onClick={() => alert('Article would open here.')}>
                <div className="br-date">
                  <span className="d">{p.date}</span>
                  <span className="r">{p.read} READ</span>
                </div>
                <div className="br-body">
                  <span className="br-cat">{p.category}</span>
                  <h3>{p.title}</h3>
                  <p>{p.dek}</p>
                  <div className="br-byline">
                    <span>By <em>{p.author}</em></span>
                    <span className="dot-sep">·</span>
                    <span>{p.church}</span>
                  </div>
                </div>
                <div className="br-cta">Read <span className="arrow">→</span></div>
              </article>
            ))}
          </div>

          {visible.length === 0 && !showFeatured && (
            <div className="empty-state">
              <h4>Nothing here yet.</h4>
              <p>This category is quiet. Try another, or come back next Sunday afternoon.</p>
            </div>
          )}
        </div>
      </section>

      {/* Saturday letter signup */}
      <section className="cta-band">
        <div className="container">
          <div className="grid">
            <div>
              <h3>{letter.headingLine1} <em>{letter.headingEm}</em></h3>
              <p>{letter.body}</p>
            </div>
            <div className="actions" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              <div className="letter-form">
                <input type="email" placeholder="your.name@email" />
                <button className="btn btn-primary">Subscribe <span className="arrow">→</span></button>
              </div>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>
                {letter.note}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
