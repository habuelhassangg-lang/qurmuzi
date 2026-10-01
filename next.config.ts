import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // PGlite ships WASM and is only used locally; keep it out of the bundle.
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default withNextIntl(nextConfig);
