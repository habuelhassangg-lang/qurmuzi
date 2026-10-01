import { Alexandria, IBM_Plex_Sans_Arabic, Unbounded } from "next/font/google";

export const displayArabic = Alexandria({
  subsets: ["arabic", "latin"],
  variable: "--font-alexandria",
  display: "swap",
});

// Only the English pages use Unbounded, so it is not preloaded on every page.
export const displayLatin = Unbounded({
  subsets: ["latin"],
  variable: "--font-unbounded",
  display: "swap",
  preload: false,
});

export const body = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-plex-arabic",
  display: "swap",
  // Six files (3 weights × 2 subsets): preloading them all competes with the
  // hero image (LCP). The size-adjusted fallback keeps the swap shift-free.
  preload: false,
});

export const fontVariables = [
  displayArabic.variable,
  displayLatin.variable,
  body.variable,
].join(" ");
