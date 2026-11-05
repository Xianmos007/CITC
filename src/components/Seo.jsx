import { Helmet } from 'react-helmet-async';
import { pageMeta, siteUrl, defaultImage, siteName } from '../data/pageMeta.js';

// Title, description and share-preview tags for one page.
// Pass `path` to use the defaults in data/pageMeta.js, and/or override
// any field directly.
export function Seo({ path, title, description, image, type = 'website' }) {
  const meta = pageMeta[path] || {};
  const t = title || meta.title || siteName;
  const d = description || meta.description || pageMeta['/'].description;
  const img = image || defaultImage;
  const url = `${siteUrl}${path && path !== '/' ? path : ''}`;
  return (
    <Helmet>
      <title>{t}</title>
      <meta name="description" content={d} />
      <meta property="og:title" content={t} />
      <meta property="og:description" content={d} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />
      <meta property="og:type" content={type} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={t} />
      <meta name="twitter:description" content={d} />
      <meta name="twitter:image" content={img} />
    </Helmet>
  );
}
