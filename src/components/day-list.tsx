import { EntryRow } from "./entry-row";
import type { DayGroup, PaymentView } from "@/lib/calc";
import { money } from "@/lib/money";
import { formatDay } from "@/lib/week";

/**
 * Entries grouped by day, newest first. Lump payments made that day are shown
 * in the day's subtotal so the header matches the running-net line.
 */
export function DayList({
  days,
  payments,
}: {
  days: DayGroup[];
  payments: PaymentView[];
}) {
  const paidByDate = new Map<string, number>();
  for (const p of payments) {
    paidByDate.set(p.date, (paidByDate.get(p.date) ?? 0) + p.amount);
  }

  return (
    <div className="space-y-3">
      {days.map((day) => {
        const lump = paidByDate.get(day.date) ?? 0;
        const net = day.net - lump;
        return (
          <section
            key={day.date}
            className="overflow-hidden rounded-2xl border border-line bg-panel"
          >
            <div className="flex items-baseline justify-between gap-2 border-b border-line bg-panel-2 px-4 py-2">
              <h2 className="text-sm font-semibold">{formatDay(day.date)}</h2>
              <p className="text-xs tabular text-muted">
                {money(day.gross)} gross
                {(day.wifePaid > 0 || lump > 0) && ` · ${money(net)} net`}
              </p>
            </div>

            {lump > 0 && (
              <p className="border-b border-line bg-panel-2/50 px-4 py-1.5 text-xs tabular text-pink-300">
                −{money(lump)} paid to wife
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
