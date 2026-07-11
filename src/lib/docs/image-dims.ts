import { readFileSync } from "node:fs";
import { join } from "node:path";

// Intrinsic dimensions of doc images, keyed by served path
// (/docs/{locale}/assets/FILE), resolved at build time by
// scripts/build-image-dims.mjs. The markdown renderer sets these as width/height
// to reserve layout space (CLS).
export type ImageDim = { width: number; height: number };
export type ImageDimMap = Record<string, ImageDim>;

// Read the build-time dimension map (content/guide/image-dims.json). Missing/
// invalid file → {} so the app still renders (images just omit width/height).
export function getImageDims(): ImageDimMap {
  try {
    const raw = readFileSync(
      join(process.cwd(), "content", "guide", "image-dims.json"),
      "utf-8"
    );
    return JSON.parse(raw) as ImageDimMap;
  } catch {
    return {};
  }
}
