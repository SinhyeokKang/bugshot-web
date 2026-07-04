import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAllDocSlugs, getDoc } from "@/lib/docs/content";
import { normalizeMarkdown } from "@/lib/docs/markdown";
import { parseSummary, findParent, flattenNav } from "@/lib/docs/summary";
import { Markdown } from "@/components/Markdown";
import { DocsPager } from "@/components/docs/DocsPager";
import { SITE_URL } from "@/lib/constants";

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
    if (!t || t.startsWith("#") || t.startsWith("![") || t.startsWith(">"))
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
  const url = `${SITE_URL}/${locale}${path}`;
  const description = firstParagraph(doc.markdown);

  return {
    title: doc.title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical: url,
      languages: {
        ko: `${SITE_URL}/ko${path}`,
        en: `${SITE_URL}/en${path}`,
        "x-default": `${SITE_URL}/ko${path}`,
      },
    },
    openGraph: { title: doc.title, description, url },
  };
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

  const markdown = normalizeMarkdown(doc.markdown, locale, doc.docDir);
  return (
    <>
      {parent && (
        <Link
          href={parent.href}
          className="mb-2 inline-block text-sm font-semibold text-brand hover:underline"
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
    </>
  );
}
