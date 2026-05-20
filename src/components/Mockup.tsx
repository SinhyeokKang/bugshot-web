"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const slides = [
  {
    label: "Inspect",
    caption: "Click any element to view its applied styles and attributes.",
  },
  {
    label: "Capture",
    caption: "Take annotated screenshots with arrows, text, and highlights.",
  },
  {
    label: "Record",
    caption:
      "Record up to 60 seconds with console and network logs in sync.",
  },
  {
    label: "AI Generation",
    caption:
      "Turn collected data into a structured bug report with reproduction steps.",
  },
  {
    label: "Send Issue",
    caption:
      "Send tickets with full attachments to Jira, GitHub, Linear, or Notion.",
  },
];

export function Mockup() {
  const [active, setActive] = useState(0);
  const current = slides[active];

  return (
    <section className="border-b pt-12 pb-20 md:pt-[60px] md:pb-[120px]">
      <div className="container mx-auto max-w-[1200px]">
        <div className="flex aspect-[5/3] w-full items-center justify-center rounded-[40px] border-[8px] border-border bg-muted md:border-[12px]">
          <span className="text-base text-muted-foreground">
            {current.label}
          </span>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.label}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "h-[42px] rounded-xl px-4 text-base font-medium transition-colors",
                active === i
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {slide.label}
            </button>
          ))}
        </div>
        <p className="mt-6 text-center text-base text-muted-foreground">
          {current.caption}
        </p>
      </div>
    </section>
  );
}
