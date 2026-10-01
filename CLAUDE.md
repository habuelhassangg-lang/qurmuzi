# CLAUDE.md — قُرمُزي (Qurmuzi)

> Single source of truth for this project. Read this file fully before every task.
> If a request conflicts with this file, point out the conflict and ask before proceeding.

## 0. Current Scope (read first)

**MVP goal:** a complete, deployed purchase journey in Arabic and English. A visitor lands on the home page, picks a bouquet, adds it to the cart, checks out as a guest, and sees the success page and invoice. Deployed on Vercel + Neon.

`ROADMAP.md` sorts every feature into three tiers. Follow them strictly:

| Tier                                     | What you do                                                                                                                                                              |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 🟢 **Must build now** (milestones M0–M5) | Build, test, and ship it.                                                                                                                                                |
| 🟡 **Design for later** (L1–L6)          | Do **not** build it. Only add the small hooks marked 🪝 inside the Must milestones (nullable columns, stubs, slots). No UI and no extra dependencies for these features. |
| ⚪ **Idea backlog**                      | Ignore it. It must not influence code, schema or dependencies.                                                                                                           |

- Work only on the milestone you were asked to do. If a task needs something from 🟡 or ⚪, stop and ask.
- Sections below describe the **full vision**. Where a section covers 🟡 work, it is marked _(Later)_. Read it for context, but do not implement it during the MVP.

## 1. Project Overview

- **Brand:** قُرمُزي (Qurmuzi) — an online flower shop. Name = "crimson".
- **Nature:** A fully **dummy / demo** project for learning and testing. No real payments, no real orders.
- **Market:** Saudi Arabia 🇸🇦 (Riyadh, Jeddah, Dammam to start).
- **Languages:** Arabic (primary, RTL) + English (secondary). See section 7 for locale codes.
- **Goals:** Production-quality code, **marketing-ready**, animation-rich "reels-style" UI, with a fast, frictionless shopping UX.
- **Hard constraint:** Everything must be **free** with no credit card or paid plan. Never add a paid service or a package with a paid license without asking.
- **Demo safety:** the deployed site shows a persistent "demo, no real orders or payments" notice. Mock payment forms never send or store card data (see section 7).

## 2. Tech Stack

| Layer              | Choice                                                                            | When       |
| ------------------ | --------------------------------------------------------------------------------- | ---------- |
| Framework          | Next.js (latest, App Router) + TypeScript (strict)                                | MVP        |
| Package manager    | pnpm                                                                              | MVP        |
| Styling            | Tailwind CSS v4 + CSS variables (design tokens)                                   | MVP        |
| UI components      | shadcn/ui (customized to brand tokens)                                            | MVP        |
| i18n               | next-intl (`ar` default, `en`), full RTL support                                  | MVP        |
| Database           | PostgreSQL — **PGlite** locally (no install), **Neon** (free) in production       | MVP        |
| ORM                | Drizzle ORM + drizzle-kit migrations                                              | MVP        |
| Validation         | Zod (shared between client and server)                                            | MVP        |
| Forms              | react-hook-form + zod resolver                                                    | MVP        |
| Client state       | Zustand (cart, UI), persisted where it makes sense                                | MVP        |
| Animation          | GSAP + ScrollTrigger (lazy-loaded), Motion (component animations)                 | MVP        |
| Testing            | Vitest (unit), Playwright (E2E) + `@axe-core/playwright`, Lighthouse checks       | MVP        |
| CI                 | GitHub Actions (lint, typecheck, unit, E2E)                                       | MVP        |
| Hosting            | Vercel Hobby (non-commercial use is fine — this is a demo)                        | MVP        |
| Media              | Images in `/public`, pre-optimized to WebP/AVIF. Stock media from Pexels.         | MVP        |
| Smooth scroll      | Lenis (high-motion pages only)                                                    | Later (L1) |
| Auth               | Better Auth (email + password; guest checkout always allowed)                     | Later (L3) |
| Email              | React Email templates; **Mailpit** locally, **Resend** (free tier) in production  | Later (L3) |
| Analytics          | Google Tag Manager → GA4, Meta Pixel, Snap Pixel, TikTok Pixel; PostHog           | Later (L5) |
| Monitoring         | Sentry (free tier)                                                                | Later (L6) |
| Optional animation | React Three Fiber (3D), Matter.js (bouquet builder physics), Lottie (small icons) | Backlog    |

