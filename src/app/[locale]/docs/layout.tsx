import { readFileSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { parseSummary } from "@/lib/docs/summary";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
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

  const brand = (
    <Link href={`/${locale}`} className="mb-6 inline-block" aria-label="BugShot">
      <Image src="/bugshot-symbol.svg" alt="BugShot" width={32} height={32} priority />
    </Link>
  );

  return (
    <>
      <LocaleSwitcher />
      <div className="container mx-auto max-w-[1200px] py-10 md:flex md:gap-12">
        <aside className="hidden md:block md:w-60 md:shrink-0">
          <div className="sticky top-6">
            {brand}
            <DocsSidebar nav={nav} />
          </div>
        </aside>

        <details className="mb-8 rounded-lg border p-2 md:hidden">
          <summary className="cursor-pointer px-2 py-1 text-sm font-medium">
            문서 목록
          </summary>
          <div className="mt-2">
            <DocsSidebar nav={nav} />
          </div>
        </details>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <Footer />
    </>
  );
}
