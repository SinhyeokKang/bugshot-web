"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { DocsNavNode } from "@/lib/docs/summary";

// shadcn sidebar menu-button structure, minus the background states:
// hover = brand color, active = brand color + one step bolder weight.
const menuButton =
  "flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none transition-colors hover:text-brand focus-visible:ring-2 focus-visible:ring-ring data-[active=true]:font-medium data-[active=true]:text-brand";
const subButton =
  "flex h-7 min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 text-sm text-sidebar-foreground outline-none transition-colors hover:text-brand focus-visible:ring-2 focus-visible:ring-ring data-[active=true]:font-medium data-[active=true]:text-brand";

export function DocsSidebar({ nav }: { nav: DocsNavNode[] }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  return (
    <nav aria-label="Docs" className="text-sidebar-foreground">
      <ul className="flex w-full min-w-0 flex-col gap-1">
        {nav.map((node) => (
          <li key={node.href} className="relative">
            <Link
              href={node.href}
              data-active={isActive(node.href)}
              className={menuButton}
            >
              <span className="truncate">{node.title}</span>
            </Link>
            {node.children.length > 0 && (
              <ul className="mx-3.5 mt-1 flex min-w-0 flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5">
                {node.children.map((child) => (
                  <li key={child.href} className="relative">
                    <Link
                      href={child.href}
                      data-active={isActive(child.href)}
                      className={subButton}
                    >
                      <span className="truncate">{child.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
