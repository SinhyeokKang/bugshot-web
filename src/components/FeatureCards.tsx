import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MousePointerClick,
  Camera,
  Network,
  Sparkles,
  Send,
} from "lucide-react";

const features = [
  {
    icon: MousePointerClick,
    title: "Pick & Edit CSS",
    description:
      "Select any DOM element, inspect its styles, and edit CSS in real time. Bugshot recognizes design tokens and generates before/after diffs automatically.",
  },
  {
    icon: Camera,
    title: "Capture Everything",
    description:
      "Take annotated screenshots or record up to 60 seconds of screen activity. Crop, highlight, and redact — all without leaving the page.",
  },
  {
    icon: Network,
    title: "Auto-Collect Logs",
    description:
      "Network requests and console logs are captured automatically and attached to your issue. No more asking developers to reproduce the bug.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Drafts",
    description:
      "Bring your own API key and let AI draft issue descriptions and suggest style fixes. Cut writing time and ship clearer reports.",
  },
  {
    icon: Send,
    title: "One-Click Issue Filing",
    description:
      "File issues to Jira, GitHub, Linear, or Notion in one click. Metadata, screenshots, and logs are attached and formatted automatically.",
  },
];

export function FeatureCards() {
  return (
    <section className="container max-w-screen-xl py-16 lg:py-24">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Everything you need to report bugs
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          From inspection to issue filing — all in one side panel.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        {features.map((feature, i) => (
          <Card
            key={feature.title}
            className={i === features.length - 1 ? "sm:col-span-2 sm:max-w-lg sm:mx-auto" : ""}
          >
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm leading-relaxed">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
