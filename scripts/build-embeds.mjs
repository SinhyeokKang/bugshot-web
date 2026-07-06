// Build/dev prestep: resolve GitBook `{% embed url="X" %}` blocks to OG cards.
// Scans fetched guide markdown for embed URLs, fetches each page's Open Graph
// meta (title/description/image/favicon) at build time, and writes a map to
// content/guide/embeds.json (gitignored). The docs renderer reads it to render
// a link card instead of a bare URL. Static export → no runtime fetch, so this
// has to happen here. Fetch failures degrade to `null` (renderer falls back to
// a plain link). Runs after fetch-guide (which populates content/guide/).
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fetchWithRetry } from "./lib/fetch-retry.mjs";

const GUIDE = join(process.cwd(), "content", "guide");
const OUT = join(GUIDE, "embeds.json");
const EMBED_RE = /\{%\s*embed\s+url="([^"]+)"\s*%\}/g;

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name.endsWith(".md")) out.push(p);
  }
  return out;
}

function collectUrls() {
  const urls = new Set();
  if (!existsSync(GUIDE)) return urls;
  for (const file of walk(GUIDE)) {
    const md = readFileSync(file, "utf-8");
    for (const m of md.matchAll(EMBED_RE)) urls.add(m[1]);
  }
  return urls;
}

function decode(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .trim();
}

function meta(html, key) {
  const a = html.match(
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']*)["']`,
      "i"
    )
  );
  const b = html.match(
    new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${key}["']`,
      "i"
    )
  );
  const v = a?.[1] ?? b?.[1];
  return v ? decode(v) : null;
}

function faviconOf(html, origin) {
  const m =
    html.match(
      /<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]*href=["']([^"']+)["']/i
    ) ||
    html.match(
      /<link[^>]+href=["']([^"']+)["'][^>]*rel=["'][^"']*icon[^"']*["']/i
    );
  try {
    return new URL(m ? decode(m[1]) : "/favicon.ico", origin).href;
  } catch {
    return null;
  }
}

function abs(url, origin) {
  if (!url) return null;
  try {
    return new URL(url, origin).href;
  } catch {
    return null;
  }
}

async function resolve(url) {
  const res = await fetchWithRetry(url, {
    headers: { "user-agent": "Mozilla/5.0 (compatible; BugShotBot/1.0)" },
    redirect: "follow",
  });
  const html = await res.text();
  const origin = new URL(res.url).origin;
  const title =
    meta(html, "og:title") ||
    decode(html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? "") ||
    null;
  return {
    url,
    title,
    description: meta(html, "og:description") || meta(html, "description"),
    image: abs(meta(html, "og:image"), origin),
    favicon: faviconOf(html, origin),
    host: new URL(url).host.replace(/^www\./, ""),
  };
}

async function main() {
  const urls = [...collectUrls()];
  const map = {};
  for (const url of urls) {
    try {
      map[url] = await resolve(url);
      console.log(`[build-embeds] ${url} → "${map[url].title ?? ""}"`);
    } catch (err) {
      map[url] = null;
      console.warn(`[build-embeds] ${url} failed: ${err.message} (→ link)`);
    }
  }
  writeFileSync(OUT, JSON.stringify(map, null, 2));
  console.log(`[build-embeds] ${urls.length} embed(s) → embeds.json`);
}

main().catch((err) => {
  console.error(`[build-embeds] failed: ${err.message}`);
  process.exit(1);
});
