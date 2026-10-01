import { Alexandria, IBM_Plex_Sans_Arabic, Unbounded } from "next/font/google";

export const displayArabic = Alexandria({
  subsets: ["arabic", "latin"],
  variable: "--font-alexandria",
  display: "swap",
});

export const displayLatin = Unbounded({
  subsets: ["latin"],
  variable: "--font-unbounded",
  display: "swap",
});

export const body = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-plex-arabic",
  display: "swap",
});

export const fontVariables = [
  displayArabic.variable,
  displayLatin.variable,
  body.variable,
].join(" ");
