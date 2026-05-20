import {
  MousePointerClick,
  Video,
  Magnet,
  Wand2,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: MousePointerClick,
    title: "Inspect & Edit CSS",
    description:
      "Click any element to view its applied styles and attributes. Modify styles in the visual editor and see changes reflected on the page instantly.",
    wide: true,
  },
  {
    icon: Video,
    title: "Record up to 60 seconds",
    description:
      "Capture the exact moment a bug happens with a built-in screen recorder. Console and network logs are collected alongside the video.",
  },
  {
    icon: Magnet,
    title: "Auto-collect context",
    description:
      "Browser, screen resolution, DOM details, console and network logs are gathered for you — with noise filtered out so the important signals stand out.",
  },
  {
    icon: Wand2,
    title: "AI bug reports",
    description:
      "Turn collected data into a structured report covering steps to reproduce, expected behavior, and actual behavior.",
  },
  {
    icon: Send,
    title: "One-click issue filing",
    description:
      "Create and send tickets with full attachments to Jira, GitHub, Linear, or Notion — with a single click.",
  },
];

export function FeatureCards() {
  return (
    <section className="border-b py-20 md:py-[120px]">
      <div className="container mx-auto max-w-[1200px]">
        <h2 className="text-center text-3xl font-bold leading-tight tracking-tight md:text-[40px] md:leading-[48px]">
          What you can do
          <br />
          with BugShot
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {features.map((f) => (
            <article
              key={f.title}
              className={cn(
                "grid grid-cols-1 overflow-hidden rounded-[40px] bg-muted md:h-[360px]",
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
                  className="h-8 w-8 text-primary"
                  strokeWidth={1.5}
                />
                <h3 className="mt-3 text-2xl font-bold leading-snug">
                  {f.title}
                </h3>
                <p className="mt-4 text-base leading-snug text-muted-foreground">
                  {f.description}
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
