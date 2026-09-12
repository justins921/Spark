import Link from "next/link";
import { Card, Empty, Shell } from "@/components/shell";
import { DayList } from "@/components/day-list";
import { groupByDay, runningNet, summarize, sumKind } from "@/lib/calc";
import {
  getEntriesInWeek,
  getLedgerInWeek,
  getOutstanding,
  getWeeklyGoal,
} from "@/lib/data";
import { money, round2, signedMoney } from "@/lib/money";
import { formatDate, formatDay, formatWeekRange, todayISO, weekOf } from "@/lib/week";

export const dynamic = "force-dynamic";

export default async function ThisWeekPage() {
  const today = todayISO();
  const monday = weekOf(today);

  const [entries, ledger, weeklyGoal, outstanding] = await Promise.all([
    getEntriesInWeek(monday),
    getLedgerInWeek(monday),
    getWeeklyGoal(),
    getOutstanding(),
  ]);

  const s = summarize(entries, ledger, weeklyGoal, monday);
  const days = groupByDay(entries);

  const owedByDate = new Map<string, number>();
  for (const row of ledger) {
    if (row.kind !== "owed") continue;
    owedByDate.set(row.date, (owedByDate.get(row.date) ?? 0) + row.amount);
  }
  const pace = runningNet(days, owedByDate);
  const onPace = round2(s.vsGoal) >= 0;
  const stillOwes = round2(outstanding);

  return (
    <Shell title="This week" subtitle={`${formatWeekRange(monday)} · today ${formatDate(today)}`}>
      <Card className="mb-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          Net
        </p>
        <p
          className={`mt-1 text-5xl font-bold tabular ${onPace ? "text-good" : "text-text"}`}
        >
          {money(s.net)}
        </p>
        <p
          className={`mt-2 text-sm font-medium tabular ${onPace ? "text-good" : "text-bad"}`}
        >
          {onPace
            ? `${signedMoney(s.vsGoal)} over the ${money(weeklyGoal)} goal`
            : `${money(Math.abs(round2(s.vsGoal)))} short of the ${money(weeklyGoal)} goal`}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-3 text-center">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted">Gross</p>
            <p className="mt-0.5 text-lg font-semibold tabular">{money(s.gross)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted">Tips</p>
            <p className="mt-0.5 text-lg font-semibold tabular">{money(s.tips)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted">
              Her share
            </p>
            <p className="mt-0.5 text-lg font-semibold tabular text-pink-300">
              {money(s.owed)}
            </p>
          </div>
        </div>
      </Card>

      {/* The balance, so mid-week you know whether you're behind with her. */}
      <Link href="/wife" className="mb-3 block active:opacity-80">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                {stillOwes < 0 ? "Paid ahead" : "Still owe her"}
              </p>
              <p
                className={`mt-0.5 text-2xl font-bold tabular ${stillOwes > 0 ? "text-pink-300" : "text-good"}`}
              >
                {money(Math.abs(stillOwes))}
              </p>
            </div>
            <div className="text-right text-xs tabular text-muted">
              <p>{money(s.owed)} earned this week</p>
              <p>{money(s.paid)} paid this week</p>
            </div>
          </div>
        </Card>
      </Link>

      {pace.length > 1 && (
        <Card className="mb-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            Running net
          </p>
          <ul className="space-y-1 text-sm tabular">
            {pace.map((p) => (
              <li key={p.date} className="flex justify-between">
                <span className="text-muted">{formatDay(p.date)}</span>
                <span>
                  <span className="text-muted">{money(p.net)}</span>
                  <span className="ml-3 font-semibold">{money(p.cumulative)}</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {days.length === 0 ? (
        <Empty>Nothing logged this week yet.</Empty>
      ) : (
        <DayList days={days} ledger={ledger} />
      )}

      {/* Sits flush on top of the tab bar (3rem tall + safe area) so no
          content shows through the gap. */}
      <div className="fixed inset-x-0 bottom-[calc(3rem+env(safe-area-inset-bottom))] z-30 bg-gradient-to-t from-ink from-60% to-transparent px-4 pt-10 pb-3">
        <div className="mx-auto max-w-lg">
          <Link
            href="/add"
            className="block rounded-xl bg-accent py-3.5 text-center text-base font-semibold text-ink shadow-lg shadow-black/40 active:opacity-90"
          >
            + Add entry
          </Link>
        </div>
      </div>
    </Shell>
  );
}
