import { config } from "dotenv";

config({ path: [".env.local", ".env"], quiet: true });

async function main() {
  const { db } = await import("../src/lib/db/client");
  // Seed data arrives in M2. For now, just prove the connection works.
  await db.execute("select 1");
  console.log("Seed: nothing to seed yet (M0).");
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
