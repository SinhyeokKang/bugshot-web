"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Fuse from "fuse.js";
import { ChevronRight, FileText, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface Doc {
  title: string;
  section: string;
  url: string;
  headings: string;
  content: string;
}

const FUSE_OPTS = {
  keys: [
    { name: "title", weight: 3 },
    { name: "headings", weight: 2 },
    { name: "section", weight: 1 },
    { name: "content", weight: 1 },
  ],
  threshold: 0.4,
  ignoreLocation: true,
  minMatchCharLength: 2,
};

// highlight query occurrences in text
function highlight(text: string, query: string): React.ReactNode {
  const q = query.trim();
  if (!q) return text;
  const parts = text.split(new RegExp(`(${escapeRegExp(q)})`, "gi"));
  return parts.map((p, i) =>
    p.toLowerCase() === q.toLowerCase() ? (
      <mark key={i} className="rounded bg-brand/15 text-brand">
        {p}
      </mark>
    ) : (
      p
    )
  );
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// excerpt around the first match, falling back to the start
function snippet(doc: Doc, query: string): string {
  const text = [doc.headings, doc.content].filter(Boolean).join(" — ");
  const idx = text.toLowerCase().indexOf(query.trim().toLowerCase());
  if (idx < 0) return text.slice(0, 90);
  const start = Math.max(0, idx - 24);
  return (start > 0 ? "…" : "") + text.slice(start, start + 90);
}

export function DocsSearch() {
  const locale = useLocale();
  const t = useTranslations("docs");
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [fuse, setFuse] = React.useState<Fuse<Doc> | null>(null);

  // ⌘K / Ctrl+K
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // lazy-load the index on first open
  React.useEffect(() => {
    if (!open || fuse) return;
    fetch(`/search/${locale}.json`)
      .then((r) => r.json())
      .then((docs: Doc[]) => setFuse(new Fuse(docs, FUSE_OPTS)))
      .catch(() => setFuse(new Fuse<Doc>([], FUSE_OPTS)));
  }, [open, fuse, locale]);

  const results = React.useMemo(() => {
    if (!fuse || !query.trim()) return [];
    return fuse.search(query).slice(0, 8).map((r) => r.item);
  }, [fuse, query]);

  const go = (url: string) => {
    setOpen(false);
    router.push(url);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 w-full max-w-md items-center gap-2 rounded-md border border-input bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <Search className="size-4 shrink-0" />
        <span className="flex-1 text-left">{t("searchPlaceholder")}</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
          ⌘K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0 shadow-lg">
          <DialogTitle className="sr-only">{t("searchPlaceholder")}</DialogTitle>
          <Command shouldFilter={false}>
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder={t("searchPlaceholder")}
            />
            <CommandList>
              {query.trim() && <CommandEmpty>{t("searchEmpty")}</CommandEmpty>}
              {results.map((doc) => (
                <CommandItem
                  key={doc.url}
                  value={doc.url}
                  onSelect={() => go(doc.url)}
                  className="gap-3"
                >
                  <FileText className="size-5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    {doc.section && (
                      <div className="truncate text-xs text-muted-foreground">
                        {doc.section}
                      </div>
                    )}
                    <div className="truncate font-semibold">
                      {highlight(doc.title, query)}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {highlight(snippet(doc, query), query)}
                    </div>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
