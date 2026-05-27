import { Link, useParams } from 'react-router-dom';
import { blogPosts, featuredPost } from '../data/blog.js';

const allPosts = [featuredPost, ...blogPosts];

function getBody(post) {
  return post.body || [
    post.dek,
    'This field note is part of the Church in the City archive: a small record of pastors, partners, and neighbors learning to show up together.',
    'More posts are being prepared for this space. For now, keep the date, the author, and the invitation close.',
  ].join('\n\n');
}

function MarkdownBody({ body }) {
  return (
    <div className="blog-post-body">
      {body.split('\n\n').map((block) => {
        if (block.startsWith('## ')) {
          return <h2 key={block}>{block.slice(3)}</h2>;
        }
        return <p key={block}>{block}</p>;
      })}
    </div>
  );
}

export function BlogPost() {
  const { slug } = useParams();
  const post = allPosts.find((p) => p.id === slug || p.slug === slug);

  if (!post) {
    return (
      <div className="page">
        <section className="page-hero">
          <div className="container">
            <span className="label">Field Notes</span>
            <h1>Post not <em>found.</em></h1>
            <p className="sub">That field note may have moved, or it may not be published yet.</p>
            <Link className="btn btn-primary" to="/blog">
              ← Back to blog
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const read = post.readtime || post.read;

  return (
    <div className="page">
      <article className="blog-post">
        <div className="container">
          <Link className="blog-back" to="/blog">← Back to blog</Link>
          <div className="blog-post-meta">
            <span className="eyebrow">— {post.category}</span>
            <span className="dot-sep">·</span>
            <span>{post.date}</span>
            <span className="dot-sep">·</span>
            <span>{read} READ</span>
          </div>
          <h1>{post.title}</h1>
          <p className="blog-post-dek">{post.dek}</p>
          <div className="br-byline">
            <span>By <em>{post.author}</em></span>
            <span className="dot-sep">·</span>
            <span>{post.church}</span>
          </div>
          <MarkdownBody body={getBody(post)} />
        </div>
      </article>
    </div>
  );
}
