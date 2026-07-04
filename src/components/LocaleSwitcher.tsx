"use client";

import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { type Locale } from "@/i18n/routing";
import { localeSwitchHref } from "@/lib/locale-redirect";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const locales: { value: Locale; label: string }[] = [
  { value: "ko", label: "KO" },
  { value: "en", label: "EN" },
];

export function LocaleSwitcher({ className }: { className?: string }) {
  const active = useLocale() as Locale;
  const pathname = usePathname();

  function switchTo(next: Locale) {
    if (next === active) return;
    // 수동 선택을 재방문 시 기억(edge redirect 최우선 판정). 1년.
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; samesite=lax; secure`;
    // replace: 뒤로가기 시 쿠키로 재리디렉트되어 back이 먹통되는 것 완화
    window.location.replace(localeSwitchHref(pathname, next));
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full border bg-background/80 p-1 shadow-sm backdrop-blur",
        className
      )}
    >
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
