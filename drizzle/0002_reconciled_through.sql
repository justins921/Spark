-- A date you were last settled up. Splits and ledger rows on or before it are
-- excluded from the outstanding balance. Null (the default) counts everything.
ALTER TABLE "settings" ADD COLUMN "reconciled_through" date;
