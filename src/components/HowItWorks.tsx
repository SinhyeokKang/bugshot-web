import { Badge } from "@/components/ui/badge";
import { Search, Wrench, MonitorUp, Truck } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Launch",
    description:
      "Click the BugShot icon or open the side panel with a keyboard shortcut.",
  },
  {
    icon: MonitorUp,
    title: "Record & inspect",
    description:
      "Capture up to 60 seconds with logs, or select any element to edit styles live.",
  },
  {
    icon: Wrench,
    title: "AI report",
    description:
      "Get a structured draft with reproduction steps, expected and actual behavior — built from your captured data.",
  },
  {
    icon: Truck,
    title: "Send or export",
    description:
      "Share via Markdown, your issue tracker, or any format your team prefers.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-y bg-muted/30 py-16 lg:py-24">
      <div className="container max-w-screen-xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How to use BugShot
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From launch to issue filed in four quick steps.
          </p>
        </div>
        <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {steps.map((step, i) => (
            <div key={step.title} className="relative flex flex-col items-center text-center lg:px-6">
              {i < steps.length - 1 && (
                <div className="absolute right-0 top-8 hidden h-px w-full border-t-2 border-dashed border-border lg:block lg:w-1/2 lg:translate-x-1/2" />
              )}
              <Badge
                variant="secondary"
                className="mb-4 h-16 w-16 flex-shrink-0 rounded-full p-0"
              >
                <step.icon className="h-7 w-7" />
              </Badge>
              <span className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Step {i + 1}
              </span>
              <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
