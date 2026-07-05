"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronDown, FileText } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DocsSidebar } from "./DocsSidebar";
import type { DocsNavNode } from "@/lib/docs/summary";

// Mobile-only sub-header below the main header: current doc name + chevron,
// tapping opens the SUMMARY nav in a left drawer.
export function DocsMobileNav({
  nav,
  docName,
}: {
  nav: DocsNavNode[];
  docName: string;
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
        className="sticky top-16 z-30 w-full border-b bg-background/60 text-left backdrop-blur-2xl transition-colors hover:bg-accent md:hidden"
      >
        <div className="container mx-auto flex h-11 max-w-[1200px] items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-2">
            <FileText className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate text-sm font-medium text-foreground">
              {docName}
            </span>
          </span>
          <ChevronDown className="size-5 shrink-0 text-muted-foreground" />
        </div>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="flex h-[90dvh] flex-col rounded-t-2xl p-0"
      >
        <SheetTitle className="sr-only">{t("menu")}</SheetTitle>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-16">
          <DocsSidebar nav={nav} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
