/**
 * Placeholder asset generator.
 *
 * Produces every image the site references, at the exact dimensions and
 * aspect ratios of the reference build, so layout, composition and visual
 * weight stay faithful. Swap the files in /public for real photography and
 * nothing else has to change.
 *
 *   node scripts/generate-assets.mjs
 */
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUB = join(ROOT, "public");

const ensure = (p) => mkdir(dirname(p), { recursive: true });

/* ------------------------------------------------------------------ */
/* Palette — mirrors the site's design tokens                          */
/* ------------------------------------------------------------------ */
const BG = "#0b0a09";
const ACCENT = "#c2a15a";

const PALETTES = {
  beef:     { glow: "#c2703a", top: "#d99b52", mid: "#7a4426", low: "#3a2015" },
  cheese:   { glow: "#e0a23c", top: "#f2c14e", mid: "#c98a24", low: "#4a3312" },
  bacon:    { glow: "#b4442c", top: "#d1614a", mid: "#8a2f20", low: "#3a1710" },
  green:    { glow: "#6f8f3a", top: "#93b352", mid: "#4d6626", low: "#1e2a10" },
  bread:    { glow: "#c98f4a", top: "#e0ab63", mid: "#96632c", low: "#3d2814" },
  truffle:  { glow: "#8a7440", top: "#c2a15a", mid: "#5c4a26", low: "#241d10" },
  flame:    { glow: "#e0641c", top: "#f59331", mid: "#a83c0e", low: "#3d1605" },
  cool:     { glow: "#5c6b78", top: "#8ba0af", mid: "#3a464f", low: "#161c20" },
  sepia:    { glow: "#9a7c50", top: "#c2a575", mid: "#69512f", low: "#241c11" },
  gold:     { glow: "#c2a15a", top: "#e6cb87", mid: "#8a6f34", low: "#2e2413" },
};

