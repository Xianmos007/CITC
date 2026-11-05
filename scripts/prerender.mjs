import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { blogPosts, featuredPost } from '../src/data/blog.js';
import { pageMeta, siteUrl, defaultImage } from '../src/data/pageMeta.js';

// Writes dist/<page>/index.html for each top-level page and each blog post,
// with that page's <title> and share-preview (OG/Twitter) tags baked in.
// GitHub Pages serves these directly, so link previews in texts and social
// posts show the right page. Dynamic URLs like /volunteer/<id> still go
// through 404.html -> the app.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const indexPath = path.join(distDir, 'index.html');
const posts = [featuredPost, ...blogPosts];

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripMarkdown(value) {
  return String(value || '')
    .replace(/[#*_`>[\]()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getSlug(post) {
  return post.slug || post.id;
}

function getDescription(post) {
  return post.dek || post.excerpt || stripMarkdown(post.body).slice(0, 160) || post.title;
}

function getImage(post) {
  const image = post.cover || post.cover_image_url || post.cover_url || post.image_url;
  if (!image) return defaultImage;
  if (/^https?:\/\//i.test(image)) return image;
  if (image.startsWith('/')) return `${siteUrl}${image}`;
  return defaultImage;
}

function buildHead(post) {
  const slug = getSlug(post);
  const title = `${post.title} · Church in the City`;
  const description = getDescription(post);
  const url = `${siteUrl}/blog/${slug}`;
  const image = getImage(post);

  return `    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="Church in the City">
    <meta property="og:title" content="${escapeHtml(post.title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${escapeHtml(url)}">
    <meta property="og:image" content="${escapeHtml(image)}">
${post.published_at ? `    <meta property="article:published_time" content="${escapeHtml(post.published_at)}">\n` : ''}    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(post.title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${escapeHtml(image)}">`;
}

function stripManagedHeadTags(html) {
  return html
    .replace(/<title>[\s\S]*?<\/title>\s*/i, '')
    .replace(
      /\s*<meta\s+[^>]*(?:name|property)=["'](?:description|og:[^"']+|twitter:[^"']+|article:[^"']+)["'][^>]*>\s*/gi,
      ''
    );
}

function buildPageHead(route, meta) {
  const url = `${siteUrl}${route}`;
  return `    <title>${escapeHtml(meta.title)}</title>
    <meta name="description" content="${escapeHtml(meta.description)}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Church in the City">
    <meta property="og:title" content="${escapeHtml(meta.title)}">
    <meta property="og:description" content="${escapeHtml(meta.description)}">
    <meta property="og:url" content="${escapeHtml(url)}">
    <meta property="og:image" content="${escapeHtml(defaultImage)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(meta.title)}">
    <meta name="twitter:description" content="${escapeHtml(meta.description)}">
    <meta name="twitter:image" content="${escapeHtml(defaultImage)}">`;
}

async function writeHtml(template, relDir, head) {
  const html = stripManagedHeadTags(template).replace(/<head>/i, `<head>\n${head}`);
  const outDir = path.join(distDir, relDir);
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, 'index.html'), html, 'utf8');
}

const template = await readFile(indexPath, 'utf8');

let pageCount = 0;
for (const [route, meta] of Object.entries(pageMeta)) {
  if (route === '/') continue; // dist/index.html already carries the home tags
  await writeHtml(template, route.slice(1), buildPageHead(route, meta));
  pageCount++;
}

let postCount = 0;
for (const post of posts) {
  const slug = getSlug(post);
  if (!slug) continue;
  await writeHtml(template, path.join('blog', slug), buildHead(post));
  postCount++;
}

console.log(`[prerender] wrote ${pageCount} page and ${postCount} blog post HTML files.`);
