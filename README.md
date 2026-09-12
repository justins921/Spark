# Spark Tracker

Mobile-first tracker for Walmart Spark deliveries: what you earned, what you owe
your wife, and whether you're on pace for the weekly goal.

Single user, one password, three screens.

- **This week** (`/`) — net, gross, tips, wife, running net, entries by day
- **Weeks** (`/weeks`) — every week plus lifetime totals
- **Wife** (`/wife`) — what she's earned vs what you've paid, and the balance

## Stack

Next.js (App Router, TypeScript) · Tailwind · Neon Postgres · Drizzle ORM · Vercel

## Setup

### 1. Create the database

In the Vercel dashboard: **Storage → Create Database → Neon (Postgres)**, then
connect it to this project. Vercel sets `DATABASE_URL` for you in all
environments — you don't paste it anywhere.

### 2. Set the password

**Project → Settings → Environment Variables**, add:

| Name           | Value                  |
| -------------- | ---------------------- |
| `APP_PASSWORD` | whatever you want      |

That one password unlocks the whole app. Change it and every logged-in device
gets kicked out.

### 3. Pull env vars locally

```bash
npm i -g vercel      # once
vercel link          # once, pick this project
vercel env pull .env.local
```

That writes `DATABASE_URL` and `APP_PASSWORD` into `.env.local` (gitignored).

### 4. Migrate and seed

```bash
npm install
npm run db:migrate   # creates the tables
npm run seed         # loads data/*.csv
npm run dev          # http://localhost:3000
```

After seeding, the week of **2026-09-07** shows gross **$614.19**, her share
**$19.43**, net **$594.77** — and the wife page reads "paid ahead $125.58",
because the seeded $145 in payments covers trips from before you started
logging. See [First run: squaring the opening balance](#first-run-squaring-the-opening-balance).

### 5. Deploy

```bash
git push
```

Vercel builds on push. Migrations are **not** run automatically — after a schema
change, run `npm run db:migrate` locally against the production `DATABASE_URL`.

## Commands

| Command               | What it does                                          |
| --------------------- | ----------------------------------------------------- |
| `npm run dev`         | Local dev server                                       |
| `npm run build`       | Production build                                       |
| `npm run typecheck`   | TypeScript, no emit                                    |
| `npm run db:generate` | Generate a migration after editing `src/db/schema.ts`  |
| `npm run db:migrate`  | Apply pending migrations                               |
| `npm run seed`        | Load the seed CSVs (safe to re-run)                    |

## The rules the app follows

Weeks run **Monday–Sunday**. An entry's `week_of` is the Monday of its date.

### What she earns

- `total` = `base + tip`
- An entry's share for her = `wife_paid_override` if set, else `total / 2` when
  she rode along, else `0`
- Plus any **owed** rows on the wife ledger — her share of work no entry covers
  (trips from before you started logging, orders you didn't record)

### What you keep

- `net` = week gross − what she earned that week
- `vs_goal` = `net` − `weekly_goal` (default `$500`, editable on `/wife`)

Net is an **accrual**: her share comes out the moment it's earned, whether or
not you've handed it over yet. Paying her later settles the debt — it doesn't
come out of net a second time.

### What you still owe

- **Earned to date** = every entry's share + every `owed` ledger row
- **Paid to date** = every `paid` ledger row
- **Outstanding** = earned − paid. Negative means you're paid ahead.

`Settle up` on `/wife` records a payment for exactly the outstanding amount,
dated today.

Money is stored at full precision and rounded once, on screen. A half of
`$21.57` is `$10.785`, so totals are summed before rounding — that's why the
week's numbers reconcile exactly instead of drifting a cent.

## First run: squaring the opening balance

Straight after seeding, `/wife` says **paid ahead $125.58**. That's correct
arithmetic on incomplete data: the seeded $145 of payments covers trips from
before you were logging entries, so the app has the payment recorded but not
the obligation it paid off.

Fix it in one go on `/wife` → **Log to the ledger** → **She earned**: enter what
she actually earned on that untracked work (dated `2026-09-11`) and save. Enter
`$145.00` and the balance lands at **still owe her $19.43** — the two 9/12 trips
you haven't settled — and the week's net reads **$449.77**.

## Seed data

`data/seed-entries.csv` and `data/seed-wife-payments.csv`.

The wife-payments rows are loaded as **paid** — cash already handed over.

Tip rows whose note reads `Tip — order NNN, delivered M/D` get the order number
and delivered date (year 2026) pulled into their own columns, and the note is
cleared since it no longer says anything the row doesn't.

`npm run seed` is idempotent. Every seeded row carries a `seed_key`, which is
unique, so re-running only fills in what's missing — it never duplicates rows or
overwrites edits you made in the app. Rows you add yourself have a null
`seed_key` and are never touched.

## Notes

- The whole app sits behind middleware; anything but `/login` redirects when
  you're not signed in. The session cookie is a digest of `APP_PASSWORD`.
- Numeric fields use `inputMode="decimal"` so phones show the number pad, and
  inputs are 16px so iOS Safari doesn't zoom on focus.
- The database driver is picked from `DATABASE_URL`: Neon's serverless HTTP
  driver for `*.neon.tech`, plain Postgres for anything else. A local Postgres
  works without changing code.
- Migration `0001` renames `wife_payments` to `wife_ledger` and adds a `kind`
  column (`owed` / `paid`), defaulting existing rows to `paid`. It's a real
  `ALTER TABLE ... RENAME`, so an already-migrated database keeps its data.
