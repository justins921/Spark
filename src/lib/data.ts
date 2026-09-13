import "server-only";
import { asc, desc, eq, gte, lte, and } from "drizzle-orm";
import { db } from "@/db";
import { entries, settings, wifeLedger } from "@/db/schema";
import { num } from "./money";
import {
  sumKind,
  toEntryView,
  toLedgerView,
  type EntryView,
  type LedgerView,
} from "./calc";
import { weekEnd, weekOf } from "./week";

export const DEFAULT_WEEKLY_GOAL = 500;

export type Settings = {
  weeklyGoal: number;
  /** Everything on or before this date is treated as already settled. */
  reconciledThrough: string | null;
};

export async function getSettings(): Promise<Settings> {
  const rows = await db.select().from(settings).where(eq(settings.id, 1));
  const row = rows[0];
  return {
    weeklyGoal: row ? num(row.weeklyGoal) : DEFAULT_WEEKLY_GOAL,
    reconciledThrough: row?.reconciledThrough ?? null,
  };
}

export async function getWeeklyGoal(): Promise<number> {
  return (await getSettings()).weeklyGoal;
}

/**
 * Drop the wife-along flags on entries up to the settled date. Their share is
 * already represented by what you paid for that period, so leaving guessed
 * flags in place double-counts her against your net.
 */
export async function clearWifeAlongThrough(date: string): Promise<number> {
  const cleared = await db
    .update(entries)
    .set({ wifeAlong: false, wifePaidOverride: null })
    .where(and(eq(entries.wifeAlong, true), lte(entries.date, date)))
    .returning({ id: entries.id });
  return cleared.length;
}

export async function setReconciledThrough(date: string | null): Promise<void> {
  await db
    .insert(settings)
    .values({ id: 1, reconciledThrough: date })
    .onConflictDoUpdate({
      target: settings.id,
      set: { reconciledThrough: date },
    });
}

export async function setWeeklyGoal(goal: number): Promise<void> {
  await db
    .insert(settings)
    .values({ id: 1, weeklyGoal: goal.toFixed(2) })
    .onConflictDoUpdate({
      target: settings.id,
      set: { weeklyGoal: goal.toFixed(2) },
    });
}

export async function getEntriesInWeek(monday: string): Promise<EntryView[]> {
  const rows = await db
    .select()
    .from(entries)
    .where(and(gte(entries.date, monday), lte(entries.date, weekEnd(monday))))
    .orderBy(desc(entries.date), desc(entries.id));
  return rows.map(toEntryView);
}

export async function getLedgerInWeek(monday: string): Promise<LedgerView[]> {
  const rows = await db
    .select()
    .from(wifeLedger)
    .where(
      and(gte(wifeLedger.date, monday), lte(wifeLedger.date, weekEnd(monday))),
    )
    .orderBy(desc(wifeLedger.date), desc(wifeLedger.id));
  return rows.map(toLedgerView);
}

export async function getAllEntries(): Promise<EntryView[]> {
  const rows = await db
    .select()
    .from(entries)
    .orderBy(desc(entries.date), desc(entries.id));
  return rows.map(toEntryView);
}

export async function getAllLedger(): Promise<LedgerView[]> {
  const rows = await db
    .select()
    .from(wifeLedger)
    .orderBy(desc(wifeLedger.date), desc(wifeLedger.id));
  return rows.map(toLedgerView);
}

export async function getEntry(id: number): Promise<EntryView | null> {
  const rows = await db.select().from(entries).where(eq(entries.id, id));
  return rows[0] ? toEntryView(rows[0]) : null;
}

/** Every week that has any activity, most recent first. */
export async function getWeeks(): Promise<string[]> {
  const [allEntries, allPayments] = await Promise.all([
    db.select({ date: entries.date }).from(entries).orderBy(asc(entries.date)),
    db.select({ date: wifeLedger.date }).from(wifeLedger),
  ]);
  const weeks = new Set<string>();
  for (const r of allEntries) weeks.add(weekOf(r.date));
  for (const r of allPayments) weeks.add(weekOf(r.date));
  return [...weeks].sort((a, b) => (a < b ? 1 : -1));
}

export type Balance = {
  owedFromEntries: number;
  owedAdjustments: number;
  owed: number;
  paid: number;
  /** owed − paid. Negative means you're paid ahead. */
  outstanding: number;
  reconciledThrough: string | null;
  /** How many rows the reconciliation date is leaving out. */
  excludedEntries: number;
  excludedLedger: number;
};

/**
 * What she's earned minus what's been handed over, counting only what happened
 * after the date you were last square. Reconciliation touches this balance
 * only — her share still comes out of net for those trips, because she earned
 * it; it's just already been paid for.
 */
export async function getBalance(): Promise<Balance> {
  const [allEntries, ledger, { reconciledThrough }] = await Promise.all([
    getAllEntries(),
    getAllLedger(),
    getSettings(),
  ]);

  const after = (date: string) =>
    reconciledThrough === null || date > reconciledThrough;

  const countedEntries = allEntries.filter((e) => after(e.date));
  const countedLedger = ledger.filter((r) => after(r.date));

  const owedFromEntries = countedEntries.reduce((s, e) => s + e.wifePaid, 0);
  const owedAdjustments = sumKind(countedLedger, "owed");
  const owed = owedFromEntries + owedAdjustments;
  const paid = sumKind(countedLedger, "paid");

  return {
    owedFromEntries,
    owedAdjustments,
    owed,
    paid,
    outstanding: owed - paid,
    reconciledThrough,
    excludedEntries: allEntries.filter(
      (e) => !after(e.date) && e.wifePaid > 0,
    ).length,
    excludedLedger: ledger.length - countedLedger.length,
  };
}

/** Just the number, for the home screen. */
export async function getOutstanding(): Promise<number> {
  return (await getBalance()).outstanding;
}

/** True when nothing has ever been recorded — used to offer the seed import. */
export async function isDatabaseEmpty(): Promise<boolean> {
  const [entryRow, ledgerRow] = await Promise.all([
    db.select({ id: entries.id }).from(entries).limit(1),
    db.select({ id: wifeLedger.id }).from(wifeLedger).limit(1),
  ]);
  return entryRow.length === 0 && ledgerRow.length === 0;
}
