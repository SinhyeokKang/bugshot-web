import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAllDocSlugs, getDoc } from "@/lib/docs/content";
import { normalizeMarkdown } from "@/lib/docs/markdown";
import { parseSummary, findParent, flattenNav } from "@/lib/docs/summary";
import { extractToc } from "@/lib/docs/toc";
import { docPageMetadata, docsBreadcrumbJsonLd } from "@/lib/docs/metadata";
import { Markdown } from "@/components/Markdown";
import { DocsPager } from "@/components/docs/DocsPager";
import { DocsShell } from "@/components/docs/DocsShell";

export const dynamicParams = false;

export function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  return getAllDocSlugs(params.locale).map((slug) => ({ slug }));
}

function firstParagraph(md: string): string {
  for (const line of md.split("\n")) {
    const t = line.trim();
    if (
      !t ||
      t.startsWith("#") ||
      t.startsWith("![") ||
      t.startsWith(">") ||
      t.startsWith("🌐") // skip the gitbook language-switch line
    )
      continue;
    // strip markdown emphasis/links to plain-ish text
    const plain = t
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/[*_`]/g, "");
    return plain.length > 160 ? `${plain.slice(0, 157)}…` : plain;
  }
  return "";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug?: string[] }>;
}): Promise<Metadata> {
  const { locale, slug = [] } = await params;
  const doc = getDoc(locale, slug);
  if (!doc) return {};
  const path = slug.length ? `/docs/${slug.join("/")}` : "/docs";
  const description = firstParagraph(doc.markdown);
  const t = await getTranslations({ locale, namespace: "docs" });
  // "{doc} | BugShot User Guide" for sub-docs; root README keeps its own title
  const title = slug.length ? `${doc.title} | ${t("titleSuffix")}` : doc.title;

  return docPageMetadata({ title, description, locale, path });
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ locale: string; slug?: string[] }>;
}) {
  const { locale, slug = [] } = await params;
  setRequestLocale(locale);
  const doc = getDoc(locale, slug);
  if (!doc) notFound();

  const summary = readFileSync(
    join(process.cwd(), "content", "guide", locale, "SUMMARY.md"),
    "utf-8"
  );
  const nav = parseSummary(summary, locale);
  const parent = findParent(nav, slug);
  const flat = flattenNav(nav);
  const idx = flat.findIndex((n) => n.slug.join("/") === slug.join("/"));
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null;
  const t = await getTranslations({ locale, namespace: "docs" });
  const toc = extractToc(doc.markdown);

  const markdown = normalizeMarkdown(doc.markdown, locale, doc.docDir);
  const breadcrumbLd = docsBreadcrumbJsonLd({
    nav,
    slug,
    locale,
    currentTitle: doc.title,
    path: slug.length ? `/docs/${slug.join("/")}` : "/docs",
  });
  return (
    <DocsShell locale={locale} nav={nav} toc={toc} tocLabel={doc.title}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {parent && (
        <Link
          href={parent.href}
          className="mb-3 inline-block text-sm font-semibold text-brand hover:underline"
        >
          {parent.title}
        </Link>
      )}
      <Markdown>{markdown}</Markdown>
      <DocsPager
        prev={prev}
        next={next}
        prevLabel={t("prev")}
        nextLabel={t("next")}
      />
    </DocsShell>
  );
}
