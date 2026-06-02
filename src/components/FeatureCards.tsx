import {
  MousePointerClick,
  Video,
  Magnet,
  Wand2,
  Send,
  Palette,
  Film,
  ListChecks,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "@/components/ScrollReveal";
import { cn } from "@/lib/utils";

type FeatureGroup = "reporter" | "dev";

interface FeatureItem {
  key: string;
  icon: LucideIcon;
  image: string;
  span?: boolean;
}

const FEATURES_BY_GROUP: Record<FeatureGroup, readonly FeatureItem[]> = {
  reporter: [
    { key: "inspect", icon: MousePointerClick, image: "inspect" },
    { key: "aiStyling", icon: Palette, image: "ai-styling" },
    { key: "record", icon: Video, image: "record" },
    { key: "ai", icon: Wand2, image: "ai-reports" },
  ],
  dev: [
    { key: "autoCollect", icon: Magnet, image: "auto-collect" },
    { key: "submit", icon: Send, image: "integrations" },
    { key: "logsViewer", icon: Film, image: "logs-viewer" },
    { key: "trackIssues", icon: ListChecks, image: "issue-tracking" },
  ],
} as const;

export async function FeatureCards({ group }: { group: FeatureGroup }) {
  const t = await getTranslations(`features.${group}`);

  return (
    <div className="container mx-auto max-w-[1200px]">
      <ScrollReveal as="div">
        <h2 id={`features-${group}-heading`} className="text-center text-3xl font-semibold leading-tight tracking-tight md:text-[40px] md:leading-[48px]">
          {t.rich("heading.line1", {
            brand: (chunks) => <span className="text-brand">{chunks}</span>,
          })}{" "}
          {t.rich("heading.line2", {
            brand: (chunks) => <span className="text-brand">{chunks}</span>,
          })}
        </h2>
      </ScrollReveal>
      <div className="mt-12 grid grid-cols-1 gap-6 min-[1200px]:grid-cols-2">
        {FEATURES_BY_GROUP[group].map((f) => (
          <ScrollReveal
            key={f.key}
            as="article"
            className={cn(
              "grid w-full grid-cols-1 overflow-hidden rounded-3xl bg-muted md:h-[360px] md:rounded-card md:grid-cols-[1fr_324px]",
              f.span && "min-[1200px]:col-span-2"
            )}
          >
            <div className="flex flex-col p-8 pb-0 md:p-10 md:pr-0">
              <f.icon
                className="h-6 w-6 text-primary md:h-7 md:w-7"
                strokeWidth={1.5}
              />
              <h3 className="mt-4 text-xl font-semibold leading-snug md:text-2xl">
                {t(`items.${f.key}.title`)}
              </h3>
              <p className="mt-4 text-base leading-snug text-foreground">
                {t(`items.${f.key}.description`)}
              </p>
            </div>
            <div className="aspect-video overflow-hidden md:aspect-auto">
              <img
                src={`/images/how/${f.image}-mobile.webp`}
                alt={t(`items.${f.key}.title`)}
                width={800}
                height={450}
                className="h-full w-full object-cover md:hidden"
              />
              <img
                src={`/images/how/${f.image}-pc.webp`}
                alt={t(`items.${f.key}.title`)}
                width={648}
                height={720}
                className="hidden h-full w-full object-cover md:block"
              />
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
