"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const labels: Record<Locale, string> = {
  en: "EN",
  ko: "KO",
};

export function LocaleSwitcher() {
  const active = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(next: Locale) {
    if (next === active) return;
    const segments = pathname.split("/");
    segments[1] = next;
    router.replace(segments.join("/") || `/${next}`);
  }

  return (
    <div className="fixed top-6 right-6 z-50 flex items-center gap-1 rounded-full border bg-background/80 p-1 backdrop-blur">
      {routing.locales.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => switchTo(locale)}
          aria-pressed={active === locale}
          className={cn(
            "h-8 rounded-full px-3 text-sm font-medium transition-colors",
            active === locale
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {labels[locale]}
        </button>
      ))}
    </div>
  );
}
