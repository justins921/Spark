import { EntryRow } from "./entry-row";
import type { DayGroup, LedgerView } from "@/lib/calc";
import { money } from "@/lib/money";
import { formatDay } from "@/lib/week";

/**
 * Entries grouped by day, newest first. Hand-logged "she earned this" rows
 * count toward the day's subtotal so the header matches the running-net line.
 * Payments don't — they settle a debt already taken out of net.
 */
export function DayList({
  days,
  ledger,
}: {
  days: DayGroup[];
  ledger: LedgerView[];
}) {
  const owedByDate = new Map<string, number>();
  for (const row of ledger) {
    if (row.kind !== "owed") continue;
    owedByDate.set(row.date, (owedByDate.get(row.date) ?? 0) + row.amount);
  }

  return (
    <div className="space-y-3">
      {days.map((day) => {
        const extraOwed = owedByDate.get(day.date) ?? 0;
        const net = day.net - extraOwed;
        return (
          <section
            key={day.date}
            className="overflow-hidden rounded-2xl border border-line bg-panel"
          >
            <div className="flex items-baseline justify-between gap-2 border-b border-line bg-panel-2 px-4 py-2">
              <h2 className="text-sm font-semibold">{formatDay(day.date)}</h2>
              <p className="text-xs tabular text-muted">
                {money(day.gross)} gross
                {(day.owed > 0 || extraOwed > 0) && ` · ${money(net)} net`}
              </p>
            </div>

            {extraOwed > 0 && (
              <p className="border-b border-line bg-panel-2/50 px-4 py-1.5 text-xs tabular text-pink-300">
                −{money(extraOwed)} she earned on untracked work
              </p>
            )}

            <ul className="divide-y divide-line">
              {day.entries.map((entry) => (
                <li key={entry.id}>
                  <EntryRow entry={entry} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
