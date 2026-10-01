/**
 * Brand colors as data, for /styleguide swatches and contrast checks.
 * Must match the CSS variables in src/app/globals.css (a unit test checks this).
 */
export const BRAND_COLORS = {
  "crimson-700": "#7a1426",
  "crimson-600": "#9e1b32",
  "crimson-500": "#b8283f",
  "crimson-50": "#fbeef0",
  cream: "#fbf8f4",
  ink: "#1f2a24",
  sage: "#8fa68e",
  muted: "#6b7280",
} as const;

export type BrandColor = keyof typeof BRAND_COLORS;

/** Text/background pairs the UI actually uses, checked against WCAG AA in /styleguide. */
export const CONTRAST_PAIRS: ReadonlyArray<{ fg: BrandColor; bg: BrandColor }> =
  [
    { fg: "ink", bg: "cream" },
    { fg: "crimson-600", bg: "cream" },
    { fg: "crimson-700", bg: "cream" },
    { fg: "crimson-500", bg: "cream" },
    { fg: "muted", bg: "cream" },
    { fg: "sage", bg: "cream" },
    { fg: "cream", bg: "crimson-600" },
    { fg: "crimson-700", bg: "crimson-50" },
  ];
