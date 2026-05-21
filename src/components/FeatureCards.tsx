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
  { key: "inspect", icon: MousePointerClick, image: "inspect" },
  { key: "record", icon: Video, image: "capture" },
  { key: "log", icon: SquareTerminal, image: "logs" },
  { key: "autoCollect", icon: Magnet, image: "auto-collect" },
  { key: "ai", icon: Wand2, image: "ai-reports" },
  { key: "submit", icon: Send, image: "integrations" },
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
              className="grid grid-cols-1 overflow-hidden rounded-3xl bg-muted md:h-[360px] md:rounded-card md:grid-cols-[240px_1fr]"
            >
              <div className="flex flex-col p-8 pb-0 md:p-10 md:pr-0">
                <f.icon
                  className="h-6 w-6 text-primary md:h-7 md:w-7"
                  strokeWidth={1.5}
                />
                <h3 className="mt-4 text-xl font-bold leading-snug md:text-2xl">
                  {t(`items.${f.key}.title`)}
                </h3>
                <p className="mt-4 text-sm leading-snug text-foreground md:text-base">
                  {t(`items.${f.key}.description`)}
                </p>
              </div>
              <div className="aspect-video overflow-hidden md:aspect-auto">
                {f.image && (
                  <>
                    <img
                      src={`/images/how/${f.image}-mobile.webp`}
                      alt=""
                      className="h-full w-full object-cover md:hidden"
                    />
                    <img
                      src={`/images/how/${f.image}-pc.webp`}
                      alt=""
                      className="hidden h-full w-full object-cover md:block"
                    />
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
