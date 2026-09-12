/**
 * Dates are handled as plain "YYYY-MM-DD" strings everywhere so nothing shifts
 * across timezones between the phone, Vercel and Postgres.
 */

const DAY_MS = 86_400_000;

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Today in the user's local timezone, as YYYY-MM-DD. */
export function todayISO(): string {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

export function addDays(iso: string, days: number): string {
  return toISODate(new Date(parseISODate(iso).getTime() + days * DAY_MS));
}

/** The Monday of the week an ISO date falls in. Weeks run Mon–Sun. */
export function weekOf(iso: string): string {
  const d = parseISODate(iso);
  const dow = d.getUTCDay(); // 0 = Sunday
  const backToMonday = (dow + 6) % 7;
  return toISODate(new Date(d.getTime() - backToMonday * DAY_MS));
}

/** The Sunday that closes the week starting at `monday`. */
export function weekEnd(monday: string): string {
  return addDays(monday, 6);
}

/** "Sep 7 – Sep 13, 2026" */
export function formatWeekRange(monday: string): string {
  const start = parseISODate(monday);
  const end = parseISODate(weekEnd(monday));
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  return `${fmt(start)} – ${fmt(end)}, ${end.getUTCFullYear()}`;
}

/** "Sat, Sep 12" */
export function formatDay(iso: string): string {
  return parseISODate(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** "Sep 12, 2026" */
export function formatDate(iso: string): string {
  return parseISODate(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** "9/12" — compact, for tight rows. */
export function formatShort(iso: string): string {
  const d = parseISODate(iso);
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
}
