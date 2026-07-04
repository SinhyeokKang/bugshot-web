import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Markdown } from "@/components/Markdown";
import { DocsShell } from "@/components/docs/DocsShell";
import { extractToc } from "@/lib/docs/toc";
import { docPageMetadata } from "@/lib/docs/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy.meta" });

  return docPageMetadata({
    title: t("title"),
    description: t("description"),
    locale,
    path: "/privacy",
    type: "website",
  });
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const markdown = readFileSync(
    join(process.cwd(), "content/privacy", `${locale}.md`),
    "utf-8"
  );
  const toc = extractToc(markdown);
  const title = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? "";

  return (
    <DocsShell locale={locale} toc={toc} tocLabel={title}>
      <Markdown>{markdown}</Markdown>
    </DocsShell>
  );
}
