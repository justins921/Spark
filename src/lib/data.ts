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

export async function getWeeklyGoal(): Promise<number> {
  const rows = await db.select().from(settings).where(eq(settings.id, 1));
  return rows[0] ? num(rows[0].weeklyGoal) : DEFAULT_WEEKLY_GOAL;
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

/** Everything she has earned to date, minus everything actually handed over. */
export async function getOutstanding(): Promise<number> {
  const [allEntries, ledger] = await Promise.all([
    getAllEntries(),
    getAllLedger(),
  ]);
  const owed =
    allEntries.reduce((s, e) => s + e.wifePaid, 0) + sumKind(ledger, "owed");
  return owed - sumKind(ledger, "paid");
}
