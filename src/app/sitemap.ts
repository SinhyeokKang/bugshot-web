import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/constants";

export const dynamic = "force-static";

function localeUrl(locale: string) {
  return `${SITE_URL}/${locale}`;
}

function privacyUrl(locale: string) {
  return `${SITE_URL}/${locale}/privacy`;
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
  ];
}
