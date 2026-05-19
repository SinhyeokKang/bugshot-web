import { Badge } from "@/components/ui/badge";
import { Search, Wrench, MonitorUp, Truck } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Detect",
    description:
      "Select a DOM element to extract CSS tokens and the full style chain in real time.",
  },
  {
    icon: Wrench,
    title: "Resolve",
    description:
      "Recognize design tokens and auto-generate style edits with before/after comparison.",
  },
  {
    icon: MonitorUp,
    title: "Capture",
    description:
      "Collect screenshots, recordings, network & console logs to complete the context.",
  },
  {
    icon: Truck,
    title: "Deliver",
    description:
      "Auto-generate and file issues in the right format for Jira, GitHub, Linear, or Notion.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-y bg-muted/30 py-16 lg:py-24">
      <div className="container max-w-screen-xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Four steps from bug discovery to issue filed.
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