Do not install a "Later" or "Backlog" package during the MVP.

### Framework notes

- Next.js 16: request interception lives in `src/proxy.ts` (formerly `middleware.ts`). Read `AGENTS.md` and the docs in `node_modules/next/dist/docs/` before using a Next.js API you are unsure about.
- `shadcn` CLI needs `ui.shadcn.com`. If the network blocks it, add components by hand from the shadcn source and keep `components.json` accurate.

### Database client

- One `db` export in `lib/db/client.ts`. If `DATABASE_URL` is set, it uses Neon; otherwise it uses PGlite (data dir in `.pglite/`, which is git-ignored).
- The production driver **must support interactive transactions**, because capacity reservation relies on them. Use the Neon serverless driver over WebSockets (`drizzle-orm/neon-serverless`) or a standard Postgres driver. Do not use `neon-http`.
- PGlite never runs on Vercel.

## 3. Commands

```bash
pnpm dev            # start dev server
pnpm build          # production build
pnpm lint           # eslint
pnpm format         # prettier --write
pnpm format:check   # prettier --check (CI)
pnpm typecheck      # next typegen && tsc --noEmit
pnpm test           # vitest
pnpm test:e2e       # playwright (desktop + 360px mobile, ar + en); builds against a fresh .pglite-e2e
pnpm e2e:db         # recreate the E2E database (.pglite-e2e) with edge-case fixtures
pnpm db:generate    # drizzle-kit generate
pnpm db:migrate     # apply migrations (same driver as the app: Neon or PGlite)
pnpm db:seed        # seed dummy data (idempotent; tops up 30 days of capacity)
pnpm images         # crop sources to 4:5 (or make placeholders), export WebP/AVIF
pnpm vercel-build   # Vercel: migrate + seed Neon on production deploys, then build
pnpm email:dev      # react-email preview                               (Later, L3)
```

Keep this list updated whenever scripts change.

## 4. Project Structure

```
src/
  app/[locale]/          # routes (ar, en)
    (shop)/              # home, catalog, product, cart, checkout          — MVP
    (account)/           # orders, addresses, saved occasions               — Later (L3)
    (marketing)/         # seasonal landing pages, about                    — Later (L5)
    admin/               # admin dashboard                                  — Later (L4)
    styleguide/          # internal design system page (dev only)           — MVP
  components/
    ui/                  # shadcn primitives (brand-styled)
    layout/              # header, footer, demo notice, providers
    home/                # hero, HeroMedia slot, occasion cards, budget shortcuts
    shop/                # product card, cart, checkout steps...
    motion/              # reusable animation components (Reveal, TextReveal, ColorFlood...)
    marketing/           # banners, popups, countdowns                      — Later (L5)
  lib/
    db/                  # drizzle schema, client, queries
    pricing/             # calculateTotals() — single source for all money math
    payments/            # mock payment methods behind one interface
    events/              # domain events (orderCreated) — no-op listeners in MVP
    analytics/           # track() stub + typed event names (no vendors in MVP)
    validation/          # zod schemas
    utils/               # currency, dates (hijri), phone formatting
  emails/                # react-email templates                            — Later (L3)
  messages/              # ar.json, en.json
scripts/                 # seed, image pipeline
tests/e2e/
```

Do not create folders for "Later" areas until their milestone starts.

## 5. Brand & Design System

### Colors (define as CSS variables + Tailwind theme tokens, never hard-code)

| Token           | Value     | Use                                   |
| --------------- | --------- | ------------------------------------- |
| `--crimson-700` | `#7A1426` | pressed / dark sections               |
| `--crimson-600` | `#9E1B32` | **primary** — buttons, links, accents |
| `--crimson-500` | `#B8283F` | hover                                 |
| `--crimson-50`  | `#FBEEF0` | soft backgrounds, badges              |
| `--cream`       | `#FBF8F4` | page background                       |
| `--ink`         | `#1F2A24` | body text                             |
| `--sage`        | `#8FA68E` | secondary accent (stems & leaves)     |
| `--muted`       | `#6B7280` | secondary text                        |

Rule: the **flowers bring the color**; the interface stays calm around them. Big sections may flood to full crimson on scroll.

Contrast note: `--sage` and `--muted` must not be used for small text on `--cream` unless they pass WCAG AA. Check them in `/styleguide`.

### Typography

