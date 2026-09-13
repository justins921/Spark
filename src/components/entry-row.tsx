import Link from "next/link";
import type { EntryView } from "@/lib/calc";
import { money } from "@/lib/money";
import { formatShort } from "@/lib/week";

const KIND_LABEL: Record<EntryView["kind"], string> = {
  trip: "Trip",
  tip: "Tip",
  incentive: "Incentive",
};

const KIND_STYLE: Record<EntryView["kind"], string> = {
  trip: "bg-accent/15 text-accent",
  tip: "bg-good/15 text-good",
  incentive: "bg-amber-400/15 text-amber-300",
};

function WifeIcon() {
  return (
    <span
      title="Wife along"
      aria-label="Wife along"
      className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-pink-400/20 text-pink-300"
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
        <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.4 0-8 2.4-8 5.3V22h16v-2.7c0-2.9-3.6-5.3-8-5.3Z" />
      </svg>
    </span>
  );
}

/** One tappable entry line. Tapping opens it in the add/edit form. */
export function EntryRow({ entry }: { entry: EntryView }) {
  const detail =
    entry.kind === "tip"
      ? [
          entry.orderNumber ? `#${entry.orderNumber}` : null,
          entry.deliveredDate ? `del ${formatShort(entry.deliveredDate)}` : null,
        ]
          .filter(Boolean)
          .join(" · ")
      : [
          entry.tripNumber ? `#${entry.tripNumber}` : null,
          entry.orders ? `${entry.orders} order${entry.orders > 1 ? "s" : ""}` : null,
          entry.completedTime,
        ]
          .filter(Boolean)
          .join(" · ");

  return (
    <Link
      href={`/add?id=${entry.id}`}
      className="flex items-center gap-2 px-3 py-3 active:bg-panel-2 xs:gap-3 xs:px-4"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${KIND_STYLE[entry.kind]}`}
          >
            {KIND_LABEL[entry.kind]}
          </span>
          {entry.wifeAlong && <WifeIcon />}
        </div>
        {detail && (
          <p className="mt-1 truncate text-xs text-muted tabular">{detail}</p>
        )}
        {entry.notes && (
          <p className="mt-0.5 truncate text-xs text-muted">{entry.notes}</p>
        )}
      </div>

      {/* Allowed to shrink so a four-figure total can't push the page wide.
          The base/tip split is the first thing to go on a narrow screen. */}
      <div className="min-w-0 text-right tabular">
        <p className="text-base font-semibold">{money(entry.total)}</p>
        <p className="hidden text-[11px] text-muted xs:block">
          {money(entry.base)} base · {money(entry.tip)} tip
        </p>
        {entry.wifePaid > 0 && (
          <p className="text-[11px] text-pink-300">
            −{money(entry.wifePaid)} wife
            {entry.estTotal !== null && (
              <span className="text-muted"> (est)</span>
            )}
          </p>
        )}
      </div>
    </Link>
  );
}
