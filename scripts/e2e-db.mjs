// `pnpm e2e:db` — fresh PGlite database for E2E: migrate, seed and add the edge-case fixtures.
// Runs before the E2E build (see playwright.config.ts), so every run starts from the same state.
import { execSync } from "node:child_process";
import { rmSync } from "node:fs";

const dir = process.env.PGLITE_DATA_DIR || ".pglite-e2e";
rmSync(dir, { recursive: true, force: true });
const env = {
  ...process.env,
  PGLITE_DATA_DIR: dir,
  SEED_E2E_FIXTURES: "1",
  DATABASE_URL: "",
};
execSync("pnpm db:migrate", { stdio: "inherit", env });
execSync("pnpm db:seed", { stdio: "inherit", env });
