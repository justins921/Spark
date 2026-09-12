import "server-only";
import { asc, desc, eq, gte, lte, and } from "drizzle-orm";
import { db } from "@/db";
import { entries, settings, wifePayments } from "@/db/schema";
import { num } from "./money";
import { toEntryView, toPaymentView, type EntryView, type PaymentView } from "./calc";
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

export async function getPaymentsInWeek(monday: string): Promise<PaymentView[]> {
  const rows = await db
    .select()
    .from(wifePayments)
    .where(
      and(
        gte(wifePayments.date, monday),
        lte(wifePayments.date, weekEnd(monday)),
      ),
    )
    .orderBy(desc(wifePayments.date), desc(wifePayments.id));
  return rows.map(toPaymentView);
}

export async function getAllEntries(): Promise<EntryView[]> {
  const rows = await db
    .select()
    .from(entries)
    .orderBy(desc(entries.date), desc(entries.id));
  return rows.map(toEntryView);
}

export async function getAllPayments(): Promise<PaymentView[]> {
  const rows = await db
    .select()
    .from(wifePayments)
    .orderBy(desc(wifePayments.date), desc(wifePayments.id));
  return rows.map(toPaymentView);
}

export async function getEntry(id: number): Promise<EntryView | null> {
  const rows = await db.select().from(entries).where(eq(entries.id, id));
  return rows[0] ? toEntryView(rows[0]) : null;
}

/** Every week that has any activity, most recent first. */
export async function getWeeks(): Promise<string[]> {
  const [allEntries, allPayments] = await Promise.all([
    db.select({ date: entries.date }).from(entries).orderBy(asc(entries.date)),
    db.select({ date: wifePayments.date }).from(wifePayments),
  ]);
  const weeks = new Set<string>();
  for (const r of allEntries) weeks.add(weekOf(r.date));
  for (const r of allPayments) weeks.add(weekOf(r.date));
  return [...weeks].sort((a, b) => (a < b ? 1 : -1));
}
