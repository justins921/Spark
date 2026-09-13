import Link from "next/link";
import { MarkTrips } from "@/components/mark-trips";
import { Empty, Shell } from "@/components/shell";
import { getMarkableEntries } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function MarkTripsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ saved }, entries] = await Promise.all([
    searchParams,
    getMarkableEntries(),
  ]);
  const marked = entries.filter((e) => e.wifeAlong).length;

  return (
    <Shell
      title="Mark her trips"
      subtitle={`${marked} of ${entries.length} marked${saved ? " · saved" : ""}`}
      action={
        <Link
          href="/wife"
          className="shrink-0 py-3 pl-3 text-sm font-medium text-accent"
        >
          Done
        </Link>
      }
    >
      {entries.length === 0 ? (
        <Empty>Nothing to mark yet.</Empty>
      ) : (
        <MarkTrips entries={entries} />
      )}
    </Shell>
  );
}
