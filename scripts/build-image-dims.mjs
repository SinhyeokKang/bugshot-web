// Build/dev prestep: measure doc image dimensions so the markdown renderer can
// set intrinsic width/height (reserves space → no CLS). Walks the fetched guide
// assets (public/docs/{locale}/assets/**), maps each served path
// (/docs/{locale}/assets/FILE — the form normalizeMarkdown emits) to {width,
// height}, and writes content/guide/image-dims.json (gitignored). Runs after
// fetch-guide. Missing/unreadable images are skipped (renderer omits dims).
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { jpegSize } from "./lib/image-size.mjs";

const PUBLIC_DOCS = join(process.cwd(), "public", "docs");
const OUT = join(process.cwd(), "content", "guide", "image-dims.json");
const LOCALES = ["ko", "en"];

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

function main() {
  const map = {};
  let count = 0;
  for (const locale of LOCALES) {
    const assets = join(PUBLIC_DOCS, locale, "assets");
    if (!existsSync(assets)) continue;
    for (const file of walk(assets)) {
      if (!/\.jpe?g$/i.test(file)) continue;
      let dim = null;
      try {
        dim = jpegSize(readFileSync(file));
      } catch {
        dim = null;
      }
      if (!dim) continue;
      const rel = relative(assets, file).split(sep).join("/");
      map[`/docs/${locale}/assets/${rel}`] = dim;
      count++;
    }
  }
  writeFileSync(OUT, JSON.stringify(map, null, 2));
  console.log(`[build-image-dims] ${count} image(s) → image-dims.json`);
}

main();
