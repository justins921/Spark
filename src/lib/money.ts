/**
 * Money helpers. Values come out of Postgres `numeric` columns as strings, so
 * everything is parsed once here and only rounded when it hits the screen.
 */

/** Parse a numeric column (or form field) into a number. Null/blank -> 0. */
export function num(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === "") return 0;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Same as `num`, but keeps null so nullable columns stay nullable. */
export function numOrNull(
  value: string | number | null | undefined,
): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Round half-up to 2 decimals, correcting for binary float wobble. */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON * Math.sign(n) * Math.abs(n)) * 100) / 100;
}

/**
 * Round to a whole dollar. Her share is settled in notes, not coins, so every
 * figure she's owed lands on one — and sums of whole dollars stay whole.
 */
export function roundDollar(n: number): number {
  return Math.round(n);
}

/** "$1,234.56" — always 2 decimals. */
export function money(n: number): string {
  const v = round2(n);
  const sign = v < 0 ? "-" : "";
  return (
    sign +
    "$" +
    Math.abs(v).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

/** "+$12.34" / "-$12.34" — for the vs-goal number. */
export function signedMoney(n: number): string {
  const v = round2(n);
  return (v >= 0 ? "+" : "") + money(v);
}

/** Turn a number into the string a `numeric` column wants. */
export function toNumeric(n: number): string {
  return round2(n).toFixed(2);
}
