# Spark Tracker

Mobile-first tracker for Walmart Spark deliveries: what you earned, what you owe
your wife, and whether you're on pace for the weekly goal.

Single user, one password, three screens.

- **This week** (`/`) — net, gross, tips, wife, running net, entries by day
- **Weeks** (`/weeks`) — every week plus lifetime totals
- **Wife** (`/wife`) — what she's earned vs what you've paid, and the balance

## Stack

Next.js (App Router, TypeScript) · Tailwind · Neon Postgres · Drizzle ORM · Vercel

## Deploy

### 1. Import the repo into Vercel

[vercel.com/new](https://vercel.com/new) → pick this repo → **Deploy**.

The first build will succeed and the app will load, but every page will error
because there's no database yet. That's expected — keep going.

### 2. Add the database

In the new project: **Storage → Create Database → Neon (Postgres)**, and
connect it to the project. Vercel sets the connection string in all
environments for you.

Depending on how the store gets created that variable is named `DATABASE_URL`,
`STORAGE_URL` or `POSTGRES_URL`. You don't need to care which — the app takes
whichever one it finds, so leave it exactly as Vercel set it. Don't rename it
or add a duplicate.

### 3. Set the password

**Settings → Environment Variables**, add `APP_PASSWORD` with whatever you
want. Apply it to Production, Preview and Development.

This one password unlocks the whole app. Change it later and every logged-in
device gets signed out.

### 4. Redeploy

**Deployments → ⋯ on the newest one → Redeploy.**

This build creates the tables. Migrations run as part of every deploy
(`vercel-build`), so you never have to remember them — they're idempotent, so
deploys that change nothing about the schema do nothing.

The app is now live and you can log in. It'll be empty.

### 5. Load your history

Log in. While the database is empty the home screen offers **Load history** —
tap it. That's your 31 entries and the $145 you've already paid her.

The prompt only appears on a completely empty database and disappears once
there's anything in it. Tapping twice can't double up: every seeded row carries
a unique `seed_key`.

> Two other ways to do the same thing, if you ever need them: paste
> [`data/seed.sql`](data/seed.sql) into Neon's SQL Editor, or run
> `npm run seed` from a terminal. All three load identical rows.

### 6. Square the opening balance

One thing to do in the app itself — see
[First run: squaring the opening balance](#first-run-squaring-the-opening-balance).

### 7. Put it on your phone

Open the deployment URL in Safari → Share → **Add to Home Screen**. It gets its
own icon and opens without browser chrome.

Everything after this deploys on `git push`.

## Working on it locally

Only needed if you want to change the code.

```bash
npm i -g vercel        # once
vercel link            # once, pick this project
vercel env pull .env.local

npm install
npm run db:migrate
npm run seed
npm run dev            # http://localhost:3000
```

`vercel env pull` writes the connection string and `APP_PASSWORD` into
`.env.local`, which is gitignored. Note that this points at your **production**
database — there's only one.

## Commands

| Command               | What it does                                          |
| --------------------- | ----------------------------------------------------- |
| `npm run dev`         | Local dev server                                       |
| `npm run build`       | Production build                                       |
| `npm run typecheck`   | TypeScript, no emit                                    |
| `npm run db:generate` | Generate a migration after editing `src/db/schema.ts`  |
| `npm run db:migrate`  | Apply pending migrations (also runs on every deploy)   |
| `npm run seed`        | Load the seed CSVs (safe to re-run)                    |
| `npm run db:seed:gen` | Rebake `src/lib/seed-data.ts` from the CSVs             |
| `npm run db:seed:sql` | Regenerate `data/seed.sql` (`> data/seed.sql`)          |

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

- **Earned** = every entry's share + every `owed` ledger row
- **Paid** = every `paid` ledger row
- **Outstanding** = earned − paid. Negative means you're paid ahead.

`Settle up` on `/wife` records a payment for exactly the outstanding amount,
dated today.

**Starting point.** If you set a "last settled up" date on `/wife`, entries and
ledger rows on or before it drop out of all three numbers. Use it when you were
square on some date but can't reconstruct which early trips she came along for
— the balance then starts clean from the day after.

It only affects the balance. Her share still comes out of net for those trips,
because she did earn it; it's just already been paid for. Clearing the date
brings everything back.

Money is stored at full precision and rounded once, on screen. A half of
`$21.57` is `$10.785`, so totals are summed before rounding — that's why the
week's numbers reconcile exactly instead of drifting a cent.

## First run: squaring the opening balance

Straight after seeding, `/wife` says **paid ahead $125.58**. That's correct
arithmetic on incomplete data: the seeded $145 of payments covers trips from
before you were logging properly, so the app has the payment recorded but not
the obligation it paid off.

The quickest fix, and the one to use when you can't remember which early trips
she was along for: `/wife` → **Starting point** → set **Last settled up** to
`2026-09-11`. Everything up to and including that day drops out of the balance,
which lands at **still owe her $19.43** — the two 9/12 trips.

If you'd rather record the obligation than write it off, use **Log to the
ledger → She earned** instead, dated `2026-09-11`, for what she actually earned
on that untracked work. Both routes end in the same place; the starting point
just doesn't need you to know the number.

## Seed data

`data/seed-entries.csv` and `data/seed-wife-payments.csv`.

The wife-payments rows are loaded as **paid** — cash already handed over.

Tip rows whose note reads `Tip — order NNN, delivered M/D` get the order number
and delivered date (year 2026) pulled into their own columns, and the note is
cleared since it no longer says anything the row doesn't.

`npm run db:seed:gen` bakes those CSVs into `src/lib/seed-data.ts`, which is
what the in-app **Load history** button, `npm run seed` and `data/seed.sql`
(via `npm run db:seed:sql`) all read. One source, so the three can't drift.
Re-run both commands after editing a CSV.

Both are idempotent. Every seeded row carries a `seed_key`, which is
unique, so re-running only fills in what's missing — it never duplicates rows or
overwrites edits you made in the app. Rows you add yourself have a null
`seed_key` and are never touched.

## Layout

One column on phones, widening as there's room. The breakpoints that matter:

| Width | What changes |
| ----- | ------------ |
| < 360px | Summary figures stack as label/value rows; paired form fields go one per line; the base/tip split is dropped from entry rows |
| ≥ 360px (`xs`) | Figures go three across, form fields pair up |
| ≥ 640px (`sm`) | "+ Add entry" moves into the page header and the sticky bottom bar disappears; the tab bar becomes a centred pill |
| ≥ 1024px (`lg`) | Slightly wider column, roomier gutters |

It's checked at 16 viewports from 280×653 up to 1920×1080, including phone
landscape, against every page — no sideways scroll, no clipped figures, no
overlapping fixed chrome, no tap target under 36px. Four-figure amounts are
part of the check, so a big week won't break a row.

Everything is plain CSS media queries with no JS measurement, so a folding
phone reflows live as it opens and closes rather than needing a reload.

## Notes

- The whole app sits behind middleware; anything but `/login` redirects when
  you're not signed in. The session cookie is a digest of `APP_PASSWORD`.
- Numeric fields use `inputMode="decimal"` so phones show the number pad, and
  inputs are 16px so iOS Safari doesn't zoom on focus.
- The connection string is read from the first of `DATABASE_URL`,
  `STORAGE_URL`, `POSTGRES_URL`, `DATABASE_URL_UNPOOLED`, `STORAGE_URL_UNPOOLED`
  or `POSTGRES_URL_NON_POOLING` that is set, so it works with whatever Vercel's
  Neon integration named it. The driver is picked from the host: Neon's
  serverless HTTP driver for `*.neon.tech`, plain Postgres for anything else,
  so a local Postgres works without changing code.
- Migration `0001` renames `wife_payments` to `wife_ledger` and adds a `kind`
  column (`owed` / `paid`), defaulting existing rows to `paid`. It's a real
  `ALTER TABLE ... RENAME`, so an already-migrated database keeps its data.
