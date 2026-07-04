import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Markdown } from "@/components/Markdown";
import { DocsShell } from "@/components/docs/DocsShell";
import { extractToc } from "@/lib/docs/toc";
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
  const t = await getTranslations({ locale, namespace: "docs" });
  const markdown = readFileSync(
    join(process.cwd(), "content/privacy", `${locale}.md`),
    "utf-8"
  );
  const toc = extractToc(markdown);

  return (
    <DocsShell locale={locale} toc={toc} tocLabel={t("onThisPage")}>
      <Markdown>{markdown}</Markdown>
    </DocsShell>
  );
}
