# قُرمُزي (Qurmuzi)

A **demo** online flower shop for the Saudi market, in Arabic (RTL, default) and English.
**No real orders, no real payments.** The site says so on every page, and card details never
leave the browser.

- Spec and rules: [`CLAUDE.md`](CLAUDE.md) · Plan and progress: [`ROADMAP.md`](ROADMAP.md)
- Stack: Next.js 16 (App Router) · TypeScript · Tailwind v4 · shadcn/ui · next-intl · Drizzle ·
  PGlite (local) / Neon (production) · Zustand · react-hook-form + Zod · GSAP · Vitest · Playwright

## What a visitor can do

1. Land on the home page (delivery promise, occasions, budgets, featured bouquets).
2. Browse the catalog by occasion and budget (filters live in the URL).
3. Open a bouquet, pick a size and add-ons, and add it to the cart.
4. Check out as a guest in 3 steps: recipient & delivery (Gregorian + Hijri dates, server-side
   Riyadh-time availability), gift card, and a mock payment (mada, Apple Pay, STC Pay, Tabby,
   Tamara, cash on delivery).
5. See the confirmation with falling petals and a simplified VAT invoice with a ZATCA-style QR.

## Requirements

- Node.js 22+
- pnpm 10 (`corepack enable`)

## Getting started

```bash
pnpm install
cp .env.example .env.local   # leave DATABASE_URL empty to use PGlite locally
pnpm db:migrate
pnpm db:seed
pnpm dev                     # http://localhost:3000 → redirects to /ar
```

## Scripts

| Command                             | What it does                                                                        |
| ----------------------------------- | ----------------------------------------------------------------------------------- |
| `pnpm dev`                          | Dev server                                                                          |
| `pnpm build` / `pnpm start`         | Production build / serve it                                                         |
| `pnpm lint`                         | ESLint                                                                              |
| `pnpm format` / `pnpm format:check` | Prettier write / check                                                              |
| `pnpm typecheck`                    | Generate route types + `tsc --noEmit`                                               |
| `pnpm test`                         | Vitest unit tests                                                                   |
| `pnpm test:e2e`                     | Playwright: desktop + 360px mobile × ar + en, including axe accessibility checks    |
| `pnpm e2e:db`                       | Recreate the E2E database (`.pglite-e2e`) with edge-case fixtures                   |
| `pnpm db:generate`                  | Generate a migration from `src/lib/db/schema.ts`                                    |
| `pnpm db:migrate`                   | Apply migrations (PGlite locally, Neon if `DATABASE_URL` is set)                    |
| `pnpm db:seed`                      | Seed dummy data (idempotent; tops up 30 days of delivery capacity)                  |
| `pnpm images`                       | Build product images (real photos from `scripts/images/source/`, else placeholders) |
| `pnpm vercel-build`                 | Used by Vercel: migrate + seed Neon on production deploys, then build               |

Run `pnpm exec playwright install chromium` once before the first E2E run,
or set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to an existing Chromium binary.

## Database

`src/lib/db/client.ts` exports one `db`:

- `DATABASE_URL` set → Neon over WebSockets (`drizzle-orm/neon-serverless`, supports transactions).
- Not set → PGlite, stored in `.pglite/` (git-ignored). PGlite never runs on Vercel.

PGlite allows one process at a time, so stop `pnpm dev` before running `db:migrate` or `db:seed`.
E2E tests use a separate `.pglite-e2e` folder, so they never touch your dev data.

Operational settings (same-day cut-off, prep hours, featured products, VAT number…) live in the
`settings` table, delivery zones and slots in their own tables. The seed adds missing settings on
every run but never overwrites values you changed.

## Testing

- **Unit (Vitest):** pricing and VAT, delivery availability rules, card checks, installments,
  ZATCA TLV encoding, phone/date/price formatting, filter parsing.
- **E2E (Playwright, 4 projects):** the full purchase journey, cart, catalog filters, product page,
  home, 404 and policy pages, keyboard use, and **axe** (WCAG 2.2 AA) on every page and checkout
  step. Edge cases use a test clock (`ENABLE_TEST_CLOCK=1`, E2E only) and seeded fixtures: after the
  cut-off, a full slot, a blackout day. One test checks that no request ever contains the card number.

## Lighthouse (mobile, median of 3 runs, local production build)

| Page               | Performance | Accessibility | Best practices | SEO                          |
| ------------------ | ----------- | ------------- | -------------- | ---------------------------- |
| Home `/ar` · `/en` | 89 · 87     | 100           | 100            | 100                          |
| Catalog            | 87 · 87     | 100           | 100            | 100                          |
| Product            | 87 · 90     | 100           | 100            | 100                          |
| Checkout           | 96 · 86     | 100           | 100            | 66 (intentionally `noindex`) |

Lab LCP is still 3–4s under simulated slow 4G; it is the main thing to improve next.

## Product images

Product images are 4:5 WebP + AVIF files in `public/images/products/`, made by `pnpm images`.
To use real photos, put them in `scripts/images/source/` named `<product-slug>-<n>.jpg`
(e.g. `crimson-classic-1.jpg`), add the photographer to `scripts/images/credits.json`,
then run `pnpm images --force`.

`/styleguide` (design system page) works in `pnpm dev`. In a production build it returns 404
unless `ENABLE_STYLEGUIDE=1` is set at build time; `pnpm test:e2e` sets it for its own build.

## Deploy (Vercel + Neon)

1. Import this repo in Vercel. `vercel.json` sets the framework and the build command.
2. In Neon, create a project and copy the **pooled** connection string.
3. In Vercel → Settings → Environment Variables, add `DATABASE_URL` for Production and Preview.
4. Deploy. Production builds run `pnpm vercel-build`: migrations, then the idempotent seed, then `next build`.
5. Open `/ar` and `/en`, and place a test order.
