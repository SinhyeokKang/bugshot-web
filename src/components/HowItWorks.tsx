"use client";

import { Rocket, Crosshair, Sparkles, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const steps = [
  { key: "launch", icon: Rocket },
  { key: "recordInspect", icon: Crosshair },
  { key: "aiReport", icon: Sparkles },
  { key: "submit", icon: Share2 },
] as const;

export function HowItWorks() {
  const t = useTranslations("how");
  const { ref, revealed } = useScrollReveal<HTMLElement>();

  return (
    <section ref={ref} className={cn("border-b py-20 md:py-[120px] transition-all duration-1500 ease-out", revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
      <div className="container mx-auto max-w-[1200px]">
        <h2 className="text-center text-3xl font-bold leading-tight tracking-tight md:text-[40px] md:leading-[48px]">
          {t.rich("heading", {
            brand: (chunks) => <span className="text-brand">{chunks}</span>,
          })}
        </h2>
        <ol className="mt-12 grid list-none grid-cols-1 gap-10 md:grid-cols-4">
          {steps.map((step, i) => (
            <li
              key={step.key}
              className="flex flex-col items-center py-5 text-center"
            >
              <step.icon
                className="h-6 w-6 text-primary md:h-8 md:w-8"
                strokeWidth={1.5}
              />
              <h3 className="mt-4 text-xl font-bold leading-snug md:text-2xl">
                {i + 1}. {t(`steps.${step.key}.title`)}
              </h3>
              <p className="mt-3 text-sm leading-snug text-foreground md:text-base">
                {t(`steps.${step.key}.description`)}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
