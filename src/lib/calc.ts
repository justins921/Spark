import type { Entry, LedgerKind, WifeLedgerRow } from "@/db/schema";
import { num, numOrNull, round2 } from "./money";
import { weekOf } from "./week";

/** An entry with its money parsed and its derived numbers worked out. */
export type EntryView = {
  id: number;
  date: string;
  kind: Entry["kind"];
  estBase: number | null;
  estTip: number | null;
  base: number;
  tip: number;
  total: number;
  /** The estimated total (est base + est tip), when one was recorded. */
  estTotal: number | null;
  /** What her half is worked out from — the estimate if there is one. */
  basis: number;
  wifeAlong: boolean;
  wifePaidOverride: number | null;
  wifePaid: number;
  tripNumber: string | null;
  orders: number | null;
  completedTime: string | null;
  orderNumber: string | null;
  deliveredDate: string | null;
  notes: string;
};

/**
 * Her half comes off the estimate you accepted, not the payout. A tip that
 * lands above or below what was offered is yours either way — you eat it or
 * you keep it. Entries with no estimate recorded fall back to what actually
 * paid, since that's the only figure available.
 */
export function basisFor(
  total: number,
  estTotal: number | null,
): number {
  return estTotal ?? total;
}

/** wife_paid_override if set, else half the basis when she rode along, else 0. */
export function wifePaidFor(
  basis: number,
  wifeAlong: boolean,
  override: number | null,
): number {
  if (override !== null) return override;
  return wifeAlong ? basis / 2 : 0;
}

/** The estimated total, or null when neither estimate field was filled in. */
export function estTotalFor(
  estBase: number | null,
  estTip: number | null,
): number | null {
  if (estBase === null && estTip === null) return null;
  return (estBase ?? 0) + (estTip ?? 0);
}

export function toEntryView(e: Entry): EntryView {
  const base = num(e.base);
  const tip = num(e.tip);
  const total = base + tip;
  const override = numOrNull(e.wifePaidOverride);
  const estTotal = estTotalFor(numOrNull(e.estBase), numOrNull(e.estTip));
  const basis = basisFor(total, estTotal);
  return {
    id: e.id,
    date: e.date,
    kind: e.kind,
    estBase: numOrNull(e.estBase),
    estTip: numOrNull(e.estTip),
    base,
    tip,
    total,
    estTotal,
    basis,
    wifeAlong: e.wifeAlong,
    wifePaidOverride: override,
    wifePaid: wifePaidFor(basis, e.wifeAlong, override),
    tripNumber: e.tripNumber,
    orders: e.orders,
    completedTime: e.completedTime,
    orderNumber: e.orderNumber,
    deliveredDate: e.deliveredDate,
    notes: e.notes,
  };
}

export type LedgerView = {
  id: number;
  date: string;
  kind: LedgerKind;
  amount: number;
  notes: string;
};

export function toLedgerView(row: WifeLedgerRow): LedgerView {
  return {
    id: row.id,
    date: row.date,
    kind: row.kind,
    amount: num(row.amount),
    notes: row.notes,
  };
}

export function sumKind(rows: LedgerView[], kind: LedgerKind): number {
  return rows.reduce((s, r) => (r.kind === kind ? s + r.amount : s), 0);
}

export type WeekSummary = {
  weekOf: string;
  entryCount: number;
  wifeEntryCount: number;
  gross: number;
  tips: number;
  /** Her share of this week's entries (the halves and overrides). */
  owedFromEntries: number;
  /** Her share of work no entry captured, logged by hand. */
  owedAdjustments: number;
  /** Everything she earned this week, paid or not. */
  owed: number;
  /** Cash actually handed over this week. */
  paid: number;
  /** What you keep: gross minus her share, whether or not you've paid it. */
  net: number;
  vsGoal: number;
};

/**
 * Net is an accrual: her share comes out the moment it is earned, and paying
 * her later just settles that debt. Subtracting payments as well would take
 * the same money out twice.
 */
export function summarize(
  entries: EntryView[],
  ledger: LedgerView[],
  weeklyGoal: number,
  week?: string,
): WeekSummary {
  const gross = entries.reduce((s, e) => s + e.total, 0);
  const tips = entries.reduce((s, e) => s + e.tip, 0);
  const owedFromEntries = entries.reduce((s, e) => s + e.wifePaid, 0);
  const owedAdjustments = sumKind(ledger, "owed");
  const owed = owedFromEntries + owedAdjustments;
  const net = gross - owed;
  return {
    weekOf: week ?? (entries[0] ? weekOf(entries[0].date) : ""),
    entryCount: entries.length,
    wifeEntryCount: entries.filter((e) => e.wifeAlong).length,
    gross,
    tips,
    owedFromEntries,
    owedAdjustments,
    owed,
    paid: sumKind(ledger, "paid"),
    net,
    // Measured off the net as it is displayed, so the net and the gap against
    // the goal always add back up on screen.
    vsGoal: round2(net) - weeklyGoal,
  };
}

/** Group entries by day, newest day first, each day carrying its own subtotals. */
export type DayGroup = {
  date: string;
  entries: EntryView[];
  gross: number;
  /** Her share of the day's entries. */
  owed: number;
  net: number;
};

export function groupByDay(entries: EntryView[]): DayGroup[] {
  const byDate = new Map<string, EntryView[]>();
  for (const e of entries) {
    const list = byDate.get(e.date);
    if (list) list.push(e);
    else byDate.set(e.date, [e]);
  }
  return [...byDate.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([date, list]) => {
      const gross = list.reduce((s, e) => s + e.total, 0);
      const owed = list.reduce((s, e) => s + e.wifePaid, 0);
      return { date, entries: list, gross, owed, net: gross - owed };
    });
}

/**
 * Running net through the week, oldest day first, so mid-week you can see
 * whether you are on pace. Payments don't appear here — they settle a debt
 * already taken out of net, they aren't a fresh cost.
 */
export function runningNet(
  days: DayGroup[],
  owedByDate: Map<string, number>,
): { date: string; net: number; cumulative: number }[] {
  const oldestFirst = [...days].sort((a, b) => (a.date < b.date ? -1 : 1));
  let cumulative = 0;
  return oldestFirst.map((d) => {
    const net = d.net - (owedByDate.get(d.date) ?? 0);
    cumulative += net;
    return { date: d.date, net, cumulative };
  });
}
