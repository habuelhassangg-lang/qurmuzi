// Vercel runs `vercel-build` instead of `build` when it exists.
// Production deploys migrate and seed Neon first (seed is idempotent), then build.
// Preview deploys skip the database step so an unmerged migration never touches production data.
import { execSync } from "node:child_process";

const run = (command) => execSync(command, { stdio: "inherit" });

if (process.env.VERCEL_ENV === "production") {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set for production deploys.");
  }
  run("pnpm db:migrate");
  run("pnpm db:seed");
}
run("pnpm build");
