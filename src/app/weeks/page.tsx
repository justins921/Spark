import Link from "next/link";
import { Card, Empty, Shell } from "@/components/shell";
import { summarize, type WeekSummary } from "@/lib/calc";
import { getAllEntries, getAllLedger, getWeeklyGoal } from "@/lib/data";
import { money, round2 } from "@/lib/money";
import { formatShort, weekEnd, weekOf } from "@/lib/week";

export const dynamic = "force-dynamic";

function WeekRow({ week }: { week: WeekSummary }) {
  const vs = round2(week.vsGoal);
  return (
    <Link
      href={`/weeks/${week.weekOf}`}
      className="block px-4 py-3 active:bg-panel-2"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-semibold tabular">
          {formatShort(week.weekOf)}–{formatShort(weekEnd(week.weekOf))}
        </span>
        <span className="text-lg font-bold tabular">{money(week.net)}</span>
      </div>
      <div className="mt-1 flex items-baseline justify-between gap-3 text-xs tabular text-muted">
        <span>
          {week.entryCount} entr{week.entryCount === 1 ? "y" : "ies"}
          {week.wifeEntryCount > 0 && ` · ${week.wifeEntryCount} with wife`}
        </span>
        <span className={vs >= 0 ? "text-good" : "text-bad"}>
          {vs >= 0 ? "+" : "−"}
          {money(Math.abs(vs))} vs goal
        </span>
      </div>
      <p className="mt-1 text-xs tabular text-muted">
        {money(week.gross)} gross · {money(week.tips)} tips ·{" "}
        <span className="text-pink-300">{money(week.owed)} her share</span>
      </p>
    </Link>
  );
}

export default async function WeeksPage() {
  const [entries, ledger, weeklyGoal] = await Promise.all([
    getAllEntries(),
    getAllLedger(),
    getWeeklyGoal(),
  ]);

  const weeks = new Set<string>();
  for (const e of entries) weeks.add(weekOf(e.date));
  for (const row of ledger) weeks.add(weekOf(row.date));

  const rows = [...weeks]
    .sort((a, b) => (a < b ? 1 : -1))
    .map((monday) =>
      summarize(
        entries.filter((e) => weekOf(e.date) === monday),
        ledger.filter((row) => weekOf(row.date) === monday),
        weeklyGoal,
        monday,
      ),
    );

  const lifetime = summarize(entries, ledger, 0);

  return (
    <Shell
      title="Weekly summary"
      subtitle={`${rows.length} week${rows.length === 1 ? "" : "s"} · goal ${money(weeklyGoal)}`}
    >
      {rows.length === 0 ? (
        <Empty>No weeks yet. Add an entry to get started.</Empty>
      ) : (
        <>
          <ul className="mb-3 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-panel">
            {rows.map((week) => (
              <li key={week.weekOf}>
                <WeekRow week={week} />
              </li>
            ))}
          </ul>

          <Card>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Lifetime
            </p>
            <p className="mt-1 text-3xl font-bold tabular">
              {money(lifetime.net)}
              <span className="ml-2 text-sm font-normal text-muted">net</span>
            </p>
            <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1 border-t border-line pt-3 text-sm tabular xs:grid-cols-2">
              <div className="flex justify-between">
                <dt className="text-muted">Gross</dt>
                <dd>{money(lifetime.gross)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Tips</dt>
                <dd>{money(lifetime.tips)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Her share</dt>
                <dd className="text-pink-300">{money(lifetime.owed)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Entries</dt>
                <dd>
                  {lifetime.entryCount}
                  <span className="text-muted"> ({lifetime.wifeEntryCount} w/ wife)</span>
                </dd>
              </div>
            </dl>
          </Card>
        </>
      )}
    </Shell>
  );
}
