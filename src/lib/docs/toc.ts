import GithubSlugger from "github-slugger";

export interface TocItem {
  depth: number; // 2 | 3
  text: string;
  id: string; // matches rehype-slug output
}

// Extract h2/h3 headings + their slugs for the on-this-page anchor nav.
// Slugs every heading in order with github-slugger so ids match rehype-slug
// (same dedup behaviour), then keeps depth 2-3. Skips fenced code blocks.
export function extractToc(md: string): TocItem[] {
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];
  let inFence = false;

  for (const line of md.split("\n")) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = line.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (!m) continue;
    const depth = m[1].length;
    const text = m[2].replace(/[*_`]/g, "").trim();
    const id = slugger.slug(text); // consume state even for h1 to match ids
    if (depth === 2 || depth === 3) items.push({ depth, text, id });
  }

  return items;
}
