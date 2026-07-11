// OpenGraph locale format (language_TERRITORY) from a next-intl locale code.
// en → en_US anchors the US-region signal; bare "en"/"ko" are non-standard.
const OG_LOCALE: Record<string, string> = {
  en: "en_US",
  ko: "ko_KR",
};

export function ogLocale(locale: string): string {
  return OG_LOCALE[locale] ?? locale;
}
