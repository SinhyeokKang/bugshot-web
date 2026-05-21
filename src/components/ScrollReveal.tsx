"use client";

import { createElement, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export function ScrollReveal({
  children,
  className,
  as = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article" | "li";
}) {
  const { ref, revealed } = useScrollReveal<HTMLElement>();

  return createElement(
    as,
    {
      ref,
      className: cn(
        "transition-all duration-1000 ease-out",
        revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className,
      ),
    },
    children,
  );
}
