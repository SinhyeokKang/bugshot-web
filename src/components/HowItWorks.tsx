import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "@/components/ScrollReveal";

const steps = [
  { key: "launch", image: "HowItWorks-1" },
  { key: "recordInspect", image: "HowItWorks-2" },
  { key: "aiReport", image: "HowItWorks-3" },
  { key: "submit", image: "HowItWorks-4" },
] as const;

export async function HowItWorks() {
  const t = await getTranslations("how");

  return (
    <div className="container mx-auto max-w-[1200px]">
      <ScrollReveal as="div">
        <h2 id="how-heading" className="text-center text-3xl font-bold leading-tight tracking-tight md:text-[40px] md:leading-[48px]">
          {t.rich("heading", {
            brand: (chunks) => <span className="text-brand">{chunks}</span>,
          })}
        </h2>
      </ScrollReveal>
      <ol className="mt-12 grid list-none grid-cols-1 gap-6 md:grid-cols-4">
        {steps.map((step, i) => (
          <ScrollReveal key={step.key} as="li" className="mb-4 flex flex-col">
            <img
              src={`/images/how-steps/${step.image}.webp`}
              alt={t(`steps.${step.key}.title`)}
              width={528}
              height={330}
              className="aspect-[16/10] w-full rounded-2xl border object-cover"
            />
            <div className="px-1.5">
              <h3 className="mt-4 text-[18px] font-semibold leading-snug md:text-[20px]">
                {i + 1}. {t(`steps.${step.key}.title`)}
              </h3>
              <p className="mt-2 text-base leading-snug text-foreground">
                {t(`steps.${step.key}.description`)}
              </p>
            </div>
          </ScrollReveal>
        ))}
      </ol>
    </div>
  );
}
