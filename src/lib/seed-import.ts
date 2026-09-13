import "server-only";
import { db } from "@/db";
import { entries, wifeLedger } from "@/db/schema";
import { SEED_ENTRIES, SEED_LEDGER } from "./seed-data";

export type SeedResult = { entries: number; ledger: number };

/**
 * Load the seed history. Every row carries a unique `seed_key`, so this is
 * safe to run more than once — a second run inserts nothing and can't
 * duplicate or overwrite anything you've entered yourself.
 */
export async function importSeedHistory(): Promise<SeedResult> {
  const insertedEntries = await db
    .insert(entries)
    .values(SEED_ENTRIES)
    .onConflictDoNothing({ target: entries.seedKey })
    .returning({ id: entries.id });

  const insertedLedger = await db
    .insert(wifeLedger)
    .values(SEED_LEDGER)
    .onConflictDoNothing({ target: wifeLedger.seedKey })
    .returning({ id: wifeLedger.id });

  return { entries: insertedEntries.length, ledger: insertedLedger.length };
}
