import { DocsHeader } from "./DocsHeader";
import { DocsMobileNav } from "./DocsMobileNav";
import { DocsSidebar } from "./DocsSidebar";
import { TocNav } from "./TocNav";
import { Footer } from "@/components/Footer";
import type { DocsNavNode } from "@/lib/docs/summary";
import type { TocItem } from "@/lib/docs/toc";

// Shared shell for docs + privacy: sticky header, optional left SUMMARY nav
// (docs only), reading column, fixed right anchor TOC, footer. Single source
// for container width, gaps, and the fixed nav/TOC offsets.
export function DocsShell({
  locale,
  nav,
  toc,
  tocLabel,
  children,
}: {
  locale: string;
  nav?: DocsNavNode[];
  toc: TocItem[];
  tocLabel: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <DocsHeader locale={locale} />
      {nav && (
        <DocsMobileNav nav={nav} docName={tocLabel} />
      )}
      <div className="container mx-auto max-w-[1200px] py-10 md:flex md:gap-10">
        {nav && (
          <aside className="hidden md:block md:w-[200px] md:shrink-0">
            <div className="fixed top-[104px] max-h-[calc(100vh-104px)] w-[200px] overflow-y-auto left-[max(1.5rem,calc((100vw-1200px)/2+1.5rem))]">
              <DocsSidebar nav={nav} />
            </div>
          </aside>
        )}
        <div className="min-w-0 flex-1 min-[1100px]:flex min-[1100px]:gap-10">
          <main id="main" className="min-w-0 flex-1">
            {children}
          </main>
          {toc.length > 0 && (
            <aside className="hidden min-[1100px]:block min-[1100px]:w-44 min-[1100px]:shrink-0">
              <div className="fixed top-[104px] max-h-[calc(100vh-8rem)] w-44 overflow-y-auto right-[max(1.5rem,calc((100vw-1200px)/2+1.5rem))]">
                <TocNav items={toc} label={tocLabel} />
              </div>
            </aside>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
