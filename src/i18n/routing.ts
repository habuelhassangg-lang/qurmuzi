import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ar", "en"],
  defaultLocale: "ar",
  // hreflang links come from page metadata (ar-SA / en), not the middleware.
  alternateLinks: false,
});

export type Locale = (typeof routing.locales)[number];

export const localeDirection: Record<Locale, "rtl" | "ltr"> = {
  ar: "rtl",
  en: "ltr",
};
