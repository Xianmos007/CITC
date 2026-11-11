import { useEffect, useMemo, useRef, useState } from 'react';
import flameUrl from '../assets/flame.png';

/* =====================================================================
   HeroScene — Titusville at sunrise.
   The Indian River, the Max Brewer Bridge, the beach, 1960s ranch homes,
   mid-century churches, and a shuttle on the pad across the water.

   Drawn as one static SVG string (no user data goes into it). Live
   opportunities appear as small tags rising from specific buildings,
   one at a time, in a fixed walk across town. They are display only.
   ===================================================================== */

const VIEW_DESKTOP = [0, 0, 1440, 470];
const VIEW_PHONE = [250, 0, 640, 470];

// Where the tags land, in scene coordinates, walking left to right.
const ANCHORS = [
  { x: 72, y: 356 },    // pink ranch house
  { x: 179, y: 386 },   // seafoam ranch house
  { x: 275.5, y: 272 }, // bell tower
  { x: 456, y: 326 },   // A-frame chapel
  { x: 553, y: 356 },   // sky-blue ranch house
];
const STEMS = [34, 26, 30, 38, 28];

function buildScene() {
  const C = {
    far: '#DDD9C8', farTree: '#C6CFBA',
    midRoof: '#D9C3A6', nearRoof: '#C7A988', land: '#E9E1CE',
    winOff: 'rgba(28,26,22,.10)', leafMid: '#B4BFA6', leaf: '#93A283', trunk: '#B7A583',
    deck: '#C9BB9B', rail: '#B5A682', pier: '#D6CBB1',
  };
  // pastels pulled toward the cream-and-gold palette
  const P = { pink: '#F0CFC2', butter: '#F3E2B0', sky: '#CADDE3', seafoam: '#C5DCCD', peach: '#F2D5B0', cream: '#EADFC8', dTeal: '#7FA397', dCoral: '#D58C76', dGold: '#C39A45' };
  const TRIM = '#FBF8F1';
  let winN = 0;
  const lit = () => `--on:${(1.4 + (winN++ * 0.37) % 4.2).toFixed(2)}s;--tw:${(7 + (winN * 1.7) % 9).toFixed(1)}s`;
  const win = (x, y, w = 9, h = 12, arch = false) => {
    const rx = arch ? w / 2 : 2;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${C.winOff}"/>` +
      `<rect class="win" style="${lit()}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>`;
  };
  // 1960s Florida ranch: long and low, shallow hip roof, wide eaves, picture window, carport
  const ranch = (x, base, w, wall, roofC, door, carport = 0) => {
    const h = 31, top = base - h, rh = 13, ov = 11;
    let s = '';
    if (carport) {
      const cx = carport > 0 ? x + w : x - 46;
      s += `<rect x="${cx}" y="${top + 3}" width="46" height="5" rx="2" fill="${roofC}"/>`;
      s += `<rect x="${carport > 0 ? cx + 40 : cx + 3}" y="${top + 8}" width="3" height="${h - 8}" fill="${TRIM}"/>`;
    }
    s += `<rect x="${x}" y="${top}" width="${w}" height="${h}" fill="${wall}"/>`;
    s += `<path d="M${x - ov} ${top + 2} L${x + w * 0.15} ${top - rh} L${x + w * 0.85} ${top - rh} L${x + w + ov} ${top + 2} Z" fill="${roofC}" stroke="${roofC}" stroke-width="2" stroke-linejoin="round"/>`;
    s += `<rect x="${x - ov}" y="${top}" width="${w + ov * 2}" height="3.6" rx="1.8" fill="${TRIM}"/>`;
    const pw = Math.round(w * 0.36), px = x + w * 0.1;
    s += win(px, top + 10, pw, 13);
    s += `<rect x="${px + pw / 3 - 0.8}" y="${top + 10}" width="1.6" height="13" fill="${wall}"/><rect x="${px + (pw * 2) / 3 - 0.8}" y="${top + 10}" width="1.6" height="13" fill="${wall}"/>`;
    s += `<rect x="${x + w * 0.56}" y="${base - 21}" width="11" height="21" rx="1.5" fill="${door}"/>`;
    s += win(x + w * 0.76, top + 10, 13, 11);
    return s;
  };
  // downtown storefront: flat roof, arched upper windows, awning
  const block = (x, base, w, h, wall, roofC, cols = 3) => {
    const top = base - h;
    let s = `<rect x="${x}" y="${top}" width="${w}" height="${h}" fill="${wall}"/>`;
    s += `<rect x="${x - 3}" y="${top - 5}" width="${w + 6}" height="8" rx="3" fill="${TRIM}"/>`;
    const gx = w / (cols + 1);
    for (let c = 1; c <= cols; c++) s += win(x + gx * c - 5, top + 13, 10, 18, true);
    s += `<path d="M${x + 4} ${base - 24} h${w - 8} l5 9 h${-(w + 2)} Z" fill="${roofC}"/>`;
    for (let c = 1; c <= cols; c++) s += win(x + gx * c - 6, base - 13, 12, 13);
    return s;
  };
  const cross = (cx, top, c) =>
    `<rect x="${cx - 1.5}" y="${top}" width="3" height="26" rx="1.5" fill="${c}"/><rect x="${cx - 7}" y="${top + 7}" width="14" height="3" rx="1.5" fill="${c}"/>`;
  // mid-century church: low sanctuary, wide eaves, tall slot windows, slim bell tower
  const church = (x, base, w, wall, roofC, door, side = 'left') => {
    const h = 46, top = base - h, tw = 17, th = 124;
    const tx = side === 'left' ? x - tw - 12 : x + w + 12;
    let s = `<rect x="${Math.min(tx, x)}" y="${base - 30}" width="${w + tw + 12}" height="4" rx="2" fill="${roofC}"/>`;
    s += `<rect x="${tx}" y="${base - th}" width="${tw}" height="${th}" fill="${wall}"/><rect x="${tx - 2}" y="${base - th - 3}" width="${tw + 4}" height="5" rx="2" fill="${roofC}"/>`;
    for (let i = 0; i < 3; i++) s += `<rect x="${tx + 3.5}" y="${base - th + 10 + i * 9}" width="${tw - 7}" height="4" rx="2" fill="${roofC}"/>`;
    s += cross(tx + tw / 2, base - th - 27, roofC);
    s += `<rect x="${x}" y="${top}" width="${w}" height="${h}" fill="${wall}"/>`;
    s += `<path d="M${x - 12} ${top + 2} L${x + w / 2} ${top - 22} L${x + w + 12} ${top + 2} Z" fill="${roofC}" stroke="${roofC}" stroke-width="2" stroke-linejoin="round"/>`;
    s += `<rect x="${x - 12}" y="${top}" width="${w + 24}" height="3.6" rx="1.8" fill="${TRIM}"/>`;
    const n = 4, gap = (w - 40) / (n + 1);
    for (let i = 1; i <= n; i++) s += win(x + 34 + gap * i - 3, top + 11, 6, 26);
    s += `<rect x="${x + 9}" y="${base - 24}" width="17" height="24" rx="1.5" fill="${door}"/><rect x="${x + 17}" y="${base - 24}" width="1.2" height="24" fill="${wall}"/>`;
    return s;
  };
  // A-frame chapel: roof to the ground, a wall of glass, a small cross
  const aframe = (x, base, w, hgt, wall, roofC, door) => {
    const cx = x + w / 2, top = base - hgt;
    let s = cross(cx, top - 24, roofC);
    s += `<path d="M${x - 9} ${base} L${cx} ${top} L${x + w + 9} ${base} Z" fill="${roofC}" stroke="${roofC}" stroke-width="3" stroke-linejoin="round"/>`;
    s += `<path d="M${x + 9} ${base} L${cx} ${top + 22} L${x + w - 9} ${base} Z" fill="${wall}"/>`;
    const glass = `M${cx - 15} ${base - 26} L${cx} ${top + 44} L${cx + 15} ${base - 26} Z`;
    s += `<path d="${glass}" fill="${C.winOff}"/><path class="win" style="${lit()}" d="${glass}"/>`;
    s += `<rect x="${cx - 0.8}" y="${top + 46}" width="1.6" height="${hgt - 72}" fill="${wall}"/>`;
    s += `<rect x="${cx - 10}" y="${base - 21}" width="20" height="21" rx="1.5" fill="${door}"/><rect x="${cx - 0.6}" y="${base - 21}" width="1.2" height="21" fill="${wall}"/>`;
    return s;
  };
  const tree = (x, base, r, c) =>
    `<rect x="${x - 2.5}" y="${base - r * 1.5}" width="5" height="${r * 1.5}" rx="2" fill="${C.trunk}"/>` +
    `<circle cx="${x}" cy="${base - r * 1.9}" r="${r}" fill="${c}"/><circle cx="${x - r * 0.7}" cy="${base - r * 1.5}" r="${r * 0.7}" fill="${c}"/><circle cx="${x + r * 0.7}" cy="${base - r * 1.45}" r="${r * 0.72}" fill="${c}"/>`;
  const palm = (x, base, h, lean = 10, t = 7, dl = 0) => {
    const tx = x + lean, ty = base - h;
    const frond = (dx, dy, drop) => `<path d="M${tx} ${ty} q${dx * 0.55} ${dy - 14} ${dx} ${dy + drop}" />`;
    return `<g class="palm" style="--t:${t}s;--dl:${dl}s">` +
      `<path d="M${x} ${base} q${lean * 0.2} ${-h * 0.55} ${lean} ${-h}" fill="none" stroke="${C.trunk}" stroke-width="7" stroke-linecap="round"/>` +
      `<g fill="none" stroke="${C.leaf}" stroke-width="8" stroke-linecap="round">` +
      frond(-48, -6, 22) + frond(-30, -26, 10) + frond(34, -24, 8) + frond(50, -4, 24) + frond(-18, -10, 34) + frond(22, -8, 36) +
      `</g><circle cx="${tx}" cy="${ty}" r="6" fill="${C.leaf}"/></g>`;
  };
  const cloud = (x, y, s, t, dl, o = 0.9) =>
    `<g class="cloud" style="--t:${t}s;--dl:${dl}s"><g transform="translate(${x} ${y}) scale(${s})" fill="#fff" opacity="${o}">` +
    `<rect x="0" y="22" width="150" height="34" rx="17"/><circle cx="48" cy="26" r="26"/><circle cx="92" cy="20" r="32"/><circle cx="122" cy="34" r="18"/></g></g>`;
  const pelican = (y, t, dl) =>
    `<g class="cloud" style="--t:${t}s;--dl:${dl}s"><path d="M0 ${y} q8 -9 16 0 q8 -9 16 0" fill="none" stroke="rgba(28,26,22,.36)" stroke-width="2.2" stroke-linecap="round"/></g>`;

  const WATER = 374;

  /* the A. Max Brewer Bridge: a long concrete girder span with paired columns */
  const B0 = [372, 380], B1 = [800, 178], B2 = [1228, 370];
  const bx = (t) => (1 - t) * (1 - t) * B0[0] + 2 * (1 - t) * t * B1[0] + t * t * B2[0];
  const by = (t) => (1 - t) * (1 - t) * B0[1] + 2 * (1 - t) * t * B1[1] + t * t * B2[1];
  let piers = '', lamps = '';
  const N = 15;
  for (let i = 1; i < N; i++) {
    const t = i / N, x = bx(t), y = by(t) + 6, hgt = WATER + 8 - y;
    if (hgt > 16) {
      piers += `<rect x="${x - 9}" y="${y + 5}" width="5" height="${hgt}" fill="${C.pier}"/><rect x="${x + 4}" y="${y + 5}" width="5" height="${hgt}" fill="${C.pier}"/>`;
      piers += `<rect x="${x - 14}" y="${y}" width="28" height="7" rx="2" fill="${C.pier}"/>`;
      piers += `<rect class="win" style="${lit()}" x="${x - 2.5}" y="${y + 9}" width="5" height="${Math.min(hgt - 12, 46)}" rx="2.5"/>`;
    }
    if (i % 2 === 0) {
      const ly = by(t) - 8;
      lamps += `<path d="M${x} ${ly} v-20 h7" fill="none" stroke="${C.rail}" stroke-width="1.6" stroke-linecap="round"/><circle class="win" style="${lit()}" cx="${x + 8}" cy="${ly - 19}" r="2.6"/>`;
    }
  }
  const curve = `M${B0[0]} ${B0[1]} Q${B1[0]} ${B1[1]} ${B2[0]} ${B2[1]}`;
  const bridge = piers +
    `<path d="${curve}" fill="none" stroke="${C.deck}" stroke-width="13" stroke-linecap="round"/>` +
    `<path d="${curve}" fill="none" stroke="${C.rail}" stroke-width="1.6" transform="translate(0 -8)"/>` +
    `<path d="${curve}" fill="none" stroke="#DCD0B4" stroke-width="3" transform="translate(0 -3.5)"/>` + lamps;

  /* the far shore: Merritt Island and a shuttle on the pad */
  const S = { tank: '#DFA06D', tankShade: '#C98A58', white: '#F8F4EC', line: '#C2B79F', tile: '#4E4840', tower: '#D2B39C', towerLine: '#BE9A80', mlp: '#C9C2AE', pad: '#D6D0BD' };
  const shuttle = (x, base, k = 1) =>
    `<g transform="translate(${x} ${base}) scale(${k})">` +
    `<path d="M-48 8 L-31 -2 L40 -2 L56 8 Z" fill="${S.pad}"/>` +
    `<rect x="-25" y="-10" width="52" height="8" rx="1" fill="${S.mlp}"/>` +
    `<rect x="22" y="-98" width="11" height="88" fill="${S.tower}"/>` +
    Array.from({ length: 8 }, (_, i) => `<path d="M22 ${-98 + i * 11} l11 11 M33 ${-98 + i * 11} l-11 11" stroke="${S.towerLine}" stroke-width=".9"/>`).join('') +
    `<rect x="13" y="-103" width="28" height="5" rx="1" fill="${S.towerLine}"/>` +
    `<rect x="26.8" y="-124" width="1.6" height="22" fill="${S.towerLine}"/>` +
    `<circle class="beacon" cx="27.6" cy="-125" r="2.2" fill="#D58C76"/>` +
    `<rect x="5" y="-87" width="17" height="3" rx="1" fill="${S.towerLine}"/>` +
    `<rect x="16" y="-60" width="6" height="2.6" rx="1" fill="${S.towerLine}"/>` +
    `<path d="M-6 -10 V-76 C-6 -84 -1 -90 2 -93 C5 -90 10 -84 10 -76 V-10 Z" fill="${S.tank}"/>` +
    `<path d="M6 -10 V-78 C8 -82 10 -80 10 -76 V-10 Z" fill="${S.tankShade}" opacity=".55"/>` +
    `<path d="M10 -10 V-70 L13 -79 L16 -70 V-10 Z" fill="${S.white}" stroke="${S.line}" stroke-width=".9" stroke-linejoin="round"/>` +
    [-24, -40, -56].map((y) => `<path d="M10 ${y} h6" stroke="${S.line}" stroke-width=".9"/>`).join('') +
    `<path d="M-18 -40 L-28 -25 L-28 -19 L-18 -19 Z" fill="${S.white}" stroke="${S.line}" stroke-width=".9" stroke-linejoin="round"/>` +
    `<path d="M-18 -14 V-58 C-18 -66 -14 -72 -11 -73 C-8 -72 -6 -68 -6 -62 V-14 Z" fill="${S.white}" stroke="${S.line}" stroke-width=".9"/>` +
    `<path d="M-8.6 -14 V-63 C-7.6 -66 -6 -64 -6 -62 V-14 Z" fill="${S.tile}" opacity=".85"/>` +
    `<path d="M-14 -71.2 C-12.5 -73 -9.5 -73 -8 -71.2 C-9.5 -71.8 -12.5 -71.8 -14 -71.2 Z" fill="${S.tile}"/>` +
    `<path d="M-15.4 -65.6 h5.2 l-.6 1.5 h-4 Z" fill="${S.tile}" opacity=".7"/>` +
    `<path d="M-15 -56 V-24" stroke="${S.line}" stroke-width=".7"/>` +
    [-17.2, -13.4].map((ex) => `<path d="M${ex} -14 h3.2 l.8 4 h-4.8 Z" fill="#9C958A"/>`).join('') +
    `<circle class="vent" cx="6" cy="-88" r="3.2" fill="#fff"/>` +
    `<circle class="vent" style="animation-delay:-1.4s" cx="7" cy="-87" r="2.6" fill="#fff"/>` +
    `<circle class="vent" style="animation-delay:-2.8s" cx="5" cy="-89" r="2.8" fill="#fff"/>` +
    `</g>`;
  const far =
    `<path d="M1110 ${WATER + 2} q50 -13 110 -11 q60 -9 120 -6 q70 -8 180 -3 V${WATER + 2} Z" fill="${C.far}"/>` +
    [1150, 1178, 1212, 1244, 1384, 1412, 1446].map((x, i) => `<circle cx="${x}" cy="${WATER - 13 - (i % 2) * 3}" r="${9 + (i % 3) * 2}" fill="${C.farTree}"/>`).join('') +
    shuttle(1288, WATER - 5, 1.18);

  /* the river */
  let glints = '';
  for (let k = 0; k < 8; k++) {
    const w = 96 - k * 9, y = WATER + 9 + k * 8.5, off = (k % 2 ? 10 : -8);
    glints += `<rect class="shimmer" style="--t:${3.2 + (k % 3) * 0.9}s;--dl:${-k * 0.55}s" x="${720 - w / 2 + off}" y="${y}" width="${w}" height="3.4" rx="1.7" fill="#E9C46E"/>`;
  }
  [[470, 392, 36], [560, 408, 26], [905, 396, 40], [1000, 418, 28], [1120, 392, 34], [1230, 410, 30], [1330, 396, 26], [860, 428, 30]].forEach(([x, y, w], i) => {
    glints += `<rect class="shimmer" style="--t:${4 + (i % 4)}s;--dl:${-i * 0.8}s" x="${x}" y="${y}" width="${w}" height="2.6" rx="1.3" fill="#fff"/>`;
  });
  const water = `<rect x="-60" y="${WATER}" width="1560" height="120" fill="url(#citc-water)"/>` + glints +
    `<path d="M-60 404 V362 q110 -14 220 -4 q90 -10 170 6 q50 6 72 40 Z" fill="#E8E1CF"/>` +
    [36, 250, 276, 322].map((x, i) => `<circle cx="${x}" cy="${358 + (i % 2) * 4}" r="${13 + (i % 3) * 3}" fill="${C.farTree}"/>`).join('');
  const boat =
    `<g transform="translate(1010 ${WATER + 34})"><g class="boat-drift"><g class="boat">` +
    `<path d="M-1 -40 L-1 -5 L-19 -5 Z" fill="#fff"/><path d="M3 -33 L3 -5 L17 -5 Z" fill="#FBF1D8"/>` +
    `<path d="M-20 -2 h40 l-7 9 h-26 Z" fill="#fff"/><rect x="-1" y="-42" width="1.8" height="40" fill="${C.rail}"/></g></g></g>`;

  /* the town, on the west bank */
  const MB = 398, NB = 428;
  const mid =
    `<path d="M-60 480 V${MB} H610 q46 2 74 18 q34 22 76 46 V480 Z" fill="${C.land}"/>` +
    tree(8, MB, 17, C.leafMid) +
    ranch(26, MB, 92, P.pink, C.midRoof, P.dTeal) +
    block(142, MB, 92, 78, P.butter, C.midRoof, 3) +
    church(296, MB, 100, P.cream, C.midRoof, P.dCoral, 'left') +
    ranch(506, MB, 94, P.sky, C.midRoof, P.dGold) +
    tree(622, MB + 4, 14, C.leafMid);
  const near =
    palm(60, NB + 2, 128, -12, 7.5, -1) +
    ranch(122, NB, 114, P.seafoam, C.nearRoof, P.dCoral, 1) +
    palm(352, NB, 136, 8, 8.5, -3) +
    aframe(412, NB + 2, 88, 102, P.cream, C.nearRoof, P.dTeal);

  /* the beach in front */
  const shore = `M360 ${NB} C520 ${NB} 600 452 760 456 S1130 446 1500 420`;
  const beach =
    `<path d="M-60 480 V${NB} H360 C520 ${NB} 600 452 760 456 S1130 446 1500 420 V480 Z" fill="url(#citc-sand)"/>` +
    `<path class="foam" d="${shore}" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".9"/>` +
    palm(668, 455, 84, 10, 6.5, -2.5) +
    palm(1424, 436, 150, -14, 9, -4) + palm(1462, 430, 104, -6, 7, -1.5);

  return `
    <defs>
      <radialGradient id="citc-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0" stop-color="#F3DCA4" stop-opacity=".95"/><stop offset=".45" stop-color="#F5E7C6" stop-opacity=".55"/><stop offset="1" stop-color="#FAF7F0" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="citc-sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EBCB7C"/><stop offset="1" stop-color="#D5A84C"/></linearGradient>
      <linearGradient id="citc-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9DDD8"/><stop offset=".5" stop-color="#D6E5DF"/><stop offset="1" stop-color="#E4EDE6"/></linearGradient>
      <linearGradient id="citc-sand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EDE3CD"/><stop offset="1" stop-color="#F3EEE3"/></linearGradient>
    </defs>
    <g class="layer" style="--depth:-4"><circle class="glow" cx="720" cy="330" r="470" fill="url(#citc-glow)"/></g>
    <g class="layer" style="--depth:-7"><g class="sun-rise"><g class="sun-bob">
      <circle class="ring" cx="720" cy="322" r="104"/><circle class="ring r2" cx="720" cy="322" r="104"/><circle class="ring r3" cx="720" cy="322" r="104"/>
      <circle cx="720" cy="322" r="104" fill="url(#citc-sun)"/>
    </g></g></g>
    <g class="layer" style="--depth:-11">
      ${cloud(0, 70, 1.15, 150, -30)}${cloud(0, 150, 0.8, 110, -78, 0.85)}${cloud(0, 30, 0.65, 190, -120, 0.8)}
      ${pelican(292, 84, -52)}${pelican(306, 84, -51.2)}
    </g>
    <g class="layer" style="--depth:3"><g class="town" style="--d:.1s">${far}</g></g>
    <g class="layer" style="--depth:5">${water}</g>
    <g class="layer" style="--depth:8"><g class="town" style="--d:.2s">${bridge}</g></g>
    <g class="layer" style="--depth:9">${boat}</g>
    <g class="layer" style="--depth:11"><g class="town" style="--d:.3s">${mid}</g></g>
    <g class="layer" style="--depth:16"><g class="town" style="--d:.45s">${near}</g></g>
    <g class="layer" style="--depth:20"><g class="town" style="--d:.5s">${beach}</g></g>
  `;
}

