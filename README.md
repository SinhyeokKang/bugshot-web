# BugShot Web

Landing page for the [BugShot](https://chromewebstore.google.com/detail/bugshot/ohakhekagkodklkickemonmifdcbhmig) Chrome extension. A single-page static site that introduces the product and drives users to install from the Chrome Web Store.

## Stack

- Next.js 14 (App Router, static export)
- Tailwind CSS v3 + shadcn/ui
- DM Sans (next/font/google)
- next-intl (locale routing: `/en`, `/ko`)
- Deployed on Vercel

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
pnpm build
```

Outputs a static site to `out/`.

## Project Structure

```
docs/           — Feature planning (PRD, design, tasks)
src/
├── app/
│   ├── [locale]/  — Localized routes (/en, /ko)
│   └── page.tsx   — Root redirect to /en
├── components/    — Section components + shadcn/ui
├── i18n/          — next-intl routing and request config
└── lib/
    ├── i18n/      — Message catalogs (en.json, ko.json)
    └── ...        — Constants, utilities
```

## Links

- [Chrome Web Store](https://chromewebstore.google.com/detail/bugshot/ohakhekagkodklkickemonmifdcbhmig)
- [GitHub (Extension)](https://github.com/sinhyeokkang/bugshot-2)
- [Privacy Policy](https://sinhyeokkang.github.io/bugshot-2/privacy)
