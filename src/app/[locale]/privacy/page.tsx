import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Markdown } from "@/components/Markdown";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Footer } from "@/components/Footer";
import { SITE_URL } from "@/lib/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy.meta" });
  const url = `${SITE_URL}/${locale}/privacy`;

  return {
    title: t("title"),
    description: t("description"),
    robots: { index: true, follow: true },
    alternates: {
      canonical: url,
      languages: {
        en: `${SITE_URL}/en/privacy`,
        ko: `${SITE_URL}/ko/privacy`,
        "x-default": `${SITE_URL}/ko/privacy`,
      },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url,
    },
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "privacy" });
  const markdown = readFileSync(
    join(process.cwd(), "content/privacy", `${locale}.md`),
    "utf-8"
  );

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground"
      >
        Skip to main content
      </a>
      <LocaleSwitcher />
      <header className="container mx-auto max-w-[900px] py-6">
        <Link href="/" aria-label={t("home")} className="inline-block">
          <Image
            src="/bugshot-symbol.svg"
            alt="BugShot"
            width={40}
            height={40}
            priority
          />
        </Link>
      </header>
      <main id="main" className="container mx-auto max-w-[900px] pb-24">
        <Markdown>{markdown}</Markdown>
      </main>
      <Footer />
    </>
  );
}
