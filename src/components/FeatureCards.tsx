import {
  MousePointerClick,
  Video,
  Magnet,
  Wand2,
  Send,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const features = [
  { key: "inspect", icon: MousePointerClick, wide: true },
  { key: "record", icon: Video },
  { key: "autoCollect", icon: Magnet },
  { key: "ai", icon: Wand2 },
  { key: "send", icon: Send },
] as const;

export function FeatureCards() {
  const t = useTranslations("features");

  return (
    <section className="border-b py-20 md:py-[120px]">
      <div className="container mx-auto max-w-[1200px]">
        <h2 className="text-center text-3xl font-bold leading-tight tracking-tight md:text-5xl md:leading-[56px]">
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
              className={cn(
                "grid grid-cols-1 overflow-hidden rounded-card bg-muted md:h-[360px]",
                f.wide
                  ? "md:col-span-2 md:grid-cols-[448px_1fr]"
                  : "md:grid-cols-[296px_1fr]"
              )}
            >
              <div
                className={cn(
                  "flex flex-col p-8 md:p-12",
                  !f.wide && "md:pr-6"
                )}
              >
                <f.icon
                  className="h-6 w-6 text-primary md:h-8 md:w-8"
                  strokeWidth={1.5}
                />
                <h3 className="mt-3 text-xl font-bold leading-snug md:text-2xl">
                  {t(`items.${f.key}.title`)}
                </h3>
                <p className="mt-4 text-sm leading-snug text-muted-foreground md:text-base">
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
