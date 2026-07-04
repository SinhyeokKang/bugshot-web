import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DocsNavNode } from "@/lib/docs/summary";

// Previous / next document links below a doc body (SUMMARY reading order).
export function DocsPager({
  prev,
  next,
  prevLabel,
  nextLabel,
}: {
  prev: DocsNavNode | null;
  next: DocsNavNode | null;
  prevLabel: string;
  nextLabel: string;
}) {
  if (!prev && !next) return null;

  return (
    <nav className="mt-16 flex flex-col gap-3 border-t pt-8 md:flex-row">
      {prev && (
        <Link
          href={prev.href}
          className="group flex flex-1 items-center gap-3 rounded-sm border p-4"
        >
          <ChevronLeft className="size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-brand" />
          <span className="flex flex-1 flex-col text-right">
            <span className="text-sm text-muted-foreground">{prevLabel}</span>
            <span className="font-medium transition-colors group-hover:text-brand">
              {prev.title}
            </span>
          </span>
        </Link>
      )}
      {next && (
        <Link
          href={next.href}
          className="group flex flex-1 items-center gap-3 rounded-sm border p-4"
        >
          <span className="flex flex-1 flex-col text-left">
            <span className="text-sm text-muted-foreground">{nextLabel}</span>
            <span className="font-medium transition-colors group-hover:text-brand">
              {next.title}
            </span>
          </span>
          <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-brand" />
        </Link>
      )}
    </nav>
  );
}
