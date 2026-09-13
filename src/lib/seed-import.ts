import "server-only";
import { and, isNotNull, notInArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { entries, wifeLedger } from "@/db/schema";
import { SEED_ENTRIES, SEED_LEDGER } from "./seed-data";

export type SyncResult = {
  entriesWritten: number;
  ledgerWritten: number;
  removed: number;
};

/** Reference the row Postgres was trying to insert, for the update branch. */
function sqlExcluded(column: string) {
  return sql.raw(`excluded."${column}"`);
}

/**
 * Bring the seeded history in line with the data file.
 *
 * Rows are matched on `seed_key`: existing ones are updated, missing ones
 * inserted, and any seeded row no longer in the file is removed — so
 * placeholders disappear once the real trips replace them. Entries you added
 * yourself have a null `seed_key` and are never touched.
 */
export async function syncSeedHistory(): Promise<SyncResult> {
  const entryKeys = SEED_ENTRIES.map((r) => r.seedKey);
  const ledgerKeys = SEED_LEDGER.map((r) => r.seedKey);

  const written = await db
    .insert(entries)
    .values(SEED_ENTRIES)
    .onConflictDoUpdate({
      target: entries.seedKey,
      set: {
        date: sqlExcluded("date"),
        kind: sqlExcluded("kind"),
        base: sqlExcluded("base"),
        tip: sqlExcluded("tip"),
        wifeAlong: sqlExcluded("wife_along"),
        wifePaidOverride: sqlExcluded("wife_paid_override"),
        tripNumber: sqlExcluded("trip_number"),
        orders: sqlExcluded("orders"),
        completedTime: sqlExcluded("completed_time"),
        orderNumber: sqlExcluded("order_number"),
        deliveredDate: sqlExcluded("delivered_date"),
        notes: sqlExcluded("notes"),
      },
    })
    .returning({ id: entries.id });

  const ledgerWritten = await db
    .insert(wifeLedger)
    .values(SEED_LEDGER)
    .onConflictDoUpdate({
      target: wifeLedger.seedKey,
      set: {
        date: sqlExcluded("date"),
        kind: sqlExcluded("kind"),
        amount: sqlExcluded("amount"),
        notes: sqlExcluded("notes"),
      },
    })
    .returning({ id: wifeLedger.id });

  const goneEntries = await db
    .delete(entries)
    .where(
      and(isNotNull(entries.seedKey), notInArray(entries.seedKey, entryKeys)),
    )
    .returning({ id: entries.id });

  const goneLedger = await db
    .delete(wifeLedger)
    .where(
      and(
        isNotNull(wifeLedger.seedKey),
        notInArray(wifeLedger.seedKey, ledgerKeys),
      ),
    )
    .returning({ id: wifeLedger.id });

  return {
    entriesWritten: written.length,
    ledgerWritten: ledgerWritten.length,
    removed: goneEntries.length + goneLedger.length,
  };
}