- Arabic display + logo: **Alexandria**. English display: **Unbounded**.
- Body (both languages): **IBM Plex Sans Arabic** (it includes Latin glyphs).
- Max two families per language. Load with `next/font`.
- The temporary logo is the word "قُرمُزي" set in Alexandria. The petal-shaped damma is a custom SVG _(Later, L1)_, so it does not add a font.

### Layout rules

- Spacing scale: multiples of 4px. Radius: `12px` cards, `9999px` buttons/pills.
- Product images: **4:5** everywhere, same background and lighting. The `pnpm images` script crops and exports them.
- Mobile-first. Every component must look right at 360px width.
- Every new component must be added to `/styleguide`. `/styleguide` returns 404 in production.

### Voice & copy — "اللغة البيضاء"

Neutral, warm Arabic understood across the Gulf. No heavy dialect, no stiff formal Arabic. A light Saudi touch is allowed only in hero/welcome moments.

| ✅ Use                       | ❌ Avoid                     |
| ---------------------------- | ---------------------------- |
| اطلب الآن ويوصل اليوم        | اطلب دحين                    |
| اختر مناسبتك                 | يرجى التكرم باختيار المناسبة |
| أضف لمستك بكرت إهداء         | ضيف كارت                     |
| تم استلام طلبك 🌹            | تمت عملية الشراء بنجاح       |
| حيّاك في قُرمُزي (hero only) | —                            |

All user-facing strings live in `messages/*.json` — never hard-code text in components.

## 6. Animation Rules ("Wow where it tells the story, fast where they buy")

| Area                                | Level                                                           |
| ----------------------------------- | --------------------------------------------------------------- |
| Home, seasonal landing pages, About | 🔥 High: scroll-driven, pinning, text reveals, color floods, 3D |
| Product page, Bouquet Builder       | ✨ Medium: playful but quick                                    |
| Catalog, cart                       | ⚡ Light: hover, layout transitions                             |
| Checkout                            | 🧘 Near zero — then a celebration (falling petals) on success   |

**MVP motion set:** `Reveal`, `TextReveal`, `ColorFlood`, falling petals on the success page. Nothing else.

Signature moments _(Later, L1 — except where noted)_:

- Hero: crimson flower blooming on scroll (image sequence or scrubbed video), background shifts cream → crimson. _MVP: static hero image + `ColorFlood`, with a `HeroMedia` slot for the bloom._
- "وش المناسبة؟" word-by-word text reveal → stacking occasion cards. _MVP: `TextReveal` + a grid of cards._
- Horizontal-scroll seasonal collection, marquee of reviews.
- Shared-element transition (View Transitions API) from product card to product page. _MVP hook: a stable `view-transition-name` on product images._
- Add-to-cart: flower flies into the bag icon.

Hard rules (always apply):

- Never block interaction; animations in the purchase path ≤ 300ms.
- Animate only `transform` and `opacity`. Lazy-load heavy animations when near the viewport.
- Respect `prefers-reduced-motion` — provide a calm fallback for every animation.
- Mobile gets lighter versions (3D → short video, reduced parallax).
- Real text must exist in the DOM (animations reveal it) for SEO and accessibility.
- Always clean up GSAP with a `gsap.context()` revert (see `useLazyGsap` in `components/motion/gsap.ts`, which also lazy-loads GSAP near the viewport). Put reusable effects in `components/motion/`.

## 7. Saudi Market Requirements

### Locales, numbers and dates

- Route segments are `/ar` and `/en`. `hreflang` values are `ar-SA` and `en`.
- **Watch out:** `Intl` with `ar-SA` defaults to the **Hijri calendar** and **Arabic-Indic digits**. Always pass `calendar` explicitly: `gregory` for Gregorian dates, `islamic-umalqura` for Hijri dates.
- **Digits:** use Latin digits (`numberingSystem: 'latn'`) for prices, phone numbers, order numbers and dates in both languages, for consistency and readability. This also applies to copy, e.g. "اطلب قبل 2 ظهرًا ويوصل اليوم".
- All formatting goes through `lib/utils`. Never call `Intl` directly in components.

### Rules

