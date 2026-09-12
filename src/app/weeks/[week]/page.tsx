import Link from "next/link";
import { notFound } from "next/navigation";
import { DayList } from "@/components/day-list";
import { Card, Empty, Shell } from "@/components/shell";
import { groupByDay, summarize } from "@/lib/calc";
import {
  getEntriesInWeek,
  getPaymentsInWeek,
  getWeeklyGoal,
} from "@/lib/data";
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

  const [entries, payments, weeklyGoal] = await Promise.all([
    getEntriesInWeek(monday),
    getPaymentsInWeek(monday),
    getWeeklyGoal(),
  ]);

  const s = summarize(entries, payments, weeklyGoal, monday);
  const days = groupByDay(entries);
  const onPace = round2(s.vsGoal) >= 0;

  return (
    <Shell
      title={formatWeekRange(monday)}
      subtitle={`${s.entryCount} entries · ${s.wifeEntryCount} with wife`}
      action={
        <Link href="/weeks" className="text-sm font-medium text-accent">
          Back
        </Link>
      }
    >
      <Card className="mb-3">
        <div className="grid grid-cols-2 gap-3 text-sm tabular">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted">Gross</p>
            <p className="text-xl font-semibold">{money(s.gross)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted">Tips</p>
            <p className="text-xl font-semibold">{money(s.tips)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted">
              Paid wife
            </p>
            <p className="text-xl font-semibold text-pink-300">
              {money(s.paidWife)}
            </p>
            <p className="text-[11px] text-muted">
              {money(s.wifeFromEntries)} splits + {money(s.wifeFromPayments)} lump
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted">Net</p>
            <p className="text-xl font-semibold">{money(s.net)}</p>
            <p className={`text-[11px] ${onPace ? "text-good" : "text-bad"}`}>
              {onPace ? "+" : "−"}
              {money(Math.abs(round2(s.vsGoal)))} vs goal
            </p>
          </div>
        </div>
      </Card>

      {payments.length > 0 && (
        <Card className="mb-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            Lump payments
          </p>
          <ul className="space-y-1 text-sm tabular">
            {payments.map((p) => (
              <li key={p.id} className="flex justify-between gap-3">
                <span className="truncate text-muted">
                  {formatDate(p.date)}
                  {p.notes && ` · ${p.notes}`}
                </span>
                <span className="shrink-0 text-pink-300">{money(p.amount)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {days.length === 0 ? (
        <Empty>No entries in this week.</Empty>
      ) : (
        <DayList days={days} payments={payments} />
      )}
    </Shell>
  );
}
