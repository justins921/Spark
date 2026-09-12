import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

/**
 * Neon's serverless HTTP driver in production (that's what Vercel provisions),
 * and the regular Postgres driver for any other host so a plain local database
 * works too. Built lazily so `next build` doesn't need a live DATABASE_URL.
 */
export function isNeonUrl(url: string): boolean {
  try {
    return /(^|\.)neon\.(tech|build)$/.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

type Db = ReturnType<typeof drizzleNeon<typeof schema>>;

let client: Db | null = null;

function getDb(): Db {
  if (client) return client;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add a Neon database from the Vercel Storage tab, " +
        "then run `vercel env pull .env.local` for local development.",
    );
  }
  client = isNeonUrl(url)
    ? drizzleNeon(neon(url), { schema })
    : (drizzlePg(url, { schema }) as unknown as Db);
  return client;
}

export const db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});

export { schema };
