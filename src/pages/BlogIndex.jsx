import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo.jsx';
import { blogPage, blogCategories, featuredPost, blogPosts } from '../data/blog.js';

export function BlogIndex() {
  const [filter, setFilter] = useState('all');

  const counts = {
    all: blogPosts.length + 1,
    saturdays: (featuredPost.cat === 'saturdays' ? 1 : 0) + blogPosts.filter((p) => p.cat === 'saturdays').length,
    partners: (featuredPost.cat === 'partners' ? 1 : 0) + blogPosts.filter((p) => p.cat === 'partners').length,
    pastoral: (featuredPost.cat === 'pastoral' ? 1 : 0) + blogPosts.filter((p) => p.cat === 'pastoral').length,
    letters: (featuredPost.cat === 'letters' ? 1 : 0) + blogPosts.filter((p) => p.cat === 'letters').length,
  };

  const visible = filter === 'all' ? blogPosts : blogPosts.filter((p) => p.cat === filter);
  const showFeatured = filter === 'all' || filter === featuredPost.cat;
  const pieceCount = visible.length + (showFeatured ? 1 : 0);

  const { hero } = blogPage;

  return (
    <div className="page">
      <Seo path="/blog" />
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
            {blogCategories.filter((c) => c.key === 'all' || counts[c.key] > 0).map((c) => (
              <button
                key={c.key}
                className={`chip ${filter === c.key ? 'active' : ''}`}
                onClick={() => setFilter(c.key)}
              >
                {c.label} <span className="count">{counts[c.key]}</span>
              </button>
            ))}
            <div className="chips-meta">
              {pieceCount} {pieceCount === 1 ? 'piece' : 'pieces'}
            </div>
          </div>

          {showFeatured && (
            <article className="blog-feature">
              <div className="bf-photo">
                {featuredPost.cover ? (
                  <img src={featuredPost.cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <span className="ph-label">{featuredPost.photoLabel}</span>
                )}
              </div>
              <div className="bf-body">
                <div className="bf-meta">
                  <span className="eyebrow">{featuredPost.category}</span>
                  <span className="dot-sep">·</span>
                  <span className="bf-date">{featuredPost.date}</span>
                  <span className="dot-sep">·</span>
                  <span className="bf-read">{featuredPost.readtime || featuredPost.read} read</span>
                </div>
                <h2>{featuredPost.title}</h2>
                <p className="bf-dek">{featuredPost.dek}</p>
                <div className="bf-byline">
                  <div className="bf-avatar">{featuredPost.author.split(' ').slice(-1)[0][0]}</div>
                  <div>
                    <div className="bf-author">{featuredPost.author}</div>
                    <div className="bf-church">{featuredPost.church}</div>
                  </div>
                  <Link className="bf-read-link" to={`/blog/${featuredPost.id}`}>
                    Read the piece <span className="arrow">→</span>
                  </Link>
                </div>
              </div>
            </article>
          )}

          <div className="blog-list">
            {visible.map((p) => (
              <Link key={p.id} className="blog-row" to={`/blog/${p.id}`}>
                <div className="br-date">
                  <span className="d">{p.date}</span>
                  <span className="r">{p.read} read</span>
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
              </Link>
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

      {/* The Saturday letter band is hidden until its signup form is real
          (SPEC-audit-fixes Phase 6). Its copy is still in data/blog.js. */}
    </div>
  );
}
