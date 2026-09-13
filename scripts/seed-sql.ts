/**
 * Prints the seed as plain SQL, built from the same baked seed data the app
 * and `npm run seed` use, so none of the three can drift. Regenerate with:
 *   npm run db:seed:sql > data/seed.sql
 * Paste the output into Neon's SQL editor if you'd rather not run Node.
 */
import { SEED_ENTRIES, SEED_LEDGER } from "../src/lib/seed-data";

const q = (v: string | number | boolean | null) => {
  if (v === null) return "NULL";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return String(v);
  return `'${v.replace(/'/g, "''")}'`;
};

const entryRows = SEED_ENTRIES;
const ledgerRows = SEED_LEDGER;

console.log("-- Spark Tracker seed data. Safe to run more than once:");
console.log("-- every row is keyed on seed_key, so re-running inserts nothing new.");
console.log("-- Run the migrations first (Vercel does this on deploy).\n");

console.log("BEGIN;\n");

for (const r of entryRows) {
  console.log(
    `INSERT INTO entries (seed_key, date, kind, base, tip, wife_along, trip_number, orders, completed_time, order_number, delivered_date, notes)\n` +
      `VALUES (${q(r.seedKey)}, ${q(r.date)}, ${q(r.kind)}, ${q(r.base)}, ${q(r.tip)}, ${q(r.wifeAlong)}, ${q(r.tripNumber)}, ${q(r.orders)}, ${q(r.completedTime)}, ${q(r.orderNumber)}, ${q(r.deliveredDate)}, ${q(r.notes)})\n` +
      `ON CONFLICT (seed_key) DO NOTHING;`,
  );
}
console.log("");
for (const r of ledgerRows) {
  console.log(
    `INSERT INTO wife_ledger (seed_key, date, kind, amount, notes)\n` +
      `VALUES (${q(r.seedKey)}, ${q(r.date)}, ${q(r.kind)}, ${q(r.amount)}, ${q(r.notes)})\n` +
      `ON CONFLICT (seed_key) DO NOTHING;`,
  );
}
console.log("");
console.log(
  "INSERT INTO settings (id, weekly_goal) VALUES (1, '500.00')\nON CONFLICT (id) DO NOTHING;",
);
console.log("\nCOMMIT;");
