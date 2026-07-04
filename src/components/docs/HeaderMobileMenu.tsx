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
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { cn } from "@/lib/utils";
import { CHROME_WEB_STORE_URL, CONTACT_EMAIL } from "@/lib/constants";

// Mobile-only right drawer holding the center nav + locale switcher
// (both hidden inline below md).
export function HeaderMobileMenu({ locale }: { locale: string }) {
  const t = useTranslations("nav");
  const pathname = usePathname().replace(/\/$/, "") || "/";
  const [open, setOpen] = useState(false);

  // close after navigating
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const docs = `/${locale}/docs`;
  const isDocs = pathname === docs || pathname.startsWith(`${docs}/`);

  const itemClass = (active: boolean) =>
    cn(
      "rounded-md px-3 py-2.5 text-base font-medium transition-colors",
      active
        ? "bg-accent text-foreground"
        : "text-muted-foreground hover:bg-accent hover:text-foreground"
    );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label={t("menu")}
        className="inline-flex size-10 items-center justify-center rounded-md border bg-background text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:hidden"
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="right" className="flex w-[80dvw] flex-col p-0">
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
        <nav className="flex flex-col gap-1 px-3">
          <Link href={docs} className={itemClass(isDocs)}>
            {t("guide")}
          </Link>
          <a href={`mailto:${CONTACT_EMAIL}`} className={itemClass(false)}>
            {t("contact")}
          </a>
          <a
            href={CHROME_WEB_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={itemClass(false)}
          >
            {t("addToChrome")}
          </a>
        </nav>
        <div className="mt-auto px-5 pb-6">
          <LocaleSwitcher className="w-fit" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
