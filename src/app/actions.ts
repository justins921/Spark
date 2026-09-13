"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  entries,
  wifeLedger,
  type Kind,
  KINDS,
  type LedgerKind,
  LEDGER_KINDS,
} from "@/db/schema";
import { SESSION_COOKIE, safeEqual, sessionToken } from "@/lib/auth";
import {
  clearWifeAlongThrough,
  getBalance,
  setWifeAlong,
  setReconciledThrough,
  setWeeklyGoal,
} from "@/lib/data";
import { syncSeedHistory } from "@/lib/seed-import";
import { numOrNull, roundDollar, toNumeric } from "@/lib/money";
import { todayISO } from "@/lib/week";

const YEAR = 60 * 60 * 24 * 365;

export async function login(_prev: string | null, formData: FormData) {
  const password = process.env.APP_PASSWORD;
  if (!password) return "APP_PASSWORD is not configured on the server.";

  const attempt = String(formData.get("password") ?? "");
  if (!safeEqual(attempt, password)) return "Wrong password.";

  const jar = await cookies();
  jar.set(SESSION_COOKIE, await sessionToken(password), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: YEAR,
  });
  redirect("/");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/login");
}

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (v === null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

function money(formData: FormData, key: string): string | null {
  const n = numOrNull(str(formData, key));
  return n === null ? null : toNumeric(n);
}

/** Anything owed to her is stored on a whole dollar. */
function dollars(formData: FormData, key: string): string | null {
  const n = numOrNull(str(formData, key));
  return n === null ? null : toNumeric(roundDollar(n));
}

function refreshAll() {
  revalidatePath("/");
  revalidatePath("/weeks");
  revalidatePath("/wife");
  revalidatePath("/weeks/[week]", "page");
}

export async function saveEntry(formData: FormData) {
  const id = numOrNull(str(formData, "id"));
  const kindRaw = String(formData.get("kind") ?? "trip");
  const kind: Kind = (KINDS as readonly string[]).includes(kindRaw)
    ? (kindRaw as Kind)
    : "trip";
  const date = str(formData, "date") ?? todayISO();
  const wifeAlong = formData.get("wifeAlong") === "on";
  const notes = str(formData, "notes") ?? "";

  // Each kind uses a different slice of the form, so build the row per kind
  // and blank out the fields that don't apply.
  let values;
  if (kind === "trip") {
    values = {
      date,
      kind,
      estBase: money(formData, "estBase"),
      estTip: money(formData, "estTip"),
      base: money(formData, "base") ?? "0.00",
      tip: money(formData, "tip") ?? "0.00",
      tripNumber: str(formData, "tripNumber"),
      orders: numOrNull(str(formData, "orders")),
      completedTime: str(formData, "completedTime"),
      orderNumber: null,
      deliveredDate: null,
    };
  } else if (kind === "tip") {
    values = {
      date,
      kind,
      estBase: null,
      estTip: null,
      base: "0.00",
      tip: money(formData, "amount") ?? "0.00",
      tripNumber: null,
      orders: null,
      completedTime: null,
      orderNumber: str(formData, "orderNumber"),
      deliveredDate: str(formData, "deliveredDate"),
    };
  } else {
    values = {
      date,
      kind,
      estBase: null,
      estTip: null,
      base: money(formData, "amount") ?? "0.00",
      tip: "0.00",
      tripNumber: null,
      orders: null,
      completedTime: null,
      orderNumber: null,
      deliveredDate: null,
    };
  }

  const row = {
    ...values,
    wifeAlong: kind === "incentive" ? false : wifeAlong,
    wifePaidOverride:
      kind !== "incentive" && wifeAlong
        ? dollars(formData, "wifePaidOverride")
        : null,
    notes,
  };

  if (id) await db.update(entries).set(row).where(eq(entries.id, id));
  else await db.insert(entries).values(row);

  refreshAll();
  redirect("/");
}

export async function deleteEntry(formData: FormData) {
  const id = numOrNull(str(formData, "id"));
  if (id) await db.delete(entries).where(eq(entries.id, id));
  refreshAll();
  redirect("/");
}

export async function addLedgerEntry(formData: FormData) {
  const amount = money(formData, "amount");
  const kindRaw = String(formData.get("ledgerKind") ?? "paid");
  const kind: LedgerKind = (LEDGER_KINDS as readonly string[]).includes(kindRaw)
    ? (kindRaw as LedgerKind)
    : "paid";

  if (amount) {
    await db.insert(wifeLedger).values({
      date: str(formData, "date") ?? todayISO(),
      kind,
      amount,
      notes: str(formData, "notes") ?? "",
    });
  }
  refreshAll();
  redirect("/wife");
}

export async function deleteLedgerEntry(formData: FormData) {
  const id = numOrNull(str(formData, "id"));
  if (id) await db.delete(wifeLedger).where(eq(wifeLedger.id, id));
  refreshAll();
  redirect("/wife");
}

/** One tap: record a payment for exactly what is still outstanding. */
export async function settleUp() {
  const { outstanding } = await getBalance();
  if (outstanding > 0) {
    await db.insert(wifeLedger).values({
      date: todayISO(),
      kind: "paid",
      amount: toNumeric(outstanding),
      notes: "Settled up",
    });
  }
  refreshAll();
  redirect("/wife");
}

export async function updateGoal(formData: FormData) {
  const goal = numOrNull(str(formData, "weeklyGoal"));
  if (goal !== null && goal >= 0) await setWeeklyGoal(goal);
  refreshAll();
  redirect("/wife");
}

/**
 * Load or re-apply the recorded history. Keyed on seed_key, so it updates what
 * has changed, adds what's new, drops placeholders that have been replaced,
 * and leaves entries you added yourself alone.
 */
export async function loadSeedHistory() {
  await syncSeedHistory();
  refreshAll();
  redirect("/");
}

/** Same thing, from the settings section rather than the empty state. */
export async function syncHistory() {
  await syncSeedHistory();
  refreshAll();
  redirect("/wife");
}

/**
 * Record the day you were last square. Everything on or before it drops out of
 * the balance, which is how you get a clean starting point when you can't
 * remember which early trips she was along for.
 */
export async function updateReconciledThrough(formData: FormData) {
  const raw = str(formData, "reconciledThrough");
  const clear = formData.get("clear") === "1";
  await setReconciledThrough(clear ? null : raw);
  refreshAll();
  redirect("/wife");
}

/** Clear guessed wife-along flags from the already-settled period. */
export async function clearSettledWifeFlags(formData: FormData) {
  const through = str(formData, "through");
  if (through) await clearWifeAlongThrough(through);
  refreshAll();
  redirect("/wife");
}

/** Save a batch of wife-along toggles from the marking screen. */
export async function saveWifeFlags(formData: FormData) {
  const ids = (key: string) =>
    formData
      .getAll(key)
      .map((v) => Number(v))
      .filter((n) => Number.isInteger(n) && n > 0);

  await setWifeAlong(ids("on"), ids("off"));
  refreshAll();
  revalidatePath("/wife/trips");
  redirect("/wife/trips?saved=1");
}
