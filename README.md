# BugShot Web

Landing page for the [BugShot](https://chromewebstore.google.com/detail/bugshot/ohakhekagkodklkickemonmifdcbhmig) Chrome extension. A single-page static site that introduces the product and drives users to install from the Chrome Web Store.

## Stack

- Next.js 15 (App Router, static export) + React 19
- Tailwind CSS v3 + shadcn/ui
- DM Sans (Latin) + Pretendard Variable (Korean)
- next-intl (defaultLocale: `ko`, routes: `/ko`, `/en`)
- Deployed on Vercel (rewrite `/` → `/ko`)

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
src/
├── app/
│   ├── layout.tsx    — Root layout (<html>, <body>, DM Sans)
│   └── [locale]/     — Localized routes (/ko, /en)
├── components/       — Section components + shadcn/ui + LocaleSwitcher
├── i18n/             — next-intl routing, navigation, request config
└── lib/
    ├── i18n/         — Message catalogs (en.json, ko.json)
    └── ...           — Constants, utilities
```

## Links

- [Chrome Web Store](https://chromewebstore.google.com/detail/bugshot/ohakhekagkodklkickemonmifdcbhmig)
- [GitHub (Extension)](https://github.com/sinhyeokkang/bugshot-2)
- [Privacy Policy](https://sinhyeokkang.github.io/bugshot-2/privacy)
