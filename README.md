# قُرمُزي (Qurmuzi)

A **demo** online flower shop for the Saudi market (Arabic RTL + English).
No real orders, no real payments. See `CLAUDE.md` for the full spec and `ROADMAP.md` for the plan.

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
| `pnpm test:e2e`                     | Playwright: desktop + 360px mobile × ar + en                                        |
| `pnpm db:generate`                  | Generate a migration from `src/lib/db/schema.ts`                                    |
| `pnpm db:migrate`                   | Apply migrations (PGlite locally, Neon if `DATABASE_URL` is set)                    |
| `pnpm db:seed`                      | Seed dummy data (idempotent)                                                        |
| `pnpm images`                       | Build product images (real photos from `scripts/images/source/`, else placeholders) |

`/styleguide` (design system page) works in `pnpm dev`. In a production build it returns 404
unless `ENABLE_STYLEGUIDE=1` is set at build time; `pnpm test:e2e` sets it for its own build.

Run `pnpm exec playwright install chromium` once before the first E2E run,
or set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to an existing Chromium binary.

## Database

`src/lib/db/client.ts` exports one `db`:

- `DATABASE_URL` set → Neon over WebSockets (`drizzle-orm/neon-serverless`, supports transactions).
- Not set → PGlite, stored in `.pglite/` (git-ignored). PGlite never runs on Vercel.

PGlite allows one process at a time, so stop `pnpm dev` before running `db:migrate` or `db:seed`.

## Product images

Product images are 4:5 WebP + AVIF files in `public/images/products/`, made by `pnpm images`.
To use real photos, put them in `scripts/images/source/` named `<product-slug>-<n>.jpg`
(e.g. `crimson-classic-1.jpg`), add the photographer to `scripts/images/credits.json`,
then run `pnpm images --force`.

## Deploy (Vercel + Neon)

1. Import this repo in Vercel. `vercel.json` sets the framework and the build command.
2. In Neon, create a project and copy the **pooled** connection string.
3. In Vercel → Settings → Environment Variables, add `DATABASE_URL` for Production and Preview.
4. Deploy. Production builds run `pnpm vercel-build`: migrations, then the idempotent seed, then `next build`.
5. Open `/ar` and `/en`.
