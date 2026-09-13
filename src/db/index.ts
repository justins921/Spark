import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

/**
 * Vercel's Neon integration names the connection string differently depending
 * on how the store was created — DATABASE_URL, STORAGE_URL and POSTGRES_URL
 * are all in the wild, and a store created with a custom prefix produces
 * something else again. Check the known names first, then fall back to any
 * variable whose value is actually a Postgres URL, so the name stops mattering.
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

const POSTGRES_URL = /^postgres(ql)?:\/\/\S+$/i;

/** The connection string, or null when nothing in the environment looks like one. */
export function findConnectionString(
  env: NodeJS.ProcessEnv = process.env,
): string | null {
  for (const key of CONNECTION_ENV_KEYS) {
    const value = env[key]?.trim();
    if (value) return value;
  }
  // Any other variable holding a Postgres URL, whatever it's called. Prefer a
  // pooled one; *_UNPOOLED / *_NON_POOLING are the direct connection.
  const candidates = Object.entries(env)
    .filter(([, v]) => typeof v === "string" && POSTGRES_URL.test(v.trim()))
    .map(([k, v]) => [k, (v as string).trim()] as const)
    .sort(([a], [b]) => Number(isUnpooled(a)) - Number(isUnpooled(b)));
  return candidates[0]?.[1] ?? null;
}

function isUnpooled(key: string): boolean {
  return /UNPOOLED|NON_POOLING/i.test(key);
}

/** Names only — never values — so a failure says what the environment holds. */
export function databaseishEnvNames(
  env: NodeJS.ProcessEnv = process.env,
): string[] {
  return Object.keys(env)
    .filter((k) => /URL|POSTGRES|DATABASE|NEON|\bPG/i.test(k))
    .sort();
}

export function missingConnectionMessage(
  env: NodeJS.ProcessEnv = process.env,
): string {
  const seen = databaseishEnvNames(env);
  return (
    "No database connection string found. Checked " +
    `${CONNECTION_ENV_KEYS.join(", ")}, and every other variable for a postgres:// value. ` +
    (seen.length
      ? `Database-ish variables present: ${seen.join(", ")}. `
      : "No database-ish variables are set at all. ") +
    "Connect a Neon database to THIS project from the Vercel Storage tab " +
    "(Storage → your database → Connect Project), then redeploy."
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
