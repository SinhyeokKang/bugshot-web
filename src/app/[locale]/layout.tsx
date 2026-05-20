import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        ko: "/ko",
        "x-default": "/en",
      },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
      siteName: "BugShot",
      locale,
      alternateLocale: routing.locales.filter((l) => l !== locale),
      url: `/${locale}`,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
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
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Chrome",
    inLanguage: locale,
    offers: { "@type": "Offer", price: "0" },
  };

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </NextIntlClientProvider>
  );
}
