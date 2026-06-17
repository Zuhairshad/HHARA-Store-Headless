# HHARA Storefront — Next.js port

Faithful port of the HHARA "Maison of Considered Luxury" design (originally a single-file React/Babel prototype) to a modern Next.js 15 app.

## Stack
- **Next.js 15** (App Router, React 19)
- **Tailwind CSS 3** (set up; the design itself ships its own complete stylesheet in `src/app/design.css` — Tailwind is available for any new work)
- **Framer Motion** (installed; ready to use for additional motion enhancements)
- **next/font/google** for Cormorant Garamond, Manrope, JetBrains Mono

## Run
```bash
npm install
npm run dev       # http://localhost:3000
npm run build && npm start
```

## Project layout
```
public/images/        54 storefront images extracted from the original bundle
src/app/
  globals.css         tailwind base + imports design.css
  design.css          original design stylesheet (~2k lines, unchanged)
  layout.tsx          root layout, fonts
  page.tsx            renders the HharaApp client component
src/components/
  HharaApp.tsx        full storefront (header, mega menu, hero, categories,
                      featured grids, editorial, marquee, lookbook, callouts,
                      newsletter, footer, cart drawer, search overlay, plus
                      collection / PDP / atelier / journal / article / lookbook /
                      stores / account / wishlist pages, with internal routing)
```

The app is one client-rendered component because the original design uses an in-memory router (`setRoute` state). Migration to per-route Next.js pages (`/`, `/shop`, `/product/[id]`, etc.) is straightforward when needed.

## Shopify integration
Yes, Next.js works with Shopify. The pattern is **headless commerce**:
- This frontend stays as-is
- Add `@shopify/storefront-api-client` and replace the static `PRODUCTS` / `CATEGORIES` arrays in `HharaApp.tsx` with GraphQL queries against the Shopify Storefront API
- Cart → use Shopify Cart API (or the SDK's helpers) instead of the local `useState` cart in `App()`
- Checkout stays on Shopify's hosted checkout (a platform constraint regardless of frontend)

Embedded Shopify Admin apps work too (via `@shopify/app-bridge-react`) but that's a different surface — admin tools, not the storefront.

## Notes
- TypeScript and ESLint errors are skipped during `next build` because the source was ported from JS/JSX (`// @ts-nocheck` at the top of `HharaApp.tsx`). Tighten incrementally when refactoring sections.
- All 54 storefront images live in `public/images/` keyed by their semantic id (`hero1.jpg`, `p1a.jpg`, `lb1.jpg`, etc.). The `IMGS` map at the top of `HharaApp.tsx` resolves these.
- Mega menu opens on Shop hover; Search and Cart open via the header icons.
