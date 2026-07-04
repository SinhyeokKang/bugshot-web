// Parses a guide SUMMARY.md (nested markdown list) into a nav tree.
// The SUMMARY is the single source of sidebar order/hierarchy.

export interface DocsNavNode {
  title: string;
  slug: string[]; // [] = root README
  href: string; // /${locale}/docs/${slug.join('/')}
  children: DocsNavNode[];
}

// `integrations/README.md` -> ['integrations'], `settings/ai.md` -> ['settings','ai'],
// `README.md` -> []
export function pathToSlug(relPath: string): string[] {
  const noExt = relPath.replace(/\.md$/, "");
  const parts = noExt.split("/").filter(Boolean);
  if (parts[parts.length - 1] === "README") parts.pop();
  return parts;
}

function href(locale: string, slug: string[]): string {
  return slug.length ? `/${locale}/docs/${slug.join("/")}` : `/${locale}/docs`;
}

const LINE = /^(\s*)-\s*\[([^\]]+)\]\(([^)]+)\)/;

// Find the parent node of a given slug within the SUMMARY tree.
// Returns null for top-level docs (no parent).
export function findParent(
  nav: DocsNavNode[],
  slug: string[]
): DocsNavNode | null {
  const key = slug.join("/");
  let result: DocsNavNode | null = null;
  const walk = (nodes: DocsNavNode[], parent: DocsNavNode | null): boolean => {
    for (const n of nodes) {
      if (n.slug.join("/") === key) {
        result = parent;
        return true;
      }
      if (walk(n.children, n)) return true;
    }
    return false;
  };
  walk(nav, null);
  return result;
}

export function parseSummary(md: string, locale: string): DocsNavNode[] {
  const roots: DocsNavNode[] = [];
  // stack of [indentDepth, node] to attach children by indentation
  const stack: { depth: number; node: DocsNavNode }[] = [];

  for (const raw of md.split("\n")) {
    const m = raw.match(LINE);
    if (!m) continue;
    const depth = Math.floor(m[1].replace(/\t/g, "  ").length / 2);
    const title = m[2].trim();
    const slug = pathToSlug(m[3].trim());
    const node: DocsNavNode = { title, slug, href: href(locale, slug), children: [] };

    while (stack.length && stack[stack.length - 1].depth >= depth) stack.pop();
    if (stack.length) stack[stack.length - 1].node.children.push(node);
    else roots.push(node);
    stack.push({ depth, node });
  }

  return roots;
}