/* Deterministic PRNG so re-runs produce identical assets */
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/* ------------------------------------------------------------------ */
/* SVG composition — a stacked-burger silhouette lit from behind       */
/* ------------------------------------------------------------------ */
function stackSVG({
  w,
  h,
  palette,
  seed = 1,
  zoom = 1,
  explode = 0,
  glowStrength = 0.55,
  showPedestal = false,
  anchorX = 0.5,
}) {
  const p = PALETTES[palette] ?? PALETTES.beef;
  const rand = rng(seed);

  const cx = w * anchorX;
  const cy = h * 0.56;
  const bw = Math.min(w * 0.9, h * 1.25) * 0.44 * zoom; // burger width
  const unit = bw * 0.1; // layer thickness unit
  const gap = explode * unit * 1.8;

  // Layers listed bottom-up so later entries paint on top. Offsets are tuned
  // so the stack reads as a solid silhouette when explode === 0.
  const PATTY = "#6b3f22";
  const layers = [
    { t: "bun-b", off: 3.15, th: 1.3, fill: p.mid, w: 0.9 },
    { t: "veg", off: 2.25, th: 0.55, fill: PALETTES.green.mid, w: 1.04 },
    { t: "tomato", off: 1.62, th: 0.6, fill: "#a8322a", w: 0.99 },
    { t: "patty", off: 0.78, th: 1.0, fill: PATTY, w: 0.95 },
    { t: "cheese", off: -0.02, th: 0.4, fill: PALETTES.cheese.top, w: 1.03 },
    { t: "patty", off: -0.82, th: 1.0, fill: PATTY, w: 0.95 },
    { t: "cheese", off: -1.6, th: 0.4, fill: PALETTES.cheese.mid, w: 1.01 },
  ];

  const layerEls = layers
    .map((l, i) => {
      const spread = (layers.length / 2 - i) * gap;
      const y = cy + l.off * unit + spread;
      const lw = bw * l.w;
      const lh = unit * l.th;
      const r = lh * 0.55;
      return `<rect x="${(cx - lw / 2).toFixed(1)}" y="${(y - lh / 2).toFixed(1)}"
        width="${lw.toFixed(1)}" height="${lh.toFixed(1)}" rx="${r.toFixed(1)}"
        fill="${l.fill}" opacity="0.96"/>
        <rect x="${(cx - lw / 2).toFixed(1)}" y="${(y - lh / 2).toFixed(1)}"
        width="${lw.toFixed(1)}" height="${(lh * 0.34).toFixed(1)}" rx="${r.toFixed(1)}"
        fill="#ffffff" opacity="0.07"/>`;
    })
    .join("");

  // Top bun dome — a squat half-ellipse sitting flush on the top layer
  const domeBase = cy - 1.95 * unit - (layers.length / 2) * gap;
  const domeH = unit * 2.1;
  const dome = `
    <path d="M ${(cx - bw / 2).toFixed(1)} ${domeBase.toFixed(1)}
             A ${(bw / 2).toFixed(1)} ${domeH.toFixed(1)} 0 0 1 ${(cx + bw / 2).toFixed(1)} ${domeBase.toFixed(1)}
             Z" fill="url(#bunGrad)"/>
    <ellipse cx="${(cx - bw * 0.17).toFixed(1)}" cy="${(domeBase - domeH * 0.45).toFixed(1)}"
             rx="${(bw * 0.19).toFixed(1)}" ry="${(domeH * 0.3).toFixed(1)}" fill="#ffffff" opacity="0.14"/>`;

  // Sesame seeds, scattered across the upper face of the dome
  let seeds = "";
  for (let i = 0; i < 16; i++) {
    const a = Math.PI * (0.1 + rand() * 0.8); // 0 → PI across the dome
    const r = 0.35 + rand() * 0.55; // how far out from centre
    const sx = cx - Math.cos(a) * (bw / 2) * r;
    const sy = domeBase - Math.sin(a) * domeH * r * 0.92;
    seeds += `<ellipse cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" rx="${(bw * 0.016).toFixed(2)}" ry="${(bw * 0.009).toFixed(2)}" fill="#f0dcb0" opacity="${(0.3 + rand() * 0.45).toFixed(2)}" transform="rotate(${(rand() * 60 - 30).toFixed(0)} ${sx.toFixed(1)} ${sy.toFixed(1)})"/>`;
  }

  // Airborne specks — reads as the exploded / splash frames
  let specks = "";
  const speckCount = Math.round(6 + explode * 46);
  for (let i = 0; i < speckCount; i++) {
    const sx = cx + (rand() - 0.5) * bw * 2.3;
    const sy = cy + (rand() - 0.5) * h * 0.85;
    const sr = bw * (0.004 + rand() * 0.014);
    const c = rand() > 0.55 ? p.top : PALETTES.cheese.top;
    specks += `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="${sr.toFixed(2)}" fill="${c}" opacity="${(0.15 + rand() * 0.5).toFixed(2)}"/>`;
  }

  const pedestal = showPedestal
    ? `<ellipse cx="${cx}" cy="${cy + 4.6 * unit}" rx="${bw * 0.62}" ry="${unit * 0.62}" fill="url(#pedGrad)" opacity="0.85"/>
       <ellipse cx="${cx}" cy="${cy + 4.35 * unit}" rx="${bw * 0.62}" ry="${unit * 0.58}" fill="${ACCENT}" opacity="0.28"/>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <radialGradient id="glow" cx="50%" cy="46%" r="62%">
      <stop offset="0%" stop-color="${p.glow}" stop-opacity="${glowStrength}"/>
      <stop offset="55%" stop-color="${p.mid}" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="${BG}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="bunGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${p.top}"/>
      <stop offset="70%" stop-color="${p.mid}"/>
      <stop offset="100%" stop-color="${p.low}"/>
    </linearGradient>
    <linearGradient id="pedGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${ACCENT}"/>
      <stop offset="100%" stop-color="#2e2413"/>
    </linearGradient>
    <radialGradient id="vig" cx="50%" cy="50%" r="72%">
      <stop offset="45%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.72"/>
    </radialGradient>
  </defs>

  <rect width="${w}" height="${h}" fill="${BG}"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
  ${pedestal}
  ${specks}
  ${layerEls}
  ${dome}
  ${seeds}
  <rect width="${w}" height="${h}" fill="url(#vig)"/>
</svg>`;
}

