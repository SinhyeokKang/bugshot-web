import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const baseUrl = "https://bug-shot.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, `${baseUrl}/${l}`])
  );

  return routing.locales.map((locale) => ({
    url: `${baseUrl}/${locale}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 1,
    alternates: { languages },
  }));
}
