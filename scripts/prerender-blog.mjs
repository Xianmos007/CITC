import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { blogPosts, featuredPost } from '../src/data/blog.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const indexPath = path.join(distDir, 'index.html');
const siteUrl = 'https://thechurchinthecity.org';
const defaultImage = `${siteUrl}/og-default.jpg`;
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

async function writePostHtml(template, post) {
  const slug = getSlug(post);
  if (!slug) return false;

  const html = stripManagedHeadTags(template).replace(
    /<head>/i,
    `<head>\n${buildHead(post)}`
  );
  const outDir = path.join(distDir, 'blog', slug);
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, 'index.html'), html, 'utf8');
  return true;
}

const template = await readFile(indexPath, 'utf8');
let count = 0;

for (const post of posts) {
  if (await writePostHtml(template, post)) count++;
}

console.log(`[prerender-blog] wrote ${count} blog post HTML files.`);
