import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/constants";
import { getAllDocSlugs, intersectSlugs, docMtime } from "@/lib/docs/content";

export const dynamic = "force-static";

function localeUrl(locale: string) {
  return `${SITE_URL}/${locale}`;
}

function privacyUrl(locale: string) {
  return `${SITE_URL}/${locale}/privacy`;
}

function docUrl(locale: string, slug: string[]) {
  return slug.length
    ? `${SITE_URL}/${locale}/docs/${slug.join("/")}`
    : `${SITE_URL}/${locale}/docs`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, localeUrl(l)])
  );
  const privacyLanguages = Object.fromEntries(
    routing.locales.map((l) => [l, privacyUrl(l)])
  );

  const koSlugs = getAllDocSlugs("ko");
  const docSlugs = intersectSlugs(koSlugs, getAllDocSlugs("en"));
  if (docSlugs.length < koSlugs.length) {
    console.warn(
      `[sitemap] dropped ${koSlugs.length - docSlugs.length} doc slug(s) absent in some locale`
    );
  }

  return [
    ...routing.locales.map((locale) => ({
      url: localeUrl(locale),
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 1,
      alternates: { languages },
    })),
    ...routing.locales.map((locale) => ({
      url: privacyUrl(locale),
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.5,
      alternates: { languages: privacyLanguages },
    })),
    // docs: only slugs present in EVERY locale — an asymmetric slug would emit
    // a per-locale URL that 404s. lastModified is the guide's source (commit)
    // mtime, so a bugshot-web rebuild no longer bumps it — it only changes when
    // bugshot-2 is re-pushed. (The tarball stamps all files with the tip commit
    // time, so it's the same value across docs, not per-file.)
    ...docSlugs.flatMap((slug) =>
      routing.locales.map((locale) => ({
        url: docUrl(locale, slug),
        lastModified: docMtime(locale, slug) ?? new Date(),
        changeFrequency: "weekly" as const,
        priority: slug.length ? 0.7 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [l, docUrl(l, slug)])
          ),
        },
      }))
    ),
  ];
}
