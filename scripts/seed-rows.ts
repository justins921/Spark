import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Kind, LedgerKind } from "../src/db/schema";
import { parseCsv } from "./csv";

const SEED_YEAR = 2026;

/**
 * Tip rows carry their order number and delivery date inside the note, e.g.
 *   "Tip — order 200015425067806, delivered 9/9"
 * Pull those into their own columns. The note then says nothing the row
 * doesn't, so it's cleared.
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

/** The seed rows, built from the CSVs. No database involved. */
export function buildSeedRows() {
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

  // Cash already handed over, so these land on the "paid" side of the ledger.
  // What she earned for that work isn't captured by any entry; add an "owed"
  // row on /wife if you want the balance to reflect it.
  const ledgerRows = read("seed-wife-payments.csv").map((r, i) => ({
    seedKey: `seed-wife-payments#${i + 1}`,
    date: r.date,
    kind: "paid" as LedgerKind,
    amount: money(r.amount),
    notes: r.notes ?? "",
  }));

  return { entryRows, ledgerRows };
}
