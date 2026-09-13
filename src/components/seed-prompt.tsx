import { loadSeedHistory } from "@/app/actions";
import { Card } from "./shell";

/** Shown only while the database is completely empty. */
export function SeedPrompt() {
  return (
    <Card className="mb-3 border-accent/40">
      <h2 className="text-sm font-semibold">Load your starting history</h2>
      <p className="mt-1 text-sm text-muted">
        31 trips, tips and incentives from Sep 6–12, plus the $145 you&apos;ve
        already paid her. Safe to tap twice — it won&apos;t double up.
      </p>
      <form action={loadSeedHistory} className="mt-3">
        <button
          type="submit"
          className="w-full rounded-xl bg-accent py-3 text-base font-semibold text-ink active:opacity-90"
        >
          Load history
        </button>
      </form>
    </Card>
  );
}
