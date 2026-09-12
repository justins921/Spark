"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { deleteEntry, saveEntry } from "@/app/actions";
import type { EntryView } from "@/lib/calc";
import { money, num } from "@/lib/money";
import type { Kind } from "@/db/schema";

const KINDS: { value: Kind; label: string }[] = [
  { value: "trip", label: "Trip" },
  { value: "tip", label: "Tip" },
  { value: "incentive", label: "Incentive" },
];

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-line bg-panel-2 px-3 py-3 text-base text-text placeholder:text-muted/60 focus:border-accent focus:outline-none";

/** Money/number input that brings up the numeric keypad on a phone. */
function MoneyInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="text"
      inputMode="decimal"
      autoComplete="off"
      placeholder="0.00"
      {...props}
      className={inputClass}
    />
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-accent py-3.5 text-base font-semibold text-ink active:opacity-90 disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save"}
    </button>
  );
}

export function EntryForm({
  entry,
  today,
  yesterday,
}: {
  entry: EntryView | null;
  today: string;
  yesterday: string;
}) {
  const [kind, setKind] = useState<Kind>(entry?.kind ?? "trip");
  const [base, setBase] = useState(entry ? String(entry.base) : "");
  const [tip, setTip] = useState(entry ? String(entry.tip) : "");
  const [amount, setAmount] = useState(
    entry ? String(entry.kind === "tip" ? entry.tip : entry.base) : "",
  );
  const [wifeAlong, setWifeAlong] = useState(entry?.wifeAlong ?? false);
  const [override, setOverride] = useState(
    entry?.wifePaidOverride !== null && entry?.wifePaidOverride !== undefined
      ? String(entry.wifePaidOverride)
      : "",
  );

  const total = kind === "trip" ? num(base) + num(tip) : num(amount);
  const half = total / 2;
  const effectiveWifePaid = override.trim() !== "" ? num(override) : half;

  return (
    <form action={saveEntry} className="space-y-4">
      {entry && <input type="hidden" name="id" value={entry.id} />}
      <input type="hidden" name="kind" value={kind} />

      <div className="grid grid-cols-3 gap-1 rounded-xl border border-line bg-panel-2 p-1">
        {KINDS.map((k) => (
          <button
            key={k.value}
            type="button"
            onClick={() => setKind(k.value)}
            className={`rounded-lg py-2.5 text-sm font-semibold ${
              kind === k.value ? "bg-accent text-ink" : "text-muted"
            }`}
          >
            {k.label}
          </button>
        ))}
      </div>

      <Field label="Date">
        <input
          type="date"
          name="date"
          defaultValue={entry?.date ?? today}
          className={inputClass}
        />
      </Field>

      {kind === "trip" && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Est. base">
              <MoneyInput
                name="estBase"
                defaultValue={entry?.estBase ?? ""}
              />
            </Field>
            <Field label="Est. tip">
              <MoneyInput name="estTip" defaultValue={entry?.estTip ?? ""} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Actual base">
              <MoneyInput
                name="base"
                value={base}
                onChange={(e) => setBase(e.target.value)}
              />
            </Field>
            <Field label="Actual tip">
              <MoneyInput
                name="tip"
                value={tip}
                onChange={(e) => setTip(e.target.value)}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Trip #">
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                name="tripNumber"
                defaultValue={entry?.tripNumber ?? ""}
                placeholder="1234"
                className={inputClass}
              />
            </Field>
            <Field label="# orders">
              <input
                type="text"
                inputMode="numeric"
                name="orders"
                defaultValue={entry?.orders ?? ""}
                placeholder="1"
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Completed time">
            <input
              type="text"
              name="completedTime"
              defaultValue={entry?.completedTime ?? ""}
              placeholder="5:02 PM"
              className={inputClass}
            />
          </Field>
        </>
      )}

      {kind === "tip" && (
        <>
          <Field label="Tip amount">
            <MoneyInput
              name="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Field>
          <Field label="Order #">
            <input
              type="text"
              inputMode="numeric"
              name="orderNumber"
              defaultValue={entry?.orderNumber ?? ""}
              placeholder="200015425067806"
              className={inputClass}
            />
          </Field>
          <Field label="Delivered date" hint="Tips post the day after delivery.">
            <input
              type="date"
              name="deliveredDate"
              defaultValue={entry?.deliveredDate ?? yesterday}
              className={inputClass}
            />
          </Field>
        </>
      )}

      {kind === "incentive" && (
        <Field label="Amount">
          <MoneyInput
            name="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </Field>
      )}

      {kind !== "incentive" && (
        <div className="rounded-xl border border-line bg-panel p-4">
          <label className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium">Wife along</span>
            <input
              type="checkbox"
              name="wifeAlong"
              checked={wifeAlong}
              onChange={(e) => setWifeAlong(e.target.checked)}
              className="h-6 w-11 appearance-none rounded-full bg-line transition-colors checked:bg-pink-400 relative before:absolute before:top-0.5 before:left-0.5 before:h-5 before:w-5 before:rounded-full before:bg-white before:transition-transform checked:before:translate-x-5"
            />
          </label>

          {wifeAlong && (
            <div className="mt-3 space-y-3 border-t border-line pt-3">
              <p className="text-sm text-muted tabular">
                Total {money(total)} · her half{" "}
                <span className="font-semibold text-pink-300">{money(half)}</span>
              </p>
              <Field label="Override (optional)">
                <MoneyInput
                  name="wifePaidOverride"
                  value={override}
                  onChange={(e) => setOverride(e.target.value)}
                  placeholder={half.toFixed(2)}
                />
              </Field>
              <p className="text-xs text-muted tabular">
                She gets {money(effectiveWifePaid)} from this entry.
              </p>
            </div>
          )}
        </div>
      )}

      <Field label="Notes">
        <textarea
          name="notes"
          rows={2}
          defaultValue={entry?.notes ?? ""}
          className={inputClass}
        />
      </Field>

      <SubmitButton />

      <div className="flex gap-3">
        <Link
          href="/"
          className="flex-1 rounded-xl border border-line py-3 text-center text-sm font-medium text-muted"
        >
          Cancel
        </Link>
        {entry && (
          <button
            type="submit"
            formAction={deleteEntry}
            formNoValidate
            onClick={(e) => {
              if (!confirm("Delete this entry?")) e.preventDefault();
            }}
            className="flex-1 rounded-xl border border-bad/40 py-3 text-center text-sm font-medium text-bad"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
