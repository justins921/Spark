/**
 * Prints the seed as plain SQL, generated from the same CSV parsing the
 * seed script uses so the two can't drift. Regenerate with:
 *   npx tsx scripts/seed-sql.ts > data/seed.sql
 * Paste the output into Neon's SQL editor if you'd rather not run Node.
 */
import { buildSeedRows } from "./seed-rows";

const q = (v: string | number | boolean | null) => {
  if (v === null) return "NULL";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return String(v);
  return `'${v.replace(/'/g, "''")}'`;
};

const { entryRows, ledgerRows } = buildSeedRows();

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
