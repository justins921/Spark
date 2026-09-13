import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

/**
 * Vercel's Neon integration names the connection string differently depending
 * on how the store was created — DATABASE_URL, STORAGE_URL and POSTGRES_URL
 * are all in the wild. Take whichever one is set rather than pinning a name.
 * Pooled URLs come first; the unpooled ones are a fallback.
 */
export const CONNECTION_ENV_KEYS = [
  "DATABASE_URL",
  "STORAGE_URL",
  "POSTGRES_URL",
  "DATABASE_URL_UNPOOLED",
  "STORAGE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
] as const;

/** The connection string, or null when none of the known names is set. */
export function findConnectionString(
  env: NodeJS.ProcessEnv = process.env,
): string | null {
  for (const key of CONNECTION_ENV_KEYS) {
    const value = env[key];
    if (value && value.trim() !== "") return value;
  }
  return null;
}

export function missingConnectionMessage(): string {
  return (
    `No database connection string found. Looked for: ${CONNECTION_ENV_KEYS.join(", ")}. ` +
    "Add a Neon database from the Vercel Storage tab, then redeploy — or run " +
    "`vercel env pull .env.local` for local development."
  );
}

export function isNeonUrl(url: string): boolean {
  try {
    return /(^|\.)neon\.(tech|build)$/.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

type Db = ReturnType<typeof drizzleNeon<typeof schema>>;

let client: Db | null = null;

/**
 * Neon's serverless HTTP driver in production, the regular Postgres driver for
 * any other host so a plain local database works too. Built lazily so
 * `next build` doesn't need a live connection.
 */
function getDb(): Db {
  if (client) return client;
  const url = findConnectionString();
  if (!url) throw new Error(missingConnectionMessage());
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
