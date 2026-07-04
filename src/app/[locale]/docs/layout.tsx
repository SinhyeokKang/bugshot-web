import { readFileSync } from "node:fs";
import { join } from "node:path";
import { setRequestLocale } from "next-intl/server";
import { parseSummary } from "@/lib/docs/summary";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { DocsHeader } from "@/components/docs/DocsHeader";
import { Footer } from "@/components/Footer";

export default async function DocsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const summary = readFileSync(
    join(process.cwd(), "content", "guide", locale, "SUMMARY.md"),
    "utf-8"
  );
  const nav = parseSummary(summary, locale);

  return (
    <>
      <DocsHeader locale={locale} nav={nav} />
      <div className="container mx-auto max-w-[1200px] py-10 md:flex md:gap-12">
        <aside className="hidden md:block md:w-[280px] md:shrink-0">
          <div className="sticky top-20">
            <DocsSidebar nav={nav} />
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <Footer />
    </>
  );
}
