"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/docs/toc";

// Right-side "on this page" anchor list with scroll-spy highlighting.
export function TocNav({ items, label }: { items: TocItem[]; label: string }) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) {
          const top = visible.sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          )[0];
          setActiveId(top.target.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px" }
    );
    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [items]);

  if (!items.length) return null;

  return (
    <nav aria-label={label} className="text-sm">
      <p className="mb-3 font-medium text-foreground">{label}</p>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              data-active={activeId === item.id}
              className={`block text-muted-foreground transition-colors hover:text-brand data-[active=true]:font-medium data-[active=true]:text-brand ${
                item.depth === 3 ? "pl-3" : ""
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
