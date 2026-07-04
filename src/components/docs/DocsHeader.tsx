import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

// Docs-only top bar: 64px, border-b, logo (left) / search (center) / locale (right).
export function DocsHeader({
  locale,
  searchPlaceholder,
}: {
  locale: string;
  searchPlaceholder: string;
}) {
  return (
    <header className="sticky top-0 z-40 h-16 border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-full max-w-[1200px] items-center gap-4">
        <Link href={`/${locale}`} aria-label="BugShot" className="shrink-0">
          <Image
            src="/bugshot-symbol.svg"
            alt="BugShot"
            width={32}
            height={32}
            priority
          />
        </Link>

        <div className="flex flex-1 justify-center">
          <button
            type="button"
            className="flex h-9 w-full max-w-md items-center gap-2 rounded-md border border-input bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <Search className="size-4 shrink-0" />
            <span className="flex-1 text-left">{searchPlaceholder}</span>
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
              ⌘K
            </kbd>
          </button>
        </div>

        <LocaleSwitcher className="shrink-0" />
      </div>
    </header>
  );
}
