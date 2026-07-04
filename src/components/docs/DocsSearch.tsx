"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Fuse from "fuse.js";
import { ChevronRight, FileText, Search } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Command,
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

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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

function snippet(doc: Doc, query: string): string {
  const text = [doc.headings, doc.content].filter(Boolean).join(" — ");
  const idx = text.toLowerCase().indexOf(query.trim().toLowerCase());
  if (!query.trim() || idx < 0) return text.slice(0, 90);
  const start = Math.max(0, idx - 24);
  return (start > 0 ? "…" : "") + text.slice(start, start + 90);
}

function isEditable(el: EventTarget | null): boolean {
  const t = el as HTMLElement | null;
  return (
    !!t &&
    (t.tagName === "INPUT" ||
      t.tagName === "TEXTAREA" ||
      t.isContentEditable === true)
  );
}

export function DocsSearch() {
  const locale = useLocale();
  const t = useTranslations("docs");
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [docs, setDocs] = React.useState<Doc[]>([]);
  const [fuse, setFuse] = React.useState<Fuse<Doc> | null>(null);

  // "/" opens search (unless typing in a field)
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !isEditable(e.target)) {
        e.preventDefault();
        setOpen(true);
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
      .then((data: Doc[]) => {
        setDocs(data);
        setFuse(new Fuse(data, FUSE_OPTS));
      })
      .catch(() => setFuse(new Fuse<Doc>([], FUSE_OPTS)));
  }, [open, fuse, locale]);

  // empty query -> all docs in index order; otherwise fuzzy matches
  const results = React.useMemo(() => {
    if (!query.trim()) return docs;
    if (!fuse) return [];
    return fuse.search(query).map((r) => r.item);
  }, [fuse, docs, query]);

  const go = (url: string) => {
    setOpen(false);
    router.push(url);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 w-full max-w-[280px] items-center gap-2 rounded-full border bg-background/80 px-4 text-sm text-muted-foreground backdrop-blur transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <Search className="size-4 shrink-0" />
        <span className="flex-1 truncate text-left">
          {t.rich("searchHint", {
            kbd: (chunks) => (
              <kbd className="mx-0.5 inline-flex h-5 items-center rounded border bg-muted px-1.5 font-mono text-xs font-medium text-foreground">
                {chunks}
              </kbd>
            ),
          })}
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-4 max-w-[540px] translate-y-0 gap-0 overflow-hidden rounded-2xl p-0 shadow-lg [&>button]:hidden">
          <DialogTitle className="sr-only">{t("searchPlaceholder")}</DialogTitle>
          <Command shouldFilter={false}>
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder={t("searchPlaceholder")}
            />
            <CommandList className="h-[400px] max-h-none p-3 pt-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&_[cmdk-list-sizer]]:space-y-1">
              {results.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  {t("searchEmpty")}
                </div>
              ) : (
                results.map((doc) => (
                  <CommandItem
                    key={doc.url}
                    value={doc.url}
                    onSelect={() => go(doc.url)}
                    className="gap-3 p-3"
                  >
                    <FileText className="size-5 shrink-0 text-muted-foreground" />
                    <div className="flex min-w-0 flex-1 flex-col">
                      {doc.section && (
                        <div className="truncate text-xs font-medium text-brand">
                          {doc.section}
                        </div>
                      )}
                      <div className="truncate text-base font-semibold">
                        {highlight(doc.title, query)}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {highlight(snippet(doc, query), query)}
                      </div>
                    </div>
                    <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
                  </CommandItem>
                ))
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