/** Abstract close-up used for ingredient / texture tiles. */
function textureSVG({ w, h, palette, seed = 1, blobs = 7 }) {
  const p = PALETTES[palette] ?? PALETTES.beef;
  const rand = rng(seed);

  let shapes = "";
  for (let i = 0; i < blobs; i++) {
    const bx = rand() * w;
    const by = h * (0.25 + rand() * 0.6);
    const brx = w * (0.13 + rand() * 0.26);
    const bry = brx * (0.5 + rand() * 0.55);
    const fill = [p.top, p.mid, p.glow][i % 3];
    shapes += `<ellipse cx="${bx.toFixed(0)}" cy="${by.toFixed(0)}" rx="${brx.toFixed(0)}" ry="${bry.toFixed(0)}" fill="${fill}" opacity="${(0.3 + rand() * 0.4).toFixed(2)}" transform="rotate(${(rand() * 50 - 25).toFixed(0)} ${bx.toFixed(0)} ${by.toFixed(0)})"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <radialGradient id="g" cx="50%" cy="45%" r="70%">
      <stop offset="0%" stop-color="${p.glow}" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="${BG}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000" stop-opacity="0.45"/>
      <stop offset="45%" stop-color="#000" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.8"/>
    </linearGradient>
    <filter id="soft"><feGaussianBlur stdDeviation="${(w * 0.012).toFixed(1)}"/></filter>
  </defs>
  <rect width="${w}" height="${h}" fill="${BG}"/>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <g filter="url(#soft)">${shapes}</g>
  <rect width="${w}" height="${h}" fill="url(#fade)"/>
</svg>`;
}

/* ------------------------------------------------------------------ */
/* Writers                                                             */
/* ------------------------------------------------------------------ */
async function writeWebp(relPath, svg, quality = 78) {
  const out = join(PUB, relPath);
  await ensure(out);
  await sharp(Buffer.from(svg)).webp({ quality }).toFile(out);
}

async function grainTexture() {
  const size = 180;
  const buf = Buffer.alloc(size * size * 4);
  const rand = rng(7);
  for (let i = 0; i < size * size; i++) {
    const v = Math.floor(rand() * 255);
    buf[i * 4] = v;
    buf[i * 4 + 1] = v;
    buf[i * 4 + 2] = v;
    buf[i * 4 + 3] = 255;
  }
  const out = join(PUB, "textures/grain.png");
  await ensure(out);
  await sharp(buf, { raw: { width: size, height: size, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(out);
}

async function favicon() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="${BG}"/>
  <path d="M6 12 Q6 6 16 6 Q26 6 26 12 Z" fill="${ACCENT}"/>
  <rect x="6" y="14" width="20" height="3" rx="1.5" fill="#f2c14e"/>
  <rect x="6" y="18" width="20" height="4" rx="2" fill="#7a4426"/>
  <path d="M6 24 Q6 27 16 27 Q26 27 26 24 Z" fill="${ACCENT}" opacity="0.85"/>
</svg>`;
  const out = join(PUB, "favicon.svg");
  await ensure(out);
  await writeFile(out, svg, "utf8");
}

/* ------------------------------------------------------------------ */
/* Manifest                                                            */
/* ------------------------------------------------------------------ */
const TILES = [
  // menu — 4:3-ish hero crops
  ["menu/smoke.webp", 900, 700, "bacon", "stack", 11],
  ["menu/truffle.webp", 900, 700, "truffle", "stack", 12],
  ["menu/gold-pedestal.webp", 900, 700, "gold", "stack-ped", 13],
  ["menu/classic.webp", 900, 700, "bread", "stack", 14],
  ["menu/overhead.webp", 900, 700, "beef", "stack", 15],
  ["menu/prime-stack.webp", 900, 700, "gold", "stack", 16],
  ["menu/wagyu.webp", 900, 700, "beef", "stack", 17],

  // ingredients — square-ish texture crops
  ["ingredients/wagyu.webp", 800, 800, "beef", "tex", 21],
  ["ingredients/brioche.webp", 800, 800, "bread", "tex", 22],
  ["ingredients/cheddar.webp", 800, 800, "cheese", "tex", 23],
  ["ingredients/bacon.webp", 800, 800, "bacon", "tex", 24],
  ["ingredients/onions.webp", 800, 800, "truffle", "tex", 25],
  ["ingredients/truffle-mayo.webp", 800, 800, "gold", "tex", 26],
  ["ingredients/egg.webp", 800, 800, "cheese", "tex", 27],
  ["ingredients/pickle.webp", 800, 800, "green", "tex", 28],

  // grill — wide
  ["grill/grill-line.webp", 1600, 900, "flame", "tex", 31],
  ["grill/open-flame.webp", 1600, 900, "flame", "tex", 32],

  // story — 16:10 cards
  ["story/story-hamburg.webp", 1000, 620, "sepia", "tex", 41],
  ["story/story-ellisisland.webp", 1000, 620, "cool", "tex", 42],
  ["story/story-wichita.webp", 1000, 620, "sepia", "tex", 43],
  ["story/story-today.webp", 1000, 620, "gold", "stack", 44],
];

async function main() {
  console.log("Generating placeholder assets…");

  for (const [path, w, h, palette, kind, seed] of TILES) {
    const svg =
      kind === "tex"
        ? textureSVG({ w, h, palette, seed })
        : stackSVG({
            w,
            h,
            palette,
            seed,
            showPedestal: kind === "stack-ped",
          });
    await writeWebp(path, svg);
  }
  console.log(`  ${TILES.length} tiles`);

  // Hero scrub sequence: push-in for the first half, layers separating
  // across the second half — matching the reference's shot progression.
  const FRAMES = 100;
  for (let i = 1; i <= FRAMES; i++) {
    const t = (i - 1) / (FRAMES - 1);
    const zoom = 1 + Math.sin(Math.min(t, 0.55) / 0.55 * Math.PI * 0.5) * 0.42;
    const explode = t < 0.55 ? 0 : (t - 0.55) / 0.45;
    const svg = stackSVG({
      w: 1080,
      h: 602,
      palette: "beef",
      seed: 100 + i,
      zoom: zoom * (1 - explode * 0.28),
      explode,
      glowStrength: 0.45 + explode * 0.3,
      showPedestal: explode > 0.75,
      // Subject sits right of centre so the left third stays clear for copy,
      // matching the reference's hero composition.
      anchorX: 0.62,
    });
    await writeWebp(`frames/prime/f_${String(i).padStart(3, "0")}.webp`, svg, 72);
  }
  console.log(`  ${FRAMES} hero frames`);

  await grainTexture();
  await favicon();
  console.log("  grain texture + favicon");
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
