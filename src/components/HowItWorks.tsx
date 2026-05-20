import { Rocket, Crosshair, ScrollText, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";

const steps = [
  { key: "launch", icon: Rocket },
  { key: "recordInspect", icon: Crosshair },
  { key: "aiReport", icon: ScrollText },
  { key: "send", icon: Share2 },
] as const;

export function HowItWorks() {
  const t = useTranslations("how");
  const heading = t.raw("heading") as string[];

  return (
    <section className="border-b py-20 md:py-[120px]">
      <div className="container mx-auto max-w-[1200px]">
        <h2 className="text-center text-3xl font-bold leading-tight tracking-tight md:text-[40px] md:leading-[48px]">
          {heading[0]}
          <br />
          {heading[1]}
        </h2>
        <ol className="mt-10 grid list-none grid-cols-1 gap-10 md:grid-cols-4">
          {steps.map((step) => (
            <li
              key={step.key}
              className="flex flex-col items-center text-center"
            >
              <step.icon
                className="h-8 w-8 text-primary"
                strokeWidth={1.5}
              />
              <h3 className="mt-3 text-2xl font-bold leading-snug">
                {t(`steps.${step.key}.title`)}
              </h3>
              <p className="mt-3 text-base leading-snug text-muted-foreground">
                {t(`steps.${step.key}.description`)}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
