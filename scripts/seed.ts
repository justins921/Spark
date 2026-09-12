import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { entries, settings, wifeLedger, type Kind } from "../src/db/schema";
import { scriptDb } from "./db";
import { parseCsv } from "./csv";

const SEED_YEAR = 2026;

/**
 * Tip rows carry their order number and delivery date inside the note, e.g.
 *   "Tip — order 200015425067806, delivered 9/9"
 * Pull those out into their own columns and leave the note alone.
 */
const TIP_NOTE =
  /^tip\s*[—–-]\s*order\s+(\d+)\s*,\s*delivered\s+(\d{1,2})\/(\d{1,2})$/i;

function parseTipNote(notes: string) {
  const m = notes.trim().match(TIP_NOTE);
  if (!m) return { orderNumber: null, deliveredDate: null, notes };
  const [, order, month, day] = m;
  return {
    orderNumber: order,
    deliveredDate: `${SEED_YEAR}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`,
    // The note said nothing the columns don't now say, so drop it and keep
    // the row clean on screen.
    notes: "",
  };
}

function money(v: string): string {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
}

function optionalInt(v: string): number | null {
  if (!v) return null;
  const n = Number(v);
  return Number.isInteger(n) ? n : null;
}

function nullIfBlank(v: string): string | null {
  return v === "" ? null : v;
}

function read(file: string) {
  return parseCsv(readFileSync(resolve(process.cwd(), "data", file), "utf8"));
}

async function main() {
  const db = scriptDb();

  const entryRows = read("seed-entries.csv").map((r, i) => {
    const kind = (r.kind || "trip") as Kind;
    const raw = r.notes ?? "";
    const { orderNumber, deliveredDate, notes } =
      kind === "tip"
        ? parseTipNote(raw)
        : { orderNumber: null, deliveredDate: null, notes: raw };

    return {
      seedKey: `seed-entries#${i + 1}`,
      date: r.date,
      kind,
      base: money(r.base),
      tip: money(r.tip),
      wifeAlong: r.wife_along?.toUpperCase() === "Y",
      tripNumber: nullIfBlank(r.trip_number ?? ""),
      orders: optionalInt(r.orders ?? ""),
      completedTime: nullIfBlank(r.completed_time ?? ""),
      orderNumber,
      deliveredDate,
      notes,
    };
  });

  // These are cash already handed over, so they land on the "paid" side of
  // the ledger. What she earned for that work isn't captured by any entry;
  // add an "owed" row on /wife if you want the balance to reflect it.
  const paymentRows = read("seed-wife-payments.csv").map((r, i) => ({
    seedKey: `seed-wife-payments#${i + 1}`,
    date: r.date,
    kind: "paid" as const,
    amount: money(r.amount),
    notes: r.notes ?? "",
  }));

  // `seed_key` is unique, so re-running this only ever fills in what is missing.
  // Rows you added or edited in the app are never touched.
  const insertedEntries = await db
    .insert(entries)
    .values(entryRows)
    .onConflictDoNothing({ target: entries.seedKey })
    .returning({ id: entries.id });

  const insertedPayments = await db
    .insert(wifeLedger)
    .values(paymentRows)
    .onConflictDoNothing({ target: wifeLedger.seedKey })
    .returning({ id: wifeLedger.id });

  await db
    .insert(settings)
    .values({ id: 1, weeklyGoal: "500.00" })
    .onConflictDoNothing({ target: settings.id });

  console.log(
    `Seed complete. Entries inserted: ${insertedEntries.length}/${entryRows.length}. ` +
      `Wife payments inserted: ${insertedPayments.length}/${paymentRows.length}.`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
