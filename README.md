# BugShot Web

Landing page **and docs site** for the [BugShot](https://chromewebstore.google.com/detail/bugshot/ohakhekagkodklkickemonmifdcbhmig) Chrome extension. A static site that introduces the product (landing), and self-hosts the guide (`/docs`) and privacy policy (`/privacy`) — their content is fetched from the bugshot-2 repo at build time so all SEO authority stays on `bug-shot.com`.

## Stack

- Next.js 15 (App Router, static export) + React 19
- Tailwind CSS v3 (+ `@tailwindcss/typography`, `tailwindcss-animate`) + shadcn/ui
- Markdown: `react-markdown` + `remark-gfm` + `rehype-slug` (shared `Markdown` component)
- Docs search: `cmdk` + `fuse.js` (build-time index, client-side fuzzy search)
- DM Sans (Latin) + Pretendard Variable (Korean)
- next-intl (defaultLocale: `en`, routes: `/ko`, `/en`)
- Deployed on Vercel (rewrites `/`, `/privacy`, `/docs/*` → default `en`; Korean browsers redirected to `/ko`)

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). `dev`/`build` first run
`fetch-privacy` + `fetch-guide` + `build-search` + `build-embeds` +
`build-image-dims` to pull privacy/guide content and build the search index,
embed OG cards, and image dimensions from bugshot-2 (all gitignored).

## Build

```bash
pnpm build
```

Outputs a static site to `out/`. (Don't run `build` while `dev` is running — it overwrites the same `.next`.)

## Project Structure

```
scripts/            — build-time content fetch + search index + embed OG meta + image dims (privacy, guide)
src/
├── app/
│   ├── layout.tsx          — Root layout (passthrough; <html>/<body>/fonts live in [locale])
│   └── [locale]/           — Localized routes (/ko, /en); renders <html lang>/<body> + DM Sans + Pretendard
│       ├── page.tsx        — Landing
│       ├── privacy/        — Privacy policy
│       └── docs/           — Guide portal (catch-all)
├── components/
│   ├── Markdown.tsx        — Shared markdown renderer
│   ├── docs/               — DocsShell, sidebar, header, search, pager, TOC, embed card
│   └── ...                 — Landing sections + shadcn/ui + LocaleSwitcher
├── i18n/                   — next-intl routing, navigation, request config
└── lib/
    ├── docs/               — SUMMARY parser, content loader, markdown, TOC, metadata, embeds, image dims
    ├── i18n/               — Message catalogs (en.json, ko.json)
    └── ...                 — Constants, utilities
```

## Links

- [Chrome Web Store](https://chromewebstore.google.com/detail/bugshot/ohakhekagkodklkickemonmifdcbhmig)
- [GitHub (Extension)](https://github.com/sinhyeokkang/bugshot-2)
- [Privacy Policy](https://bug-shot.com/ko/privacy)
