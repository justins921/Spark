"use client";

import { useState } from "react";
import type { LedgerKind } from "@/db/schema";

const inputClass =
  "w-full rounded-xl border border-line bg-panel-2 px-3 py-3 text-base text-text placeholder:text-muted/60 focus:border-accent focus:outline-none";

const OPTIONS: { value: LedgerKind; label: string; hint: string }[] = [
  {
    value: "paid",
    label: "I paid her",
    hint: "Cash you handed over. Lowers what you still owe.",
  },
  {
    value: "owed",
    label: "She earned",
    hint: "Her share of work no entry covers. Raises what you owe.",
  },
];

/** Add a row to the wife ledger — either side, one form. */
export function LedgerForm({
  action,
  today,
}: {
  action: (formData: FormData) => void;
  today: string;
}) {
  const [kind, setKind] = useState<LedgerKind>("paid");
  const active = OPTIONS.find((o) => o.value === kind)!;

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="ledgerKind" value={kind} />

      <div className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-panel-2 p-1">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => setKind(o.value)}
            className={`rounded-lg py-2.5 text-sm font-semibold ${
              kind === o.value
                ? o.value === "paid"
                  ? "bg-good text-ink"
                  : "bg-pink-400 text-ink"
                : "text-muted"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted">{active.hint}</p>

      <div className="grid grid-cols-2 gap-3">
        <input
          type="date"
          name="date"
          defaultValue={today}
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
        {kind === "paid" ? "Record payment" : "Record what she earned"}
      </button>
    </form>
  );
}