- **Currency:** SAR (ر.س). Prices displayed **VAT-inclusive (15%)**; invoice shows the VAT breakdown, a dummy VAT number and a mock ZATCA-style QR (TLV-encoded, base64).
- **Payments (all mocked, with realistic UI):** mada, Apple Pay, STC Pay, Tabby, Tamara (BNPL, split in 4), Cash on Delivery.
  - All methods implement one interface in `lib/payments`.
  - Card fields are validated client-side only (Luhn, expiry) and are **never sent to the server or stored**. Prefill a test card.
  - Never collect a real OTP, password or bank login.
- **Phone:** `+966 5X XXX XXXX` format + validation. Stored normalized as `+9665XXXXXXXX`.
- **Address:** city → district (حي) + optional **Saudi National Address** short code.
- **Weekend:** Friday–Saturday; delivery slots configured accordingly.
- **Dates:** show Hijri alongside Gregorian where dates matter (delivery date, seasonal pages).
- **Occasions:** Founding Day (Feb 22), National Day (Sep 23), Ramadan, Eid al-Fitr, Eid al-Adha, new baby (مواليد — hospital arrangements), graduation, weddings & ملكة, birthdays, get well, apology, love.
- **Privacy:** policy aligned with the Saudi Personal Data Protection Law (PDPL). MVP ships a short version; the full version is Later (L6).

## 8. Flower-Shop Domain Rules

- **Perishable stock:** capacity per day and per delivery slot, not a simple stock count. Capacity is **reserved atomically inside a DB transaction** when the order is created. The client never decides availability.
- **Delivery zones:** per city/district, each with a fee and available slots.
- **Same-day cut-off** (configurable, e.g. order before 2 PM), computed **on the server in `Asia/Riyadh`**, never from the browser clock. Blackout dates are in the MVP; peak-day rules are Later (L4).
- **Order statuses:** `confirmed → preparing → photo_sent → out_for_delivery → delivered` (+ `cancelled`). The full enum and an `order_status_history` table exist from M2. Only `confirmed` is used in the MVP.
- **Gift options:** recipient ≠ buyer, gift card message, hide price from recipient, anonymous sender, "surprise — don't call the recipient".
- **Photo before dispatch** of the actual bouquet (mocked in admin) _(Later, L4)_.
- **Substitution policy:** similar flower if one is unavailable. Shown on the product page and the policy page.
- **Product options:** sizes (عادي / كبير / فاخر) and add-ons (chocolate, vase, balloon, teddy).
- **Operational config** (cut-off hour, zones, fees, slots, capacity, blackout dates) lives in **DB tables**, not code constants, so the admin can manage it later.

## 9. UX Rules

- Delivery promise visible from the first screen ("اطلب قبل 2 ظهرًا ويوصل اليوم").
- Shop by **occasion** and **budget** first, flower type second.
- **Guest checkout** always. In the MVP it is the only path. Account creation after the order is Later (L3).
- Checkout = 3 steps: (1) recipient & delivery, (2) gift card, (3) payment. Order summary always visible.
- Sticky add-to-cart on mobile. Large tap targets (≥ 44px).
- Proper RTL: mirrored icons/arrows/order, not just translated text. Use logical CSS properties (`ms-`, `me-`, `ps-`, `pe-`).
- Every page has loading (skeletons), empty and error states. Friendly 404 with suggestions.
- Accessibility: WCAG AA contrast, alt text, full keyboard support, visible focus states.
- Catalog filters live in the URL search params, so a filtered view can be shared.

## 10. Marketing-Ready Requirements

**In the MVP:**

- **SEO:** Next.js Metadata API on every page, `sitemap.ts`, `robots.ts`, canonical URLs, `hreflang` (`ar-SA`, `en`). Target queries like "توصيل ورد الرياض", "ورد مواليد جدة".
- **Structured data (JSON-LD):** `Product`, `Offer`, `BreadcrumbList`, `Organization`.
- **Tracking hook:** a `track()` stub in `lib/analytics` with typed event names: `view_item`, `add_to_cart`, `begin_checkout`, `add_payment_info`, `purchase`. It is called in the right places but sends nothing. It already checks a consent state, which defaults to "denied".
- **Schema hooks:** `utm_first`, `utm_last`, `coupon_code`, `discount_halalas` on orders (nullable).
- **Non-intrusive marketing:** max one announcement bar (in the MVP, it is the demo notice); **no fake urgency or fake scarcity**; never interrupt checkout with upsells.

**Later (L2, L5):**

