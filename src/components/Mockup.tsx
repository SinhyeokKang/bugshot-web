"use client";

import { useState } from "react";
import { Camera, MousePointerClick, Send, Video, Wand2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const slides = [
  { key: "inspect", icon: MousePointerClick },
  { key: "capture", icon: Camera },
  { key: "record", icon: Video },
  { key: "ai", icon: Wand2 },
  { key: "send", icon: Send },
] as const;

export function Mockup() {
  const t = useTranslations("mockup");
  const [active, setActive] = useState(0);
  const current = slides[active];

  return (
    <section className="border-b pt-12 pb-20 md:pt-[60px] md:pb-[120px]">
      <div className="container mx-auto max-w-[1200px]">
        <h2 className="sr-only">{t("srHeading")}</h2>
        <div className="flex aspect-[5/3] w-full items-center justify-center rounded-3xl border-[6px] border-border bg-muted md:rounded-card md:border-[12px]">
          <span className="text-base text-muted-foreground">
            {t(`slides.${current.key}.label`)}
          </span>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.key}
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={active === i}
              className={cn(
                "flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-medium transition-colors md:h-[42px] md:gap-2 md:px-4 md:text-base [&_svg]:size-4 md:[&_svg]:size-5",
                active === i
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <slide.icon />
              {t(`slides.${slide.key}.label`)}
            </button>
          ))}
        </div>
        <p className="mt-6 text-center text-base text-foreground">
          {t(`slides.${current.key}.caption`)}
        </p>
      </div>
    </section>
  );
}
