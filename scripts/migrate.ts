/**
 * `pnpm db:migrate` — applies the SQL migrations in `drizzle/` with the same
 * driver the app uses (Neon over WebSockets when DATABASE_URL is set,
 * PGlite otherwise).
 */
import { config } from "dotenv";

config({ path: [".env.local", ".env"], quiet: true });

async function main() {
  const migrationsFolder = "drizzle";
  if (process.env.DATABASE_URL) {
    const { drizzle } = await import("drizzle-orm/neon-serverless");
    const { migrate } = await import("drizzle-orm/neon-serverless/migrator");
    const { neonConfig, Pool } = await import("@neondatabase/serverless");
    const ws = (await import("ws")).default;
    neonConfig.webSocketConstructor = ws;
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    await migrate(drizzle({ client: pool }), { migrationsFolder });
    await pool.end();
  } else {
    const { PGlite } = await import("@electric-sql/pglite");
    const { drizzle } = await import("drizzle-orm/pglite");
    const { migrate } = await import("drizzle-orm/pglite/migrator");
    const { PGLITE_DATA_DIR } = await import("../src/lib/db/config");
    const client = new PGlite(PGLITE_DATA_DIR);
    await migrate(drizzle({ client }), { migrationsFolder });
    await client.close();
  }
  console.log("Migrations applied.");
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
