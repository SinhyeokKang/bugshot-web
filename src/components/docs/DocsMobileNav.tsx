"use client";

import { useEffect, useState } from "react";
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
export function DocsMobileNav({ nav }: { nav: DocsNavNode[] }) {
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
        className="inline-flex size-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:hidden"
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 overflow-y-auto">
        <SheetTitle className="sr-only">{t("menu")}</SheetTitle>
        <div className="mt-6">
          <DocsSidebar nav={nav} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
