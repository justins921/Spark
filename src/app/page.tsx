import Link from "next/link";
import { Card, Empty, Shell } from "@/components/shell";
import { DayList } from "@/components/day-list";
import { groupByDay, runningNet, summarize } from "@/lib/calc";
import {
  getEntriesInWeek,
  getPaymentsInWeek,
  getWeeklyGoal,
} from "@/lib/data";
import { money, round2, signedMoney } from "@/lib/money";
import { formatDate, formatDay, formatWeekRange, todayISO, weekOf } from "@/lib/week";

export const dynamic = "force-dynamic";

export default async function ThisWeekPage() {
  const today = todayISO();
  const monday = weekOf(today);

  const [entries, payments, weeklyGoal] = await Promise.all([
    getEntriesInWeek(monday),
    getPaymentsInWeek(monday),
    getWeeklyGoal(),
  ]);

  const s = summarize(entries, payments, weeklyGoal, monday);
  const days = groupByDay(entries);
  const paymentsByDate = new Map<string, number>();
  for (const p of payments) {
    paymentsByDate.set(p.date, (paymentsByDate.get(p.date) ?? 0) + p.amount);
  }
  const pace = runningNet(days, paymentsByDate);
  const onPace = s.vsGoal >= 0;

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
            <p className="text-[11px] uppercase tracking-wide text-muted">Wife</p>
            <p className="mt-0.5 text-lg font-semibold tabular text-pink-300">
              {money(s.paidWife)}
            </p>
          </div>
        </div>
      </Card>

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

      {payments.length > 0 && (
        <Card className="mb-3">
          <div className="flex items-baseline justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Lump payments to wife
            </p>
            <p className="text-sm font-semibold tabular text-pink-300">
              {money(s.wifeFromPayments)}
            </p>
          </div>
          <p className="mt-1 text-xs text-muted">
            {money(s.wifeFromEntries)} more came out of entry splits.
          </p>
        </Card>
      )}

      {days.length === 0 ? (
        <Empty>Nothing logged this week yet.</Empty>
      ) : (
        <DayList days={days} payments={payments} />
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