// 'SAT · APR 27' → 'Sat', '8:00AM' → '8:00am'
const shortDay = (date = '') => {
  const d = String(date).split('·')[0].trim();
  return d ? d.charAt(0).toUpperCase() + d.slice(1).toLowerCase() : '';
};
const shortTime = (time = '') => String(time).replace(/\s?(AM|PM)$/i, (m) => m.trim().toLowerCase());

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function HeroScene({ opportunities = [] }) {
  const sceneRef = useRef(null);
  const svgRef = useRef(null);
  const markup = useMemo(() => buildScene(), []);
  const reduced = useMemo(() => prefersReducedMotion(), []);
  const [phone, setPhone] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches
  );
  const [points, setPoints] = useState([]); // anchor positions in px, null when off-screen
  const [step, setStep] = useState(0);
  const [showing, setShowing] = useState(false);

  // Upcoming needs that still have room come first; one per anchor at most.
  const needs = useMemo(() => {
    const open = opportunities.filter((o) => (Number(o.filled) || 0) < (Number(o.total) || 1));
    return (open.length ? open : opportunities).slice(0, ANCHORS.length);
  }, [opportunities]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const onChange = () => setPhone(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Where each anchor sits on screen right now.
  useEffect(() => {
    const scene = sceneRef.current;
    const svg = svgRef.current;
    if (!scene || !svg) return undefined;
    const measure = () => {
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      const box = scene.getBoundingClientRect();
      const pt = svg.createSVGPoint();
      setPoints(ANCHORS.map(({ x, y }) => {
        pt.x = x; pt.y = y;
        const p = pt.matrixTransform(ctm);
        const left = p.x - box.left, top = p.y - box.top;
        const fits = left > 24 && left < box.width - 24 && top > 70;
        return fits ? { left, top, width: box.width } : null;
      }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(scene);
    return () => ro.disconnect();
  }, [phone]);

  // The walk: rise, hold, settle, then the next building over.
  const slots = needs.map((o, i) => ({ o, i, p: points[i] })).filter((s) => s.p);
  const slotCount = slots.length;
  useEffect(() => {
    if (!slotCount || reduced) return undefined; // reduced motion: the first tag just stays put
    let t1, t2;
    let n = 0;
    const cycle = () => {
      setStep(n % slotCount);
      setShowing(true);
      t1 = setTimeout(() => {
        setShowing(false);
        n += 1;
        t2 = setTimeout(cycle, 1100);
      }, 4200);
    };
    t2 = setTimeout(cycle, 1800); // let the town rise first
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [slotCount, reduced]);

  // Keep each card on screen: the stem stays on its building, the card slides.
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    scene.querySelectorAll('.need').forEach((el) => {
      const card = el.querySelector('.need-card');
      const left = parseFloat(el.style.left);
      const half = card.offsetWidth / 2;
      const width = scene.clientWidth;
      const target = Math.min(Math.max(left, 12 + half), width - 12 - half);
      card.style.setProperty('--shift', `${(target - left).toFixed(1)}px`);
    });
  }, [points, needs]);

  // Pointer parallax: the town leans a few pixels toward the cursor.
  useEffect(() => {
    const scene = sceneRef.current;
    const host = scene?.parentElement;
    if (!host || !window.matchMedia('(hover: hover)').matches || prefersReducedMotion()) return undefined;
    const onMove = (e) => {
      const r = host.getBoundingClientRect();
      scene.style.setProperty('--px', (-((e.clientX - r.left) / r.width - 0.5)).toFixed(3));
      scene.style.setProperty('--py', (-((e.clientY - r.top) / r.height - 0.5)).toFixed(3));
    };
    const onLeave = () => {
      scene.style.setProperty('--px', 0);
      scene.style.setProperty('--py', 0);
    };
    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerleave', onLeave);
    return () => {
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  const view = (phone ? VIEW_PHONE : VIEW_DESKTOP).join(' ');

  return (
    <div className="scene" ref={sceneRef} aria-hidden="true">
      <svg
        ref={svgRef}
        viewBox={view}
        preserveAspectRatio="xMidYMax slice"
        dangerouslySetInnerHTML={{ __html: markup }}
      />
      {slots.map(({ o, i, p }, k) => (
        <div
          key={o.id}
          className={`need ${(reduced ? k === 0 : showing && step === k) ? 'on' : ''}`}
          style={{ left: p.left, top: p.top, '--stem': `${STEMS[i]}px` }}
        >
          <div className="need-card">
            <span className="ico"><img src={flameUrl} alt="" /></span>
            <span className="t">{o.title}</span>
            <small>{[shortDay(o.date), shortTime(o.time)].filter(Boolean).join(' · ')}</small>
          </div>
          <span className="need-stem" />
          <span className="need-ping" />
        </div>
      ))}
    </div>
  );
}
