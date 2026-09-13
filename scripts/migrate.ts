import { config } from "dotenv";
config({ path: ".env.local" });

import { isNeonUrl } from "../src/db/index";

async function main() {
  // This runs as part of the Vercel build. The very first build can happen
  // before the Neon database is attached, so say so clearly and let the build
  // through rather than failing on a project that isn't wired up yet.
  if (!process.env.DATABASE_URL) {
    console.warn(
      "\n  DATABASE_URL is not set, so no migrations ran.\n" +
        "  Add a Neon database from the Vercel Storage tab, then redeploy.\n",
    );
    return;
  }

  const { scriptDb } = await import("./db");
  const db = scriptDb();
  const opts = { migrationsFolder: "./drizzle" };

  if (isNeonUrl(process.env.DATABASE_URL)) {
    const { migrate } = await import("drizzle-orm/neon-http/migrator");
    await migrate(db as never, opts);
  } else {
    const { migrate } = await import("drizzle-orm/node-postgres/migrator");
    await migrate(db as never, opts);
  }
  console.log("Migrations applied.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
