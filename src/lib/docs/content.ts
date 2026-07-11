import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { pathToSlug } from "./summary";

const GUIDE_DIR = join(process.cwd(), "content", "guide");

export interface DocPage {
  slug: string[];
  title: string; // first H1
  markdown: string; // raw (pre-normalize)
  docDir: string; // dir relative to guide/{locale}, e.g. 'integrations' ('' for root)
}

function localeDir(locale: string): string {
  return join(GUIDE_DIR, locale);
}

// all .md files (excluding SUMMARY.md) as repo-relative paths
function listMarkdownFiles(dir: string, base = ""): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...listMarkdownFiles(join(dir, entry.name), rel));
    else if (entry.name.endsWith(".md") && entry.name !== "SUMMARY.md") out.push(rel);
  }
  return out;
}

export function getAllDocSlugs(locale: string): string[][] {
  return listMarkdownFiles(localeDir(locale)).map(pathToSlug);
}

// Keep only slugs present in every locale. sitemap emits per-locale URLs for
// each slug, so a slug missing in one locale would yield a 404 URL. Guards
// against asymmetric guides (a doc added/renamed in only one language).
export function intersectSlugs(...perLocale: string[][][]): string[][] {
  if (perLocale.length === 0) return [];
  const key = (s: string[]) => s.join("/");
  const [first, ...rest] = perLocale;
  const restSets = rest.map((list) => new Set(list.map(key)));
  return first.filter((s) => restSets.every((set) => set.has(key(s))));
}

// mtime of a doc's source file, for per-page sitemap lastModified (so a single
// content change doesn't mark every URL as modified). null if the file is gone.
export function docMtime(locale: string, slug: string[]): Date | null {
  const file = slugToFile(locale, slug);
  return file ? statSync(file).mtime : null;
}

// inverse of pathToSlug: [] -> README.md, ['integrations'] -> integrations/README.md,
// ['settings','ai'] -> settings/ai.md
function slugToFile(locale: string, slug: string[]): string | null {
  const base = localeDir(locale);
  const direct = join(base, `${slug.join("/") || "README"}.md`);
  if (existsSync(direct)) return direct;
  const readme = join(base, ...slug, "README.md");
  if (existsSync(readme)) return readme;
  return null;
}

export function getDoc(locale: string, slug: string[]): DocPage | null {
  const file = slugToFile(locale, slug);
  if (!file) return null;
  const markdown = readFileSync(file, "utf-8");
  const title = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? "";
  // README docs live in the dir named by the full slug; leaf docs live in slug minus last
  const isReadme = file.endsWith("README.md");
  return {
    slug,
    title,
    markdown,
    docDir: isReadme ? slug.join("/") : slug.slice(0, -1).join("/"),
  };
}
