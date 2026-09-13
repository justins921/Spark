import {
  addLedgerEntry,
  clearSettledWifeFlags,
  deleteLedgerEntry,
  logout,
  settleUp,
  syncHistory,
  updateGoal,
  updateReconciledThrough,
} from "@/app/actions";
import { ConfirmButton } from "@/components/confirm-button";
import { LedgerForm } from "@/components/ledger-form";
import { Card, Empty, Shell } from "@/components/shell";
import { getAllLedger, getBalance, getSettings } from "@/lib/data";
import { money, round2 } from "@/lib/money";
import { formatDate, todayISO } from "@/lib/week";

export const dynamic = "force-dynamic";

const inputClass =
  "w-full rounded-xl border border-line bg-panel-2 px-3 py-3 text-base text-text placeholder:text-muted/60 focus:border-accent focus:outline-none";

export default async function WifePage() {
  const [ledger, balance, { weeklyGoal, reconciledThrough }] =
    await Promise.all([getAllLedger(), getBalance(), getSettings()]);

  const { owedFromEntries: fromEntries, owedAdjustments: adjustments } = balance;
  const { owed, paid } = balance;
  const outstanding = round2(balance.outstanding);
  const settled = outstanding === 0;
  const ahead = outstanding < 0;
  const since = reconciledThrough ? `since ${formatDate(reconciledThrough)}` : null;

  return (
    <Shell
      title="Wife"
      subtitle={
        since
          ? `Square as of ${formatDate(reconciledThrough!)} — counting everything after`
          : "What she's earned, what you've paid"
      }
    >
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
              {since ? "Earned since" : "Earned to date"}
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
              {since ? "Paid since" : "Paid to date"}
            </p>
            <p className="mt-0.5 text-lg font-semibold text-good">
              {money(paid)}
            </p>
            <p className="text-[11px] text-muted">
              {
                ledger.filter(
                  (r) =>
                    r.kind === "paid" &&
                    (!reconciledThrough || r.date > reconciledThrough),
                ).length
              }{" "}
              payments
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
        <h2 className="text-sm font-semibold">Starting point</h2>
        <p className="mt-1 text-sm text-muted">
          {reconciledThrough
            ? `Everything on or before ${formatDate(reconciledThrough)} counts as already settled${
                balance.excludedEntries + balance.excludedLedger > 0
                  ? ` — ${balance.excludedEntries} entr${balance.excludedEntries === 1 ? "y" : "ies"} and ${balance.excludedLedger} ledger row${balance.excludedLedger === 1 ? "" : "s"} left out of the balance`
                  : ""
              }.`
            : "If you and she were square as of some date, set it here. Trips on or before it stop counting toward the balance — useful when you can't remember which early ones she came along for."}
        </p>
        <form action={updateReconciledThrough} className="mt-3 space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">
              Last settled up
            </span>
            <input
              type="date"
              name="reconciledThrough"
              defaultValue={reconciledThrough ?? ""}
              className={inputClass}
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-xl bg-accent py-3 text-base font-semibold text-ink active:opacity-90"
          >
            Save starting point
          </button>
          {reconciledThrough && (
            <button
              type="submit"
              name="clear"
              value="1"
              className="w-full rounded-xl border border-line py-3 text-sm font-medium text-muted active:bg-panel-2"
            >
              Clear — count everything again
            </button>
          )}
        </form>

        {/* Flags before the settled date are guesses whose share is already
            covered by what you paid, so they only distort net. */}
        {reconciledThrough && balance.excludedEntries > 0 && (
          <div className="mt-4 border-t border-line pt-3">
            <p className="text-sm text-muted">
              {balance.excludedEntries} entr
              {balance.excludedEntries === 1 ? "y is" : "ies are"} still marked
              wife-along before this date. Her share of those is already covered
              by what you paid, so leaving them on takes it out of your net
              twice.
            </p>
            <form action={clearSettledWifeFlags} className="mt-3">
              <input type="hidden" name="through" value={reconciledThrough} />
              <ConfirmButton
                message={`Clear the wife-along flag on ${balance.excludedEntries} entr${balance.excludedEntries === 1 ? "y" : "ies"} through ${formatDate(reconciledThrough)}?`}
                className="w-full rounded-xl border border-line py-3 text-sm font-semibold active:bg-panel-2"
              >
                Clear those flags
              </ConfirmButton>
            </form>
          </div>
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
            <li
              key={row.id}
              className="flex flex-wrap items-center gap-2 px-3 py-3 xs:gap-3 xs:px-4"
            >
              <span
                className={`shrink-0 rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                  row.kind === "paid"
                    ? "bg-good/15 text-good"
                    : "bg-pink-400/15 text-pink-300"
                }`}
              >
                {row.kind}
              </span>
              {/* A real min-width here makes the amount and delete wrap to a
                  second line on a very narrow screen instead of squeezing. */}
              <div className="min-w-[6rem] flex-1">
                <p className="text-sm font-medium tabular">
                  {formatDate(row.date)}
                </p>
                {row.notes && (
                  <p className="truncate text-xs text-muted">{row.notes}</p>
                )}
              </div>
              <p
                className={`ml-auto shrink-0 text-base font-semibold tabular ${
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
                  className="shrink-0 rounded-lg border border-line px-2.5 py-2.5 text-xs text-bad active:bg-panel-2"
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

        <div className="mt-4 border-t border-line pt-3">
          <p className="text-sm text-muted">
            Re-apply the recorded history after it&apos;s been corrected. Adds
            what&apos;s new, updates what changed, and drops placeholders that
            have been replaced. Entries you added yourself aren&apos;t touched.
          </p>
          <form action={syncHistory} className="mt-3">
            <ConfirmButton
              message="Re-apply the recorded history? Any edits you made to those rows in the app will be overwritten."
              className="w-full rounded-xl border border-line py-3 text-sm font-semibold active:bg-panel-2"
            >
              Sync history
            </ConfirmButton>
          </form>
        </div>
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
