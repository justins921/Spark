import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import {
  findConnectionString,
  isNeonUrl,
  missingConnectionMessage,
} from "../src/db/index";

type ScriptDb = ReturnType<typeof drizzleNeon>;

/** Same driver and same connection-string lookup the app uses. */
export function scriptDb(): ScriptDb {
  const url = findConnectionString();
  if (!url) throw new Error(missingConnectionMessage());
  return isNeonUrl(url)
    ? drizzleNeon(neon(url))
    : (drizzlePg(url) as unknown as ScriptDb);
}
