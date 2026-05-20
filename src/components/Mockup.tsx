"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const slideKeys = ["inspect", "capture", "record", "ai", "send"] as const;

export function Mockup() {
  const t = useTranslations("mockup");
  const [active, setActive] = useState(0);
  const currentKey = slideKeys[active];

  return (
    <section className="border-b pt-12 pb-20 md:pt-[60px] md:pb-[120px]">
      <div className="container mx-auto max-w-[1200px]">
        <h2 className="sr-only">{t("srHeading")}</h2>
        <div className="flex aspect-[5/3] w-full items-center justify-center rounded-card border-[8px] border-border bg-muted md:border-[12px]">
          <span className="text-base text-muted-foreground">
            {t(`slides.${currentKey}.label`)}
          </span>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {slideKeys.map((key, i) => (
            <button
              key={key}
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={active === i}
              className={cn(
                "h-[42px] rounded-xl px-4 text-base font-medium transition-colors",
                active === i
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {t(`slides.${key}.label`)}
            </button>
          ))}
        </div>
        <p className="mt-6 text-center text-base text-foreground">
          {t(`slides.${currentKey}.caption`)}
        </p>
      </div>
    </section>
  );
}
