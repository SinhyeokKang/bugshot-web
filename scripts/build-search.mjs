// Build a lightweight client search index from the fetched guide content.
// Emits public/search/{locale}.json: one entry per doc with title, section
// (parent), headings, and plain-text body. Consumed client-side by Fuse.js.
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LOCALES = ["ko", "en"];
const GUIDE = join(process.cwd(), "content", "guide");
const OUT = join(process.cwd(), "public", "search");

function pathToSlug(rel) {
  const parts = rel.replace(/\.md$/, "").split("/").filter(Boolean);
  if (parts[parts.length - 1] === "README") parts.pop();
  return parts;
}

// parse SUMMARY.md into [{ title, slug, section }]
function parseSummary(md) {
  const out = [];
  const stack = []; // { depth, title }
  for (const raw of md.split("\n")) {
    const m = raw.match(/^(\s*)-\s*\[([^\]]+)\]\(([^)]+)\)/);
    if (!m) continue;
    const depth = Math.floor(m[1].replace(/\t/g, "  ").length / 2);
    const title = m[2].trim();
    const slug = pathToSlug(m[3].trim());
    while (stack.length && stack[stack.length - 1].depth >= depth) stack.pop();
    const section = stack.length ? stack[stack.length - 1].title : "";
    out.push({ title, slug, section });
    stack.push({ depth, title });
  }
  return out;
}

function slugToFile(base, slug) {
  const direct = join(base, `${slug.join("/") || "README"}.md`);
  if (existsSync(direct)) return direct;
  const readme = join(base, ...slug, "README.md");
  return existsSync(readme) ? readme : null;
}

function extract(md) {
  const headings = [];
  const body = [];
  let inFence = false;
  for (const line of md.split("\n")) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const t = line.trim();
    if (!t || t.startsWith("🌐")) continue;
    const h = t.match(/^(#{2,3})\s+(.+)$/);
    if (h) {
      headings.push(clean(h[2]));
      continue;
    }
    if (t.startsWith("#") || t.startsWith("![") || /^\|/.test(t)) continue;
    body.push(clean(t));
  }
  return { headings: headings.join(" · "), content: body.join(" ").slice(0, 1500) };
}

// strip inline markdown to plain text
function clean(s) {
  return s
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

mkdirSync(OUT, { recursive: true });
for (const locale of LOCALES) {
  const base = join(GUIDE, locale);
  const summary = parseSummary(readFileSync(join(base, "SUMMARY.md"), "utf-8"));
  const index = summary.map(({ title, slug, section }) => {
    const file = slugToFile(base, slug);
    const md = file ? readFileSync(file, "utf-8") : "";
    const { headings, content } = extract(md);
    const url = slug.length ? `/${locale}/docs/${slug.join("/")}` : `/${locale}/docs`;
    return { title, section, url, headings, content };
  });
  writeFileSync(join(OUT, `${locale}.json`), JSON.stringify(index));
  console.log(`[build-search] ${locale}: ${index.length} docs indexed`);
}
