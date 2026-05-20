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
    title: "Inspect & edit CSS live",
    description:
      "Click any element to view its applied styles and attributes. Modify styles in the visual editor and see changes reflected on the page instantly.",
  },
  {
    icon: Camera,
    title: "Record up to 60 seconds",
    description:
      "Capture the exact moment a bug happens with a built-in screen recorder. Console and network logs are collected alongside the video.",
  },
  {
    icon: Network,
    title: "Auto-collect context",
    description:
      "Browser, screen resolution, DOM details, console and network logs are gathered for you — with noise filtered out so the important signals stand out.",
  },
  {
    icon: Sparkles,
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
    <section className="container max-w-screen-xl py-16 lg:py-24">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          What you can do with BugShot
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