- JSON-LD: `AggregateRating` (with real reviews only), `FAQPage`. Also serve `/llms.txt`.
- **OG images:** generated per product and page with `next/og`.
- **Tracking:** `track()` → GTM dataLayer + PostHog, gated by a **cookie consent** banner.
- **UTM capture:** store first-touch and last-touch UTM params and attach them to the order.
- **Features:** coupons (%, fixed, first order, expiry, min spend), newsletter signup (+ discount), abandoned-cart email, seasonal landing pages with countdowns, bundles and "frequently bought together", reviews, honest social proof.
- **Popup:** once only, after 30s or exit intent.
- **Admin marketing panel:** manage coupons, banners and seasonal pages without code.
- Blog (MDX + `Article` schema) and referral program are in the Idea backlog.

## 11. Performance Budget

- Lighthouse (mobile): Performance ≥ 85, Accessibility ≥ 95, SEO ≥ 95, Best Practices ≥ 95.
- LCP < 2.5s, CLS < 0.1, INP < 200ms.
- Use Server Components by default; client components only when interactivity is needed.
- Images pre-optimized (WebP/AVIF) to stay within free image-optimization limits.
- The hero LCP element is a static, pre-sized image, never an animation.

## 12. Code Conventions

- TypeScript strict; no `any`. Zod schemas are the source of truth for input types.
- Server Actions for mutations, always validated with Zod on the server.
- Money stored as **integers in halalas** (1 SAR = 100 halalas). Format only at display time.
- **All money math goes through `calculateTotals()`** in `lib/pricing`. The server always re-prices the order; never trust prices from the client. The cart stores product/variant/add-on IDs, not prices.
- Dates stored in UTC; displayed in `Asia/Riyadh`.
- Small, focused components. No inline magic values — use tokens and constants.
- Never commit `.env*` files. Keep `.env.example` updated.
- Rate-limit login, signup and coupon endpoints _(when they exist, L3/L5)_.

## 13. Workflow

1. Start every milestone in **Plan Mode**; get the plan approved before writing code.
2. One milestone at a time, following `ROADMAP.md`. A milestone is done only when its **Done when** condition is met.
3. After each feature: `pnpm lint && pnpm typecheck && pnpm test`, check the UI with Playwright (desktop + 360px mobile, ar + en), then commit. CI must stay green.
4. Commit messages: Conventional Commits (`feat:`, `fix:`, `chore:`...).
5. New ideas that come up mid-task go into the ⚪ Idea backlog in `ROADMAP.md`. They are not built.
6. Update `ROADMAP.md` checkboxes and this file when a decision changes, and add a line to the decisions log below.

## 14. Decisions Log

