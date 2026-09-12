import { scriptDb } from "./db";
import { migrate as migrateNeon } from "drizzle-orm/neon-http/migrator";
import { migrate as migratePg } from "drizzle-orm/node-postgres/migrator";
import { isNeonUrl } from "../src/db/index";

async function main() {
  const db = scriptDb();
  const opts = { migrationsFolder: "./drizzle" };
  if (isNeonUrl(process.env.DATABASE_URL!)) {
    await migrateNeon(db as never, opts);
  } else {
    await migratePg(db as never, opts);
  }
  console.log("Migrations applied.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
