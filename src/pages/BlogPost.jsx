import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { blogPosts, featuredPost } from '../data/blog.js';

const allPosts = [featuredPost, ...blogPosts];
const DEFAULT_OG_IMAGE = 'https://thechurchinthecity.org/og-default.jpg';
const SITE_URL = 'https://thechurchinthecity.org';
const markdownBodies = import.meta.glob('../content/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

function getBody(post) {
  return getMarkdownBody(post) || post.body || [
    post.dek,
    'This field note is part of the Church in the City archive: a small record of pastors, partners, and neighbors learning to show up together.',
    'More posts are being prepared for this space. For now, keep the date, the author, and the invitation close.',
  ].join('\n\n');
}

function getMarkdownBody(post) {
  return markdownBodies[`../content/blog/${post.id}.md`]
    || markdownBodies[`../content/blog/${post.slug}.md`]
    || '';
}

function MarkdownBody({ body }) {
  return (
    <div className="blog-post-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
    </div>
  );
}

function getDescription(post) {
  return post.excerpt
    || post.dek
    || (post.body || '').replace(/[#*_`>[\]()]/g, '').slice(0, 160).trim()
    || post.title;
}

function getCoverImage(post) {
  const cover = post.cover || post.cover_image_url || post.cover_url;
  if (!cover) return DEFAULT_OG_IMAGE;
  if (/^https?:\/\//i.test(cover)) return cover;
  if (cover.startsWith('/')) return `${SITE_URL}${cover}`;
  return DEFAULT_OG_IMAGE;
}

function getCoverSrc(post) {
  const cover = post.cover || post.cover_image_url || post.cover_url;
  return cover && !/^https?:\/\//i.test(cover) ? cover : cover || '';
}

function getSlug(post) {
  return post.slug || post.id;
}

export function BlogPost() {
  const { slug } = useParams();
  const post = allPosts.find((p) => p.id === slug || p.slug === slug);

  if (!post) {
    return (
      <div className="page">
        <Helmet>
          <title>Post not found · Church in the City</title>
          <meta name="description" content="That field note may have moved, or it may not be published yet." />
          <meta property="og:title" content="Post not found · Church in the City" />
          <meta property="og:description" content="That field note may have moved, or it may not be published yet." />
          <meta property="og:url" content={`https://thechurchinthecity.org/blog/${slug || ''}`} />
          <meta property="og:image" content={DEFAULT_OG_IMAGE} />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Post not found · Church in the City" />
          <meta name="twitter:description" content="That field note may have moved, or it may not be published yet." />
          <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />
        </Helmet>
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
  const description = getDescription(post);
  const coverImage = getCoverImage(post);
  const coverSrc = getCoverSrc(post);
  const postSlug = getSlug(post);

  return (
    <div className="page">
      <Helmet>
        <title>{post.title} · Church in the City</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`https://thechurchinthecity.org/blog/${postSlug}`} />
        <meta property="og:image" content={coverImage} />
        <meta property="og:type" content="article" />
        {post.published_at && <meta property="article:published_time" content={post.published_at} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={coverImage} />
      </Helmet>
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
          {coverSrc && (
            <div className="blog-post-cover">
              <img src={coverSrc} alt="" />
            </div>
          )}
          <MarkdownBody body={getBody(post)} />
        </div>
      </article>
    </div>
  );
}
