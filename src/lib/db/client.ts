import { PGlite } from "@electric-sql/pglite";
import { neonConfig, Pool } from "@neondatabase/serverless";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import ws from "ws";
import * as schema from "./schema";

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

export const PGLITE_DATA_DIR = ".pglite";

function createDb(): Db {
  const url = process.env.DATABASE_URL;

  if (url) {
    // WebSocket driver (not neon-http) so interactive transactions work.
    neonConfig.webSocketConstructor = ws;
    return drizzleNeon({ client: new Pool({ connectionString: url }), schema });
  }

  if (process.env.VERCEL) {
    throw new Error(
      "DATABASE_URL is required on Vercel; PGlite never runs there.",
    );
  }

  return drizzlePglite({ client: new PGlite(PGLITE_DATA_DIR), schema });
}

// Reuse one client across hot reloads in development.
const globalForDb = globalThis as unknown as { db?: Db };

export const db: Db = globalForDb.db ?? createDb();

if (process.env.NODE_ENV !== "production") globalForDb.db = db;
