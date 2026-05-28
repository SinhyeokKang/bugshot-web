"use client";

import { useState } from "react";
import { Camera, Film, MousePointerClick, SquareTerminal, Video, Wand2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const slides = [
  { key: "inspect", icon: MousePointerClick, image: "/images/mockup-inspect.webp" },
  { key: "screenshot", icon: Camera, image: "/images/mockup-screenshot.webp" },
  { key: "record", icon: Video, image: "/images/mockup-record.webp" },
  { key: "log", icon: SquareTerminal, image: "/images/mockup-log.webp" },
  { key: "ai", icon: Wand2, image: "/images/mockup-ai.webp" },
  { key: "logsViewer", icon: Film, image: "/images/mockup-logs-viewer.webp" },
] as const;

export function Mockup() {
  const t = useTranslations("mockup");
  const { ref, revealed } = useScrollReveal<HTMLElement>();
  const [active, setActive] = useState(0);
  const current = slides[active];
  const handleNext = () => setActive((prev) => (prev + 1) % slides.length);

  return (
    <section ref={ref} className={cn("border-b pt-12 pb-20 md:pt-[60px] md:pb-[120px] transition-all duration-1000 ease-out", revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
      <div className="container mx-auto max-w-[1200px]">
        <h2 className="sr-only">{t("srHeading")}</h2>
        <div className="relative">
          <button
            type="button"
            onClick={handleNext}
            aria-label={t("next")}
            className="grid w-full cursor-pointer overflow-hidden rounded-3xl border-[6px] border-border md:rounded-card md:border-[12px]"
          >
            {slides.map((slide, i) => (
              <img
                key={slide.key}
                src={slide.image}
                alt={t(`slides.${slide.key}.label`)}
                width={2256}
                height={1354}
                aria-hidden={i !== active}
                className={cn(
                  "col-start-1 row-start-1 -m-px w-[calc(100%+2px)] max-w-none transition-opacity duration-300 ease-out",
                  i === active ? "opacity-100" : "opacity-0"
                )}
              />
            ))}
          </button>
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
                  : "bg-muted text-foreground hover:bg-muted-foreground/10"
              )}
            >
              <slide.icon />
              {t(`slides.${slide.key}.label`)}
            </button>
          ))}
        </div>
        <p className="mt-6 text-center text-lg text-foreground md:text-xl">
          {t(`slides.${current.key}.caption`)}
        </p>
      </div>
    </section>
  );
}
