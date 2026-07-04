import { Globe } from "lucide-react";
import type { EmbedData } from "@/lib/docs/embeds";

// Renders a GitBook `{% embed url %}` as a horizontal link card using OG meta
// resolved at build time. No meta (fetch failed) → a plain link fallback.
export function EmbedCard({
  url,
  data,
}: {
  url: string;
  data: EmbedData | null;
}) {
  if (!data) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-brand"
      >
        {url}
      </a>
    );
  }

  const host = data.host || new URL(url).host.replace(/^www\./, "");

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="my-6 flex flex-col overflow-hidden rounded-xs border no-underline shadow-sm transition-colors hover:bg-accent md:flex-row"
    >
      {data.image ? (
        <div className="relative aspect-[1200/630] w-full shrink-0 md:aspect-auto md:w-44">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      ) : null}
      <div className="min-w-0 flex-1 p-4">
        <div className="line-clamp-1 font-semibold text-foreground">
          {data.title ?? host}
        </div>
        {data.description ? (
          <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {data.description}
          </div>
        ) : null}
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          {data.favicon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.favicon} alt="" className="h-4 w-4 object-contain" />
          ) : (
            <Globe className="h-4 w-4" />
          )}
          <span className="truncate">{host}</span>
        </div>
      </div>
    </a>
  );
}
