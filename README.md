# Bugshot Web

Landing page for the [Bugshot](https://chromewebstore.google.com/detail/bugshot/ohakhekagkodklkickemonmifdcbhmig) Chrome extension. A single-page static site that introduces the product and drives users to install from the Chrome Web Store.

## Stack

- Next.js 14 (App Router, static export)
- Tailwind CSS v3 + shadcn/ui
- Pretendard font (CDN)
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
├── app/        — Next.js App Router (layout, page, globals)
├── components/ — Section components + shadcn/ui
└── lib/        — Constants, utilities
```

## Links

- [Chrome Web Store](https://chromewebstore.google.com/detail/bugshot/ohakhekagkodklkickemonmifdcbmmig)
- [GitHub (Extension)](https://github.com/sinhyeokkang/bugshot-2)
- [Privacy Policy](https://sinhyeokkang.github.io/bugshot-2/privacy)
