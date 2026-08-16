/**
 * Derives the hero crops from the original photograph, once, at build time.
 *
 * Why this script exists at all:
 *   src/assets/wallboard.jpg is stored 5712x4284 LANDSCAPE with EXIF Orientation=6,
 *   and is an MPO (multi-frame) JPEG container. sharp does NOT apply EXIF orientation
 *   unless .rotate() is called, and astro:assets gives you nowhere to call it — so the
 *   naive path ships the hero on its side. We rotate once here and hand Astro upright
 *   files that carry no orientation tag at all.
 *
 *   .withMetadata() is deliberately never called: it copies input metadata into the
 *   output and can re-attach orientation:6 onto an already-rotated buffer, which
 *   reintroduces exactly the bug this script exists to remove.
 *
 * The originals stay in src/assets/ as the addendum requires. They are simply never
 * imported by any component — only the derived hero-*.jpg files are.
 */
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'src/assets/wallboard.jpg');

const clearance = JSON.parse(
  await readFile(path.join(root, 'src/data/photo-clearance.json'), 'utf8'),
);

/**
 * Crop rectangles in POST-ROTATION coordinates (4284 x 5712).
 *
 * Variant B: permission covers the figures, so the framing is the brief's original wide
 * crop — subject left, the display filling the rest — and nothing is withheld. The
 * density of that dashboard is the argument the page is making, so it ships sharp.
 *
 * (Variant A, kept for reference, worked by capping the render scale rather than by
 * cropping tighter: cropping tighter magnifies the dashboard and makes it MORE readable.)
 */
const CROPS = {
  A: {
    wide: { left: 142, top: 1250, width: 4000, height: 2000 }, // 2:1
    tall: { left: 600, top: 1350, width: 1900, height: 1900 }, // 1:1
  },
  B: {
    wide: { left: 142, top: 1250, width: 4000, height: 2000 }, // 2:1 — display fills the right
    tall: { left: 560, top: 1350, width: 2160, height: 2160 }, // 1:1 — no cases, no plant, no floor
  },
};

/**
 * Under A the render scale was the confidentiality control, so the hero shipped 1x only
 * and was soft on retina. Under B there is nothing to withhold, so these are simply the
 * largest useful sizes: the brief caps the hero at 2400px because the source is a phone
 * photograph and upscaling past its real detail is wasted bytes.
 */
const MAX_W = { A: { wide: 704, tall: 328 }, B: { wide: 2400, tall: 1600 } };

const variant = clearance.variant === 'B' ? 'B' : 'A';
if (clearance.variant === 'C') {
  console.log('[photos] variant C — no hero photograph. Nothing to derive.');
  process.exit(0);
}

const base = sharp(src).rotate(); // applies EXIF orientation, takes the MPO primary frame

// metadata() reports the STORED dimensions, not the post-.rotate() pipeline output, so it
// must be corrected by the orientation tag before being asserted. Orientations 5-8 are the
// 90-degree ones and swap width/height on display; this file is Orientation=6.
const meta = await sharp(src).metadata();
const swaps = meta.orientation >= 5 && meta.orientation <= 8;
const shown = swaps
  ? { width: meta.height, height: meta.width }
  : { width: meta.width, height: meta.height };
if (shown.width !== 4284 || shown.height !== 5712) {
  throw new Error(
    `[photos] post-rotation size is ${shown.width}x${shown.height}, expected 4284x5712 ` +
      `(stored ${meta.width}x${meta.height}, orientation ${meta.orientation}). ` +
      `The crop rectangles are stale — fix them before shipping a mis-cropped hero.`,
  );
}

const out = [];
for (const shape of ['wide', 'tall']) {
  const rect = CROPS[variant][shape];
  const w = Math.min(MAX_W[variant][shape], rect.width);
  const h = Math.round((w * rect.height) / rect.width);
  const file = path.join(root, `src/assets/hero-${shape}.jpg`);
  const info = await base
    .clone()
    .extract(rect)
    .resize(w, h, { fit: 'fill', kernel: 'lanczos3' })
    .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
    .toFile(file);
  out.push([`hero-${shape}.jpg`, `${info.width}x${info.height}`, `${(info.size / 1024).toFixed(0)}kB`]);
}

// Cut fresh from the original at 1200x630 rather than upscaled from the hero render:
// under B the page withholds nothing, so routing the card through a smaller render would
// only make it soft for no benefit. Its own extract, at the card's own 1.905:1 ratio.
const og = await base
  .clone()
  .extract({ left: 142, top: 1400, width: 4000, height: 2100 })
  .resize(1200, 630, { fit: 'cover', kernel: 'lanczos3' })
  .jpeg({ quality: 84, chromaSubsampling: '4:4:4' })
  .toFile(path.join(root, 'public/og.jpg'));
out.push(['og.jpg', `${og.width}x${og.height}`, `${(og.size / 1024).toFixed(0)}kB`]);

console.log(`[photos] variant ${variant} — hero max ${MAX_W[variant].wide}px`);
for (const [f, dim, size] of out) console.log(`         ${f.padEnd(16)} ${dim.padEnd(12)} ${size}`);
