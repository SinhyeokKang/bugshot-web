import Image from "next/image";
import Link from "next/link";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { DocsHeaderNav } from "./DocsHeaderNav";
import { DocsSearch } from "./DocsSearch";
import { HeaderMobileMenu } from "./HeaderMobileMenu";

// Shared top bar (landing/privacy/docs): 64px. Logo + center nav (left) /
// search + locale, mobile menu (right).
export function DocsHeader({ locale }: { locale: string }) {
  return (
    <header className="sticky top-0 z-40 h-16 border-b bg-background/60 backdrop-blur-2xl">
      <div className="container mx-auto flex h-full max-w-[1200px] items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link href={`/${locale}`} aria-label="BugShot" className="shrink-0">
            <Image
              src="/bugshot-symbol.svg"
              alt="BugShot"
              width={36}
              height={36}
              priority
            />
          </Link>

          <DocsHeaderNav locale={locale} />
        </div>

        <div className="flex items-center gap-2">
          <DocsSearch />
          <HeaderMobileMenu locale={locale} />
          <LocaleSwitcher className="shrink-0" />
        </div>
      </div>
    </header>
  );
}
