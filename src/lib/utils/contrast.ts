/** WCAG 2.x contrast helpers, used by /styleguide to check token pairs. */

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) throw new TypeError(`Expected a 6-digit hex color, got ${hex}`);
  const int = Number.parseInt(match[1], 16);
  const r = (int >> 16) & 0xff;
  const g = (int >> 8) & 0xff;
  const b = int & 0xff;
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(foreground: string, background: string): number {
  const [light, dark] = [
    relativeLuminance(foreground),
    relativeLuminance(background),
  ].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}

/** AA thresholds: 4.5 for normal text, 3 for large text (≥ 24px, or ≥ 18.66px bold). */
export function wcagLevel(ratio: number): "AA" | "AA large" | "fail" {
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA large";
  return "fail";
}
