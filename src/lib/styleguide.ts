/**
 * /styleguide is a dev-only page. It is on in development, and in a production
 * build only when ENABLE_STYLEGUIDE=1 (set in CI so E2E can screenshot it).
 * On Vercel the variable is unset, so the page returns 404.
 */
export function isStyleguideEnabled(
  env: Partial<Record<"NODE_ENV" | "ENABLE_STYLEGUIDE", string>> = process.env,
): boolean {
  return env.NODE_ENV !== "production" || env.ENABLE_STYLEGUIDE === "1";
}
