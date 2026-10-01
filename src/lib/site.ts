import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

/** Absolute site origin for canonical URLs, sitemaps and JSON-LD. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");

/** hreflang codes per locale (CLAUDE.md section 7). */
export const HREFLANG: Record<Locale, string> = { ar: "ar-SA", en: "en" };

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** `/ar/catalog` style path for a locale; `path` is locale-less and starts with `/` (or is ""). */
export function localePath(locale: Locale, path = ""): string {
  return `/${locale}${path === "/" ? "" : path}`;
}

/** Metadata `alternates` with canonical + hreflang for a locale-less path. */
export function alternatesFor(locale: Locale, path = "") {
  const languages: Record<string, string> = {};
  for (const l of routing.locales)
    languages[HREFLANG[l]] = absoluteUrl(localePath(l, path));
  languages["x-default"] = absoluteUrl(localePath(routing.defaultLocale, path));
  return { canonical: absoluteUrl(localePath(locale, path)), languages };
}
