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
    <Shell
      title="This week"
      subtitle={`${formatWeekRange(monday)} · today ${formatDate(today)}`}
      action={
        // On phones the add button is the sticky bar at the bottom; once
        // there's a pointer (or a short landscape viewport) it lives up here
        // instead, so it can't crowd the tab bar or the content.
        <Link
          href="/add"
          className="hidden shrink-0 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-ink active:opacity-90 sm:block"
        >
          + Add entry
        </Link>
      }
    >
      <Card className="mb-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          Net
        </p>
        <p
          className={`mt-1 text-4xl font-bold tabular xs:text-5xl ${onPace ? "text-good" : "text-text"}`}
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

        {/* Three across once there's room; stacked label/value rows below
            that, so a four-figure week can't clip. */}
        <dl className="mt-4 grid grid-cols-1 gap-1 border-t border-line pt-3 xs:grid-cols-3 xs:gap-2 xs:text-center">
          {[
            { label: "Gross", value: money(s.gross), tone: "" },
            { label: "Tips", value: money(s.tips), tone: "" },
            { label: "Her share", value: money(s.owed), tone: "text-pink-300" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex min-w-0 items-baseline justify-between gap-2 xs:block"
            >
              <dt className="text-[11px] uppercase tracking-wide text-muted">
                {stat.label}
              </dt>
              <dd
                className={`text-base font-semibold tabular xs:mt-0.5 sm:text-lg ${stat.tone}`}
              >
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </Card>

      {/* The balance, so mid-week you know whether you're behind with her. */}
      <Link href="/wife" className="mb-3 block active:opacity-80">
        <Card>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                {stillOwes < 0 ? "Paid ahead" : "Still owe her"}
              </p>
              <p
                className={`mt-0.5 text-2xl font-bold tabular ${stillOwes > 0 ? "text-pink-300" : "text-good"}`}
              >
                {money(Math.abs(stillOwes))}
              </p>
            </div>
            <div className="min-w-0 text-xs tabular text-muted sm:text-right">
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
              <li
                key={p.date}
                className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-baseline gap-x-2 xs:gap-x-3"
              >
                <span className="truncate text-muted">{formatDay(p.date)}</span>
                <span className="text-muted">{money(p.net)}</span>
                <span className="font-semibold">{money(p.cumulative)}</span>
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
          content shows through the gap. Hidden once the header carries it. */}
      <div className="fixed inset-x-0 bottom-[calc(3rem+env(safe-area-inset-bottom))] z-30 bg-gradient-to-t from-ink from-60% to-transparent px-4 pt-10 pb-3 sm:hidden">
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
