"use client";

import {
  MousePointerClick,
  Video,
  SquareTerminal,
  Magnet,
  Wand2,
  Send,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const features = [
  { key: "inspect", icon: MousePointerClick },
  { key: "record", icon: Video },
  { key: "log", icon: SquareTerminal },
  { key: "autoCollect", icon: Magnet },
  { key: "ai", icon: Wand2 },
  { key: "submit", icon: Send },
] as const;

export function FeatureCards() {
  const t = useTranslations("features");
  const { ref, revealed } = useScrollReveal<HTMLElement>();

  return (
    <section ref={ref} className={cn("border-b py-20 md:py-[120px] transition-all duration-1000 ease-out", revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
      <div className="container mx-auto max-w-[1200px]">
        <h2 className="text-center text-3xl font-bold leading-tight tracking-tight md:text-[40px] md:leading-[48px]">
          {t.rich("heading.line1", {
            brand: (chunks) => <span className="text-brand">{chunks}</span>,
          })}
          <br />
          {t.rich("heading.line2", {
            brand: (chunks) => <span className="text-brand">{chunks}</span>,
          })}
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {features.map((f) => (
            <article
              key={f.key}
              className="grid grid-cols-1 overflow-hidden rounded-3xl bg-muted md:h-[360px] md:rounded-card md:grid-cols-[296px_1fr]"
            >
              <div className="flex flex-col p-8 md:p-12 md:pr-6">
                <f.icon
                  className="h-6 w-6 text-primary md:h-8 md:w-8"
                  strokeWidth={1.5}
                />
                <h3 className="mt-4 text-xl font-bold leading-snug md:text-2xl">
                  {t(`items.${f.key}.title`)}
                </h3>
                <p className="mt-4 text-sm leading-snug text-foreground md:text-base">
                  {t(`items.${f.key}.description`)}
                </p>
              </div>
              <div className="aspect-video md:aspect-auto" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
