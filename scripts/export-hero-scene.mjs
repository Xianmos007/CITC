// Exports the homepage hero landscape (src/components/HeroScene.jsx) as a
// standalone, static SVG and a 1200px-wide PNG for email headers.
//   node scripts/export-hero-scene.mjs
// The PNG step needs `rsvg-convert` (librsvg). Animations are frozen at their
// resting state; nothing in the output depends on the site's CSS.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public/assets/email');
const PAPER = '#FAF7F0';   // --citc-paper
const WINDOW = '#E7BF63';  // .scene .win (lit windows)
// The scene's own frame is 0 0 1440 470; the sunrise glow spills above it on
// the site, so the export adds headroom for the glow to fade out fully.
const VIEW = [0, -148, 1440, 618];

const src = readFileSync(path.join(root, 'src/components/HeroScene.jsx'), 'utf8');
const start = src.indexOf('function buildScene()');
const end = src.indexOf("// 'SAT");
if (start < 0 || end < 0) throw new Error('buildScene() not found in HeroScene.jsx');
const buildScene = new Function(`${src.slice(start, end)}; return buildScene;`)();

// Where a drifting cloud/bird sits at page load (see @keyframes drift).
const driftX = (t, dl) => (-360 + 2160 * ((-dl % t) / t)).toFixed(1);

const inner = buildScene()
  .replace(/<circle class="ring[^>]*\/>/g, '')            // pulse rings: invisible at rest
  .replace(/<circle class="vent"[^>]*\/>/g, '')           // tank steam: invisible at rest
  .replace(/class="win" style="[^"]*"/g, `fill="${WINDOW}"`)
  .replace(/class="shimmer" style="[^"]*"/g, 'opacity=".6"')
  .replace(/<g class="cloud" style="--t:([\d.]+)s;--dl:(-?[\d.]+)s">/g,
    (_, t, dl) => `<g transform="translate(${driftX(+t, +dl)} 0)">`)
  .replace(/ class="[^"]*"/g, '')
  .replace(/ style="[^"]*"/g, '')
  .replace(/\n\s*/g, '\n  ')
  .trim();

const svg = (bg) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEW.join(' ')}" width="${VIEW[2]}" height="${VIEW[3]}">
  <title>Titusville at sunrise — Church in the City</title>
  ${bg ? `<rect x="${VIEW[0]}" y="${VIEW[1]}" width="${VIEW[2]}" height="${VIEW[3]}" fill="${PAPER}"/>\n  ` : ''}${inner}
</svg>
`;

mkdirSync(outDir, { recursive: true });
const svgPath = path.join(outDir, 'hero-landscape.svg');
const pngPath = path.join(outDir, 'hero-landscape.png');
writeFileSync(svgPath, svg(false));
console.log('wrote', path.relative(root, svgPath));
execFileSync('rsvg-convert', ['-w', '1200', '-b', PAPER, '-o', pngPath, svgPath]);
console.log('wrote', path.relative(root, pngPath));
