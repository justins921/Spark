import {
  boolean,
  date,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const KINDS = ["trip", "tip", "incentive"] as const;
export type Kind = (typeof KINDS)[number];

/**
 * Two sides of the wife ledger:
 *   "owed" — her share of work that isn't captured by an entry's split
 *            (trips from before you started logging, orders you didn't record)
 *   "paid" — cash you actually handed her
 * What's still outstanding is everything owed minus everything paid.
 */
export const LEDGER_KINDS = ["owed", "paid"] as const;
export type LedgerKind = (typeof LEDGER_KINDS)[number];

export const entries = pgTable("entries", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  kind: text("kind").notNull().$type<Kind>(),

  // What the app offered before the trip was accepted.
  estBase: numeric("est_base", { precision: 10, scale: 2 }),
  estTip: numeric("est_tip", { precision: 10, scale: 2 }),

  // What actually paid.
  base: numeric("base", { precision: 10, scale: 2 }).notNull().default("0"),
  tip: numeric("tip", { precision: 10, scale: 2 }).notNull().default("0"),

  wifeAlong: boolean("wife_along").notNull().default(false),
  wifePaidOverride: numeric("wife_paid_override", { precision: 10, scale: 2 }),

  tripNumber: text("trip_number"),
  orders: integer("orders"),
  completedTime: text("completed_time"),

  orderNumber: text("order_number"),
  deliveredDate: date("delivered_date"),

  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),

  // Set only on rows created by `npm run seed`, so the seed can be re-run
  // without duplicating anything or overwriting edits made in the app.
  // Null for everything you add yourself.
  seedKey: text("seed_key").unique(),
});

export const wifeLedger = pgTable("wife_ledger", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  kind: text("kind").notNull().$type<LedgerKind>().default("paid"),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes").notNull().default(""),
  seedKey: text("seed_key").unique(),
});

// Single-row table. Always id = 1.
export const settings = pgTable("settings", {
  id: integer("id").primaryKey().default(1),
  weeklyGoal: numeric("weekly_goal", { precision: 10, scale: 2 })
    .notNull()
    .default("500"),
});

export type Entry = typeof entries.$inferSelect;
export type NewEntry = typeof entries.$inferInsert;
export type WifeLedgerRow = typeof wifeLedger.$inferSelect;
export type NewWifeLedgerRow = typeof wifeLedger.$inferInsert;
