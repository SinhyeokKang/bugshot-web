import Image from "next/image";
import Link from "next/link";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { DocsMobileNav } from "./DocsMobileNav";
import type { DocsNavNode } from "@/lib/docs/summary";

// Shared docs/privacy top bar: 64px, border-b.
// With nav: mobile hamburger + logo (left) / locale (right). Without nav
// (e.g. privacy): logo (left) / locale (right), no mobile drawer.
export function DocsHeader({
  locale,
  nav,
}: {
  locale: string;
  nav?: DocsNavNode[];
}) {
  return (
    <header className="sticky top-0 z-40 h-16 border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-full max-w-[1200px] items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {nav && <DocsMobileNav nav={nav} locale={locale} />}
          <Link href={`/${locale}`} aria-label="BugShot" className="shrink-0">
            <Image
              src="/bugshot-symbol.svg"
              alt="BugShot"
              width={36}
              height={36}
              priority
            />
          </Link>
        </div>

        <LocaleSwitcher className="shrink-0" />
      </div>
    </header>
  );
}
