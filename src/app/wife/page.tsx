import { addWifePayment, deleteWifePayment, logout, updateGoal } from "@/app/actions";
import { ConfirmButton } from "@/components/confirm-button";
import { Card, Empty, Shell } from "@/components/shell";
import { getAllEntries, getAllPayments, getWeeklyGoal } from "@/lib/data";
import { money } from "@/lib/money";
import { formatDate, todayISO } from "@/lib/week";

export const dynamic = "force-dynamic";

const inputClass =
  "w-full rounded-xl border border-line bg-panel-2 px-3 py-3 text-base text-text placeholder:text-muted/60 focus:border-accent focus:outline-none";

export default async function WifePage() {
  const [entries, payments, weeklyGoal] = await Promise.all([
    getAllEntries(),
    getAllPayments(),
    getWeeklyGoal(),
  ]);

  const fromEntries = entries.reduce((s, e) => s + e.wifePaid, 0);
  const fromPayments = payments.reduce((s, p) => s + p.amount, 0);
  const total = fromEntries + fromPayments;

  return (
    <Shell title="Wife" subtitle="Everything she's owed to date">
      <Card className="mb-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          Total owed to date
        </p>
        <p className="mt-1 text-4xl font-bold tabular text-pink-300">
          {money(total)}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3 text-center text-sm tabular">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted">
              Entry splits
            </p>
            <p className="mt-0.5 font-semibold">{money(fromEntries)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted">
              Lump payments
            </p>
            <p className="mt-0.5 font-semibold">{money(fromPayments)}</p>
          </div>
        </div>
      </Card>

      <Card className="mb-3">
        <h2 className="mb-3 text-sm font-semibold">Add a lump payment</h2>
        <form action={addWifePayment} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              name="date"
              defaultValue={todayISO()}
              className={inputClass}
            />
            <input
              type="text"
              inputMode="decimal"
              name="amount"
              required
              placeholder="0.00"
              className={inputClass}
            />
          </div>
          <input
            type="text"
            name="notes"
            placeholder="Notes (optional)"
            className={inputClass}
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-accent py-3 text-base font-semibold text-ink active:opacity-90"
          >
            Add payment
          </button>
        </form>
      </Card>

      <h2 className="mb-2 px-1 text-sm font-semibold">
        Lump payments ({payments.length})
      </h2>
      {payments.length === 0 ? (
        <Empty>No lump payments yet.</Empty>
      ) : (
        <ul className="mb-3 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-panel">
          {payments.map((p) => (
            <li key={p.id} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium tabular">{formatDate(p.date)}</p>
                {p.notes && (
                  <p className="truncate text-xs text-muted">{p.notes}</p>
                )}
              </div>
              <p className="shrink-0 text-base font-semibold tabular text-pink-300">
                {money(p.amount)}
              </p>
              <form action={deleteWifePayment}>
                <input type="hidden" name="id" value={p.id} />
                <ConfirmButton
                  message={`Delete the ${money(p.amount)} payment?`}
                  aria-label="Delete payment"
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
