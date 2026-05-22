import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { notFound } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { routing } from "@/i18n/routing";
import { SITE_URL, CHROME_WEB_STORE_URL } from "@/lib/constants";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

function localeUrl(locale: string) {
  return `/${locale}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const url = localeUrl(locale);

  return {
    metadataBase: new URL(SITE_URL),
    title: t("title"),
    description: t("description"),
    verification: {
      other: {
        "naver-site-verification":
          "79f463827c65e552ad423cf396466a6d9aea1984",
      },
    },
    robots: { index: true, follow: true },
    alternates: {
      canonical: url,
      languages: {
        en: "/en",
        ko: "/ko",
        "x-default": "/ko",
      },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
      siteName: "BugShot",
      locale,
      alternateLocale: routing.locales.filter((l) => l !== locale),
      url,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: t("title"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: [
        {
          url: "/og-image.png",
          alt: t("title"),
        },
      ],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: "meta" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "BugShot",
    description: t("description"),
    url: `${SITE_URL}${localeUrl(locale)}`,
    image: `${SITE_URL}/og-image.png`,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Chrome",
    inLanguage: locale,
    author: {
      "@type": "Person",
      name: "Sinhyeok Kang",
      url: "https://github.com/SinhyeokKang",
    },
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    downloadUrl: CHROME_WEB_STORE_URL,
  };

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang="${locale}"`,
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
      <Analytics />
      <SpeedInsights />
    </NextIntlClientProvider>
  );
}
