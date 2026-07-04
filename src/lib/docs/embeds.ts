import { readFileSync } from "node:fs";
import { join } from "node:path";

// OG metadata for a GitBook `{% embed %}` URL, resolved at build time by
// scripts/build-embeds.mjs. `null` means the fetch failed → render a plain link.
export type EmbedData = {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  favicon: string | null;
  host: string;
};

export type EmbedMap = Record<string, EmbedData | null>;

// Read the build-time embed map (content/guide/embeds.json). Missing/invalid
// file → {} so the app still renders (embeds fall back to plain links).
export function getEmbeds(): EmbedMap {
  try {
    const raw = readFileSync(
      join(process.cwd(), "content", "guide", "embeds.json"),
      "utf-8"
    );
    return JSON.parse(raw) as EmbedMap;
  } catch {
    return {};
  }
}
