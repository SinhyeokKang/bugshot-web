"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export function Review() {
  const t = useTranslations("review");
  const { ref, revealed } = useScrollReveal<HTMLElement>();

  return (
    <section ref={ref} className={cn("border-b py-20 md:py-[120px] transition-all duration-1500 ease-out", revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
      <div className="container mx-auto max-w-[1200px] flex flex-col items-center gap-5">
        <p className="text-sm text-muted-foreground md:text-base">
          {t("author")}
        </p>
        <blockquote className="text-center text-xl font-medium leading-[140%] tracking-tight md:text-[32px]">
          {`“${t("quote")}”`}
        </blockquote>
        <p className="text-sm text-muted-foreground md:text-base">
          {t("source")}
        </p>
      </div>
    </section>
  );
}
