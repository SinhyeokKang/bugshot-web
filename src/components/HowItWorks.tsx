"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { HOW_KEYS, HOW_GUIDE_PATHS, GUIDE_URL } from "@/lib/constants";

export function HowItWorks() {
  const t = useTranslations("how");
  const locale = useLocale();
  const { ref, revealed } = useScrollReveal<HTMLDivElement>();
  const [activeKey, setActiveKey] = useState<string>(HOW_KEYS[0]);

  const handleValueChange = (value: string) => {
    if (value) setActiveKey(value);
  };

  const handleNext = () => {
    const idx = HOW_KEYS.indexOf(activeKey as typeof HOW_KEYS[number]);
    setActiveKey(HOW_KEYS[(idx + 1) % HOW_KEYS.length]);
  };

  return (
    <div
      ref={ref}
      className={cn(
        "container mx-auto max-w-[1200px] transition-all duration-1000 ease-out",
        revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}
    >
      <h2
        id="how-heading"
        className="text-center text-3xl font-semibold leading-tight tracking-tight md:text-[40px] md:leading-[48px]"
      >
        {t("heading")}
      </h2>

      <div className="mt-12 flex gap-10">
        <div className="flex-1">
          <Accordion
            type="single"
            value={activeKey}
            onValueChange={handleValueChange}
          >
            {HOW_KEYS.map((key, i) => (
              <AccordionItem key={key} value={key}>
                <AccordionTrigger className="text-[18px] font-semibold md:text-[20px]">
                  {i + 1}. {t(`steps.${key}.title`)}
                </AccordionTrigger>
                <AccordionContent className="text-base text-foreground">
                  <img
                    src={`/images/how-steps/how-${key}-mobile.webp`}
                    alt={t(`steps.${key}.title`)}
                    className="mb-3 w-full md:hidden"
                  />
                  {t.rich(`steps.${key}.description`, {
                    guide: (chunks) => (
                      <a
                        href={`${GUIDE_URL}/${locale}${HOW_GUIDE_PATHS[key] ?? ""}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-brand underline-offset-4 hover:underline"
                      >
                        {chunks}
                      </a>
                    ),
                  })}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="relative hidden basis-[45%] md:block">
          <button
            type="button"
            onClick={handleNext}
            aria-label={t("nextStep")}
            className="w-full cursor-pointer overflow-hidden rounded-r-card border-[12px] border-l-0 border-border aspect-[520/720]"
          >
            <div className="grid h-full">
              {HOW_KEYS.map((key) => (
                <img
                  key={key}
                  src={`/images/how-steps/how-${key}.webp`}
                  alt={t(`steps.${key}.title`)}
                  width={508}
                  height={696}
                  aria-hidden={key !== activeKey}
                  className={cn(
                    "col-start-1 row-start-1 h-full w-full object-contain object-[right_center] transition-opacity duration-300 ease-out",
                    key === activeKey ? "opacity-100" : "opacity-0"
                  )}
                />
              ))}
            </div>
          </button>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-[104px] bg-gradient-to-r from-background to-transparent" />
        </div>
      </div>
    </div>
  );
}
