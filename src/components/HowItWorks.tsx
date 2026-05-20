import { Rocket, Crosshair, ScrollText, Share2 } from "lucide-react";

const steps = [
  {
    icon: Rocket,
    title: "Launch",
    description:
      "Click the BugShot icon or open the side panel with a keyboard shortcut.",
  },
  {
    icon: Crosshair,
    title: "Record & inspect",
    description:
      "Capture up to 60 seconds with logs, or select any element to edit styles live.",
  },
  {
    icon: ScrollText,
    title: "AI report",
    description:
      "Get a structured draft with reproduction steps, expected and actual behavior — built from your captured data.",
  },
  {
    icon: Share2,
    title: "Send or export",
    description:
      "Share via Markdown, your issue tracker, or any format your team prefers.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-b py-20 md:py-[120px]">
      <div className="container mx-auto max-w-[1200px]">
        <h2 className="text-center text-3xl font-bold leading-tight tracking-tight md:text-[40px] md:leading-[48px]">
          How to use
          <br />
          BugShot
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.title}
              className="flex flex-col items-center text-center"
            >
              <step.icon
                className="h-8 w-8 text-primary"
                strokeWidth={1.5}
              />
              <h3 className="mt-3 text-2xl font-bold leading-snug">
                {step.title}
              </h3>
              <p className="mt-3 text-base leading-snug text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
