/**
 * Image pipeline: `pnpm images [--force]`
 *
 * For every product image `<slug>-<n>`:
 *  - if `scripts/images/source/<slug>-<n>.(jpg|jpeg|png|webp)` exists, crop it to 4:5
 *    (smart crop) and export it;
 *  - otherwise generate a branded placeholder.
 * Outputs WebP + AVIF at 480 and 960px wide to `public/images/products/`.
 * Photographer credits for real photos go in `scripts/images/credits.json`
 * (`{ "<slug>-<n>": { "photographer": "...", "photographerUrl": "...", "sourceUrl": "..." } }`)
 * and are written to the database by `pnpm db:seed`.
 */
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import {
  IMAGE_LARGE_WIDTH,
  IMAGE_SMALL_WIDTH,
} from "../src/lib/catalog/images";
import { IMAGES_PER_PRODUCT, PRODUCTS } from "./data/catalog";

const SOURCE_DIR = "scripts/images/source";
const OUT_DIR = "public/images/products";
const IMAGE_WIDTHS = [IMAGE_SMALL_WIDTH, IMAGE_LARGE_WIDTH] as const;
const RATIO = 5 / 4; // height / width
const FORMATS = ["webp", "avif"] as const;

// Placeholder petal colors, one per seeded product color.
const PETAL: Record<string, string> = {
  red: "#9e1b32",
  white: "#e9e1d6",
  pink: "#e7a3b3",
  blue: "#8eaed6",
  green: "#7fa27d",
  mixed: "#d9774f",
  yellow: "#e8bd3f",
  purple: "#9a7bc2",
};

function flower(
  cx: number,
  cy: number,
  r: number,
  color: string,
  rotate: number,
) {
  const petals = Array.from({ length: 8 }, (_, i) => {
    const angle = rotate + i * 45;
    return `<ellipse cx="${cx}" cy="${cy - r * 0.55}" rx="${r * 0.32}" ry="${r * 0.55}" fill="${color}" opacity="0.92" transform="rotate(${angle} ${cx} ${cy})"/>`;
  }).join("");
  return `${petals}<circle cx="${cx}" cy="${cy}" r="${r * 0.22}" fill="#7a1426" opacity="0.85"/>`;
}

function placeholderSvg(color: string, variant: number) {
  const w = 800;
  const h = w * RATIO;
  const petal = PETAL[color] ?? PETAL.red;
  const flowers =
    variant === 1
      ? flower(w / 2, h * 0.4, 230, petal, 0)
      : [
          flower(w * 0.32, h * 0.38, 150, petal, 10),
          flower(w * 0.68, h * 0.36, 130, petal, 30),
          flower(w * 0.5, h * 0.55, 160, petal, 20),
        ].join("");
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs><radialGradient id="bg" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#fffdfa"/><stop offset="1" stop-color="#f3eee8"/></radialGradient></defs>
    <rect width="${w}" height="${h}" fill="url(#bg)"/>
    <path d="M${w / 2} ${h * 0.55} C ${w / 2 - 20} ${h * 0.7}, ${w / 2 + 20} ${h * 0.82}, ${w / 2} ${h * 0.95}" stroke="#8fa68e" stroke-width="18" fill="none" stroke-linecap="round"/>
    <ellipse cx="${w / 2 + 70}" cy="${h * 0.76}" rx="70" ry="26" fill="#8fa68e" transform="rotate(-30 ${w / 2 + 70} ${h * 0.76})"/>
    ${flowers}
  </svg>`);
}

function findSource(name: string): string | null {
  for (const ext of ["jpg", "jpeg", "png", "webp"]) {
    const file = path.join(SOURCE_DIR, `${name}.${ext}`);
    if (existsSync(file)) return file;
  }
  return null;
}

async function main() {
  const force = process.argv.includes("--force");
  mkdirSync(OUT_DIR, { recursive: true });
  let written = 0;

  for (const product of PRODUCTS) {
    for (let n = 1; n <= IMAGES_PER_PRODUCT; n++) {
      const name = `${product.slug}-${n}`;
      const source = findSource(name);
      const input = source ?? placeholderSvg(product.color, n);

      for (const width of IMAGE_WIDTHS) {
        for (const format of FORMATS) {
          const out = path.join(OUT_DIR, `${name}-${width}.${format}`);
          if (!force && existsSync(out)) continue;
          const image = sharp(input).resize(width, Math.round(width * RATIO), {
            fit: "cover",
            position: sharp.strategy.attention,
          });
          await (
            format === "webp"
              ? image.webp({ quality: 78 })
              : image.avif({ quality: 55 })
          ).toFile(out);
          written++;
        }
      }
      console.log(`${source ? "photo      " : "placeholder"}  ${name}`);
    }
  }
  console.log(`Done: ${written} files written to ${OUT_DIR}.`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
