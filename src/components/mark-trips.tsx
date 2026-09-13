"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveWifeFlags } from "@/app/actions";
import type { EntryView } from "@/lib/calc";
import { money } from "@/lib/money";
import { wifePaidFor } from "@/lib/calc";
import { formatDay, formatShort } from "@/lib/week";

function SaveBar({ count, share }: { count: number; share: number }) {
  const { pending } = useFormStatus();
  return (
    <div className="fixed inset-x-0 bottom-[calc(3rem+env(safe-area-inset-bottom))] z-30 bg-gradient-to-t from-ink from-60% to-transparent px-4 pt-10 pb-3 sm:bottom-20 sm:pt-6">
      <div className="mx-auto max-w-lg sm:max-w-xl">
        <button
          type="submit"
          disabled={pending || count === 0}
          className="w-full rounded-xl bg-accent py-3.5 text-base font-semibold text-ink shadow-lg shadow-black/40 active:opacity-90 disabled:bg-panel-2 disabled:text-muted disabled:shadow-none"
        >
          {pending
            ? "Saving…"
            : count === 0
              ? `Her share ${money(share)}`
              : `Save ${count} change${count === 1 ? "" : "s"} · her share ${money(share)}`}
        </button>
      </div>
    </div>
  );
}

/**
 * Tap rows to mark the ones she was along for, then save once. Toggling is
 * local until you save, so marking thirty trips is thirty taps and one
 * round-trip rather than thirty.
 */
export function MarkTrips({ entries }: { entries: EntryView[] }) {
  const initial = useMemo(
    () => new Set(entries.filter((e) => e.wifeAlong).map((e) => e.id)),
    [entries],
  );
  const [on, setOn] = useState<Set<number>>(initial);

  const toggle = (id: number) =>
    setOn((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const turnedOn = [...on].filter((id) => !initial.has(id));
  const turnedOff = [...initial].filter((id) => !on.has(id));
  const changeCount = turnedOn.length + turnedOff.length;

  const share = entries.reduce(
    (sum, e) => (on.has(e.id) ? sum + wifePaidFor(e.basis, true, null) : sum),
    0,
  );

  // Group by day, newest first — the order the app already uses.
  const days: { date: string; rows: EntryView[] }[] = [];
  for (const e of entries) {
    const last = days[days.length - 1];
    if (last && last.date === e.date) last.rows.push(e);
    else days.push({ date: e.date, rows: [e] });
  }

  return (
    <form action={saveWifeFlags} className="pb-8 sm:pb-16">
      {turnedOn.map((id) => (
        <input key={`on${id}`} type="hidden" name="on" value={id} />
      ))}
      {turnedOff.map((id) => (
        <input key={`off${id}`} type="hidden" name="off" value={id} />
      ))}

      <div className="space-y-3">
        {days.map((day) => {
          const dayShare = day.rows.reduce(
            (s, e) => (on.has(e.id) ? s + wifePaidFor(e.basis, true, null) : s),
            0,
          );
          return (
            <section
              key={day.date}
              className="overflow-hidden rounded-2xl border border-line bg-panel"
            >
              <div className="flex items-baseline justify-between gap-2 border-b border-line bg-panel-2 px-4 py-2">
                <h2 className="text-sm font-semibold">{formatDay(day.date)}</h2>
                {dayShare > 0 && (
                  <p className="text-xs tabular text-pink-300">
                    {money(dayShare)} hers
                  </p>
                )}
              </div>
              <ul className="divide-y divide-line">
                {day.rows.map((e) => {
                  const marked = on.has(e.id);
                  const detail =
                    e.kind === "tip"
                      ? [
                          e.orderNumber ? `#${e.orderNumber}` : null,
                          e.deliveredDate
                            ? `del ${formatShort(e.deliveredDate)}`
                            : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")
                      : [
                          e.tripNumber ? `#${e.tripNumber}` : null,
                          e.orders
                            ? `${e.orders} order${e.orders > 1 ? "s" : ""}`
                            : null,
                          e.completedTime,
                        ]
                          .filter(Boolean)
                          .join(" · ");
                  return (
                    <li key={e.id}>
                      <button
                        type="button"
                        onClick={() => toggle(e.id)}
                        aria-pressed={marked}
                        className={`flex w-full items-center gap-3 px-3 py-3 text-left xs:px-4 ${
                          marked ? "bg-pink-400/10" : "active:bg-panel-2"
                        }`}
                      >
                        <span
                          aria-hidden
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                            marked
                              ? "border-pink-400 bg-pink-400 text-ink"
                              : "border-line text-transparent"
                          }`}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                          >
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium">
                            {e.kind === "tip" ? "Tip" : "Trip"}
                            <span className="ml-2 font-normal text-muted tabular">
                              {money(e.total)}
                            </span>
                            {e.estTotal !== null && (
                              <span className="ml-2 font-normal text-muted tabular">
                                · est {money(e.estTotal)}
                              </span>
                            )}
                          </span>
                          {detail && (
                            <span className="mt-0.5 block truncate text-xs text-muted tabular">
                              {detail}
                            </span>
                          )}
                        </span>

                        <span
                          className={`shrink-0 text-sm tabular ${marked ? "text-pink-300" : "text-transparent"}`}
                        >
                          {money(wifePaidFor(e.basis, true, null))}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      <SaveBar count={changeCount} share={share} />
    </form>
  );
}
