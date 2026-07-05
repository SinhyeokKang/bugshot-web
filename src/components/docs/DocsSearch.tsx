"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Fuse from "fuse.js";
import { ChevronRight, FileText, Search, X } from "lucide-react";
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

  // load the index once, on first intent (hover/focus/open) so opening is smooth
  const loadingRef = React.useRef(false);
  const loadIndex = React.useCallback(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    fetch(`/search/${locale}.json`)
      .then((r) => r.json())
      .then((data: Doc[]) => {
        setDocs(data);
        setFuse(new Fuse(data, FUSE_OPTS));
      })
      .catch(() => setFuse(new Fuse<Doc>([], FUSE_OPTS)));
  }, [locale]);

  React.useEffect(() => {
    if (open) loadIndex();
  }, [open, loadIndex]);

  // empty query -> parent docs only (docs that have children nested under
  // their url); otherwise fuzzy matches
  const results = React.useMemo(() => {
    if (query.trim()) return fuse ? fuse.search(query).map((r) => r.item) : [];
    return docs.filter((d) => docs.some((o) => o.url.startsWith(`${d.url}/`)));
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
        onPointerEnter={loadIndex}
        onFocus={loadIndex}
        aria-label={t("searchPlaceholder")}
        className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-background/80 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <Search className="size-5" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="left-0 top-0 flex h-[100dvh] w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-0 p-0 shadow-lg [&>button]:hidden md:left-[50%] md:top-4 md:h-auto md:w-[calc(100%-2rem)] md:max-w-[540px] md:-translate-x-1/2 md:rounded-2xl md:border md:data-[state=open]:slide-in-from-left-1/2 md:data-[state=closed]:slide-out-to-left-1/2">
          <DialogTitle className="sr-only">{t("searchPlaceholder")}</DialogTitle>
          <Command shouldFilter={false} className="flex min-h-0 flex-1 flex-col">
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder={t("searchPlaceholder")}
              endSlot={
                query ? (
                  <button
                    type="button"
                    aria-label={t("searchClear")}
                    onClick={() => setQuery("")}
                    className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                ) : null
              }
              trailing={
                <button
                  type="button"
                  aria-label={t("searchClose")}
                  onClick={() => setOpen(false)}
                  className="inline-flex size-[42px] shrink-0 items-center justify-center rounded-md border bg-background text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:hidden"
                >
                  <X className="size-5" />
                </button>
              }
            />
            <CommandList className="min-h-0 max-h-none flex-1 overscroll-contain px-5 py-4 md:h-[400px] md:flex-none md:p-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&_[cmdk-list-sizer]]:space-y-1">
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
                      <div className="truncate text-sm text-muted-foreground">
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
