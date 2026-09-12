import Link from "next/link";
import { notFound } from "next/navigation";
import { DayList } from "@/components/day-list";
import { Card, Empty, Shell } from "@/components/shell";
import { groupByDay, summarize } from "@/lib/calc";
import { getEntriesInWeek, getLedgerInWeek, getWeeklyGoal } from "@/lib/data";
import { money, round2 } from "@/lib/money";
import { formatDate, formatWeekRange, weekOf } from "@/lib/week";

export const dynamic = "force-dynamic";

export default async function WeekDetailPage({
  params,
}: {
  params: Promise<{ week: string }>;
}) {
  const { week } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(week)) notFound();
  const monday = weekOf(week);

  const [entries, ledger, weeklyGoal] = await Promise.all([
    getEntriesInWeek(monday),
    getLedgerInWeek(monday),
    getWeeklyGoal(),
  ]);

  const s = summarize(entries, ledger, weeklyGoal, monday);
  const days = groupByDay(entries);
  const onPace = round2(s.vsGoal) >= 0;

  return (
    <Shell
      title={formatWeekRange(monday)}
      subtitle={`${s.entryCount} entries · ${s.wifeEntryCount} with wife`}
      action={
        <Link
          href="/weeks"
          className="shrink-0 py-3 pl-3 text-sm font-medium text-accent"
        >
          Back
        </Link>
      }
    >
      <Card className="mb-3">
        <div className="grid grid-cols-1 gap-3 text-sm tabular xs:grid-cols-2">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted">Gross</p>
            <p className="text-lg font-semibold xs:text-xl">{money(s.gross)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted">Tips</p>
            <p className="text-lg font-semibold xs:text-xl">{money(s.tips)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted">
              Her share
            </p>
            <p className="text-lg font-semibold text-pink-300 xs:text-xl">
              {money(s.owed)}
            </p>
            <p className="text-[11px] text-muted">
              {money(s.owedFromEntries)} splits
              {s.owedAdjustments > 0 && ` + ${money(s.owedAdjustments)} untracked`}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted">Net</p>
            <p className="text-lg font-semibold xs:text-xl">{money(s.net)}</p>
            <p className={`text-[11px] ${onPace ? "text-good" : "text-bad"}`}>
              {onPace ? "+" : "−"}
              {money(Math.abs(round2(s.vsGoal)))} vs goal
            </p>
          </div>
        </div>
      </Card>

      {ledger.length > 0 && (
        <Card className="mb-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            Wife ledger this week
          </p>
          <ul className="space-y-1 text-sm tabular">
            {ledger.map((row) => (
              <li key={row.id} className="flex justify-between gap-3">
                <span className="truncate text-muted">
                  {formatDate(row.date)}
                  {row.notes && ` · ${row.notes}`}
                </span>
                <span
                  className={`shrink-0 ${row.kind === "paid" ? "text-good" : "text-pink-300"}`}
                >
                  {row.kind === "paid" ? "paid " : "owed "}
                  {money(row.amount)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {days.length === 0 ? (
        <Empty>No entries in this week.</Empty>
      ) : (
        <DayList days={days} ledger={ledger} />
      )}
    </Shell>
  );
}
