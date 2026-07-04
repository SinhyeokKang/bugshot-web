"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { CHROME_WEB_STORE_URL, CONTACT_EMAIL } from "@/lib/constants";

// Center nav shared across all pages. Active state via path matching
// (next/navigation pathname includes the locale prefix).
export function DocsHeaderNav({ locale }: { locale: string }) {
  const t = useTranslations("nav");
  const pathname = usePathname().replace(/\/$/, "") || "/";

  const docs = `/${locale}/docs`;
  const isDocs = pathname === docs || pathname.startsWith(`${docs}/`);

  const linkClass = (active: boolean) =>
    cn(
      "text-base font-medium transition-colors hover:text-foreground",
      active ? "text-foreground" : "text-muted-foreground"
    );

  return (
    <nav className="hidden items-center gap-6 md:flex">
      <Link href={docs} className={linkClass(isDocs)}>
        {t("guide")}
      </Link>
      <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass(false)}>
        {t("contact")}
      </a>
      <a
        href={CHROME_WEB_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass(false)}
      >
        {t("addToChrome")}
      </a>
    </nav>
  );
}