| Decision                                                                                                                                                       | Why                                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| MVP = full guest purchase journey, deployed                                                                                                                    | A working end-to-end flow first; wow and growth features come after.                                                                            |
| Deploy to Vercel + Neon in M0, not at the end                                                                                                                  | PGlite cannot run on Vercel; surface driver/env issues early.                                                                                   |
| Driver must support transactions                                                                                                                               | Capacity reservation must be atomic.                                                                                                            |
| Alexandria for both Arabic display and logo; Unbounded for English                                                                                             | Keeps the "max two families per language" rule.                                                                                                 |
| Latin digits everywhere, explicit calendars in `Intl`                                                                                                          | `ar-SA` defaults to Hijri + Arabic-Indic digits; avoid silent bugs.                                                                             |
| 15 seed products in MVP, 30 later                                                                                                                              | Image sourcing is the bottleneck; 15 is enough to test filters.                                                                                 |
| Persistent demo notice; card data never leaves the browser                                                                                                     | A realistic payment UI on a public URL must not look or act like a real store.                                                                  |
| PGlite locally (not Docker), Neon in production                                                                                                                | Zero local install; one `db` client switches on `DATABASE_URL`, so Docker can be added later with no code change.                               |
| `cn()` lives in `lib/utils/cn.ts`                                                                                                                              | `lib/utils/` is the folder for all helpers (section 4).                                                                                         |
| Supporting neutrals `--surface`, `--line`, `--surface-muted`, `--danger`                                                                                       | The brand table has no white, border or error color; these are UI chrome only.                                                                  |
| Tailwind `muted` = quiet surface, `muted-foreground` = brand `--muted`                                                                                         | shadcn uses `bg-muted` for surfaces and `text-muted-foreground` for secondary text.                                                             |
| `--sage` is decorative only (2.48:1 on cream)                                                                                                                  | Fails WCAG AA for text; `/styleguide` shows every pair's ratio.                                                                                 |
| Toast = Sonner                                                                                                                                                 | shadcn replaced its Toast component with Sonner.                                                                                                |
| Sheet sides are logical (`start`/`end`)                                                                                                                        | The cart drawer opens from the reading-end edge in both directions.                                                                             |
| All button sizes ≥ 44px; no `sm`/`xs` sizes                                                                                                                    | Tap-target rule in section 9.                                                                                                                   |
| `/styleguide` is on in a production build only with `ENABLE_STYLEGUIDE=1`                                                                                      | E2E screenshots it in CI; Vercel leaves it unset, so it returns 404.                                                                            |
| GSAP is allowed                                                                                                                                                | It is free for all use (including plugins), so it meets the "free" constraint.                                                                  |
| The build never queries the database                                                                                                                           | `next build` renders in several processes and PGlite allows one. Product pages use on-demand ISR (`revalidate = 3600`), the sitemap is dynamic. |
| Production deploys run migrate + seed (`vercel.json` → `pnpm vercel-build`)                                                                                    | No local setup needed to prepare Neon; previews skip it so unmerged migrations never touch production.                                          |
| Placeholder product images until real photos are added                                                                                                         | Pexels is blocked in the dev sandbox; `pnpm images` uses real photos from `scripts/images/source/` when present.                                |
| Budget filters use the cheapest size                                                                                                                           | "From" price is what shoppers compare; buckets are under 200 / 200–400 / 400–700 / 700+ SAR.                                                    |
| Product pages have no `loading.tsx`                                                                                                                            | Streaming a skeleton sends 200 before `notFound()`; unknown products must return a real 404.                                                    |
| All `[locale]` pages are on-demand ISR (`generateStaticParams` returns `[]`); the catalog is `force-dynamic`                                                   | Keeps the build free of database access; the catalog reads `searchParams`, which ISR rendering cannot.                                          |
| GSAP is lazy-loaded near the viewport (`useLazyGsap`), not via `@gsap/react`                                                                                   | GSAP + ScrollTrigger (~117KB) blocked the hero paint; mobile Performance went from 73 to 90 on `/ar`.                                           |
| Reveal animations use `opacity`, never `visibility`                                                                                                            | Hidden links can't be reached with Tab; opacity-0 links stay focusable and scroll into view.                                                    |
| Only Alexandria is preloaded; Plex and Unbounded are not                                                                                                       | Nine preloaded font files competed with the LCP image; fallbacks are size-adjusted, so CLS stays ~0.                                            |
| Featured products come from the `featured_products` setting                                                                                                    | Config lives in the DB (section 8); the seed adds missing settings on every run without overwriting.                                            |
| Cart stores `{productId, variantId, addOnIds, quantity}` only; prices come from `quoteCartAction`                                                              | The client never holds prices; lines the server no longer recognises are dropped.                                                               |
| `createOrder` re-prices, recomputes availability in Riyadh time, then reserves capacity with `UPDATE … WHERE reserved < capacity` inside the order transaction | One conditional update is atomic: concurrent orders can never overbook a slot.                                                                  |
| Same-day slots need `same_day_prep_hours` (2) before they start; config lives in `settings`                                                                    | "Order before 2 PM" still needs prep time; the admin can change both later.                                                                     |
| Order pages use the random order UUID in the URL, not the order number                                                                                         | Order numbers are guessable; the invoice shows names and addresses.                                                                             |
| Card fields live in component state with no `name`, never in the form data or the server action                                                                | Card data never leaves the browser (section 7); an E2E test checks request bodies.                                                              |
| Test clock: `ENABLE_TEST_CLOCK=1` lets a cookie pin "now" (E2E only)                                                                                           | Cut-off rules can be tested deterministically; Vercel never sets the flag.                                                                      |
| E2E uses its own PGlite dir (`.pglite-e2e`), recreated each run                                                                                                | Playwright stops the server abruptly and PGlite can be left unreadable; the dev database stays safe.                                            |
| `fieldset { min-width: 0 }` globally                                                                                                                           | Fieldsets default to `min-content` and let wide children widen the whole page on mobile.                                                        |
| ZATCA QR = TLV (seller, VAT no., timestamp, total, VAT) → base64 → `qrcode` SVG                                                                                | Matches the e-invoice QR format; values are demo data.                                                                                          |
