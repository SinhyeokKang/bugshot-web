"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DocsSidebar } from "./DocsSidebar";
import type { DocsNavNode } from "@/lib/docs/summary";

// Mobile-only hamburger that opens the docs nav in a left drawer.
export function DocsMobileNav({
  nav,
  locale,
}: {
  nav: DocsNavNode[];
  locale: string;
}) {
  const t = useTranslations("docs");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // close the drawer after navigating to another doc
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label={t("menu")}
        className="inline-flex size-9 items-center justify-center rounded-md border bg-background text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:hidden"
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[60vw] overflow-y-auto p-0 sm:max-w-none"
      >
        <SheetTitle className="sr-only">{t("menu")}</SheetTitle>
        <div className="flex h-16 items-center px-4">
          <Link href={`/${locale}`} aria-label="BugShot">
            <Image
              src="/bugshot-symbol.svg"
              alt="BugShot"
              width={36}
              height={36}
              priority
            />
          </Link>
        </div>
        <div className="px-4 pb-6">
          <DocsSidebar nav={nav} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
