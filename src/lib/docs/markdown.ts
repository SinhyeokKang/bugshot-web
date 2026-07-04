import { pathToSlug } from "./summary";

// resolve a relative posix path (target) against a directory (docDir)
function resolveRel(docDir: string, target: string): string {
  const parts = docDir ? docDir.split("/") : [];
  for (const seg of target.split("/")) {
    if (seg === "" || seg === ".") continue;
    if (seg === "..") parts.pop();
    else parts.push(seg);
  }
  return parts.join("/");
}

// Normalize guide markdown for internal static rendering:
// - drop the inline `🌐 [English](gitbook.io...)` language-switch lines
// - rewrite `assets/x.jpg` image paths to `/docs/{locale}/assets/x.jpg`
// - convert `{% embed url="X" %}` to a plain markdown link
// - rewrite relative `*.md` doc links to `/{locale}/docs/{slug}` routes
export function normalizeMarkdown(
  md: string,
  locale: string,
  docDir: string
): string {
  let out = md;

  // language-switch lines (e.g. `🌐 [English](https://bugshot.gitbook.io/en/...)`)
  out = out.replace(/^\s*🌐\s*\[[^\]]*\]\([^)]*\)\s*$/gm, "");

  // gitbook embeds
  out = out.replace(
    /\{%\s*embed\s+url="([^"]+)"\s*%\}/g,
    (_m, url) => `[${url}](${url})`
  );

  // images: (../)*assets/FILE -> /docs/{locale}/assets/FILE
  out = out.replace(
    /\]\((?:\.\.\/)*assets\/([^)]+)\)/g,
    (_m, file) => `](/docs/${locale}/assets/${file})`
  );

  // relative .md doc links -> internal route (preserve #anchor)
  out = out.replace(
    /\]\(([^)]+\.md)(#[^)]*)?\)/g,
    (_m, target: string, anchor = "") => {
      if (/^https?:/.test(target)) return `](${target}${anchor})`;
      const slug = pathToSlug(resolveRel(docDir, target));
      const href = slug.length
        ? `/${locale}/docs/${slug.join("/")}`
        : `/${locale}/docs`;
      return `](${href}${anchor})`;
    }
  );

  return out;
}
