// Build/dev prestep: fetch privacy policy markdown from bugshot-2 (public repo).
// content/ is gitignored — the single source of truth stays in bugshot-2.
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const RAW_BASE =
  "https://raw.githubusercontent.com/SinhyeokKang/bugshot-2/main/docs";
const OUT_DIR = join(process.cwd(), "content", "privacy");

const SOURCES = [
  { url: `${RAW_BASE}/privacy.ko.md`, out: "ko.md" },
  { url: `${RAW_BASE}/privacy.en.md`, out: "en.md" },
];

async function fetchOne({ url, out }) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}: ${url}`);
  }
  const text = await res.text();
  if (!text.trim().startsWith("#")) {
    throw new Error(`unexpected content (not a markdown heading): ${url}`);
  }
  await writeFile(join(OUT_DIR, out), text, "utf-8");
  console.log(`[fetch-privacy] ${out} (${text.length} bytes)`);
}

try {
  await mkdir(OUT_DIR, { recursive: true });
  await Promise.all(SOURCES.map(fetchOne));
} catch (err) {
  console.error(`[fetch-privacy] failed: ${err.message}`);
  process.exit(1);
}
