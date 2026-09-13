import { entries, settings, wifeLedger } from "../src/db/schema";
import { scriptDb } from "./db";
import { SEED_ENTRIES, SEED_LEDGER } from "../src/lib/seed-data";

async function main() {
  const db = scriptDb();
  const entryRows = SEED_ENTRIES;
  const ledgerRows = SEED_LEDGER;

  // `seed_key` is unique, so re-running this only ever fills in what is
  // missing. Rows you added or edited in the app are never touched.
  const insertedEntries = await db
    .insert(entries)
    .values(entryRows)
    .onConflictDoNothing({ target: entries.seedKey })
    .returning({ id: entries.id });

  const insertedLedger = await db
    .insert(wifeLedger)
    .values(ledgerRows)
    .onConflictDoNothing({ target: wifeLedger.seedKey })
    .returning({ id: wifeLedger.id });

  await db
    .insert(settings)
    .values({ id: 1, weeklyGoal: "500.00" })
    .onConflictDoNothing({ target: settings.id });

  console.log(
    `Seed complete. Entries inserted: ${insertedEntries.length}/${entryRows.length}. ` +
      `Wife ledger rows inserted: ${insertedLedger.length}/${ledgerRows.length}.`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
