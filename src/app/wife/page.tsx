import {
  addLedgerEntry,
  deleteLedgerEntry,
  logout,
  settleUp,
  updateGoal,
} from "@/app/actions";
import { ConfirmButton } from "@/components/confirm-button";
import { LedgerForm } from "@/components/ledger-form";
import { Card, Empty, Shell } from "@/components/shell";
import { sumKind } from "@/lib/calc";
import { getAllEntries, getAllLedger, getWeeklyGoal } from "@/lib/data";
import { money, round2 } from "@/lib/money";
import { formatDate, todayISO } from "@/lib/week";

export const dynamic = "force-dynamic";

const inputClass =
  "w-full rounded-xl border border-line bg-panel-2 px-3 py-3 text-base text-text placeholder:text-muted/60 focus:border-accent focus:outline-none";

export default async function WifePage() {
  const [entries, ledger, weeklyGoal] = await Promise.all([
    getAllEntries(),
    getAllLedger(),
    getWeeklyGoal(),
  ]);

  const fromEntries = entries.reduce((s, e) => s + e.wifePaid, 0);
  const adjustments = sumKind(ledger, "owed");
  const owed = fromEntries + adjustments;
  const paid = sumKind(ledger, "paid");
  const outstanding = round2(owed - paid);
  const settled = outstanding === 0;
  const ahead = outstanding < 0;

  return (
    <Shell title="Wife" subtitle="What she's earned, what you've paid">
      <Card className="mb-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          {settled ? "All square" : ahead ? "Paid ahead" : "Still owe her"}
        </p>
        <p
          className={`mt-1 text-4xl font-bold tabular ${
            settled ? "text-muted" : ahead ? "text-good" : "text-pink-300"
          }`}
        >
          {money(Math.abs(outstanding))}
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3 text-center text-sm tabular">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted">
              Earned to date
            </p>
            <p className="mt-0.5 text-lg font-semibold text-pink-300">
              {money(owed)}
            </p>
            <p className="text-[11px] text-muted">
              {money(fromEntries)} splits
              {adjustments > 0 && ` + ${money(adjustments)} untracked`}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted">
              Paid to date
            </p>
            <p className="mt-0.5 text-lg font-semibold text-good">
              {money(paid)}
            </p>
            <p className="text-[11px] text-muted">
              {ledger.filter((r) => r.kind === "paid").length} payments
            </p>
          </div>
        </div>

        {outstanding > 0 && (
          <form action={settleUp} className="mt-3">
            <ConfirmButton
              message={`Record a ${money(outstanding)} payment dated today?`}
              className="w-full rounded-xl bg-good py-3 text-base font-semibold text-ink active:opacity-90"
            >
              Settle up — pay {money(outstanding)}
            </ConfirmButton>
          </form>
        )}
      </Card>

      <Card className="mb-3">
        <h2 className="mb-3 text-sm font-semibold">Log to the ledger</h2>
        <LedgerForm action={addLedgerEntry} today={todayISO()} />
      </Card>

      <h2 className="mb-2 px-1 text-sm font-semibold">
        Ledger ({ledger.length})
      </h2>
      {ledger.length === 0 ? (
        <Empty>Nothing logged yet.</Empty>
      ) : (
        <ul className="mb-3 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-panel">
          {ledger.map((row) => (
            <li key={row.id} className="flex items-center gap-3 px-4 py-3">
              <span
                className={`shrink-0 rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                  row.kind === "paid"
                    ? "bg-good/15 text-good"
                    : "bg-pink-400/15 text-pink-300"
                }`}
              >
                {row.kind}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium tabular">
                  {formatDate(row.date)}
                </p>
                {row.notes && (
                  <p className="truncate text-xs text-muted">{row.notes}</p>
                )}
              </div>
              <p
                className={`shrink-0 text-base font-semibold tabular ${
                  row.kind === "paid" ? "text-good" : "text-pink-300"
                }`}
              >
                {money(row.amount)}
              </p>
              <form action={deleteLedgerEntry}>
                <input type="hidden" name="id" value={row.id} />
                <ConfirmButton
                  message={`Delete this ${money(row.amount)} ${row.kind} row?`}
                  aria-label="Delete ledger row"
                  className="rounded-lg border border-line px-2.5 py-1.5 text-xs text-bad active:bg-panel-2"
                >
                  Delete
                </ConfirmButton>
              </form>
            </li>
          ))}
        </ul>
      )}

      <Card className="mb-3">
        <h2 className="mb-3 text-sm font-semibold">Settings</h2>
        <form action={updateGoal} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">
              Weekly net goal
            </span>
            <input
              type="text"
              inputMode="decimal"
              name="weeklyGoal"
              defaultValue={weeklyGoal.toFixed(2)}
              className={inputClass}
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-xl border border-line py-3 text-sm font-semibold active:bg-panel-2"
          >
            Save goal
          </button>
        </form>
      </Card>

      <form action={logout}>
        <button
          type="submit"
          className="w-full rounded-xl border border-line py-3 text-sm font-medium text-muted active:bg-panel-2"
        >
          Log out
        </button>
      </form>
    </Shell>
  );
}
