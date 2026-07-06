// Build/dev prestep: fetch guide markdown + assets from bugshot-2 (public repo).
// Markdown → content/guide/{locale}/**, assets → public/docs/{locale}/assets/**.
// Both dests are gitignored — the single source of truth stays in bugshot-2.
import { execFileSync } from "node:child_process";
import { cp, mkdir, rm, readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, sep } from "node:path";
import { tmpdir } from "node:os";
import { fetchWithRetry } from "./lib/fetch-retry.mjs";

const REPO = "SinhyeokKang/bugshot-2";
const BRANCH = "main";
const TARBALL = `https://codeload.github.com/${REPO}/tar.gz/refs/heads/${BRANCH}`;
const TOP = "bugshot-2-main"; // tarball top-level dir for refs/heads/main
const LOCALES = ["ko", "en"];

const CONTENT_DIR = join(process.cwd(), "content", "guide");
const PUBLIC_DOCS = join(process.cwd(), "public", "docs");

async function main() {
  const res = await fetchWithRetry(TARBALL);
  const buf = Buffer.from(await res.arrayBuffer());

  const work = join(tmpdir(), "bugshot-guide");
  await rm(work, { recursive: true, force: true });
  await mkdir(work, { recursive: true });
  const tarPath = join(work, "repo.tar.gz");
  await writeFile(tarPath, buf);

  // extract only the guide dirs
  execFileSync(
    "tar",
    [
      "-xzf",
      tarPath,
      "-C",
      work,
      ...LOCALES.map((l) => `${TOP}/guide/${l}`),
    ],
    { stdio: "ignore" }
  );

  await rm(CONTENT_DIR, { recursive: true, force: true });
  await rm(PUBLIC_DOCS, { recursive: true, force: true });

  for (const locale of LOCALES) {
    const srcGuide = join(work, TOP, "guide", locale);
    if (!existsSync(join(srcGuide, "SUMMARY.md"))) {
      throw new Error(`missing SUMMARY.md for ${locale}`);
    }
    // markdown (preserve tree, skip the assets dir + junk)
    await cp(srcGuide, join(CONTENT_DIR, locale), {
      recursive: true,
      filter: (src) =>
        !src.includes(`${sep}assets`) && !src.endsWith(".DS_Store"),
    });
    // assets → public
    const srcAssets = join(srcGuide, "assets");
    if (existsSync(srcAssets)) {
      await cp(srcAssets, join(PUBLIC_DOCS, locale, "assets"), {
        recursive: true,
      });
    }
    const mdCount = (await readdir(join(CONTENT_DIR, locale), {
      recursive: true,
    })).filter((f) => f.endsWith(".md")).length;
    if (mdCount === 0) throw new Error(`no markdown extracted for ${locale}`);
    console.log(`[fetch-guide] ${locale}: ${mdCount} md files`);
  }
}

main().catch((err) => {
  console.error(`[fetch-guide] failed: ${err.message}`);
  process.exit(1);
});
