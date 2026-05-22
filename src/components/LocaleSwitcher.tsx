"use client";

import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { type Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const locales: { value: Locale; label: string }[] = [
  { value: "ko", label: "KO" },
  { value: "en", label: "EN" },
];

export function LocaleSwitcher() {
  const active = useLocale() as Locale;
  const pathname = usePathname();

  function switchTo(next: Locale) {
    if (next === active) return;
    const stripped = pathname.replace(/^\/[a-z]{2}/, "");
    window.location.href = `/${next}${stripped || ""}`;
  }

  return (
    <div className="fixed top-4 right-4 z-50 md:top-6 md:right-6 flex items-center gap-1 rounded-full border bg-background/80 p-1 backdrop-blur">
      {locales.map(({ value, label }) => (
        <Button
          key={value}
          variant="ghost"
          size="sm"
          onClick={() => switchTo(value)}
          aria-pressed={active === value}
          className={cn(
            "h-8 rounded-full px-3 text-sm font-medium",
            active === value
              ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
              : "text-muted-foreground"
          )}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
