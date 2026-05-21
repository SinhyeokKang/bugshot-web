"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const steps = [
  { key: "launch", image: "HowItWorks-1" },
  { key: "recordInspect", image: "HowItWorks-2" },
  { key: "aiReport", image: "HowItWorks-3" },
  { key: "submit", image: "HowItWorks-4" },
] as const;

export function HowItWorks() {
  const t = useTranslations("how");
  const { ref, revealed } = useScrollReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      className={cn(
        "border-b py-20 md:py-[120px] transition-all duration-1000 ease-out",
        revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
      )}
    >
      <div className="container mx-auto max-w-[1200px]">
        <h2 className="text-center text-3xl font-bold leading-tight tracking-tight md:text-[40px] md:leading-[48px]">
          {t.rich("heading", {
            brand: (chunks) => <span className="text-brand">{chunks}</span>,
          })}
        </h2>
        <ol className="mt-12 grid list-none grid-cols-1 gap-6 md:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.key} className="flex flex-col">
              <img
                src={`/images/how-steps/${step.image}.png`}
                alt=""
                className="aspect-[16/10] w-full rounded-2xl border object-cover"
              />
              <h3 className="mt-4 text-xl font-bold leading-snug md:text-2xl">
                {i + 1}. {t(`steps.${step.key}.title`)}
              </h3>
              <p className="mt-2 text-base leading-snug text-foreground">
                {t(`steps.${step.key}.description`)}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
