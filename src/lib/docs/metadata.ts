import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";
import { findParent, type DocsNavNode } from "./summary";

// BreadcrumbList JSON-LD reflecting the SUMMARY hierarchy:
// BugShot (home) -> ancestor sections -> current doc.
export function docsBreadcrumbJsonLd({
  nav,
  slug,
  locale,
  currentTitle,
  path,
}: {
  nav: DocsNavNode[];
  slug: string[];
  locale: string;
  currentTitle: string;
  path: string;
}) {
  const items = [{ name: "BugShot", url: `${SITE_URL}/${locale}` }];
  const chain: { name: string; url: string }[] = [];
  let s = slug;
  for (;;) {
    const p = findParent(nav, s);
    if (!p) break;
    chain.unshift({ name: p.title, url: `${SITE_URL}${p.href}` });
    s = p.slug;
  }
  items.push(...chain, {
    name: currentTitle,
    url: `${SITE_URL}/${locale}${path}`,
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

// Full metadata for a doc-like page (docs + privacy). Next does NOT deep-merge
// openGraph/twitter from the parent layout, so every field (incl. og-image) is
// set explicitly here to avoid losing the shared image/site name.
export function docPageMetadata({
  title,
  description,
  locale,
  path,
  type = "article",
}: {
  title: string;
  description: string;
  locale: string;
  path: string; // e.g. "/docs/integrations/platforms" or "/privacy"
  type?: "article" | "website";
}): Metadata {
  const url = `${SITE_URL}/${locale}${path}`;
  const langUrl = (l: string) => `${SITE_URL}/${l}${path}`;
  const image = `${SITE_URL}/og-image.png`;

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical: url,
      languages: {
        ko: langUrl("ko"),
        en: langUrl("en"),
        "x-default": langUrl("ko"),
      },
    },
    openGraph: {
      type,
      title,
      description,
      url,
      siteName: "BugShot",
      locale,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
