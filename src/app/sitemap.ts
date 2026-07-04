import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/constants";
import { getAllDocSlugs } from "@/lib/docs/content";

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
    // docs (ko/en slugs are symmetric — enumerate from ko)
    ...getAllDocSlugs("ko").flatMap((slug) =>
      routing.locales.map((locale) => ({
        url: docUrl(locale, slug),
        lastModified: new Date(),
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
