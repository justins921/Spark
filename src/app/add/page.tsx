import { EntryForm } from "@/components/entry-form";
import { Shell } from "@/components/shell";
import { getEntry } from "@/lib/data";
import { addDays, todayISO } from "@/lib/week";

export const dynamic = "force-dynamic";

export default async function AddPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const entry = id ? await getEntry(Number(id)) : null;
  const today = todayISO();

  return (
    <Shell
      title={entry ? "Edit entry" : "Add entry"}
      subtitle={entry ? `Entry #${entry.id}` : undefined}
    >
      <EntryForm entry={entry} today={today} yesterday={addDays(today, -1)} />
    </Shell>
  );
}
