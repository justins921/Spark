import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { isNeonUrl } from "../src/db/index";

type ScriptDb = ReturnType<typeof drizzleNeon>;

/** Same driver choice the app makes, for the CLI scripts. */
export function scriptDb(): ScriptDb {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Run `vercel env pull .env.local` first.",
    );
  }
  return isNeonUrl(url)
    ? drizzleNeon(neon(url))
    : (drizzlePg(url) as unknown as ScriptDb);
}
